// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@16.12.0";

// Initialize Supabase client using Deno runtime environment variables
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Initialize Stripe with secret key from environment
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Stripe-Signature",
};

// Handle CORS preflight requests
function handleCORS(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
}

// Create PaymentIntent endpoint
async function createPaymentIntent(req) {
  try {
    const { amount, currency = "usd", metadata = {} } = await req.json();
    
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Valid amount is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: ["card", "apple_pay", "google_pay"]
      }
    });

    // Store payment record in Supabase (optional - for tracking)
    const { error } = await supabase
      .from("payments")
      .insert({
        user_id: metadata.user_id || null,
        amount,
        currency,
        stripe_payment_intent_id: paymentIntent.id,
        status: paymentIntent.status,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error("Error storing payment:", error);
    }

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("PaymentIntent creation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// Webhook handler for Stripe events
async function handleWebhook(req) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const body = await req.text();

  if (!signature || !webhookSecret) {
    return new Response(
      JSON.stringify({ error: "Missing signature or webhook secret" }),
      { status: 400 }
    );
  }

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    console.log("Webhook event received:", event.type);

    // Handle important events
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);
        
        // Update payment record in Supabase
        await supabase
          .from("payments")
          .update({ 
            status: "succeeded",
            completed_at: new Date().toISOString()
          })
          .eq("stripe_payment_intent_id", paymentIntent.id);
        break;

      case "payment_intent.payment_failed":
        console.log("Payment failed:", event.data.object.id);
        
        // Update payment record in Supabase
        await supabase
          .from("payments")
          .update({ 
            status: "failed",
            error_message: event.data.object.last_payment_error?.message
          })
          .eq("stripe_payment_intent_id", event.data.object.id);
        break;

      case "customer.subscription.created":
        console.log("Subscription created:", event.data.object.id);
        break;

      case "customer.subscription.deleted":
        console.log("Subscription cancelled:", event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: "Webhook signature verification failed" }),
      { status: 400 }
    );
  }
}

// Main request handler
async function handler(req) {
  const url = new URL(req.url);
  
  // Handle CORS
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  // Route requests
  if (url.pathname === "/create-payment-intent" && req.method === "POST") {
    return await createPaymentIntent(req);
  }
  
  if (url.pathname === "/webhook" && req.method === "POST") {
    return await handleWebhook(req);
  }

  // Default response
  return new Response(
    JSON.stringify({ message: "Stripe payments API" }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Start the server
serve(handler, { port: 8000 });
