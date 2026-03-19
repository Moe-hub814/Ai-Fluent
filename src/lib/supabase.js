// ─── SUPABASE CLIENT ───
// Replace SUPABASE_KEY with your actual anon/publishable key from the Supabase dashboard.
const SUPABASE_URL = "https://jedeqqkrmgsemnnmufjo.supabase.co";
const SUPABASE_KEY = "sb_publishable_Bcpg3b7ytODIYoPa54AF1A_MmG5DT8q";

let _supabase = null;

export function getSupabase() {
  if (_supabase) return _supabase;
  // Loaded via CDN <script> tag injected in main App
  if (window.__supabase) {
    _supabase = window.__supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return _supabase;
}

// ─── SUPABASE HELPERS ───
export const sb = {
  async signUp(email, password) {
    const s = getSupabase();
    if (!s) return { error: { message: "Supabase SDK still loading..." } };
    return s.auth.signUp({ email, password });
  },

  async signIn(email, password) {
    const s = getSupabase();
    if (!s) return { error: { message: "Supabase SDK still loading..." } };
    return s.auth.signInWithPassword({ email, password });
  },

  async signInGoogle() {
    const s = getSupabase();
    if (!s) return;
    return s.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  },

  async signOut() {
    const s = getSupabase();
    if (!s) return;
    return s.auth.signOut();
  },

  async getSession() {
    const s = getSupabase();
    if (!s) return null;
    const { data } = await s.auth.getSession();
    return data?.session;
  },

  async getProfile(uid) {
    const s = getSupabase();
    if (!s) return {};
    const { data } = await s.from("profiles").select("*").eq("id", uid).single();
    return data || {};
  },

  async updateProfile(uid, updates) {
    const s = getSupabase();
    if (!s) return;
    await s.from("profiles").update(updates).eq("id", uid);
  },

  async getProgress(uid) {
    const s = getSupabase();
    if (!s) return [];
    const { data } = await s.from("user_progress").select("*").eq("user_id", uid);
    return data || [];
  },

  async completeLesson(uid, pathId, lessonIndex) {
    const s = getSupabase();
    if (!s) return;
    await s.from("user_progress").upsert(
      {
        user_id: uid,
        path_id: pathId,
        lesson_index: lessonIndex,
        status: "completed",
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,path_id,lesson_index" }
    );
    // Record activity streak (calls a Supabase DB function)
    await s.rpc("record_activity", { p_user_id: uid, p_type: "lesson" });
  },

  // Calls the "claude-proxy" Supabase Edge Function — keeps the API key server-side.
  async callClaude({ feature, messages, system, session_id, context_type, context_id, context_title }) {
    const s = getSupabase();
    if (!s) throw new Error("Supabase not ready");
    const { data, error } = await s.functions.invoke("claude-proxy", {
      body: { feature, messages, system, session_id, context_type, context_id, context_title },
    });
    if (error) throw error;
    return data;
  },

  onAuthChange(callback) {
    const s = getSupabase();
    if (!s) return { data: { subscription: { unsubscribe: () => {} } } };
    return s.auth.onAuthStateChange(callback);
  },
};
