// ─── SUPABASE CLIENT v3 ───
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jedeqqkrmgsemnnmufjo.supabase.co";
const SUPABASE_KEY = "sb_publishable_Bcpg3b7ytODIYoPa54AF1A_MmG5DT8q";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const db = {
  async signUp(email, pass) {
    return supabase.auth.signUp({ email, password: pass });
  },
  async signIn(email, pass) {
    return supabase.auth.signInWithPassword({ email, password: pass });
  },
  async signOut() {
    return supabase.auth.signOut();
  },
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data?.session;
  },
  async getProfile(uid) {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    return data || {};
  },
  async updateProfile(uid, updates) {
    await supabase.from("profiles").update(updates).eq("id", uid);
  },
  async getProgress(uid) {
    const { data } = await supabase.from("user_progress").select("*").eq("user_id", uid);
    return data || [];
  },
  async completeLesson(uid, pathId, lessonIndex) {
    await supabase.from("user_progress").upsert(
      { user_id: uid, path_id: pathId, lesson_index: lessonIndex, status: "completed", completed_at: new Date().toISOString() },
      { onConflict: "user_id,path_id,lesson_index" }
    );
    try { await supabase.rpc("record_activity", { p_user_id: uid, p_type: "lesson" }); } catch (e) { console.warn(e); }
  },
  async callClaude(options) {
    // Direct fetch - no auth needed, edge function handles Claude directly
    const res = await fetch(`${SUPABASE_URL}/functions/v1/claude-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
      },
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      console.error("Claude proxy error:", res.status, err);
      throw new Error(err.detail || err.error || `HTTP ${res.status}`);
    }

    return res.json();
  },
  onAuth(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};