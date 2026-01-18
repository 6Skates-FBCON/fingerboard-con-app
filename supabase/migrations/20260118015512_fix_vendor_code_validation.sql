/*
  # Fix Vendor Code Validation

  1. Changes
    - Update RLS policy to allow public (anon) access to validate vendor codes
    - This ensures vendor code validation works even before user authentication
  
  2. Security
    - Still restricts to only reading active codes
    - Admin-only policies remain for managing codes
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can validate vendor codes" ON vendor_codes;

-- Create a more permissive policy that allows both authenticated and anonymous users
-- to validate active vendor codes
CREATE POLICY "Anyone can validate active vendor codes"
  ON vendor_codes
  FOR SELECT
  TO public
  USING (is_active = true);