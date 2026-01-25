/*
  # Add Access Code Requirement to Products

  1. Changes
    - Add `requires_access_code` column to `stripe_products` table
    - Update specific products to require access code:
      - General Admission
      - Complete Admission
      - Blackriver FBCon deck & admission

  2. Security
    - No RLS changes needed (inherits existing policies)
*/

-- Add requires_access_code column to stripe_products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stripe_products' AND column_name = 'requires_access_code'
  ) THEN
    ALTER TABLE stripe_products 
    ADD COLUMN requires_access_code boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Update products that require access code
UPDATE stripe_products
SET requires_access_code = true
WHERE name IN (
  'General Admission',
  'Complete Admission',
  'Blackriver FBCon deck & admission'
);
