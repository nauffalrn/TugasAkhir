import { supabase } from "../lib/supabase";

export async function findAllBadgesByUser(userId: string) {
  return supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });
}

export async function findBadgeDef(topicId: string, level: number) {
  const { data } = await supabase
    .from("badge_defs")
    .select("*")
    .eq("topic_id", topicId)
    .eq("level", level)
    .single();

  return data;
}

export async function awardBadge(
  userId: string,
  topicId: string,
  level: number,
) {
  const { data, error } = await supabase
    .from("user_badges")
    .insert({
      user_id: userId,
      topic_id: topicId,
      level: level,
    })
    .select()
    .single();

  return { data, error };
}

export async function checkBadgeExists(
  userId: string,
  topicId: string,
  level: number,
) {
  const { data } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .eq("level", level)
    .maybeSingle();

  return !!data;
}
