import { supabase } from "../lib/supabase";

export async function findAllProgressByUser(userId: string) {
  return supabase.from("user_topic_progress").select("*").eq("user_id", userId);
}

export async function findProgress(userId: string, topicId: string) {
  const { data } = await supabase
    .from("user_topic_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .maybeSingle();

  return data;
}

export async function upsertProgress(progressData: {
  user_id: string;
  topic_id: string;
  highest_level_unlocked?: number;
  best_score_l1?: number;
  best_score_l2?: number;
  best_score_l3?: number;
  best_score_l4?: number;
  updated_at: string;
}) {
  const { data, error } = await supabase
    .from("user_topic_progress")
    .upsert(progressData, {
      onConflict: "user_id,topic_id",
    })
    .select()
    .single();

  return { data, error };
}
