import { createClient } from 'npm:@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token or user not found' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userId = user.id;

    console.log(`Starting account deletion for user: ${userId}`);

    const { error: ticketsOwnedError } = await supabaseClient
      .from('tickets')
      .delete()
      .eq('owner_id', userId);

    if (ticketsOwnedError) {
      console.error('Error deleting owned tickets:', ticketsOwnedError);
    }

    const { error: ticketsPurchaserError } = await supabaseClient
      .from('tickets')
      .update({ original_purchaser_id: null })
      .eq('original_purchaser_id', userId);

    if (ticketsPurchaserError) {
      console.error('Error clearing original_purchaser_id:', ticketsPurchaserError);
    }

    const { error: ticketsValidatorError } = await supabaseClient
      .from('tickets')
      .update({ validated_by: null })
      .eq('validated_by', userId);

    if (ticketsValidatorError) {
      console.error('Error clearing validated_by:', ticketsValidatorError);
    }

    const { error: transfersFromError } = await supabaseClient
      .from('ticket_transfers')
      .update({ from_user_id: null })
      .eq('from_user_id', userId);

    if (transfersFromError) {
      console.error('Error clearing from_user_id:', transfersFromError);
    }

    const { error: transfersToError } = await supabaseClient
      .from('ticket_transfers')
      .update({ to_user_id: null })
      .eq('to_user_id', userId);

    if (transfersToError) {
      console.error('Error clearing to_user_id:', transfersToError);
    }

    const { error: customersError } = await supabaseClient
      .from('stripe_customers')
      .delete()
      .eq('user_id', userId);

    if (customersError) {
      console.error('Error deleting stripe customers:', customersError);
    }

    const { error: emailLogError } = await supabaseClient
      .from('email_verification_log')
      .delete()
      .eq('user_id', userId);

    if (emailLogError) {
      console.error('Error deleting email verification log:', emailLogError);
    }

    const { error: vendorCodesError } = await supabaseClient
      .from('vendor_codes')
      .update({ created_by: null })
      .eq('created_by', userId);

    if (vendorCodesError) {
      console.error('Error updating vendor codes:', vendorCodesError);
    }

    const { error: adminError } = await supabaseClient
      .from('admin_users')
      .update({ assigned_by: null })
      .eq('assigned_by', userId);

    if (adminError) {
      console.error('Error updating admin users:', adminError);
    }

    const { error: profileError } = await supabaseClient
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
    }

    const { error: deleteUserError } = await supabaseClient.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('Error deleting user from auth:', deleteUserError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete user account', details: deleteUserError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Account deletion completed for user: ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in delete-account function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});