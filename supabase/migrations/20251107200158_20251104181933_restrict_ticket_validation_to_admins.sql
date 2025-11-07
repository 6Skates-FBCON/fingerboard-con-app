/*
  # Restrict Ticket Validation to Admin Users Only

  ## Overview
  This migration adds security policies to ensure only admin users can validate tickets.
  It restricts the ability to update ticket status to 'validated' and set validated_by field.

  ## Security Changes

  ### Tickets Table Policies
  - Add policy to allow only admins to validate tickets
  - Restrict setting validated_by field to admin users only
  - Ensure validated_at can only be set by admins during validation
  - Regular users can still transfer their own tickets

  ## Important Notes
  - Only users with role='admin' in profiles table can validate tickets
  - Ticket validation includes updating status to 'validated'
  - Validated tickets cannot be transferred or modified further
  - All validation actions are logged with admin user ID and timestamp
*/

-- Drop existing update policy for users
DROP POLICY IF EXISTS "Users can update their own tickets" ON tickets;

-- Users can update tickets they own (for transfers only, not validation)
CREATE POLICY "Users can transfer their own tickets"
    ON tickets
    FOR UPDATE
    TO authenticated
    USING (
        owner_id = auth.uid()
        AND status = 'active'
    )
    WITH CHECK (
        owner_id = auth.uid()
        AND status IN ('active', 'transferred')
        AND validated_at IS NULL
        AND validated_by IS NULL
    );

-- Only admins can validate tickets
CREATE POLICY "Admins can validate tickets"
    ON tickets
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Function to validate a ticket (admin only)
CREATE OR REPLACE FUNCTION validate_ticket(ticket_qr_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    ticket_record tickets%ROWTYPE;
    admin_check boolean;
    result json;
BEGIN
    -- Check if current user is admin
    SELECT is_admin(auth.uid()) INTO admin_check;
    
    IF NOT admin_check THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Unauthorized: Only admins can validate tickets'
        );
    END IF;
    
    -- Get the ticket
    SELECT * INTO ticket_record
    FROM tickets
    WHERE qr_code_data = ticket_qr_code;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Ticket not found'
        );
    END IF;
    
    -- Check if already validated
    IF ticket_record.status = 'validated' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Ticket already validated',
            'validated_at', ticket_record.validated_at
        );
    END IF;
    
    -- Check if ticket is active
    IF ticket_record.status != 'active' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Ticket is not active',
            'status', ticket_record.status
        );
    END IF;
    
    -- Validate the ticket
    UPDATE tickets
    SET 
        status = 'validated',
        validated_at = now(),
        validated_by = auth.uid(),
        updated_at = now()
    WHERE qr_code_data = ticket_qr_code;
    
    -- Return success with ticket details
    RETURN json_build_object(
        'success', true,
        'ticket', json_build_object(
            'id', ticket_record.id,
            'ticket_type', ticket_record.ticket_type,
            'ticket_number', ticket_record.ticket_number,
            'event_name', ticket_record.event_name,
            'event_date', ticket_record.event_date,
            'owner_id', ticket_record.owner_id
        )
    );
END;
$$;

-- Grant execute permission to authenticated users (function checks admin internally)
GRANT EXECUTE ON FUNCTION validate_ticket(text) TO authenticated;