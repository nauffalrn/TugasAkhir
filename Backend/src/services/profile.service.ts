import * as badgeRepo from "../repositories/badge.repository";
import * as progressRepo from "../repositories/progress.repository";
import * as quizRepo from "../repositories/quiz.repository";
import * as topicRepo from "../repositories/topic.repository";
import * as userRepo from "../repositories/user.repository";

export async function getUserProfile(userId: string) {
  const user = await userRepo.findUserById(userId);
  if (!user) {
    throw { code: "USER_NOT_FOUND", message: "User tidak ditemukan" };
  }

  // Get total attempts
  const totalAttempts = await quizRepo.countUserAttempts(userId);

  // Get badges earned
  const { data: badges } = await badgeRepo.findAllBadgesByUser(userId);

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    created_at: user.created_at,
    total_attempts: totalAttempts || 0,
    badges_earned: badges?.length || 0,
  };
}

export async function getUserBadges(userId: string) {
  const { data: userBadges, error } =
    await badgeRepo.findAllBadgesByUser(userId);
  if (error) {
    throw { code: "DB_ERROR", message: error.message };
  }

  // Enrich with badge definitions
  const enriched = await Promise.all(
    (userBadges || []).map(async (ub: any) => {
      const badgeDef = await badgeRepo.findBadgeDef(ub.topic_id, ub.level);
      const { data: topic } = await topicRepo.findTopicById(ub.topic_id);

      return {
        topic_id: ub.topic_id,
        topic_title: topic?.title || "Unknown",
        level: ub.level,
        earned_at: ub.earned_at,
        title: badgeDef?.title || `Level ${ub.level}`,
        icon_key: badgeDef?.icon_key || `default-level-${ub.level}`,
      };
    }),
  );

  return enriched;
}

export async function getUserProgress(userId: string) {
  const { data, error } = await progressRepo.findAllProgressByUser(userId);
  if (error) {
    throw { code: "DB_ERROR", message: error.message };
  }

  return {
    progress: data || [],
  };
}
