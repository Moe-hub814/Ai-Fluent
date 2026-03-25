// supabase/functions/claude-proxy/index.ts
// This edge function proxies Claude API calls so the API key stays server-side.
// Deploy with: supabase functions deploy claude-proxy

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Get user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { feature, messages, system, session_id, context_type, context_id, context_title } = body;

    // ─── Check usage limits ───
    const { data: usageCheck } = await supabase.rpc("check_usage", {
      p_user_id: user.id,
      p_feature: feature || "tutor",
    });

    if (usageCheck && !usageCheck.allowed) {
      return new Response(JSON.stringify({
        error: "limit_reached",
        message: `You've reached your free tier limit for this feature. Upgrade to Pro for unlimited access.`,
        remaining: 0,
        limit: usageCheck.limit,
        tier: usageCheck.tier,
      }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Select model based on feature ───
    const model = (feature === "tutor" || feature === "news")
      ? "claude-sonnet-4-5-20250929"  // Better quality for tutoring & explanations
      : "claude-haiku-4-5-20241022";  // Faster & cheaper for tool workflows

    // ─── Call Claude API ───
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: feature === "tool" ? 1000 : 800,
        system: system || "You are a helpful AI tutor. Explain things simply.",
        messages: messages || [],
      }),
    });

    const claudeData = await claudeResponse.json();

    if (!claudeResponse.ok) {
      console.error("Claude API error:", claudeData);
      return new Response(JSON.stringify({ error: "Claude API error", details: claudeData }), {
        status: claudeResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const assistantText = claudeData.content
      ?.map((c: any) => c.text || "")
      .join("") || "";

    // ─── Store chat history ───
    if (session_id || context_type) {
      let sid = session_id;

      // Create session if needed
      if (!sid && context_type) {
        const { data: newSession } = await supabase
          .from("chat_sessions")
          .insert({
            user_id: user.id,
            context_type,
            context_id: context_id || null,
            context_title: context_title || null,
          })
          .select("id")
          .single();
        sid = newSession?.id;
      }

      if (sid) {
        // Store user message
        const lastUserMsg = messages?.[messages.length - 1];
        if (lastUserMsg) {
          await supabase.from("chat_messages").insert({
            session_id: sid,
            user_id: user.id,
            role: "user",
            content: lastUserMsg.content,
          });
        }

        // Store assistant response
        await supabase.from("chat_messages").insert({
          session_id: sid,
          user_id: user.id,
          role: "assistant",
          content: assistantText,
          input_tokens: claudeData.usage?.input_tokens,
          output_tokens: claudeData.usage?.output_tokens,
          model,
        });
      }

      // Record activity
      const actType = feature === "tutor" ? "tutor" : feature === "news" ? "news" : "tool";
      await supabase.rpc("record_activity", { p_user_id: user.id, p_type: actType });

      return new Response(JSON.stringify({
        text: assistantText,
        session_id: sid,
        usage: claudeData.usage,
        remaining: usageCheck?.remaining ?? -1,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No session tracking (simple response)
    return new Response(JSON.stringify({
      text: assistantText,
      usage: claudeData.usage,
      remaining: usageCheck?.remaining ?? -1,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
