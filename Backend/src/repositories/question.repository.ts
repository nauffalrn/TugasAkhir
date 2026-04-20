import { supabase } from "../lib/supabase";

function normalizeAssets(assets: any) {
  if (!assets) return {};

  let parsed = assets;
  if (typeof assets === "string") {
    try {
      parsed = JSON.parse(assets);
    } catch {
      return {};
    }
  }

  if (!parsed || typeof parsed !== "object") return {};

  const normalized: Record<string, string> = {};

  Object.entries(parsed).forEach(([key, value]: [string, any]) => {
    if (!value) return;

    let clean = String(value)
      .trim()
      .replace(/\\/g, "/")
      .replace(/^[a-zA-Z]:\//, "/")
      .replace(/^http:\/\/[^/]+/, "")
      .replace(/^https:\/\/[^/]+/, "");

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

  if (error) throw error;

  return {
    data:
      data?.map((q: any) => ({
        ...q,
        assets: normalizeAssets(q.assets),
      })) || [],
    error: null,
  };
}

export async function findQuestionsByIds(ids: string[]) {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .in("id", ids);

  if (error) throw error;

  return {
    data:
      data?.map((q) => ({
        ...q,
        assets: normalizeAssets(q.assets),
      })) || [],
    error: null,
  };
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
