// API endpoint to create a Stripe Connect V2 account for a user
// This uses the V2 API as specified, with merchant capabilities for card payments
// Requires STRIPE_SECRET_KEY environment variable
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for database operations

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set. Please set it to your Stripe secret key.');
}

const stripe = new Stripe(stripeSecretKey);

// Initialize Supabase client with service role key for server-side operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required for database operations.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // Extract user data from request body
    // In a real app, validate these fields and ensure user is authenticated
    const { user_id, display_name, contact_email } = req.body;

    if (!user_id || !display_name || !contact_email) {
      return res.status(400).json({ error: 'Missing required fields: user_id, display_name, contact_email' });
    }

    // Check if user already has a connected account
    const { data: existingAccount, error: checkError } = await supabase
      .from('connected_accounts')
      .select('account_id')
      .eq('user_id', user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw checkError;
    }

    if (existingAccount) {
      return res.status(400).json({ error: 'User already has a connected account', account_id: existingAccount.account_id });
    }

    // Create the connected account using Stripe V2 API
    // This creates a V2 account with merchant capabilities for card payments
    const account = await stripe.v2.core.accounts.create({
      display_name: display_name, // User's display name
      contact_email: contact_email, // User's contact email
      identity: {
        country: 'us', // Default to US, can be made configurable
      },
      dashboard: 'full', // Full dashboard access
      defaults: {
        responsibilities: {
          fees_collector: 'stripe', // Stripe handles fees
          losses_collector: 'stripe', // Stripe handles losses
        },
      },
      configuration: {
        customer: {}, // Customer configuration (empty for basic setup)
        merchant: {
          capabilities: {
            card_payments: {
              requested: true, // Request card payment capability
            },
          },
        },
      },
    });

    // Store the mapping in the database
    // This links the user to their Stripe account ID
    const { error: insertError } = await supabase
      .from('connected_accounts')
      .insert({
        user_id: user_id,
        account_id: account.id, // The Stripe account ID (starts with 'acct_')
      });

    if (insertError) {
      throw insertError;
    }

    // Return success response with account details
    res.status(200).json({
      success: true,
      account: {
        id: account.id,
        display_name: account.display_name,
        contact_email: account.contact_email,
      },
      message: 'Connected account created successfully. Proceed to onboarding.',
    });

  } catch (error) {
    console.error('Error creating connected account:', error);
    res.status(500).json({
      error: 'Failed to create connected account',
      details: error.message,
    });
  }
}
