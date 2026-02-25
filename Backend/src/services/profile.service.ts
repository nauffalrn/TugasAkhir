import * as badgeRepo from "../repositories/badge.repository";
import * as progressRepo from "../repositories/progress.repository";
import * as topicRepo from "../repositories/topic.repository";
import * as userRepo from "../repositories/user.repository";

export async function getUserProfile(userId: string) {
  const user = await userRepo.findUserById(userId);
  if (!user) throw { code: "USER_NOT_FOUND", message: "User tidak ditemukan" };

  const { total_attempts, badges_earned } = await userRepo.getUserStats(userId);

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    created_at: user.created_at,
    total_attempts,
    badges_earned,
  };
}

export async function getUserProgress(userId: string) {
  const { data, error } = await progressRepo.findAllProgressByUser(userId);
  if (error) throw { code: "DB_ERROR", message: error.message };

  // ✅ FIX: Join dengan topics untuk dapat slug
  const progressWithTopics = await Promise.all(
    (data || []).map(async (p: any) => {
      const { data: topic } = await topicRepo.findTopicById(p.topic_id);
      return {
        ...p,
        topic_slug: topic?.slug,
        topic_title: topic?.title,
      };
    }),
  );

  return { progress: progressWithTopics };
}

export async function getUserBadges(userId: string) {
  const badges = await badgeRepo.findUserBadges(userId);
  return badges;
}
