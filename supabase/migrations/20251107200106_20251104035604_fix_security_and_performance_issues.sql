/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses security and performance issues identified in the database:
  
  1. Missing Foreign Key Indexes
    - Add indexes for `original_purchaser_id` and `validated_by` foreign keys
  
  2. RLS Policy Optimization
    - Update all RLS policies to use `(select auth.uid())` pattern for better performance
    - This prevents re-evaluation of auth functions for each row
  
  3. Consolidate Permissive Policies
    - Merge multiple SELECT policies on tickets table into single efficient policy
  
  ## Changes Made
  - Added missing foreign key indexes
  - Recreated all RLS policies with optimized auth function calls
  - Consolidated duplicate SELECT policies
*/

-- Add missing foreign key indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tickets_original_purchaser_id ON tickets(original_purchaser_id);
CREATE INDEX IF NOT EXISTS idx_tickets_validated_by ON tickets(validated_by);

-- Drop existing RLS policies to recreate them with optimized auth calls
-- stripe_customers table
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;
CREATE POLICY "Users can view their own customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- stripe_subscriptions table
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;
CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stripe_customers
      WHERE stripe_customers.customer_id = stripe_subscriptions.customer_id
      AND stripe_customers.user_id = (select auth.uid())
    )
  );

-- stripe_orders table
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;
CREATE POLICY "Users can view their own order data"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stripe_customers
      WHERE stripe_customers.customer_id = stripe_orders.customer_id
      AND stripe_customers.user_id = (select auth.uid())
    )
  );

-- tickets table - consolidate multiple SELECT policies into one
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can view tickets they purchased" ON tickets;

-- Single optimized SELECT policy that allows viewing owned OR originally purchased tickets
CREATE POLICY "Users can view their tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (
    owner_id = (select auth.uid()) 
    OR original_purchaser_id = (select auth.uid())
  );

-- Recreate UPDATE policy with optimized auth call
DROP POLICY IF EXISTS "Users can update their own tickets" ON tickets;
CREATE POLICY "Users can update their own tickets"
  ON tickets
  FOR UPDATE
  TO authenticated
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));

-- ticket_transfers table
DROP POLICY IF EXISTS "Users can view their transfer history" ON ticket_transfers;
CREATE POLICY "Users can view their transfer history"
  ON ticket_transfers
  FOR SELECT
  TO authenticated
  USING (
    from_user_id = (select auth.uid()) 
    OR to_user_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "Users can create transfers for their tickets" ON ticket_transfers;
CREATE POLICY "Users can create transfers for their tickets"
  ON ticket_transfers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    from_user_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_id
      AND tickets.owner_id = (select auth.uid())
      AND tickets.status = 'active'
    )
  );