/*
  # Create Vendor Codes Table

  1. New Tables
    - `vendor_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique) - The vendor access code
      - `is_active` (boolean) - Whether the code is currently valid
      - `used_count` (integer) - Number of times this code has been used
      - `max_uses` (integer, nullable) - Maximum number of uses allowed (null = unlimited)
      - `created_at` (timestamptz)
      - `created_by` (uuid, nullable) - Admin who created the code
      - `notes` (text, nullable) - Optional notes about the code

  2. Security
    - Enable RLS on `vendor_codes` table
    - Add policy for authenticated users to read active codes (for validation)
    - Add policy for admins to manage codes

  3. Indexes
    - Add index on code for faster lookups
    - Add index on is_active for filtering
*/

CREATE TABLE IF NOT EXISTS vendor_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  used_count integer DEFAULT 0 NOT NULL,
  max_uses integer,
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  notes text
);

-- Add indexes
CREATE INDEX IF NOT EXISTS vendor_codes_code_idx ON vendor_codes(code);
CREATE INDEX IF NOT EXISTS vendor_codes_is_active_idx ON vendor_codes(is_active);

-- Enable RLS
ALTER TABLE vendor_codes ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to check if a code is valid
CREATE POLICY "Authenticated users can validate vendor codes"
  ON vendor_codes
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy for admins to view all codes
CREATE POLICY "Admins can view all vendor codes"
  ON vendor_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy for admins to insert codes
CREATE POLICY "Admins can insert vendor codes"
  ON vendor_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy for admins to update codes
CREATE POLICY "Admins can update vendor codes"
  ON vendor_codes
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

-- Policy for admins to delete codes
CREATE POLICY "Admins can delete vendor codes"
  ON vendor_codes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert some initial vendor codes
INSERT INTO vendor_codes (code, notes, max_uses) VALUES
  ('VENDOR2026', 'General vendor access code', NULL),
  ('FBCON-VENDOR', 'Alternative vendor code', NULL)
ON CONFLICT (code) DO NOTHING;