/*
  # Create Push Notifications Table

  1. New Tables
    - `push_tokens`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `expo_push_token` (text, unique)
      - `device_id` (text, optional device identifier)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `push_tokens` table
    - Add policy for users to manage their own push tokens
    - Add policy for admins to read all tokens (for sending notifications)

  3. Indexes
    - Index on user_id for faster lookups
    - Index on expo_push_token for deduplication
*/

-- Create push_tokens table
CREATE TABLE IF NOT EXISTS push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  expo_push_token text NOT NULL,
  device_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique index on expo_push_token to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS push_tokens_token_idx ON push_tokens(expo_push_token);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS push_tokens_user_id_idx ON push_tokens(user_id);

-- Enable RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own tokens
CREATE POLICY "Users can view own push tokens"
  ON push_tokens
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own tokens
CREATE POLICY "Users can insert own push tokens"
  ON push_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tokens
CREATE POLICY "Users can update own push tokens"
  ON push_tokens
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own tokens
CREATE POLICY "Users can delete own push tokens"
  ON push_tokens
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Admins can view all tokens (for sending notifications)
CREATE POLICY "Admins can view all push tokens"
  ON push_tokens
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_push_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_push_tokens_updated_at
  BEFORE UPDATE ON push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_push_tokens_updated_at();