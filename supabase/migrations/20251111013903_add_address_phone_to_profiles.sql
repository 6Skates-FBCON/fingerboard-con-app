/*
  # Add Address and Phone Number to Profiles

  1. Changes
    - Add `phone_number` column (text, optional)
    - Add `address` column (text, optional)
    - Add `city` column (text, optional)
    - Add `state` column (text, optional)
    - Add `zip_code` column (text, optional)
  
  2. Security
    - Users can update their own profile information
*/

-- Add address and phone columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'city'
  ) THEN
    ALTER TABLE profiles ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'state'
  ) THEN
    ALTER TABLE profiles ADD COLUMN state text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE profiles ADD COLUMN zip_code text;
  END IF;
END $$;
