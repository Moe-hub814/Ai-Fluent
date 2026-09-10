// Privacy-friendly product analytics — no third party, no cookies, no IP
// storage. Events go to our own `public.events` table (migration
// 20260910_events.sql) so we can see the funnel: map → lesson → practice →
// submit → complete. Anonymous visitors get a random device id; signed-in
// users are keyed by their auth id. Nothing is sent that the user typed.
const SUPABASE_URL = "https://jedeqqkrmgsemnnmufjo.supabase.co";
const SUPABASE_KEY = "sb_publishable_Bcpg3b7ytODIYoPa54AF1A_MmG5DT8q";

const AID_KEY = "lumicamp_aid";
const OPT_OUT_KEY = "lumicamp_analytics_off";
const FLUSH_MS = 4000;
const MAX_BATCH = 25;

let queue = [];
let timer = null;
let userId = null;
let sessionId = null;

const uuid = () => (crypto?.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);
const anonId = () => { try { let v = localStorage.getItem(AID_KEY); if (!v) { v = uuid(); localStorage.setItem(AID_KEY, v); } return v; } catch { return "no-storage"; } };
export const analyticsOff = () => { try { return localStorage.getItem(OPT_OUT_KEY) === "1"; } catch { return false; } };
export const setAnalyticsOff = (off) => { try { off ? localStorage.setItem(OPT_OUT_KEY, "1") : localStorage.removeItem(OPT_OUT_KEY); } catch {} };

const platform = () => {
  try { if (window.Capacitor?.isNativePlatform?.()) return window.Capacitor.getPlatform?.() || "native"; } catch {}
  return /Mobi|Android/i.test(navigator.userAgent) ? "mobile-web" : "web";
};

async function flush(useKeepalive = false) {
  if (!queue.length) return;
  const batch = queue.splice(0, MAX_BATCH);
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/events`, {
      method: "POST",
      keepalive: useKeepalive,
      headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Prefer: "return=minimal" },
      body: JSON.stringify(batch),
    });
  } catch { /* analytics is best-effort; drop the batch */ }
  if (queue.length) schedule();
}
function schedule() { if (timer) return; timer = setTimeout(() => { timer = null; flush(); }, FLUSH_MS); }

export const analytics = {
  setUser(id) { userId = id || null; },
  /** track("lesson_open", { path: "basics", lesson: 0 }) — props must be small & non-personal */
  track(event, props = {}) {
    if (analyticsOff() || !event) return;
    if (!sessionId) sessionId = uuid();
    const safe = {};
    for (const [k, v] of Object.entries(props)) if (v !== undefined && v !== null && String(v).length <= 120) safe[k] = v;
    queue.push({ event: String(event).slice(0, 60), props: safe, anon_id: anonId(), user_id: userId, session_id: sessionId, lang: (() => { try { return localStorage.getItem("lumicamp_lang") || "en"; } catch { return "en"; } })(), platform: platform(), app_version: (typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev") });
    if (queue.length >= MAX_BATCH) flush(); else schedule();
  },
};

// Don't lose the last few events when the tab closes / app backgrounds.
try {
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(true); });
  window.addEventListener("pagehide", () => flush(true));
} catch {}
