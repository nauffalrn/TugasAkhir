import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { api } from "../lib/api";
import { Container } from "../components/layout/container";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Loading } from "../components/ui/loading";
import { Colors } from "../constants/config";
import type { QuizAttempt } from "../types";

export default function AttemptScreen() {
  const { slug, level } = useLocalSearchParams<{ slug: string; level: string }>();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    startQuiz();
  }, []);

  useEffect(() => {
    if (!attempt?.time_limit_seconds) return;
    setTimeLeft(attempt.time_limit_seconds);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // auto-submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt]);

  async function startQuiz() {
    try {
      const res = await api.post("/quiz/start", { topic_slug: slug, level: parseInt(level!) });
      setAttempt(res.data.data);
    } catch (err: any) {
      Alert.alert("Error", err.message);
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(expired = false) {
    if (!expired && Object.keys(answers).length < 10) {
      return Alert.alert("Perhatian", "Jawab semua soal dulu");
    }

    setSubmitting(true);
    try {
      const payload = attempt!.questions.map((q) => ({
        question_id: q.id,
        selected_index: answers[q.id] ?? 0,
      }));

      const res = await api.post("/quiz/submit", { attempt_id: attempt!.attempt_id, answers: payload });
      router.replace(`/kuis/result?data=${JSON.stringify(res.data.data)}`);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loading />;
  if (!attempt) return <Text>Gagal memuat kuis</Text>;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Container scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Kuis Level {level}</Text>
        {timeLeft !== null && <Text style={styles.timer}>⏱ {formatTime(timeLeft)}</Text>}
      </View>

      {attempt.questions.map((q, idx) => (
        <Card key={q.id}>
          <Text style={styles.question}>
            {idx + 1}. {q.prompt}
          </Text>
          {q.hint && <Text style={styles.hint}>💡 Hint: {q.hint}</Text>}
          {q.options.map((opt, optIdx) => (
            <TouchableOpacity key={optIdx} onPress={() => setAnswers({ ...answers, [q.id]: optIdx })}>
              <View style={[styles.option, answers[q.id] === optIdx && styles.optionSelected]}>
                <Text style={[styles.optionText, answers[q.id] === optIdx && styles.optionTextSelected]}>{opt}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>
      ))}

      <Button title="Submit Jawaban" onPress={() => handleSubmit()} loading={submitting} />
    </Container>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: Colors.text },
  timer: { fontSize: 18, fontWeight: "600", color: Colors.danger },
  question: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: Colors.text },
  hint: { fontSize: 14, color: Colors.warning, marginBottom: 8, fontStyle: "italic" },
  option: { padding: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 8 },
  optionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + "20" },
  optionText: { fontSize: 14, color: Colors.text },
  optionTextSelected: { fontWeight: "600", color: Colors.primary },
});