/*
  # Create Transfer Ticket Function

  ## Overview
  This migration creates a secure database function to handle ticket transfers atomically.
  The function bypasses RLS to ensure the transfer can complete even though the owner_id
  is changing during the transaction.

  ## Changes
  1. Create a secure function `transfer_ticket` that:
     - Validates the current user owns the ticket
     - Creates a transfer record
     - Updates the ticket ownership
     - All in a single atomic transaction

  ## Security
  - Function runs with SECURITY DEFINER to bypass RLS
  - Explicit checks ensure only the current owner can transfer
  - Transfer history is maintained for audit purposes
*/

-- Create function to transfer a ticket
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
  v_transfer_id bigint;
BEGIN
  -- Get the current owner and status
  SELECT owner_id, status
  INTO v_from_user_id, v_ticket_status
  FROM tickets
  WHERE id = p_ticket_id;

  -- Verify ticket exists
  IF v_from_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ticket not found'
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION transfer_ticket TO authenticated;

-- Add comment
COMMENT ON FUNCTION transfer_ticket IS 'Securely transfers a ticket from the current owner to a new owner';
