/*
  # Add Stripe Products Table

  1. New Tables
    - `stripe_products`: Stores Stripe product information
      - `id` (bigint, primary key)
      - `product_id` (text, unique) - Stripe product ID
      - `name` (text) - Product name
      - `description` (text) - Product description
      - `active` (boolean) - Whether product is active
      - `metadata` (jsonb) - Additional product metadata
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `stripe_prices`: Stores Stripe price information
      - `id` (bigint, primary key)
      - `price_id` (text, unique) - Stripe price ID
      - `product_id` (text) - References stripe_products
      - `active` (boolean) - Whether price is active
      - `currency` (text) - Price currency
      - `unit_amount` (bigint) - Price amount in cents
      - `type` (text) - 'one_time' or 'recurring'
      - `interval` (text) - For recurring: 'month', 'year', etc.
      - `interval_count` (integer) - For recurring: number of intervals
      - `metadata` (jsonb) - Additional price metadata
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access (anyone can view products/prices)
    - Only service role can insert/update/delete
*/

-- Create stripe_products table
CREATE TABLE IF NOT EXISTS stripe_products (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id text NOT NULL UNIQUE,
  name text NOT NULL,
  description text DEFAULT '',
  active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read products (they need to see what's available)
CREATE POLICY "Anyone can view active products"
  ON stripe_products
  FOR SELECT
  USING (active = true);

-- Create stripe_prices table
CREATE TABLE IF NOT EXISTS stripe_prices (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  price_id text NOT NULL UNIQUE,
  product_id text NOT NULL,
  active boolean DEFAULT true,
  currency text NOT NULL,
  unit_amount bigint NOT NULL,
  type text NOT NULL CHECK (type IN ('one_time', 'recurring')),
  interval text CHECK (interval IN ('day', 'week', 'month', 'year') OR interval IS NULL),
  interval_count integer DEFAULT 1,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES stripe_products(product_id) ON DELETE CASCADE
);

ALTER TABLE stripe_prices ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read prices
CREATE POLICY "Anyone can view active prices"
  ON stripe_prices
  FOR SELECT
  USING (active = true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stripe_prices_product_id ON stripe_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_stripe_prices_active ON stripe_prices(active);
CREATE INDEX IF NOT EXISTS idx_stripe_products_active ON stripe_products(active);

-- Create a view for products with their prices
CREATE VIEW stripe_products_with_prices WITH (security_invoker = true) AS
SELECT
  p.id,
  p.product_id,
  p.name,
  p.description,
  p.active,
  p.metadata as product_metadata,
  json_agg(
    json_build_object(
      'price_id', pr.price_id,
      'currency', pr.currency,
      'unit_amount', pr.unit_amount,
      'type', pr.type,
      'interval', pr.interval,
      'interval_count', pr.interval_count,
      'active', pr.active,
      'metadata', pr.metadata
    ) ORDER BY pr.unit_amount
  ) FILTER (WHERE pr.price_id IS NOT NULL) as prices
FROM stripe_products p
LEFT JOIN stripe_prices pr ON p.product_id = pr.product_id AND pr.active = true
WHERE p.active = true
GROUP BY p.id, p.product_id, p.name, p.description, p.active, p.metadata;

GRANT SELECT ON stripe_products_with_prices TO authenticated, anon;