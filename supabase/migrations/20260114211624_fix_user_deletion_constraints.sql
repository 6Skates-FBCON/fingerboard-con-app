/*
  # Fix User Deletion Foreign Key Constraints

  1. Changes
    - Make `original_purchaser_id` nullable in tickets table
    - Make `from_user_id` nullable in ticket_transfers table  
    - Make `to_user_id` nullable in ticket_transfers table
    - Update foreign key constraints to use ON DELETE SET NULL

  2. Purpose
    - Allow user accounts to be deleted while preserving ticket transfer history
    - When a user is deleted, their references in tickets/transfers are set to NULL
*/

-- Make original_purchaser_id nullable
ALTER TABLE tickets 
ALTER COLUMN original_purchaser_id DROP NOT NULL;

-- Make from_user_id nullable in ticket_transfers
ALTER TABLE ticket_transfers 
ALTER COLUMN from_user_id DROP NOT NULL;

-- Make to_user_id nullable in ticket_transfers  
ALTER TABLE ticket_transfers 
ALTER COLUMN to_user_id DROP NOT NULL;

-- Drop and recreate tickets foreign keys with ON DELETE SET NULL
ALTER TABLE tickets 
DROP CONSTRAINT IF EXISTS tickets_original_purchaser_id_fkey;

ALTER TABLE tickets 
ADD CONSTRAINT tickets_original_purchaser_id_fkey 
FOREIGN KEY (original_purchaser_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

ALTER TABLE tickets 
DROP CONSTRAINT IF EXISTS tickets_validated_by_fkey;

ALTER TABLE tickets 
ADD CONSTRAINT tickets_validated_by_fkey 
FOREIGN KEY (validated_by) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Drop and recreate ticket_transfers foreign keys with ON DELETE SET NULL
ALTER TABLE ticket_transfers 
DROP CONSTRAINT IF EXISTS ticket_transfers_from_user_id_fkey;

ALTER TABLE ticket_transfers 
ADD CONSTRAINT ticket_transfers_from_user_id_fkey 
FOREIGN KEY (from_user_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

ALTER TABLE ticket_transfers 
DROP CONSTRAINT IF EXISTS ticket_transfers_to_user_id_fkey;

ALTER TABLE ticket_transfers 
ADD CONSTRAINT ticket_transfers_to_user_id_fkey 
FOREIGN KEY (to_user_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Fix stripe_customers foreign key
ALTER TABLE stripe_customers 
DROP CONSTRAINT IF EXISTS stripe_customers_user_id_fkey;

ALTER TABLE stripe_customers 
ADD CONSTRAINT stripe_customers_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Fix email_verification_log foreign key
ALTER TABLE email_verification_log 
DROP CONSTRAINT IF EXISTS email_verification_log_user_id_fkey;

ALTER TABLE email_verification_log 
ADD CONSTRAINT email_verification_log_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Fix admin_users foreign key
ALTER TABLE admin_users 
DROP CONSTRAINT IF EXISTS admin_users_assigned_by_fkey;

ALTER TABLE admin_users 
ADD CONSTRAINT admin_users_assigned_by_fkey 
FOREIGN KEY (assigned_by) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Fix vendor_codes foreign key
ALTER TABLE vendor_codes 
DROP CONSTRAINT IF EXISTS vendor_codes_created_by_fkey;

ALTER TABLE vendor_codes 
ADD CONSTRAINT vendor_codes_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Fix profiles foreign key - use CASCADE so profile is deleted with user
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;