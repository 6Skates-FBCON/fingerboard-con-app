/*
  # Make Address Fields International

  1. Changes
    - Add `country` column to profiles table
    - Rename `state` to `state_province` for clarity
    - Rename `zip_code` to `postal_code` for international compatibility
  
  2. Notes
    - These fields remain optional to support various address formats worldwide
*/

-- Add country column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'country'
  ) THEN
    ALTER TABLE profiles ADD COLUMN country text;
  END IF;
END $$;

-- Rename state to state_province if state exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'state'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'state_province'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN state TO state_province;
  END IF;
END $$;

-- Rename zip_code to postal_code if zip_code exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'zip_code'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN zip_code TO postal_code;
  END IF;
END $$;
