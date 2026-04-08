import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("ANON_KEY");

// Simple in-memory rate limiter (resets on redeploy)
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRate(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

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
    // 1. Validate the request has a valid apikey
    const apikey = req.headers.get("apikey") || "";
    
    // The apikey must match the Supabase anon/publishable key
    // This ensures only requests from our app (which has the key) can call this function
    if (!apikey || apikey.length < 20) {
      console.warn("Blocked: missing or invalid apikey");
      return reply({ error: "Unauthorized", detail: "Missing API key" }, 401);
    }

    // If we have SUPABASE_ANON_KEY set, validate against it
    if (SUPABASE_ANON_KEY && apikey !== SUPABASE_ANON_KEY) {
      console.warn("Blocked: apikey mismatch");
      return reply({ error: "Unauthorized", detail: "Invalid API key" }, 401);
    }

    // 2. Rate limiting by IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRate(ip)) {
      console.warn("Rate limited:", ip);
      return reply({ error: "Too many requests", detail: "Please slow down. Try again in a minute." }, 429);
    }

    // 3. Parse and validate body
    const body = await req.json();
    const { feature, messages, system, use_search } = body;

    if (!feature || !messages || !Array.isArray(messages) || messages.length === 0) {
      return reply({ error: "Bad request", detail: "Missing feature or messages" }, 400);
    }

    // 4. Validate feature is one of our allowed types
    const ALLOWED_FEATURES = ["tutor", "news_fetch", "news_chat", "tool", "practice", "challenge"];
    if (!ALLOWED_FEATURES.includes(feature)) {
      return reply({ error: "Bad request", detail: "Invalid feature type" }, 400);
    }

    console.log("Request:", feature, "from:", ip);

    // 5. Select model
    const model = (feature === "tutor" || feature === "news_fetch" || feature === "news_chat")
      ? "claude-sonnet-4-6"
      : "claude-haiku-4-5-20251001";

    // 6. Build Claude request with token limits to prevent abuse
    const claudeBody: any = {
      model,
      max_tokens: feature === "news_fetch" ? 2048 : feature === "tutor" ? 4096 : 1024,
      system: (system || "You are Lumi, a helpful AI guide.").slice(0, 2000), // Cap system prompt length
      messages: messages.slice(-10).map((m: any) => ({ // Max 10 messages, prevent huge context
        role: m.role === "user" ? "user" : "assistant",
        content: String(m.content || "").slice(0, feature === "tutor" ? 8000 : 3000), // Higher cap for tutor/translation
      })),
    };

    if (use_search || feature === "news_fetch") {
      claudeBody.tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }];
    }

    console.log("Calling:", model);

    // 7. Call Claude API
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
      return reply({ error: "Claude error", detail: data?.error?.message || "AI service unavailable" }, 502);
    }

    // 8. Extract text response
    let text = (data.content || [])
      .filter((c: any) => c.type === "text")
      .map((c: any) => c.text || "")
      .join("\n");

    // For news_fetch, try to extract clean JSON from the response
    if (feature === "news_fetch" && text) {
      // Try to find JSON array in the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          JSON.parse(jsonMatch[0]); // Validate it's valid JSON
          text = jsonMatch[0]; // Return just the clean JSON
        } catch (e) {
          console.warn("JSON extraction failed, returning raw text");
        }
      }
    }

    console.log("Success:", text.length, "chars");

    return reply({ text, usage: data.usage });

  } catch (err) {
    console.error("CRASH:", String(err));
    return reply({ error: "Server error", detail: "Something went wrong. Please try again." }, 500);
  }
});
