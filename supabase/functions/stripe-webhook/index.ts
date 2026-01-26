import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Fingerboard Con App',
    version: '1.0.3',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // get the signature from the header
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    // get the raw body
    const body = await req.text();

    // verify the webhook signature
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object ?? {};

  if (!stripeData) {
    return;
  }

  // Handle refund events
  if (event.type === 'charge.refunded') {
    await handleChargeRefund(event.data.object as Stripe.Charge);
    return;
  }

  if (event.type === 'refund.updated') {
    await handleRefundUpdated(event.data.object as Stripe.Refund);
    return;
  }

  if (!('customer' in stripeData)) {
    return;
  }

  // for one time payments, we only listen for the checkout.session.completed event
  if (event.type === 'payment_intent.succeeded' && event.data.object.invoice === null) {
    return;
  }

  const { customer: customerId } = stripeData;

  if (!customerId || typeof customerId !== 'string') {
    console.error(`No customer received on event: ${JSON.stringify(event)}`);
  } else {
    let isSubscription = true;

    if (event.type === 'checkout.session.completed') {
      const { mode } = stripeData as Stripe.Checkout.Session;

      isSubscription = mode === 'subscription';

      console.info(`Processing ${isSubscription ? 'subscription' : 'one-time payment'} checkout session`);
    }

    const { mode, payment_status } = stripeData as Stripe.Checkout.Session;

    if (isSubscription) {
      console.info(`Starting subscription sync for customer: ${customerId}`);
      await syncCustomerFromStripe(customerId);
    } else if (mode === 'payment' && payment_status === 'paid') {
      try {
        // Extract the necessary information from the session
        const {
          id: checkout_session_id,
          payment_intent,
          amount_subtotal,
          amount_total,
          currency,
        } = stripeData as Stripe.Checkout.Session;

        // Insert the order into the stripe_orders table
        const { data: orderData, error: orderError } = await supabase.from('stripe_orders').insert({
          checkout_session_id,
          payment_intent_id: payment_intent,
          customer_id: customerId,
          amount_subtotal,
          amount_total,
          currency,
          payment_status,
          status: 'completed',
        }).select().single();

        if (orderError) {
          console.error('Error inserting order:', orderError);
          return;
        }
        console.info(`Successfully processed one-time payment for session: ${checkout_session_id}`);

        // Generate individual tickets for this order
        await generateTicketsForOrder(orderData.id, customerId, stripeData as Stripe.Checkout.Session);
      } catch (error) {
        console.error('Error processing one-time payment:', error);
      }
    }
  }
}

async function cancelTicketsByPaymentIntent(paymentIntentId: string, source: string) {
  const { data: order, error: orderError } = await supabase
    .from('stripe_orders')
    .select('id')
    .eq('payment_intent_id', paymentIntentId)
    .maybeSingle();

  if (orderError) {
    console.error(`Error finding order for ${source}:`, orderError);
    return null;
  }

  if (!order) {
    console.warn(`No order found for payment intent: ${paymentIntentId}`);
    return null;
  }

  const { data: cancelledTickets, error: ticketsError } = await supabase
    .from('tickets')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('order_id', order.id)
    .neq('status', 'validated')
    .select();

  if (ticketsError) {
    console.error('Error cancelling tickets:', ticketsError);
    return null;
  }

  const { error: orderUpdateError } = await supabase
    .from('stripe_orders')
    .update({ status: 'canceled' })
    .eq('id', order.id);

  if (orderUpdateError) {
    console.error('Error updating order status:', orderUpdateError);
  }

  return { orderId: order.id, ticketCount: cancelledTickets?.length || 0 };
}

async function handleChargeRefund(charge: Stripe.Charge) {
  try {
    const paymentIntentId = charge.payment_intent;

    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      console.error('No payment intent ID found in charge:', charge.id);
      return;
    }

    console.info(`Processing charge.refunded for payment intent: ${paymentIntentId}`);

    const result = await cancelTicketsByPaymentIntent(paymentIntentId, 'charge.refunded');

    if (result) {
      console.info(`Successfully cancelled ${result.ticketCount} ticket(s) for order ${result.orderId} due to charge.refunded`);
    }
  } catch (error) {
    console.error('Error handling charge.refunded:', error);
  }
}

