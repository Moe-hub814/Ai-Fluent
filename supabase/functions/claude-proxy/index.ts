import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

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
    const body = await req.json();
    const { feature, messages, system, use_search } = body;

    console.log("Request:", feature);

    const model = (feature === "tutor" || feature === "news_fetch" || feature === "news_chat")
      ? "claude-sonnet-4-6"
      : "claude-haiku-4-5-20251001";

    const claudeBody: any = {
      model,
      max_tokens: feature === "news_fetch" ? 2048 : 1024,
      system: system || "You are Lumi, a helpful AI guide.",
      messages: messages || [],
    };

    if (use_search || feature === "news_fetch") {
      claudeBody.tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }];
    }

    console.log("Calling:", model, "search:", !!(use_search || feature === "news_fetch"));

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
      return reply({ error: "Claude error", detail: data?.error?.message || JSON.stringify(data) }, 502);
    }

    const text = (data.content || [])
      .filter((c: any) => c.type === "text")
      .map((c: any) => c.text || "")
      .join("\n");

    console.log("Success:", text.length, "chars");

    return reply({ text, usage: data.usage });

  } catch (err) {
    console.error("CRASH:", String(err));
    return reply({ error: "Server error", detail: String(err) }, 500);
  }
});
