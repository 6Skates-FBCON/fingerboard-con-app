import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser(token);

    if (getUserError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { qr_code_data } = await req.json();

    if (!qr_code_data) {
      return new Response(
        JSON.stringify({ success: false, message: 'QR code data is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        id,
        ticket_type,
        ticket_number,
        status,
        event_name,
        owner_id,
        validated_at
      `)
      .eq('qr_code_data', qr_code_data)
      .single();

    if (ticketError || !ticket) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid QR code - ticket not found',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (ticket.status === 'validated') {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Ticket already used on ${new Date(ticket.validated_at).toLocaleString()}`,
          ticket: {
            id: ticket.id,
            ticket_type: ticket.ticket_type,
            ticket_number: ticket.ticket_number,
            event_name: ticket.event_name,
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (ticket.status === 'cancelled' || ticket.status === 'expired') {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Ticket is ${ticket.status}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: ownerData, error: ownerError } = await supabase.auth.admin.getUserById(
      ticket.owner_id
    );

    if (ownerError) {
      console.error('Error fetching owner:', ownerError);
    }

    const { error: updateError } = await supabase
      .from('tickets')
      .update({
        status: 'validated',
        validated_at: new Date().toISOString(),
        validated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticket.id);

    if (updateError) {
      console.error('Error updating ticket:', updateError);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to validate ticket',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Ticket validated successfully',
        ticket: {
          id: ticket.id,
          ticket_type: ticket.ticket_type,
          ticket_number: ticket.ticket_number,
          event_name: ticket.event_name,
          owner_email: ownerData?.user?.email || 'Unknown',
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'An error occurred during validation',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});