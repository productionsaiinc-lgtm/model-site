-- Supabase SQL Schema for Nova Studio Membership System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- PROFILES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Set up RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can access all profiles"
  ON profiles
  USING (auth.role() = 'service_role');


-- ========================================
-- MEMBERSHIP TIERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS membership_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  paypal_plan_id TEXT UNIQUE,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_membership_tiers_name ON membership_tiers(name);

-- Set up RLS for membership_tiers (public read, service role write)
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active membership tiers"
  ON membership_tiers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role can manage membership tiers"
  ON membership_tiers
  USING (auth.role() = 'service_role');


-- ========================================
-- SUBSCRIPTIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  paypal_subscription_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, cancelled, expired
  activated_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paypal_id ON subscriptions(paypal_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Set up RLS for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions
  USING (auth.role() = 'service_role');


-- ========================================
-- PAYMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paypal_subscription_id TEXT NOT NULL REFERENCES subscriptions(paypal_subscription_id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL, -- payment_completed, payment_failed, etc.
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(paypal_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Set up RLS for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage payments"
  ON payments
  USING (auth.role() = 'service_role');


-- ========================================
-- HELPER FUNCTION: Update updated_at timestamp
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles
CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to membership_tiers
CREATE TRIGGER trigger_update_membership_tiers_updated_at
  BEFORE UPDATE ON membership_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to subscriptions
CREATE TRIGGER trigger_update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ========================================
-- SAMPLE DATA: Membership Tiers
-- ========================================
INSERT INTO membership_tiers (name, description, price, paypal_plan_id, features, is_active)
VALUES
  (
    'Pro',
    'Perfect for individual professionals',
    9.99,
    'PLAN_PRO_MONTHLY',
    '["Advanced models", "Monthly updates", "Community access", "Basic support"]'::jsonb,
    true
  ),
  (
    'Elite',
    'For serious creators and studios',
    29.99,
    'PLAN_ELITE_MONTHLY',
    '["All Pro features", "Priority support", "Custom models", "API access", "Weekly updates"]'::jsonb,
    true
  ),
  (
    'Studio',
    'For teams and agencies',
    99.99,
    'PLAN_STUDIO_MONTHLY',
    '["All Elite features", "Dedicated account manager", "Unlimited API calls", "Team seats (5)", "Custom training"]'::jsonb,
    true
  )
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- NOTES
-- ========================================
-- After running this SQL:
-- 1. Update the membership_tiers.paypal_plan_id with actual PayPal plan IDs
-- 2. Configure Supabase auth in the dashboard
-- 3. Test RLS policies with different user roles
-- 4. Monitor logs for any connection issues
