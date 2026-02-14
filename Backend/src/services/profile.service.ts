import * as userRepo from "../repositories/user.repository";
import * as quizRepo from "../repositories/quiz.repository";
import * as badgeRepo from "../repositories/badge.repository";
import * as progressRepo from "../repositories/progress.repository";
import * as topicRepo from "../repositories/topic.repository";

export async function getUserProfile(userId: string) {
  const user = await userRepo.findUserById(userId);
  if (!user) {
    throw { code: "USER_NOT_FOUND", message: "User tidak ditemukan" };
  }

  const totalQuestions = await quizRepo.countTotalQuestionsAnswered(userId);

  return {
    user,
    stats: { total_questions_answered: totalQuestions },
  };
}

export async function getUserBadges(userId: string) {
  const { data: badges, error } = await badgeRepo.findAllBadgesByUser(userId);
  if (error) {
    throw { code: "DB_ERROR", message: error.message };
  }

  // Fetch topic + badge_def untuk setiap badge (parallel)
  const enriched = await Promise.all(
    (badges || []).map(async (b: any) => {
      const [topicRes, badgeDef] = await Promise.all([
        topicRepo.findTopicBySlug(""), // placeholder, sebenarnya by id
        badgeRepo.findBadgeDef(b.topic_id, b.level),
      ]);

      // Workaround: fetch topic by id (add helper jika perlu)
      const { data: topic } = await topicRepo.findTopicBySlug(""); // FIX: perlu repo.findTopicById
      return {
        level: b.level,
        earned_at: b.earned_at,
        topic_id: b.topic_id,
        title: badgeDef?.title,
        icon_key: badgeDef?.icon_key,
      };
    })
  );

  return enriched;
}

export async function getUserProgress(userId: string) {
  const { data, error } = await progressRepo.findAllProgressByUser(userId);
  if (error) {
    throw { code: "DB_ERROR", message: error.message };
  }
  return data || [];
}