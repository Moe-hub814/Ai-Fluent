import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("ANON_KEY");
// Injected automatically by Supabase for every edge function.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// ---- AI NEWS CACHE -------------------------------------------------------
// The live web search takes 15-30 s. Testers said nobody waits that long.
// Stories are shared: one fetch per language every NEWS_TTL serves everyone.
//   1. in-memory (this isolate)      → ~0 ms
//   2. public.news_cache (Postgres)  → ~200 ms   (migration 20260903_news_cache.sql)
//   3. Claude + web search           → 15-30 s, then written to 1 + 2
const NEWS_TTL = 3 * 60 * 60 * 1000; // 3 hours
const newsMem = new Map<string, { articles: unknown[]; fetchedAt: number }>();
const newsInflight = new Map<string, Promise<unknown[] | null>>();

function newsKey(lang: string) {
  return `${lang}:${new Date().toISOString().slice(0, 10)}`;
}

async function dbGetNews(key: string): Promise<{ articles: unknown[]; fetchedAt: number } | null> {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/news_cache?key=eq.${encodeURIComponent(key)}&select=articles,fetched_at&limit=1`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    if (!r.ok) return null;
    const rows = await r.json();
    if (!Array.isArray(rows) || !rows[0]) return null;
    return { articles: rows[0].articles, fetchedAt: new Date(rows[0].fetched_at).getTime() };
  } catch (e) {
    console.warn("news_cache read failed:", String(e));
    return null;
  }
}

async function dbPutNews(key: string, articles: unknown[]) {
  if (!SUPABASE_URL || !SERVICE_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/news_cache?on_conflict=key`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({ key, articles, fetched_at: new Date().toISOString() }),
    });
  } catch (e) {
    console.warn("news_cache write failed:", String(e));
  }
}

