/*
  # Add Display Name to Profiles

  1. Changes
    - Add `display_name` column to profiles table (text, optional)
    - Users can set a display name separate from their email

  2. Security
    - Users can update their own display_name through existing RLS policies
*/

-- Add display_name column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN display_name text;
  END IF;
END $$;
