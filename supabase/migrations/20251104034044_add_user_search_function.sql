/*
  # Add User Search Function

  ## Overview
  Creates a secure function to search for users by email address for ticket transfers.
  
  ## New Functions
  - `search_users_by_email`: Searches for users by email (case-insensitive partial match)
    - Only returns users who have registered accounts
    - Does not expose sensitive user information
    - Returns user ID and email only
  
  ## Security
  - Function is accessible to authenticated users only
  - Results are limited to prevent abuse
  - Email addresses are already public within the app context for transfers
*/

-- Create function to search users by email
CREATE OR REPLACE FUNCTION search_users_by_email(search_email text)
RETURNS TABLE (id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::text
  FROM auth.users au
  WHERE 
    au.email ILIKE '%' || search_email || '%'
    AND au.id != auth.uid()
    AND au.email IS NOT NULL
  LIMIT 10;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_users_by_email(text) TO authenticated;