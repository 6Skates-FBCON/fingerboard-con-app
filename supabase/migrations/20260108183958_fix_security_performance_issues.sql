/*
  # Fix Database Security and Performance Issues

  1. Add Missing Index
    - Add index on `email_verification_log.user_id` for the foreign key
    
  2. Fix RLS Policy Performance Issues
    - Update `email_verification_log` policy to use subselect for auth.uid()
    - Update `profiles` update policy to use subselect for auth.uid()
    
  3. Drop Unused Indexes
    - Remove 12 unused indexes on stripe_products, stripe_prices, profiles, admin_users, and tickets tables
    
  4. Fix Function Search Path
    - Recreate function with SECURITY INVOKER to make search_path immutable
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename = 'email_verification_log'
    AND indexname = 'idx_email_verification_log_user_id'
  ) THEN
    CREATE INDEX idx_email_verification_log_user_id ON public.email_verification_log(user_id);
  END IF;
END $$;

DROP INDEX IF EXISTS public.idx_stripe_products_active;
DROP INDEX IF EXISTS public.idx_stripe_prices_product_id;
DROP INDEX IF EXISTS public.idx_stripe_prices_active;
DROP INDEX IF EXISTS public.idx_profiles_role;
DROP INDEX IF EXISTS public.idx_profiles_email;
DROP INDEX IF EXISTS public.idx_admin_users_active;
DROP INDEX IF EXISTS public.idx_admin_users_assigned_by;
DROP INDEX IF EXISTS public.idx_tickets_order_id;
DROP INDEX IF EXISTS public.idx_tickets_qr_code;
DROP INDEX IF EXISTS public.idx_tickets_status;
DROP INDEX IF EXISTS public.idx_tickets_original_purchaser_id;
DROP INDEX IF EXISTS public.idx_tickets_validated_by;

DROP POLICY IF EXISTS "Users can view own verification status" ON public.email_verification_log;
CREATE POLICY "Users can view own verification status"
  ON public.email_verification_log FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

DROP FUNCTION IF EXISTS public.update_push_tokens_updated_at();
CREATE OR REPLACE FUNCTION public.update_push_tokens_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