async function handleRefundUpdated(refund: Stripe.Refund) {
  try {
    if (refund.status !== 'succeeded') {
      console.info(`Refund ${refund.id} status is ${refund.status}, skipping cancellation`);
      return;
    }

    let paymentIntentId: string | null = null;

    if (refund.payment_intent && typeof refund.payment_intent === 'string') {
      paymentIntentId = refund.payment_intent;
    } else if (refund.charge && typeof refund.charge === 'string') {
      const charge = await stripe.charges.retrieve(refund.charge);
      if (charge.payment_intent && typeof charge.payment_intent === 'string') {
        paymentIntentId = charge.payment_intent;
      }
    }

    if (!paymentIntentId) {
      console.error('No payment intent ID found for refund:', refund.id);
      return;
    }

    console.info(`Processing refund.updated for payment intent: ${paymentIntentId}`);

    const result = await cancelTicketsByPaymentIntent(paymentIntentId, 'refund.updated');

    if (result) {
      console.info(`Successfully cancelled ${result.ticketCount} ticket(s) for order ${result.orderId} due to refund.updated`);
    }
  } catch (error) {
    console.error('Error handling refund.updated:', error);
  }
}

// Generate individual tickets for an order
async function generateTicketsForOrder(orderId: number, customerId: string, session: Stripe.Checkout.Session) {
  try {
    // Get the user_id from the customer_id
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', customerId)
      .single();

    if (customerError || !customerData) {
      console.error('Error fetching customer user_id:', customerError);
      return;
    }

    const userId = customerData.user_id;

    // Get line items to determine quantity and ticket type
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price'],
    });

    if (!lineItems.data || lineItems.data.length === 0) {
      console.error('No line items found for session:', session.id);
      return;
    }

    const lineItem = lineItems.data[0];
    const priceId = lineItem.price?.id;
    let quantity = lineItem.quantity || 1;
    let ticketType = lineItem.description || 'General Admission';

    // Vendor Package price ID - creates 2 admission tickets
    const VENDOR_PACKAGE_PRICE_ID = 'price_1SoWqNLz01V9GjOuKJ9cm8Wv';

    // If this is a vendor package, create 2 individual admission tickets
    if (priceId === VENDOR_PACKAGE_PRICE_ID) {
      quantity = 2;
      ticketType = 'Vendor Package - Admission';
    }

    // Define color palette for tickets
    const ticketColors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#8BC34A', '#FFC107'];

    // Generate individual tickets
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const qrCodeData = crypto.randomUUID();
      const backgroundColor = ticketColors[i % ticketColors.length];

      tickets.push({
        order_id: orderId,
        ticket_type: ticketType,
        ticket_number: i + 1,
        qr_code_data: qrCodeData,
        owner_id: userId,
        original_purchaser_id: userId,
        status: 'active',
        background_color: backgroundColor,
      });
    }

    // Insert all tickets
    const { error: ticketsError } = await supabase.from('tickets').insert(tickets);

    if (ticketsError) {
      console.error('Error inserting tickets:', ticketsError);
      return;
    }

    console.info(`Successfully generated ${quantity} ticket(s) for order ${orderId}`);
  } catch (error) {
    console.error('Error generating tickets:', error);
  }
}

// based on the excellent https://github.com/t3dotgg/stripe-recommendations
async function syncCustomerFromStripe(customerId: string) {
  try {
    // fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    // TODO verify if needed
    if (subscriptions.data.length === 0) {
      console.info(`No active subscriptions found for customer: ${customerId}`);
      const { error: noSubError } = await supabase.from('stripe_subscriptions').upsert(
        {
          customer_id: customerId,
          subscription_status: 'not_started',
        },
        {
          onConflict: 'customer_id',
        },
      );

      if (noSubError) {
        console.error('Error updating subscription status:', noSubError);
        throw new Error('Failed to update subscription status in database');
      }
    }

    // assumes that a customer can only have a single subscription
    const subscription = subscriptions.data[0];

    // store subscription state
    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
      },
      {
        onConflict: 'customer_id',
      },
    );

    if (subError) {
      console.error('Error syncing subscription:', subError);
      throw new Error('Failed to sync subscription in database');
    }
    console.info(`Successfully synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}
