import { supabase } from "../lib/supabase";

export async function hasBadge(userId: string, topicId: string, level: number) {
  const { data } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .eq("level", level)
    .maybeSingle();
  return !!data;
}

export async function awardBadge(userId: string, topicId: string, level: number) {
  return supabase.from("user_badges").insert({ user_id: userId, topic_id: topicId, level });
}

export async function findAllBadgesByUser(userId: string) {
  const { data, error } = await supabase
    .from("user_badges")
    .select("topic_id,level,earned_at")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });
  return { data, error };
}

export async function findBadgeDef(topicId: string, level: number) {
  const { data } = await supabase
    .from("badge_defs")
    .select("title,icon_key")
    .eq("topic_id", topicId)
    .eq("level", level)
    .maybeSingle();
  return data;
}