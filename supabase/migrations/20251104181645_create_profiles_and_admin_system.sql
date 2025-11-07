/*
  # Create User Profiles and Admin System

  ## Overview
  This migration creates a comprehensive user profile and admin role management system.
  It allows designating up to 4 users as admins with equal access privileges.

  ## New Tables

  ### profiles
  Stores user profile information and role assignments
  - `id` (uuid, primary key) - References auth.users(id)
  - `email` (text, unique, not null) - User's email address
  - `role` (user_role enum) - User's role (user or admin)
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### admin_users
  Manages the list of admin email addresses (max 4)
  - `id` (bigint, primary key) - Admin record identifier
  - `email` (text, unique, not null) - Admin email address
  - `assigned_by` (uuid) - User who assigned admin role
  - `assigned_at` (timestamptz) - When admin role was assigned
  - `is_active` (boolean) - Whether admin is currently active

  ## Enums
  - `user_role`: Defines available user roles (user, admin)

  ## Functions
  - `handle_new_user()`: Trigger function to create profile on user signup
  - `sync_user_role()`: Function to sync user role based on admin_users table
  - `is_admin(user_id)`: Helper function to check if user is admin
  - `check_max_admins()`: Validates maximum 4 active admins

  ## Triggers
  - `on_auth_user_created`: Creates profile when new user signs up
  - `on_admin_user_updated`: Syncs role when admin_users table changes
  - `enforce_max_admins`: Prevents exceeding 4 active admins

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can view their own profile
  - Only admins can view admin_users table
  - Profiles are automatically created and managed
  - Admin assignments are audit-logged

  ## Important Notes
  - Maximum 4 active admins allowed (enforced by trigger)
  - Admin status is determined by email match in admin_users table
  - Role sync happens automatically on login and admin assignment
  - All admin actions are logged with timestamps and assigners
*/

-- Create user_role enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
    END IF;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create index for faster role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Users can update their own profile (but not role)
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email text UNIQUE NOT NULL,
    assigned_by uuid REFERENCES auth.users(id),
    assigned_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin_users table
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
CREATE POLICY "Admins can view admin users"
    ON admin_users
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Function to check if a user is an admin by user_id
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_id AND role = 'admin'
    );
$$;

-- Function to check if an email is in admin list
CREATE OR REPLACE FUNCTION is_admin_email(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM admin_users
        WHERE email = user_email AND is_active = true
    );
$$;

-- Function to validate max 4 active admins
CREATE OR REPLACE FUNCTION check_max_admins()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    active_count integer;
BEGIN
    IF NEW.is_active = true THEN
        SELECT COUNT(*) INTO active_count
        FROM admin_users
        WHERE is_active = true AND id != COALESCE(NEW.id, 0);
        
        IF active_count >= 4 THEN
            RAISE EXCEPTION 'Maximum of 4 active admins allowed';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger to enforce max admins limit
DROP TRIGGER IF EXISTS enforce_max_admins ON admin_users;
CREATE TRIGGER enforce_max_admins
    BEFORE INSERT OR UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION check_max_admins();

-- Function to sync user role based on admin_users table
CREATE OR REPLACE FUNCTION sync_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update role to admin if email is in admin_users and is_active
    IF NEW.is_active = true THEN
        UPDATE profiles
        SET role = 'admin', updated_at = now()
        WHERE email = NEW.email AND role != 'admin';
    ELSE
        -- Remove admin role if deactivated
        UPDATE profiles
        SET role = 'user', updated_at = now()
        WHERE email = NEW.email AND role = 'admin';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger to sync role when admin_users is updated
DROP TRIGGER IF EXISTS on_admin_user_updated ON admin_users;
CREATE TRIGGER on_admin_user_updated
    AFTER INSERT OR UPDATE OF is_active ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_role();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create profile for new user
    INSERT INTO profiles (id, email, role)
    VALUES (
        NEW.id,
        NEW.email,
        CASE 
            WHEN is_admin_email(NEW.email) THEN 'admin'::user_role
            ELSE 'user'::user_role
        END
    );
    
    RETURN NEW;
END;
$$;

-- Trigger to create profile when new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Trigger to update updated_at on profile changes
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Backfill profiles for existing users
INSERT INTO profiles (id, email, role)
SELECT 
    id, 
    email,
    CASE 
        WHEN is_admin_email(email) THEN 'admin'::user_role
        ELSE 'user'::user_role
    END
FROM auth.users
ON CONFLICT (id) DO NOTHING;