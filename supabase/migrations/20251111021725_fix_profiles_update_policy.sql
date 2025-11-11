/*
  # Fix Profiles Update Policy

  1. Changes
    - Drop and recreate the update policy to avoid infinite recursion
    - Simplify the WITH CHECK to only verify the user is updating their own record
    - The role field is already protected by the trigger, so we don't need to check it in the policy

  2. Security
    - Users can only update their own profile
    - The role field remains protected by the trigger system
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create a simpler update policy without recursion
CREATE POLICY "Users can update their own profile"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
