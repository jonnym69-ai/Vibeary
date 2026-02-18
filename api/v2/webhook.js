// Webhook endpoint to handle Stripe V2 events for connected accounts
// Uses thin events for V2 webhooks, parses and handles various event types
// Requires STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET environment variables
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for database operations

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set. Please set it to your Stripe secret key.');
}

const stripe = new Stripe(stripeSecretKey);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set. Please set it to your webhook signing secret.');
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const sig = req.headers['stripe-signature'];
  let thinEvent;

  try {
    // Parse the thin event
    thinEvent = stripe.parseThinEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  try {
    // Fetch the full event data
    const event = await stripe.v2.core.events.retrieve(thinEvent.id);

    // Handle the event based on its type
    await handleEvent(event);

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Function to handle different event types
async function handleEvent(event) {
  console.log(`Handling event: ${event.type}`);

  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event);
      break;
    case 'v2.core.account[requirements].updated':
      await handleAccountRequirementsUpdated(event);
      break;
    case 'v2.core.account[configuration.merchant].capability_status_updated':
      await handleCapabilityStatusUpdated(event);
      break;
    case 'v2.core.account[configuration.customer].capability_status_updated':
      await handleCapabilityStatusUpdated(event);
      break;
    case 'payment_method.attached':
      await handlePaymentMethodAttached(event);
      break;
    case 'payment_method.detached':
      await handlePaymentMethodDetached(event);
      break;
    case 'customer.updated':
      await handleCustomerUpdated(event);
      break;
    case 'customer.tax_id.created':
    case 'customer.tax_id.updated':
    case 'customer.tax_id.deleted':
      await handleTaxIdChange(event);
      break;
    case 'billing_portal.configuration.created':
    case 'billing_portal.configuration.updated':
      await handleBillingPortalConfiguration(event);
      break;
    case 'billing_portal.session.created':
      await handleBillingPortalSession(event);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

// Handler for subscription creation
async function handleSubscriptionCreated(event) {
  const subscription = event.data.object;
  const accountId = subscription.customer_account; // V2 uses customer_account

  await upsertSubscription(accountId, subscription);
}

// Handler for subscription updates
async function handleSubscriptionUpdated(event) {
  const subscription = event.data.object;
  const accountId = subscription.customer_account;

  await upsertSubscription(accountId, subscription);
}

// Handler for subscription deletion
async function handleSubscriptionDeleted(event) {
  const subscription = event.data.object;
  const accountId = subscription.customer_account;

  // Mark subscription as canceled
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('subscription_id', subscription.id);

  if (error) {
    console.error('Error updating canceled subscription:', error);
  }
}

// Handler for account requirements updates
async function handleAccountRequirementsUpdated(event) {
  const account = event.data.object;
  // TODO: Update connected_accounts table with requirements status
  // For now, just log
  console.log('Account requirements updated for account:', account.id);
}

// Handler for capability status updates
async function handleCapabilityStatusUpdated(event) {
  const account = event.data.object;
  // TODO: Update connected_accounts table with capability status
  // For now, just log
  console.log('Capability status updated for account:', account.id);
}

// Handler for payment method attached
async function handlePaymentMethodAttached(event) {
  const paymentMethod = event.data.object;
  console.log('Payment method attached:', paymentMethod.id);
}

// Handler for payment method detached
async function handlePaymentMethodDetached(event) {
  const paymentMethod = event.data.object;
  console.log('Payment method detached:', paymentMethod.id);
}

// Handler for customer updates
async function handleCustomerUpdated(event) {
  const customer = event.data.object;
  console.log('Customer updated:', customer.id);
}

// Handler for tax ID changes
async function handleTaxIdChange(event) {
  const taxId = event.data.object;
  console.log('Tax ID changed:', taxId.id);
}

// Handler for billing portal configuration changes
async function handleBillingPortalConfiguration(event) {
  const configuration = event.data.object;
  console.log('Billing portal configuration updated:', configuration.id);
}

// Handler for billing portal session creation
async function handleBillingPortalSession(event) {
  const session = event.data.object;
  console.log('Billing portal session created:', session.id);
}

// Helper function to upsert subscription data
async function upsertSubscription(accountId, subscription) {
  const subscriptionData = {
    account_id: accountId,
    subscription_id: subscription.id,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, { onConflict: 'subscription_id' });

  if (error) {
    console.error('Error upserting subscription:', error);
  }
}
