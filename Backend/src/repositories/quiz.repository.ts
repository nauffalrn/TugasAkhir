import { supabase } from "../lib/supabase";

export async function createAttempt(userId: string, topicId: string, level: number, timeLimitSeconds: number | null) {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: userId,
      topic_id: topicId,
      level,
      time_limit_seconds: timeLimitSeconds,
      total_questions: 10,
    })
    .select("id")
    .single();
  return { data, error };
}

export async function saveAttemptQuestions(attemptId: string, questionIds: string[]) {
  const records = questionIds.map((qId, idx) => ({
    attempt_id: attemptId,
    question_id: qId,
    position: idx,
  }));
  return supabase.from("quiz_attempt_questions").insert(records);
}

export async function findAttemptById(attemptId: string) {
  const { data } = await supabase
    .from("quiz_attempts")
    .select("user_id,topic_id,level,submitted_at")
    .eq("id", attemptId)
    .maybeSingle();
  return data;
}

export async function saveAnswers(
  attemptId: string,
  answers: Array<{ question_id: string; selected_index: number; is_correct: boolean }>
) {
  return supabase.from("quiz_attempt_answers").insert(
    answers.map((a) => ({
      attempt_id: attemptId,
      question_id: a.question_id,
      selected_index: a.selected_index,
      is_correct: a.is_correct,
    }))
  );
}

export async function updateAttemptSubmit(attemptId: string, correctCount: number, score: number) {
  return supabase
    .from("quiz_attempts")
    .update({ submitted_at: new Date().toISOString(), correct_count: correctCount, score })
    .eq("id", attemptId);
}

export async function countTotalQuestionsAnswered(userId: string) {
  const { data } = await supabase
    .from("quiz_attempts")
    .select("total_questions")
    .eq("user_id", userId)
    .not("submitted_at", "is", null);
  return (data || []).reduce((sum, a) => sum + (a.total_questions || 0), 0);
}