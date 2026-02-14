import * as topicRepo from "../repositories/topic.repository";
import * as questionRepo from "../repositories/question.repository";
import * as quizRepo from "../repositories/quiz.repository";
import * as progressRepo from "../repositories/progress.repository";
import * as badgeRepo from "../repositories/badge.repository";

export async function startQuiz(userId: string, topicSlug: string, level: number) {
  // 1) Get topic
  const { data: topic } = await topicRepo.findTopicBySlug(topicSlug);
  if (!topic) {
    throw { code: "TOPIC_NOT_FOUND", message: "Topic tidak ditemukan" };
  }

  // 2) Cek unlock level (L2+ butuh best score level sebelumnya ≥80)
  if (level > 1) {
    const progress = await progressRepo.findProgress(userId, topic.id);
    const prevBestKey = `best_score_l${level - 1}` as keyof typeof progress;
    const prevBest = progress?.[prevBestKey];

    if (!prevBest || (prevBest as number) < 80) {
      throw {
        code: "LEVEL_LOCKED",
        message: `Level ${level} terkunci. Selesaikan level ${level - 1} dengan nilai ≥80`,
      };
    }
  }

  // 3) Ambil 10 soal acak
  const { data: questions, error: qError } = await questionRepo.getRandomQuestions(topic.id, level, 10);
  if (qError || !questions || questions.length < 10) {
    throw { code: "INSUFFICIENT_QUESTIONS", message: "Soal tidak cukup (butuh minimal 10)" };
  }

  // 4) Tentukan timer
  let timeLimitSeconds: number | null = null;
  if (level === 3) timeLimitSeconds = 1800; // 30 menit
  if (level === 4) timeLimitSeconds = 900;  // 15 menit

  // 5) Buat attempt
  const { data: attempt, error: aError } = await quizRepo.createAttempt(userId, topic.id, level, timeLimitSeconds);
  if (aError || !attempt) {
    throw { code: "DB_ERROR", message: aError?.message || "Failed to create attempt" };
  }

  // 6) Simpan attempt_questions
  await quizRepo.saveAttemptQuestions(
    attempt.id,
    questions.map((q: any) => q.id)
  );

  // 7) Return soal (tanpa correct_index, hint hanya L1/L2)
  return {
    attempt_id: attempt.id,
    time_limit_seconds: timeLimitSeconds,
    questions: questions.map((q: any) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options,
      hint: level === 1 || level === 2 ? q.hint : null,
    })),
  };
}

export async function submitQuiz(userId: string, attemptId: string, answers: Array<{ question_id: string; selected_index: number }>) {
  // 1) Verify attempt
  const attempt = await quizRepo.findAttemptById(attemptId);
  if (!attempt) {
    throw { code: "ATTEMPT_NOT_FOUND", message: "Attempt tidak ditemukan" };
  }
  if (attempt.user_id !== userId) {
    throw { code: "FORBIDDEN", message: "Bukan attempt kamu" };
  }
  if (attempt.submitted_at) {
    throw { code: "ALREADY_SUBMITTED", message: "Sudah submit sebelumnya" };
  }

  const topicId = attempt.topic_id;
  const level = attempt.level;

  // 2) Get correct answers
  const questionIds = answers.map((a) => a.question_id);
  const { data: correctData, error: cError } = await questionRepo.findQuestionsByIds(questionIds);
  if (cError || !correctData) {
    throw { code: "DB_ERROR", message: cError?.message || "Failed to get correct answers" };
  }

  const correctMap = new Map(correctData.map((q: any) => [q.id, { correct_index: q.correct_index, explanation: q.explanation }]));

  // 3) Hitung skor
  let correctCount = 0;
  const answerRecords = answers.map((ans) => {
    const correct = correctMap.get(ans.question_id);
    const isCorrect = correct?.correct_index === ans.selected_index;
    if (isCorrect) correctCount++;
    return { question_id: ans.question_id, selected_index: ans.selected_index, is_correct: isCorrect };
  });

  const score = (correctCount / 10) * 100;

  // 4) Simpan answers + update attempt
  await quizRepo.saveAnswers(attemptId, answerRecords);
  await quizRepo.updateAttemptSubmit(attemptId, correctCount, score);

  // 5) Update progress
  const currentProgress = await progressRepo.findProgress(userId, topicId);
  const bestKey = `best_score_l${level}`;
  const currentBest = currentProgress?.[bestKey as keyof typeof currentProgress] as number | null;
  const newBest = !currentBest || score > currentBest ? score : currentBest;

  const newHighest =
    score >= 80 && level >= (currentProgress?.highest_level_unlocked || 1) && level < 4
      ? level + 1
      : currentProgress?.highest_level_unlocked || 1;

  const upsertData: any = {
    user_id: userId,
    topic_id: topicId,
    highest_level_unlocked: newHighest,
    updated_at: new Date().toISOString(),
  };
  upsertData[bestKey] = newBest;

  await progressRepo.upsertProgress(upsertData);

  // 6) Award badge (sekali saja)
  let badgeEarned = false;
  if (score >= 80) {
    const hasBadgeAlready = await badgeRepo.hasBadge(userId, topicId, level);
    if (!hasBadgeAlready) {
      await badgeRepo.awardBadge(userId, topicId, level);
      badgeEarned = true;
    }
  }

  // 7) Return review
  const review = answers.map((ans) => {
    const correct = correctMap.get(ans.question_id);
    return {
      question_id: ans.question_id,
      selected_index: ans.selected_index,
      correct_index: correct?.correct_index,
      is_correct: correct?.correct_index === ans.selected_index,
      explanation: correct?.explanation,
    };
  });

  return {
    score,
    correct_count: correctCount,
    total_questions: 10,
    review,
    unlocked_next_level: score >= 80 && level < 4,
    badge_earned: badgeEarned,
  };
}