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
