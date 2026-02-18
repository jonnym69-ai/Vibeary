import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Stripe-Signature",
};

// Handle CORS preflight requests
function handleCORS(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
}

// Main request handler
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  // Handle CORS
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  // Simple health check
  if (url.pathname === "/") {
    return new Response(
      JSON.stringify({ message: "Stripe payments API running" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Default response for other routes
  return new Response(
    JSON.stringify({ message: "Use /create-payment-intent or /webhook endpoints" }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Start the server
serve(handler, { port: 8000 });
