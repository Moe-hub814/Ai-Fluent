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
  async sendOtp(email) {
    return supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
  },
  async verifyOtp(email, token) {
    return supabase.auth.verifyOtp({ email, token, type: "email" });
  },
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
    const byUserId = await supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle();
    if (!byUserId.error && byUserId.data) return byUserId.data;
    const byLegacyId = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    return byLegacyId.data || {};
  },
  // profiles is keyed by `id` (= auth user id) in the live schema, and RLS
  // allows users to UPDATE their own row but not INSERT (an upsert counts as an
  // insert and is rejected with 42501). The signup trigger already creates the
  // row, so: UPDATE by id first; only if no row exists, try an insert.
  async _upsertProfile(uid, updates) {
    const upd = await supabase.from("profiles").update(updates).eq("id", uid).select("id");
    if (!upd.error && upd.data && upd.data.length) return { error: null };
    const ins = await supabase.from("profiles").insert({ id: uid, ...updates });
    if (!ins.error) return { error: null };
    // Legacy/alternate schema keyed by user_id
    const byUserId = await supabase.from("profiles").upsert({ user_id: uid, ...updates }, { onConflict: "user_id" });
    if (!byUserId.error) return { error: null };
    console.warn("profile write failed:", upd.error?.message, ins.error?.message, byUserId.error?.message);
    return { error: ins.error || upd.error || byUserId.error };
  },
  async saveDisplayName(uid, displayName) {
    const clean = String(displayName || "").trim().slice(0, 40);
    const { error } = await this._upsertProfile(uid, { display_name: clean });
    if (error) return { error };
    // Also store it in user_metadata: it rides along in the JWT, so greetings
    // render instantly on load without waiting on a profiles query.
    try { await supabase.auth.updateUser({ data: { display_name: clean } }); } catch (e) { console.warn("metadata update failed:", e); }
    return { error: null };
  },
  async updateProfile(uid, updates) {
    return this._upsertProfile(uid, updates);
  },
  async getProgress(uid) {
    const { data, error } = await supabase.from("user_progress").select("*").eq("user_id", uid);
    if (error) throw error; // let callers keep their local copy instead of wiping it
    return (data || []).map((row) => ({
      ...row,
      path_id: row.path_id ?? row.node_id,
      lesson_index: Number(row.lesson_index ?? row.lesson_id),
    }));
  },
  async completeLesson(uid, pathId, lessonIndex) {
    await supabase.from("user_progress").upsert(
      { user_id: uid, path_id: pathId, lesson_index: lessonIndex, status: "completed", completed_at: new Date().toISOString() },
      { onConflict: "user_id,path_id,lesson_index" }
    );
    try { await supabase.rpc("record_activity", { p_user_id: uid, p_type: "lesson" }); } catch (e) { console.warn(e); }
  },
  async getInviteByToken(token) {
    const { data, error } = await supabase
      .from("org_invites")
      .select("id, token, org_id, org_name, expires_at, accepted_at")
      .eq("token", token)
      .maybeSingle();
    return { data, error };
  },
  async findOrgMember(orgId, email) {
    const { data, error } = await supabase
      .from("org_members")
      .select("id, org_id, email, status, user_id")
      .eq("org_id", orgId)
      .eq("email", (email || "").toLowerCase())
      .maybeSingle();
    return { data, error };
  },
  async activateOrgMembership(memberId, userId) {
    const { error } = await supabase
      .from("org_members")
      .update({ status: "active", user_id: userId, joined_at: new Date().toISOString() })
      .eq("id", memberId);
    return { error };
  },
  async markInviteAccepted(inviteId) {
    const { error } = await supabase
      .from("org_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", inviteId);
    return { error };
  },
  async getActiveOrgByUser(userId) {
    const { data } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    return data?.org_id || null;
  },
  async getCertificateByCode(code) {
    const { data, error } = await supabase
      .from("cert_verification")
      .select("*")
      .eq("verify_code", code)
      .maybeSingle();
    return { data, error };
  },
  // Live schema of public.user_progress (verified 2026-08-25):
  //   user_id, path_id (text), lesson_index (int), score, status, completed_at
  // There is NO node_id / lesson_id / org_id column — writing those fails with
  // 42703 and the lesson never persists. Accept both naming styles (older
  // queued rows in localStorage still use node_id/lesson_id) and map them.
  async upsertUserProgress(row) {
    const path_id = row.path_id ?? row.node_id;
    const lesson_index = Number(row.lesson_index ?? row.lesson_id);
    if (!row.user_id || path_id == null || Number.isNaN(lesson_index)) {
      return { error: { message: "upsertUserProgress: missing user_id/path_id/lesson_index" } };
    }
    const payload = {
      user_id: row.user_id,
      path_id,
      lesson_index,
      score: row.score ?? 100,
      status: "completed",
      completed_at: row.completed_at || new Date().toISOString(),
    };
    let { error } = await supabase
      .from("user_progress")
      .upsert(payload, { onConflict: "user_id,path_id,lesson_index" });
    // Verified 2026-08-25: unique index on (user_id,path_id,lesson_index) exists
    // and RLS allows insert/update (DELETE is blocked — never rely on it).
    // If the constraint ever disappears (42P10), fall back to update → insert.
    if (error && error.code === "42P10") {
      const upd = await supabase.from("user_progress").update(payload)
        .match({ user_id: payload.user_id, path_id, lesson_index }).select("id");
      if (!upd.error && upd.data?.length) error = null;
      else ({ error } = await supabase.from("user_progress").insert(payload));
    }
    if (error) { console.warn("Progress save failed:", error); return { error }; }
    await this.recordActivity(row.user_id, "lesson");
    return { error: null };
  },
  // Server-side streak: record_activity(p_user_id, p_type) → { streak, date }
  // and updates profiles.current_streak / longest_streak / last_active_date.
  async recordActivity(uid, type = "activity") {
    if (!uid) return { data: null, error: { message: "no uid" } };
    try {
      const { data, error } = await supabase.rpc("record_activity", { p_user_id: uid, p_type: type });
      if (error) console.warn("record_activity failed:", error);
      return { data, error };
    } catch (e) { console.warn("record_activity failed:", e); return { data: null, error: e }; }
  },
  // profiles.total_tutor_sessions — one bump per Lumi conversation.
  async bumpTutorSessions(uid) {
    if (!uid) return { error: { message: "no uid" } };
    const { data } = await supabase.from("profiles").select("total_tutor_sessions").eq("id", uid).maybeSingle();
    const next = (data?.total_tutor_sessions || 0) + 1;
    return supabase.from("profiles").update({ total_tutor_sessions: next }).eq("id", uid);
  },
  // Cross-device preferences. `language` exists on the live table; `theme` and
  // `tutorial_seen` come from the 20260825 migration — if it hasn't been run
  // yet (42703 unknown column) retry with just the columns we know exist.
  async savePrefs(uid, prefs) {
    if (!uid) return { error: { message: "no uid" } };
    const res = await supabase.from("profiles").update(prefs).eq("id", uid);
    if (res.error?.code === "42703" && "language" in prefs && Object.keys(prefs).length > 1) {
      return supabase.from("profiles").update({ language: prefs.language }).eq("id", uid);
    }
    if (res.error) console.warn("Prefs save failed:", res.error);
    return res;
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