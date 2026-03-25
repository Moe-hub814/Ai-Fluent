// supabase/functions/claude-proxy/index.ts
// Deploy: supabase functions deploy claude-proxy
// Set key: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { feature, messages, system } = await req.json();

    const model = (feature === "tutor" || feature === "news")
      ? "claude-haiku-4-5-20251001"
      : "claude-haiku-4-5-20251001";

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: system || "You are a helpful AI tutor. Explain things simply.",
        messages: messages || [],
      }),
    });

    const claudeData = await claudeResponse.json();

    if (!claudeResponse.ok) {
      return new Response(JSON.stringify({ error: "Claude API error", details: claudeData }), {
        status: claudeResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const text = claudeData.content?.map((c: any) => c.text || "").join("") || "";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
