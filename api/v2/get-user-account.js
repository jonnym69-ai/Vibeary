// API endpoint to get a user's connected Stripe account
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for database operations

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    // Get user ID from query parameters
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId query parameter' });
    }

    // Query the connected_accounts table for the user's account
    const { data, error } = await supabase
      .from('connected_accounts')
      .select('account_id')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return res.status(200).json({ account_id: null });
      }
      throw error;
    }

    // Return the account ID
    res.status(200).json({
      account_id: data.account_id,
    });

  } catch (error) {
    console.error('Error retrieving user account:', error);
    res.status(500).json({
      error: 'Failed to retrieve user account',
      details: error.message,
    });
  }
}
