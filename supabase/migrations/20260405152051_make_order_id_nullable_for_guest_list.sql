/*
  # Make order_id Nullable for Guest List Tickets

  ## Summary
  Removes the NOT NULL constraint from the `order_id` column on the `tickets` table
  to allow guest list tickets to be inserted without a corresponding Stripe purchase order.

  ## Changes
  - `tickets.order_id`: changed from NOT NULL to nullable

  ## Rationale
  Guest list tickets are not purchased through Stripe, so they have no associated order.
  A NULL order_id accurately represents that no purchase was made, rather than using a
  fake/placeholder order ID.

  ## Important Notes
  - No data is modified by this migration
  - Existing tickets with a real order_id are unaffected
  - The foreign key reference to stripe_orders(id) is preserved; it simply becomes optional
*/

ALTER TABLE tickets ALTER COLUMN order_id DROP NOT NULL;
