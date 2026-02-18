// API endpoint to get subscriptions for a connected account
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
    // Get account ID from query parameters
    const { accountId } = req.query;

    if (!accountId) {
      return res.status(400).json({ error: 'Missing accountId query parameter' });
    }

    // Query the subscriptions table for the account
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Return the subscriptions
    res.status(200).json({
      subscriptions: data,
    });

  } catch (error) {
    console.error('Error retrieving subscriptions:', error);
    res.status(500).json({
      error: 'Failed to retrieve subscriptions',
      details: error.message,
    });
  }
}
