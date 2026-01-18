/*
  # Add first and last name to profiles

  1. Changes
    - Add `first_name` column to profiles table
    - Add `last_name` column to profiles table
  
  2. Details
    - Both columns are text type
    - Both columns are nullable to maintain backward compatibility
    - Existing records will have NULL values for these fields
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'first_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'last_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_name text;
  END IF;
END $$;