/*
  # Block Transfers for Guest List Tickets

  ## Summary
  Updates the `transfer_ticket` database function to reject transfer attempts
  for tickets with ticket_type = 'guest_list'. This is a server-side enforcement
  that cannot be bypassed via direct API calls.

  ## Changes
  - `transfer_ticket` function: adds an early check that returns an error if the
    ticket's ticket_type is 'guest_list', before any ownership or status checks run

  ## Security
  - Server-side enforcement ensures guest list tickets can never be transferred
    regardless of client-side UI state
*/

CREATE OR REPLACE FUNCTION transfer_ticket(
  p_ticket_id bigint,
  p_to_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from_user_id uuid;
  v_ticket_status ticket_status;
  v_ticket_type text;
  v_transfer_id bigint;
BEGIN
  -- Get the current owner, status, and type
  SELECT owner_id, status, ticket_type
  INTO v_from_user_id, v_ticket_status, v_ticket_type
  FROM tickets
  WHERE id = p_ticket_id;

  -- Verify ticket exists
  IF v_from_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ticket not found'
    );
  END IF;

  -- Block transfers for guest list tickets
  IF v_ticket_type = 'guest_list' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Guest list tickets cannot be transferred'
    );
  END IF;

  -- Verify caller is the current owner
  IF v_from_user_id != auth.uid() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You do not own this ticket'
    );
  END IF;

  -- Verify ticket is active (not validated or cancelled)
  IF v_ticket_status != 'active' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ticket cannot be transferred (status: ' || v_ticket_status || ')'
    );
  END IF;

  -- Verify recipient exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_to_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Recipient user not found'
    );
  END IF;

  -- Create transfer record
  INSERT INTO ticket_transfers (
    ticket_id,
    from_user_id,
    to_user_id,
    transfer_status,
    transferred_at
  )
  VALUES (
    p_ticket_id,
    v_from_user_id,
    p_to_user_id,
    'completed',
    now()
  )
  RETURNING id INTO v_transfer_id;

  -- Update ticket ownership
  UPDATE tickets
  SET
    owner_id = p_to_user_id,
    status = 'active',
    updated_at = now()
  WHERE id = p_ticket_id;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'transfer_id', v_transfer_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION transfer_ticket TO authenticated;

COMMENT ON FUNCTION transfer_ticket IS 'Securely transfers a ticket from the current owner to a new owner. Guest list tickets cannot be transferred.';
