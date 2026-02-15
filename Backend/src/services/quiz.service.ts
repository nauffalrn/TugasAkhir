import { randomUUID } from "crypto";
import * as badgeRepo from "../repositories/badge.repository";
import * as progressRepo from "../repositories/progress.repository";
import * as questionRepo from "../repositories/question.repository";
import * as quizRepo from "../repositories/quiz.repository";
import * as topicRepo from "../repositories/topic.repository";

export async function startQuiz(
  userId: string,
  topicSlug: string,
  level: number,
) {
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
  const { data: questions, error: qError } =
    await questionRepo.getRandomQuestions(topic.id, level, 10);
  if (qError || !questions || questions.length < 10) {
    throw {
      code: "INSUFFICIENT_QUESTIONS",
      message: "Soal tidak cukup (butuh minimal 10)",
    };
  }

  // 4) Tentukan timer
  let timeLimitSeconds: number | null = null;
  if (level === 3) timeLimitSeconds = 1800; // 30 menit
  if (level === 4) timeLimitSeconds = 900; // 15 menit

  // 5) Generate temporary attempt ID (tidak disimpan ke DB dulu)
  const tempAttemptId = randomUUID();

  // 6) Return soal dengan metadata (tanpa correct_index, hint hanya L1/L2)
  return {
    attempt_id: tempAttemptId,
    topic_id: topic.id,
    topic_slug: topicSlug,
    level: level,
    time_limit_seconds: timeLimitSeconds,
    questions: questions.map((q: any) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options,
      hint: level === 1 || level === 2 ? q.hint : null,
    })),
  };
}

export async function submitQuiz(
  userId: string,
  attemptId: string,
  topicId: string,
  level: number,
  answers: Array<{ question_id: string; selected_index: number }>,
) {
  // 1) Buat attempt baru saat submit
  const { data: attempt, error: aError } = await quizRepo.createAttempt(
    userId,
    topicId,
    level,
    level === 3 ? 1800 : level === 4 ? 900 : null,
  );
  if (aError || !attempt) {
    throw {
      code: "DB_ERROR",
      message: aError?.message || "Failed to create attempt",
    };
  }

  const actualAttemptId = attempt.id;

  // 2) Simpan attempt_questions
  await quizRepo.saveAttemptQuestions(
    actualAttemptId,
    answers.map((a) => a.question_id),
  );

  // 3) Get correct answers - UPDATE: simpan semua data yang dibutuhkan
  const questionIds = answers.map((a) => a.question_id);
  const { data: correctData, error: cError } =
    await questionRepo.findQuestionsByIds(questionIds);
  if (cError || !correctData) {
    throw {
      code: "DB_ERROR",
      message: cError?.message || "Failed to get correct answers",
    };
  }

  const correctMap = new Map(
    correctData.map((q: any) => [
      q.id,
      {
        prompt: q.prompt,
        options: q.options,
        correct_index: q.correct_index,
        explanation: q.explanation,
      },
    ]),
  );

  // 4) Hitung skor
  let correctCount = 0;
  const answerRecords = answers.map((ans) => {
    const correct = correctMap.get(ans.question_id);
    const isCorrect = correct?.correct_index === ans.selected_index;
    if (isCorrect) correctCount++;
    return {
      question_id: ans.question_id,
      selected_index: ans.selected_index,
      is_correct: isCorrect,
    };
  });

  const score = (correctCount / 10) * 100;

  // 5) Simpan answers + update attempt
  await quizRepo.saveAnswers(actualAttemptId, answerRecords);
  await quizRepo.updateAttemptSubmit(actualAttemptId, correctCount, score);

  // 6) Update progress
  const currentProgress = await progressRepo.findProgress(userId, topicId);
  const bestKey = `best_score_l${level}`;
  const currentBest = currentProgress?.[
    bestKey as keyof typeof currentProgress
  ] as number | null;
  const newBest = !currentBest || score > currentBest ? score : currentBest;

  const newHighest =
    score >= 80 &&
    level >= (currentProgress?.highest_level_unlocked || 1) &&
    level < 4
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

  // 7) Award badge (sekali saja)
  let badgeEarned = false;
  if (score >= 80) {
    const hasBadgeAlready = await badgeRepo.hasBadge(userId, topicId, level);
    if (!hasBadgeAlready) {
      await badgeRepo.awardBadge(userId, topicId, level);
      badgeEarned = true;
    }
  }

  // 8) Return review
  const review = answers.map((ans) => {
    const questionData = correctMap.get(ans.question_id);
    return {
      question_id: ans.question_id,
      prompt: questionData?.prompt,
      options: questionData?.options,
      selected_index: ans.selected_index,
      correct_index: questionData?.correct_index,
      is_correct: questionData?.correct_index === ans.selected_index,
      explanation: questionData?.explanation,
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
