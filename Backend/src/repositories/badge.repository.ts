import { supabase } from "../lib/supabase";

export async function checkBadgeExists(
  userId: string,
  topicId: string,
  level: number,
): Promise<boolean> {
  const { data } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .eq("level", level)
    .maybeSingle();

  return !!data;
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

export async function findUserBadges(userId: string) {
  const { data, error } = await supabase
    .from("user_badges")
    .select(
      `
      *,
      topics (
        id,
        title,
        slug
      )
    `,
    )
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });

  if (error) throw error;

  // Transform data untuk include badge metadata
  return (data || []).map((badge: any) => ({
    topic_id: badge.topic_id,
    topic_title: badge.topics.title,
    topic_slug: badge.topics.slug,
    level: badge.level,
    title: getBadgeTitle(badge.level),
    icon_key: `${badge.topics.slug}-level-${badge.level}`,
    earned_at: badge.earned_at,
  }));
}

// Helper functions untuk badge metadata
function getBadgeTitle(level: number): string {
  const titles: { [key: number]: string } = {
    1: "Pemula",
    2: "Mahir",
    3: "Expert",
    4: "Master",
  };
  return titles[level] || "Badge";
}
