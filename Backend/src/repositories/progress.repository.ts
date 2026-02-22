import { supabase } from "../lib/supabase";

export async function findProgress(userId: string, topicId: string) {
  const { data } = await supabase
    .from("user_topic_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .maybeSingle();
  return data;
}

export async function upsertProgress(progress: any) {
  return supabase
    .from("user_topic_progress")
    .upsert(progress, { onConflict: "user_id,topic_id" });
}

export async function findAllProgressByUser(userId: string) {
  const { data, error } = await supabase
    .from("user_topic_progress")
    .select(
      `
      highest_level_unlocked,
      best_score_l1,
      best_score_l2,
      best_score_l3,
      best_score_l4,
      topic_id,
      topics!inner(slug)
    `,
    )
    .eq("user_id", userId);

  const mapped = data?.map((p: any) => ({
    highest_level_unlocked: p.highest_level_unlocked,
    best_score_l1: p.best_score_l1,
    best_score_l2: p.best_score_l2,
    best_score_l3: p.best_score_l3,
    best_score_l4: p.best_score_l4,
    topic_id: p.topic_id,
    topic_slug: p.topics.slug,
  }));

  return { data: mapped, error };
}
