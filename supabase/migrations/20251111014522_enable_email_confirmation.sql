/*
  # Enable Email Confirmation for New Registrations

  1. Notes
    - Email confirmation is configured through Supabase Dashboard
    - This migration documents the required settings
    - Custom email templates should be configured in the Dashboard
    
  2. Email Settings Required
    - Enable email confirmation in Authentication > Settings
    - Customize email templates in Authentication > Email Templates
    - Set "From" email to include FBCon branding
*/

-- This is a documentation migration
-- Actual email configuration is done through Supabase Dashboard:
-- 1. Go to Authentication > Providers > Email
-- 2. Enable "Confirm email"
-- 3. Go to Authentication > Email Templates
-- 4. Customize the "Confirm signup" template with FBCon branding

-- Create a table to track email confirmation status if needed
CREATE TABLE IF NOT EXISTS email_verification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_verification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verification status"
  ON email_verification_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
