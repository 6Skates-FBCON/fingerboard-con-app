/*
  # Fix All Security and Performance Issues

  ## Overview
  This migration comprehensively addresses all security and performance issues identified:

  ### 1. Foreign Key Indexes
  - Add missing index on `admin_users.assigned_by` foreign key

  ### 2. RLS Policy Optimization (Auth Initialization Plan)
  Fix all RLS policies to use `(select auth.uid())` pattern to prevent per-row re-evaluation:
  - `profiles` - Users can view their own profile
  - `profiles` - Users can update their own profile
  - `admin_users` - Admins can view admin users
  - `tickets` - Users can transfer their own tickets
  - `tickets` - Admins can validate tickets

  ### 3. Multiple Permissive Policies
  - Consolidate UPDATE policies on tickets table into restrictive policies

  ### 4. Function Search Path Security
  Add explicit search_path to all functions to prevent privilege escalation:
  - `is_admin()`
  - `is_admin_email()`
  - `check_max_admins()`
  - `sync_user_role()`
  - `handle_new_user()`
  - `update_updated_at_column()`
  - `validate_ticket()`

  ### 5. Unused Indexes
  These indexes are kept as they support essential queries:
  - Profile indexes: Support admin checks and user lookups
  - Ticket indexes: Support ownership, validation, and QR code lookups
  - Transfer indexes: Support transfer history queries
  - Stripe indexes: Support product and pricing queries

  Note: Indexes show as "unused" because the database is new with minimal data.
  They will be essential as the application scales.

  ## Security Notes
  - All auth function calls optimized for performance
  - Function search paths hardened against injection attacks
  - Policies properly separated by action type
  - Foreign key relationships properly indexed
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEX
-- ============================================================================

-- Index for admin_users.assigned_by foreign key
CREATE INDEX IF NOT EXISTS idx_admin_users_assigned_by ON admin_users(assigned_by);

-- ============================================================================
-- 2. OPTIMIZE RLS POLICIES - Fix Auth Initialization Plan Issues
-- ============================================================================

-- PROFILES TABLE: Optimize auth.uid() calls
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (id = (select auth.uid()))
    WITH CHECK (id = (select auth.uid()) AND role = (SELECT role FROM profiles WHERE id = (select auth.uid())));

-- ADMIN_USERS TABLE: Optimize auth.uid() calls
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
CREATE POLICY "Admins can view admin users"
    ON admin_users
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = (select auth.uid())
            AND profiles.role = 'admin'
        )
    );

-- TICKETS TABLE: Fix multiple permissive policies issue
-- Drop all existing UPDATE policies
DROP POLICY IF EXISTS "Users can update their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can transfer their own tickets" ON tickets;
DROP POLICY IF EXISTS "Admins can validate tickets" ON tickets;

-- Recreate as separate policies with optimized auth calls
-- Users can transfer their own active tickets
CREATE POLICY "Users can transfer their own tickets"
    ON tickets
    FOR UPDATE
    TO authenticated
    USING (
        owner_id = (select auth.uid())
        AND status = 'active'
    )
    WITH CHECK (
        owner_id = (select auth.uid())
        AND status IN ('active', 'transferred')
        AND validated_at IS NULL
        AND validated_by IS NULL
    );

-- Admins can validate tickets (as restrictive policy)
DROP POLICY IF EXISTS "Admins can validate tickets restrictive" ON tickets;
CREATE POLICY "Admins can validate tickets restrictive"
    ON tickets
    AS RESTRICTIVE
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = (select auth.uid())
            AND profiles.role = 'admin'
        )
        OR owner_id = (select auth.uid())
    );

-- ============================================================================
-- 3. FIX FUNCTION SEARCH PATH SECURITY ISSUES
-- ============================================================================

-- Function: is_admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_id AND role = 'admin'
    );
$$;

-- Function: is_admin_email
CREATE OR REPLACE FUNCTION is_admin_email(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM admin_users
        WHERE email = user_email AND is_active = true
    );
$$;

-- Function: check_max_admins
CREATE OR REPLACE FUNCTION check_max_admins()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

-- Function: sync_user_role
CREATE OR REPLACE FUNCTION sync_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

-- Function: handle_new_user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

-- Function: update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Function: validate_ticket
CREATE OR REPLACE FUNCTION validate_ticket(ticket_qr_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    ticket_record tickets%ROWTYPE;
    admin_check boolean;
    result json;
    current_user_id uuid;
BEGIN
    -- Get current user ID once
    SELECT auth.uid() INTO current_user_id;
    
    -- Check if current user is admin
    SELECT is_admin(current_user_id) INTO admin_check;
    
    IF NOT admin_check THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Unauthorized: Only admins can validate tickets'
        );
    END IF;
    
    -- Get the ticket
    SELECT * INTO ticket_record
    FROM tickets
    WHERE qr_code_data = ticket_qr_code;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Ticket not found'
        );
    END IF;
    
    -- Check if already validated
    IF ticket_record.status = 'validated' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Ticket already validated',
            'validated_at', ticket_record.validated_at
        );
    END IF;
    
    -- Check if ticket is active
    IF ticket_record.status != 'active' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Ticket is not active',
            'status', ticket_record.status
        );
    END IF;
    
    -- Validate the ticket
    UPDATE tickets
    SET 
        status = 'validated',
        validated_at = now(),
        validated_by = current_user_id,
        updated_at = now()
    WHERE qr_code_data = ticket_qr_code;
    
    -- Return success with ticket details
    RETURN json_build_object(
        'success', true,
        'ticket', json_build_object(
            'id', ticket_record.id,
            'ticket_type', ticket_record.ticket_type,
            'ticket_number', ticket_record.ticket_number,
            'event_name', ticket_record.event_name,
            'event_date', ticket_record.event_date,
            'owner_id', ticket_record.owner_id
        )
    );
END;
$$;