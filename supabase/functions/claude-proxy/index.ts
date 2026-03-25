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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { feature, messages, system, session_id, context_type, context_id, context_title, use_search } = body;

    // Check usage limits
    const { data: usageCheck } = await supabase.rpc("check_usage", {
      p_user_id: user.id,
      p_feature: feature || "tutor",
    });

    if (usageCheck && !usageCheck.allowed) {
      return new Response(JSON.stringify({
        error: "limit_reached",
        message: "You've reached your free tier limit. Upgrade to Pro for unlimited access.",
        remaining: 0,
      }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Select model based on feature
    const model = (feature === "tutor" || feature === "news_chat")
      ? "claude-haiku-4-5-20251001"
      : "claude-haiku-4-5-20251001";

    // Build request body
    const claudeBody: any = {
      model,
      max_tokens: feature === "news_fetch" ? 2000 : feature === "tool" ? 1000 : 800,
      system: system || "You are a helpful AI guide called Lumi.",
      messages: messages || [],
    };

    // Add web search tool for news fetching
    if (use_search || feature === "news_fetch") {
      claudeBody.tools = [{
        type: "web_search_20250305",
        name: "web_search",
      }];
    }

    // Call Claude API
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(claudeBody),
    });

    const claudeData = await claudeResponse.json();

    if (!claudeResponse.ok) {
      console.error("Claude API error:", claudeData);
      return new Response(JSON.stringify({ error: "Claude API error", details: claudeData }), {
        status: claudeResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract text from response (handle web search blocks too)
    const assistantText = claudeData.content
      ?.filter((c: any) => c.type === "text")
      .map((c: any) => c.text || "")
      .join("\n") || "";

    // Store chat history if session tracking
    if (session_id || context_type) {
      let sid = session_id;
      if (!sid && context_type) {
        const { data: newSession } = await supabase
          .from("chat_sessions")
          .insert({ user_id: user.id, context_type, context_id: context_id || null, context_title: context_title || null })
          .select("id").single();
        sid = newSession?.id;
      }
      if (sid) {
        const lastMsg = messages?.[messages.length - 1];
        if (lastMsg) {
          await supabase.from("chat_messages").insert({ session_id: sid, user_id: user.id, role: "user", content: lastMsg.content });
        }
        await supabase.from("chat_messages").insert({
          session_id: sid, user_id: user.id, role: "assistant", content: assistantText,
          input_tokens: claudeData.usage?.input_tokens, output_tokens: claudeData.usage?.output_tokens, model,
        });
      }

      const actType = feature === "tutor" ? "tutor" : feature?.startsWith("news") ? "news" : "tool";
      await supabase.rpc("record_activity", { p_user_id: user.id, p_type: actType });

      return new Response(JSON.stringify({
        text: assistantText, session_id: sid, usage: claudeData.usage, remaining: usageCheck?.remaining ?? -1,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({
      text: assistantText, usage: claudeData.usage, remaining: usageCheck?.remaining ?? -1,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error", msg: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
