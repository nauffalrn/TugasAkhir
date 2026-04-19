import { supabase } from "../lib/supabase";

export async function getRandomQuestions(
  topicId: string,
  level: number,
  limit: number,
) {
  const { data, error } = await supabase.rpc("get_random_questions", {
    p_topic_id: topicId,
    p_level: level,
    p_limit: limit,
  });
  return { data, error };
}

export async function findQuestionsByIds(ids: string[]) {
  const { data, error } = await supabase
    .from("questions")
    .select("id,prompt,options,correct_index,explanation")
    .in("id", ids);
  return { data, error };
}

export async function findAssetsForQuestions(questionIds: string[]) {
  const { data, error } = await supabase
    .from("question_assets")
    .select("question_id, asset_url, position")
    .in("question_id", questionIds);

  if (error) {
    console.error("Error fetching question assets:", error);
    throw new Error("Gagal mengambil aset soal");
  }

  return data || [];
}
