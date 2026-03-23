// ─── SUPABASE CLIENT ───
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jedeqqkrmgsemnnmufjo.supabase.co";
const SUPABASE_KEY = "sb_publishable_Bcpg3b7ytODIYoPa54AF1A_MmG5DT8q";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const db = {
  async signUp(e, p) {
    return supabase.auth.signUp({ email: e, password: p });
  },
  async signIn(e, p) {
    return supabase.auth.signInWithPassword({ email: e, password: p });
  },
  async signOut() {
    return supabase.auth.signOut();
  },
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data?.session;
  },
  async getProfile(uid) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();
    return data || {};
  },
  async updateProfile(uid, updates) {
    await supabase.from("profiles").update(updates).eq("id", uid);
  },
  async getProgress(uid) {
    const { data } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", uid);
    return data || [];
  },
  async completeLesson(uid, pathId, lessonIndex) {
    await supabase.from("user_progress").upsert(
      {
        user_id: uid,
        path_id: pathId,
        lesson_index: lessonIndex,
        status: "completed",
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,path_id,lesson_index" }
    );
    await supabase.rpc("record_activity", {
      p_user_id: uid,
      p_type: "lesson",
    });
  },
  async callClaude(options) {
    const { data, error } = await supabase.functions.invoke("claude-proxy", {
      body: options,
    });
    if (error) throw error;
    return data;
  },
  onAuth(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};