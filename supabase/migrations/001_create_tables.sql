-- Create premium_users table
CREATE TABLE IF NOT EXISTS premium_users (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_type TEXT DEFAULT 'premium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for premium_users
ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;

-- Create policy for premium_users (users can only see their own premium status)
CREATE POLICY "Users can view own premium status" ON premium_users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own premium status" ON premium_users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own premium status" ON premium_users
  FOR UPDATE USING (auth.uid() = user_id);

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_favorites
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policy for user_favorites (users can only manage their own favorites)
CREATE POLICY "Users can view own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own favorites" ON user_favorites
  FOR UPDATE USING (auth.uid() = user_id);

-- Create payments table for tracking transactions
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  stripe_payment_intent_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Enable RLS for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policy for payments (users can only see their own payments)
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_premium_users_user_id ON premium_users(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
-- Create user_library table for premium users' personal audiobook collections
CREATE TABLE IF NOT EXISTS user_library (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  narrator TEXT,
  platform TEXT DEFAULT 'manual', -- audible, amazon, google, etc.
  source_url TEXT,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, title, author) -- Prevent duplicate entries
);

-- Enable RLS for user_library
ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;

-- Create policy for user_library (users can only manage their own library)
CREATE POLICY "Users can view own library" ON user_library
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own library" ON user_library
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own library" ON user_library
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own library" ON user_library
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_title ON user_library(title);
CREATE INDEX IF NOT EXISTS idx_user_library_author ON user_library(author);

-- Create connected_accounts table for Stripe Connect V2 accounts
CREATE TABLE IF NOT EXISTS connected_accounts (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  account_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for connected_accounts
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;

-- Create policy for connected_accounts (users can only manage their own connected account)
CREATE POLICY "Users can view own connected account" ON connected_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connected account" ON connected_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connected account" ON connected_accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON connected_accounts(user_id);

-- Create subscriptions table for tracking subscription status on connected accounts
CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGSERIAL PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES connected_accounts(account_id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for subscriptions (users can view subscriptions for their connected accounts)
CREATE POLICY "Users can view subscriptions for their accounts" ON subscriptions
  FOR SELECT USING (
    account_id IN (
      SELECT account_id FROM connected_accounts WHERE user_id = auth.uid()
    )
  );

-- Create policy for service role to manage subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_account_id ON subscriptions(account_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscription_id ON subscriptions(subscription_id);
