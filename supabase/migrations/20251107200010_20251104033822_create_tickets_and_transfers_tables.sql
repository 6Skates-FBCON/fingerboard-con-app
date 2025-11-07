/*
  # Create Tickets and Ticket Transfers Tables

  ## Overview
  This migration creates a comprehensive ticketing system with individual QR codes
  and transfer capabilities. Each ticket purchased gets its own unique QR code,
  allowing for independent transfers and validation.

  ## New Tables

  ### tickets
  Stores individual ticket records with unique QR codes
  - `id` (bigint, primary key) - Unique ticket identifier
  - `order_id` (bigint, references stripe_orders) - Links to purchase order
  - `ticket_type` (text) - Type of ticket (e.g., "General Admission")
  - `ticket_number` (integer) - Number within the order (1 of 4, 2 of 4, etc.)
  - `qr_code_data` (text, unique) - Unique identifier for QR code
  - `owner_id` (uuid, references auth.users) - Current owner of the ticket
  - `original_purchaser_id` (uuid, references auth.users) - Original buyer
  - `status` (ticket_status enum) - Current ticket status
  - `validated_at` (timestamptz) - When ticket was scanned/used
  - `validated_by` (uuid) - Staff member who validated ticket
  - `background_color` (text) - Color for ticket display
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### ticket_transfers
  Complete audit trail of all ticket transfers
  - `id` (bigint, primary key) - Transfer record identifier
  - `ticket_id` (bigint, references tickets) - Ticket being transferred
  - `from_user_id` (uuid, references auth.users) - Sender
  - `to_user_id` (uuid, references auth.users) - Recipient
  - `transfer_status` (transfer_status enum) - Status of transfer
  - `transferred_at` (timestamptz) - When transfer completed
  - `created_at` (timestamptz) - When transfer initiated

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can view tickets they own or originally purchased
  - Users can view transfer history for their tickets
  - Only current ticket owners can initiate transfers
  - Staff role can validate tickets

  ## Important Notes
  - Each ticket purchased generates a separate record with unique QR code
  - Tickets can be transferred independently even if bought together
  - Transfer history is immutable for audit purposes
  - Validated tickets cannot be transferred or reused
*/

-- Create enum types for ticket status
CREATE TYPE ticket_status AS ENUM (
    'active',
    'transferred',
    'validated',
    'expired',
    'cancelled'
);

-- Create enum type for transfer status
CREATE TYPE transfer_status AS ENUM (
    'pending',
    'completed',
    'rejected',
    'cancelled'
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    order_id bigint REFERENCES stripe_orders(id) NOT NULL,
    ticket_type text NOT NULL,
    ticket_number integer NOT NULL DEFAULT 1,
    qr_code_data text UNIQUE NOT NULL,
    owner_id uuid REFERENCES auth.users(id) NOT NULL,
    original_purchaser_id uuid REFERENCES auth.users(id) NOT NULL,
    status ticket_status NOT NULL DEFAULT 'active',
    validated_at timestamptz DEFAULT NULL,
    validated_by uuid REFERENCES auth.users(id) DEFAULT NULL,
    background_color text NOT NULL DEFAULT '#4CAF50',
    event_name text NOT NULL DEFAULT 'Fingerboard Con 2026',
    event_date text NOT NULL DEFAULT 'April 24-26, 2026',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tickets_owner_id ON tickets(owner_id);
CREATE INDEX IF NOT EXISTS idx_tickets_order_id ON tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_qr_code ON tickets(qr_code_data);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Users can view tickets they own
CREATE POLICY "Users can view their own tickets"
    ON tickets
    FOR SELECT
    TO authenticated
    USING (owner_id = auth.uid());

-- Users can view tickets they originally purchased (even if transferred)
CREATE POLICY "Users can view tickets they purchased"
    ON tickets
    FOR SELECT
    TO authenticated
    USING (original_purchaser_id = auth.uid());

-- Users can update tickets they own (for transfers)
CREATE POLICY "Users can update their own tickets"
    ON tickets
    FOR UPDATE
    TO authenticated
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Create ticket_transfers table
CREATE TABLE IF NOT EXISTS ticket_transfers (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ticket_id bigint REFERENCES tickets(id) NOT NULL,
    from_user_id uuid REFERENCES auth.users(id) NOT NULL,
    to_user_id uuid REFERENCES auth.users(id) NOT NULL,
    transfer_status transfer_status NOT NULL DEFAULT 'completed',
    transferred_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transfers_ticket_id ON ticket_transfers(ticket_id);
CREATE INDEX IF NOT EXISTS idx_transfers_from_user ON ticket_transfers(from_user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_user ON ticket_transfers(to_user_id);

-- Enable RLS
ALTER TABLE ticket_transfers ENABLE ROW LEVEL SECURITY;

-- Users can view transfers they were involved in
CREATE POLICY "Users can view their transfer history"
    ON ticket_transfers
    FOR SELECT
    TO authenticated
    USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- Users can create transfers for tickets they own
CREATE POLICY "Users can create transfers for their tickets"
    ON ticket_transfers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        from_user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM tickets
            WHERE tickets.id = ticket_id
            AND tickets.owner_id = auth.uid()
            AND tickets.status = 'active'
        )
    );

-- Create a view for ticket details with transfer history
CREATE VIEW ticket_details WITH (security_invoker = true) AS
SELECT
    t.id,
    t.order_id,
    t.ticket_type,
    t.ticket_number,
    t.qr_code_data,
    t.owner_id,
    t.original_purchaser_id,
    t.status,
    t.validated_at,
    t.background_color,
    t.event_name,
    t.event_date,
    t.created_at,
    COUNT(tt.id) as transfer_count,
    CASE
        WHEN t.owner_id != t.original_purchaser_id THEN true
        ELSE false
    END as was_transferred
FROM tickets t
LEFT JOIN ticket_transfers tt ON t.id = tt.ticket_id
WHERE t.owner_id = auth.uid() OR t.original_purchaser_id = auth.uid()
GROUP BY t.id, t.order_id, t.ticket_type, t.ticket_number, t.qr_code_data,
         t.owner_id, t.original_purchaser_id, t.status, t.validated_at,
         t.background_color, t.event_name, t.event_date, t.created_at;

GRANT SELECT ON ticket_details TO authenticated;