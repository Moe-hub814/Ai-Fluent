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
  async saveDisplayName(uid, displayName) {
    const payload = { user_id: uid, display_name: displayName.trim() };
    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });
    return { error };
  },
  async updateProfile(uid, updates) {
    const byUserId = await supabase.from("profiles").update(updates).eq("user_id", uid);
    if (byUserId.error) {
      await supabase.from("profiles").update(updates).eq("id", uid);
    }
  },
  async getProgress(uid) {
    const { data } = await supabase.from("user_progress").select("*").eq("user_id", uid);
    return (data || []).map((row) => ({
      ...row,
      path_id: row.path_id ?? row.node_id,
      lesson_index: row.lesson_index ?? row.lesson_id,
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
  async upsertUserProgress(row) {
    return supabase
      .from("user_progress")
      .upsert(
        {
          user_id: row.user_id,
          org_id: row.org_id ?? null,
          node_id: row.node_id,
          lesson_id: row.lesson_id,
          score: row.score,
          completed_at: row.completed_at || new Date().toISOString(),
        },
        { onConflict: "user_id,node_id,lesson_id" }
      );
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