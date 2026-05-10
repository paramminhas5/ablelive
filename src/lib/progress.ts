// Progress store: localStorage when signed out, Supabase when signed in.
// On sign-in, local progress is merged INTO the cloud (max XP, max streak,
// union of completions/badges) so users never lose XP earned signed-out.
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const KEY = "ableton.school.progress.v1";
const MERGED_KEY = "ableton.school.merged_for";

export type Progress = {
  xp: number;
  streakDays: number;
  lastDay: string | null;
  completedMissions: Record<string, { score: number; at: number }>;
  badges: string[];
};

const empty = (): Progress => ({
  xp: 0, streakDays: 0, lastDay: null, completedMissions: {}, badges: [],
});

const readLocal = (): Progress => {
  if (typeof localStorage === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch { return empty(); }
};

const writeLocal = (p: Progress) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("progress:update"));
};

async function readCloud(userId: string): Promise<Progress> {
  const [{ data: prog }, { data: comps }, { data: bdg }] = await Promise.all([
    supabase.from("progress").select("xp, streak_days, last_day").eq("user_id", userId).maybeSingle(),
    supabase.from("mission_completions").select("mission_slug, score, completed_at").eq("user_id", userId),
    supabase.from("badges").select("badge_slug").eq("user_id", userId),
  ]);
  const completedMissions: Progress["completedMissions"] = {};
  (comps ?? []).forEach((c) => {
    completedMissions[c.mission_slug] = { score: Number(c.score), at: new Date(c.completed_at).getTime() };
  });
  return {
    xp: prog?.xp ?? 0,
    streakDays: prog?.streak_days ?? 0,
    lastDay: prog?.last_day ?? null,
    completedMissions,
    badges: (bdg ?? []).map((b) => b.badge_slug),
  };
}

async function writeCloudCompletion(userId: string, slug: string, score: number, badge?: string) {
  await supabase.from("mission_completions").upsert({
    user_id: userId, mission_slug: slug, score,
  }, { onConflict: "user_id,mission_slug" });
  if (badge) {
    await supabase.from("badges").upsert({ user_id: userId, badge_slug: badge }, { onConflict: "user_id,badge_slug" });
  }
}

async function writeCloudProgress(userId: string, xp: number, streak: number, lastDay: string) {
  await supabase.from("progress").upsert({
    user_id: userId, xp, streak_days: streak, last_day: lastDay, updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
}

async function mergeLocalIntoCloud(userId: string) {
  if (typeof localStorage === "undefined") return;
  if (localStorage.getItem(MERGED_KEY) === userId) return;
  const local = readLocal();
  if (local.xp === 0 && Object.keys(local.completedMissions).length === 0 && local.badges.length === 0) {
    localStorage.setItem(MERGED_KEY, userId);
    return;
  }
  const cloud = await readCloud(userId);
  const today = new Date().toISOString().slice(0, 10);
  const lastDay = (cloud.lastDay && local.lastDay) ? (cloud.lastDay > local.lastDay ? cloud.lastDay : local.lastDay) : (cloud.lastDay ?? local.lastDay ?? today);
  await writeCloudProgress(userId, Math.max(cloud.xp, local.xp), Math.max(cloud.streakDays, local.streakDays), lastDay);
  // Upsert each local completion
  const rows = Object.entries(local.completedMissions).map(([slug, v]) => ({
    user_id: userId, mission_slug: slug, score: v.score, completed_at: new Date(v.at).toISOString(),
  }));
  if (rows.length) await supabase.from("mission_completions").upsert(rows, { onConflict: "user_id,mission_slug" });
  if (local.badges.length) {
    await supabase.from("badges").upsert(local.badges.map((b) => ({ user_id: userId, badge_slug: b })), { onConflict: "user_id,badge_slug" });
  }
  localStorage.setItem(MERGED_KEY, userId);
}

export const useProgress = () => {
  const [p, setP] = useState<Progress>(empty());
  const [userId, setUserId] = useState<string | null>(null);

  // Track auth + initial load
  useEffect(() => {
    let mounted = true;
    const refresh = async (uid: string | null) => {
      if (!mounted) return;
      if (uid) {
        await mergeLocalIntoCloud(uid);
        const cloud = await readCloud(uid);
        if (mounted) setP(cloud);
      } else {
        setP(readLocal());
      }
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      const uid = s?.user?.id ?? null;
      setUserId(uid);
      void refresh(uid);
    });
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id ?? null;
      setUserId(uid);
      void refresh(uid);
    });
    const h = () => { if (!userId) setP(readLocal()); };
    window.addEventListener("progress:update", h);
    window.addEventListener("storage", h);
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      window.removeEventListener("progress:update", h);
      window.removeEventListener("storage", h);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completeMission = useCallback((slug: string, xp: number, score: number, badge?: string) => {
    const cur = userId ? p : readLocal();
    const today = new Date().toISOString().slice(0, 10);
    let streak = cur.streakDays;
    if (cur.lastDay !== today) {
      const y = new Date(); y.setDate(y.getDate() - 1);
      const yKey = y.toISOString().slice(0, 10);
      streak = cur.lastDay === yKey ? streak + 1 : 1;
    }
    const already = cur.completedMissions[slug];
    const next: Progress = {
      ...cur,
      xp: cur.xp + (already ? 0 : xp),
      lastDay: today,
      streakDays: streak,
      completedMissions: { ...cur.completedMissions, [slug]: { score, at: Date.now() } },
      badges: badge && !cur.badges.includes(badge) ? [...cur.badges, badge] : cur.badges,
    };
    setP(next);
    if (userId) {
      void writeCloudCompletion(userId, slug, score, badge);
      void writeCloudProgress(userId, next.xp, next.streakDays, next.lastDay!);
    } else {
      writeLocal(next);
    }
  }, [p, userId]);

  const reset = useCallback(() => {
    if (userId) return; // signed-in users keep cloud data — sign out + clear localStorage if they really want to reset
    writeLocal(empty());
  }, [userId]);

  return { progress: p, completeMission, reset };
};
