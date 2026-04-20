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

export const questionRepository = {
  async findQuestionsByTopicAndLevel(topicId: string, level: number) {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("topic_id", topicId)
      .eq("level", level);

    if (error) throw error;

    return (
      data?.map((q) => ({
        ...q,
        assets: normalizeAssets(q.assets),
      })) || []
    );
  },

  async findQuestionsById(questionIds: string[]) {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .in("id", questionIds);

    if (error) throw error;

    return (
      data?.map((q) => ({
        ...q,
        assets: normalizeAssets(q.assets),
      })) || []
    );
  },
};

function normalizeAssets(assets: Record<string, string> | null) {
  if (!assets) return {};

  const normalized: Record<string, string> = {};

  Object.entries(assets).forEach(([key, value]) => {
    if (!value) return;

    let clean = String(value)
      .trim()
      .replace(/\\/g, "/")
      .replace(/^[a-zA-Z]:\//, "/");

    const publicPos = clean.toLowerCase().indexOf("public/");
    if (publicPos !== -1) {
      clean = clean.slice(publicPos + "public/".length);
    }

    const imagesPos = clean.toLowerCase().indexOf("images/");
    if (imagesPos !== -1) {
      clean = clean.slice(imagesPos);
    }

    clean = clean.replace(/^\.?\//, "").replace(/^\/+/, "");
    if (!clean.toLowerCase().startsWith("images/")) {
      clean = `images/${clean}`;
    }

    normalized[key] = clean;
  });

  return normalized;
}
