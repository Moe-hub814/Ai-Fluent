import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function reply(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    // 1. Auth
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    
    console.log("Auth header present:", !!token, "length:", token.length);

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    let userId: string | null = null;

    if (token && token.length > 20) {
      const { data, error } = await supabase.auth.getUser(token);
      if (error) console.warn("Auth error:", error.message);
      if (data?.user) userId = data.user.id;
    }

    console.log("User ID:", userId || "anonymous");

    // 2. Parse body
    const body = await req.json();
    const { feature, messages, system, use_search } = body;
    console.log("Feature:", feature, "Messages:", messages?.length || 0);

    // 3. Model selection
    const model = (feature === "tutor" || feature === "news_fetch" || feature === "news_chat")
      ? "claude-sonnet-4-5-20250929"
      : "claude-haiku-4-5-20241022";

    // 4. Build request
    const claudeBody: any = {
      model,
      max_tokens: feature === "news_fetch" ? 2048 : 1024,
      system: system || "You are Lumi, a helpful AI guide.",
      messages: messages || [],
    };

    if (use_search || feature === "news_fetch") {
      claudeBody.tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }];
    }

    console.log("Calling Claude:", model, "search:", !!(use_search || feature === "news_fetch"));

    // 5. Call Claude API
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(claudeBody),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Claude error:", res.status, JSON.stringify(data));
      return reply({ error: "Claude error", detail: data?.error?.message || "Unknown" }, 502);
    }

    // 6. Extract text
    const text = (data.content || [])
      .filter((c: any) => c.type === "text")
      .map((c: any) => c.text || "")
      .join("\n");

    console.log("Success! Response length:", text.length, "chars");

    // 7. Record activity (don't block response)
    if (userId) {
      try { await supabase.rpc("record_activity", { p_user_id: userId, p_type: feature || "general" }); }
      catch (e) { console.warn("Activity record failed:", e); }
    }

    return reply({ text, usage: data.usage });

  } catch (err) {
    console.error("CRASH:", String(err), (err as any)?.stack);
    return reply({ error: "Server error", detail: String(err) }, 500);
  }
});