// ---- GENERIC CONTENT CACHE (public.content_cache) --------------------------
// Lesson translations and generated daily challenges are identical for every
// user with the same language/day, so they are computed once and shared.
const contentMem = new Map<string, unknown>();
async function cacheGet(key: string): Promise<unknown | null> {
  if (contentMem.has(key)) return contentMem.get(key);
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/content_cache?key=eq.${encodeURIComponent(key)}&select=value&limit=1`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    if (!r.ok) return null;
    const rows = await r.json();
    if (!Array.isArray(rows) || !rows[0]) return null;
    contentMem.set(key, rows[0].value);
    if (contentMem.size > 2000) contentMem.clear();
    return rows[0].value;
  } catch { return null; }
}
async function cachePut(key: string, value: unknown) {
  contentMem.set(key, value);
  if (!SUPABASE_URL || !SERVICE_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/content_cache?on_conflict=key`, {
      method: "POST",
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
    });
  } catch (e) { console.warn("content_cache write failed:", String(e)); }
}
async function sha1(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}
function extractJson(text: string): unknown | null {
  const m = text.match(/[\[{][\s\S]*[\]}]/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

function parseArticles(text: string): unknown[] | null {
  const m = text.match(/\[[\s\S]*\]/);
  if (!m) return null;
  try {
    const arr = JSON.parse(m[0]);
    return Array.isArray(arr) && arr.length > 0 && arr.every((a: any) => a && typeof a.title === "string") ? arr : null;
  } catch {
    return null;
  }
}

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

// ---- AUTH + QUOTAS ---------------------------------------------------------
// The publishable key ships inside the JS bundle, so on its own it proves
// nothing. Every call now carries the user's Supabase JWT, verified against
// GoTrue. Signed-out visitors keep a small per-IP trial so the demo works.
// Counters are in-memory (reset on redeploy) — good enough to stop bill abuse;
// move to a table if you need exact accounting.
const USER_DAILY_CAP = Number(Deno.env.get("USER_DAILY_CAP") || 150);
const ANON_DAILY_CAP = Number(Deno.env.get("ANON_DAILY_CAP") || 6);
const ANON_FEATURES = new Set(["tutor", "tool", "news_fetch", "practice", "translate", "challenge_gen"]);
const MAX_BODY_BYTES = 64 * 1024;

const tokenCache = new Map<string, { uid: string; exp: number }>();
async function verifyUser(authHeader: string): Promise<string | null> {
  const token = (authHeader || "").replace(/^Bearer\s+/i, "").trim();
  if (!token || token === SUPABASE_ANON_KEY || token.length < 40) return null;
  const hit = tokenCache.get(token);
  if (hit && hit.exp > Date.now()) return hit.uid;
  if (!SUPABASE_URL) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY || "", Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    const u = await r.json();
    if (!u?.id) return null;
    tokenCache.set(token, { uid: u.id, exp: Date.now() + 5 * 60 * 1000 });
    if (tokenCache.size > 5000) tokenCache.clear();
    return u.id;
  } catch (e) {
    console.warn("JWT verify failed:", String(e));
    return null;
  }
}

const daily = new Map<string, { day: string; count: number }>();
function dayKey() { return new Date().toISOString().slice(0, 10); }
function dailyCount(key: string): number {
  const e = daily.get(key);
  return e && e.day === dayKey() ? e.count : 0;
}
function bumpDaily(key: string) {
  const d = dayKey();
  const e = daily.get(key);
  if (!e || e.day !== d) daily.set(key, { day: d, count: 1 });
  else e.count++;
  if (daily.size > 20000) daily.clear();
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

    // 3. Parse and validate body (size-capped)
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return reply({ error: "Bad request", detail: "Request too large" }, 413);
    let body: any;
    try { body = JSON.parse(raw); } catch { return reply({ error: "Bad request", detail: "Invalid JSON" }, 400); }
    const { feature, messages, system, use_search, lang, force, key: contentKey, goals, level: userLevel } = body;

    if (!feature || !messages || !Array.isArray(messages) || messages.length === 0) {
      return reply({ error: "Bad request", detail: "Missing feature or messages" }, 400);
    }

    // 4. Validate feature is one of our allowed types
    const ALLOWED_FEATURES = ["tutor", "news_fetch", "news_chat", "tool", "practice", "challenge", "translate", "challenge_gen"];
    if (!ALLOWED_FEATURES.includes(feature)) {
      return reply({ error: "Bad request", detail: "Invalid feature type" }, 400);
    }

    // 4a. Who is calling? Verified user → generous daily cap. Anonymous → tiny
    //     trial quota, limited features, then a friendly "create an account".
    const uid = await verifyUser(req.headers.get("authorization") || "");
    const quotaKey = uid ? `u:${uid}` : `a:${ip}`;
    if (!uid) {
      if (!ANON_FEATURES.has(feature)) {
        return reply({ error: "Sign in required", code: "auth_required", detail: "Create a free account to use this." }, 401);
      }
      if (dailyCount(quotaKey) >= ANON_DAILY_CAP) {
        return reply({ error: "Sign in required", code: "auth_required", detail: "You've used today's free tries. Create a free account (just your email) to keep going." }, 401);
      }
    } else if (dailyCount(quotaKey) >= USER_DAILY_CAP) {
      return reply({ error: "Daily limit reached", code: "quota", detail: "You've hit today's Lumi limit. It resets at midnight UTC." }, 429);
    }

    console.log("Request:", feature, uid ? "user" : "anon", "from:", ip);

    // 4b. Shared caches — translations and daily challenges are the same for
    //     everyone with the same language (and day), so serve them before
    //     touching quotas or Claude.
    const cLang = String(lang || "en").slice(0, 5);
    let cacheKey = "";
    if (feature === "translate") {
      const content = String(messages[0]?.content || "");
      cacheKey = `tr:${cLang}:${String(contentKey || "x").slice(0, 40)}:${await sha1(content)}`;
      const hit = await cacheGet(cacheKey);
      if (hit && !force) return reply({ text: JSON.stringify(hit), cached: true });
    }
    if (feature === "challenge_gen") {
      const bucket = String(Array.isArray(goals) && goals[0] ? goals[0] : "general").toLowerCase().replace(/[^a-z]/g, "").slice(0, 24) || "general";
      cacheKey = `dc:${cLang}:${dayKey()}:${bucket}`;
      const hit = await cacheGet(cacheKey);
      if (hit && !force) return reply({ text: JSON.stringify(hit), cached: true });
    }

    // 4c. AI News: serve from the shared cache when fresh.
    const newsLang = String(lang || "en").slice(0, 5);
    const nKey = newsKey(newsLang);
    if (feature === "news_fetch" && !force) {
      const mem = newsMem.get(nKey);
      if (mem && Date.now() - mem.fetchedAt < NEWS_TTL) {
        return reply({ text: JSON.stringify(mem.articles), cached: true, fetched_at: mem.fetchedAt });
      }
      const row = await dbGetNews(nKey);
      if (row) {
        newsMem.set(nKey, row);
        if (Date.now() - row.fetchedAt < NEWS_TTL) {
          return reply({ text: JSON.stringify(row.articles), cached: true, fetched_at: row.fetchedAt });
        }
      }
      // Stale or missing: if another request is already fetching, wait for it
      // instead of paying for a second web search.
      const inflight = newsInflight.get(nKey);
      if (inflight) {
        const arts = await inflight;
        if (arts) return reply({ text: JSON.stringify(arts), cached: true, fetched_at: Date.now() });
      }
    }

    // 5. Select model
    const model = (feature === "tutor" || feature === "news_fetch" || feature === "news_chat" || feature === "translate")
      ? "claude-sonnet-4-6"
      : "claude-haiku-4-5-20251001";

    // 6. Build Claude request with token limits to prevent abuse
    let sys = (system || "You are Lumi, a helpful AI guide.").slice(0, 2000);
    let msgs: any[] = messages;
    if (feature === "challenge_gen") {
      const g = Array.isArray(goals) ? goals.slice(0, 3).map(String).join(", ") : "general AI skills";
      const langName = cLang === "ar" ? "Arabic" : cLang === "fr" ? "French" : "English";
      sys = `You write ONE short daily practice challenge for a beginner-friendly AI-skills app. Today is ${dayKey()}. The learner's goals: ${g}. Their level: ${userLevel || "beginner"}. The challenge must ask them to do something concrete with an AI chatbot about THEIR OWN life or work (not a generic question), take under 5 minutes, and be gradable from a written answer. Vary the angle day to day (prompting, checking facts, images, data, everyday tasks, safety, news). Return ONLY a JSON object: {"id":"gen-${dayKey()}","title":"...(max 6 words)","desc":"...(one line)","task":"...(2-4 sentences, second person, ends with what to write)","category":"prompts|basics|daily|images|writing|data|news|safety"}. Write all text in ${langName}. No markdown, no backticks.`;
      msgs = [{ role: "user", content: `Generate today's challenge.` }];
    }
    const claudeBody: any = {
      model,
      max_tokens: feature === "news_fetch" ? 2048 : (feature === "tutor" || feature === "translate") ? 4096 : 1024,
      system: sys,
      messages: msgs.slice(-10).map((m: any) => ({ // Max 10 messages, prevent huge context
        role: m.role === "user" ? "user" : "assistant",
        content: String(m.content || "").slice(0, (feature === "tutor" || feature === "translate") ? 8000 : 3000),
      })),
    };

    if (use_search || feature === "news_fetch") {
      claudeBody.tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }];
    }

    bumpDaily(quotaKey);
    console.log("Calling:", model);

    // 7. Call Claude API
    const callClaude = async () => {
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
      return { res, data };
    };

    let res: Response, data: any;
    if (feature === "news_fetch") {
      // Coalesce concurrent news fetches for the same language/day.
      const p = (async () => {
        const out = await callClaude();
        if (!out.res.ok) return null;
        const text = (out.data.content || []).filter((c: any) => c.type === "text").map((c: any) => c.text || "").join("\n");
        const arts = parseArticles(text);
        if (arts) {
          newsMem.set(nKey, { articles: arts, fetchedAt: Date.now() });
          dbPutNews(nKey, arts);
        }
        return arts;
      })();
      newsInflight.set(nKey, p);
      try {
        const arts = await p;
        if (arts) return reply({ text: JSON.stringify(arts), cached: false, fetched_at: Date.now() });
      } finally {
        newsInflight.delete(nKey);
      }
      // Parsing failed — fall through to the generic path so the client gets raw text.
      ({ res, data } = await callClaude());
    } else {
      ({ res, data } = await callClaude());
    }

    if (!res.ok) {
      console.error("Claude error:", res.status, JSON.stringify(data));
      return reply({ error: "Claude error", detail: data?.error?.message || "AI service unavailable" }, 502);
    }

    // 8. Extract text response
    let text = (data.content || [])
      .filter((c: any) => c.type === "text")
      .map((c: any) => c.text || "")
      .join("\n");

    // Shared-cache features: validate JSON and store for everyone else.
    if ((feature === "translate" || feature === "challenge_gen") && text) {
      const parsed = extractJson(text);
      if (parsed && typeof parsed === "object") {
        if (feature === "challenge_gen") {
          const c: any = parsed;
          if (!c.title || !c.task) return reply({ error: "Bad generation", detail: "Try again" }, 502);
          c.id = c.id || `gen-${dayKey()}`;
        }
        if (cacheKey) cachePut(cacheKey, parsed);
        text = JSON.stringify(parsed);
      }
    }

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
