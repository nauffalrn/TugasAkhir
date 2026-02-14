import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Container } from "../components/layout/container";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Colors } from "../constants/config";
import type { QuizResult } from "../types";

export default function ResultScreen() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const result: QuizResult = JSON.parse(data!);

  return (
    <Container scroll>
      <Text style={styles.title}>Hasil Kuis</Text>

      <Card>
        <Text style={styles.score}>Skor: {result.score}</Text>
        <Text style={styles.info}>
          Benar: {result.correct_count} / {result.total_questions}
        </Text>
        {result.unlocked_next_level && <Text style={styles.unlock}>🎉 Level berikutnya terbuka!</Text>}
        {result.badge_earned && <Text style={styles.badge}>🏆 Badge baru didapatkan!</Text>}
      </Card>

      <Text style={styles.reviewTitle}>Review Jawaban</Text>
      <FlatList
        data={result.review}
        keyExtractor={(item) => item.question_id}
        renderItem={({ item, index }) => (
          <Card>
            <Text style={styles.questionNum}>Soal {index + 1}</Text>
            <Text style={item.is_correct ? styles.correct : styles.wrong}>
              {item.is_correct ? "✅ Benar" : "❌ Salah"}
            </Text>
            {!item.is_correct && <Text style={styles.correctAnswer}>Jawaban benar: {item.correct_index + 1}</Text>}
            {item.explanation && <Text style={styles.explanation}>{item.explanation}</Text>}
          </Card>
        )}
        contentContainerStyle={styles.list}
      />

      <Button title="Kembali" onPress={() => router.replace("/tabs/kuis")} />
    </Container>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: Colors.text },
  score: { fontSize: 32, fontWeight: "bold", color: Colors.primary, textAlign: "center" },
  info: { fontSize: 16, color: Colors.text, textAlign: "center", marginTop: 8 },
  unlock: { fontSize: 14, color: Colors.secondary, textAlign: "center", marginTop: 8 },
  badge: { fontSize: 14, color: Colors.warning, textAlign: "center", marginTop: 4 },
  reviewTitle: { fontSize: 20, fontWeight: "bold", marginTop: 24, marginBottom: 12, color: Colors.text },
  list: { gap: 12 },
  questionNum: { fontSize: 16, fontWeight: "600", color: Colors.text },
  correct: { fontSize: 14, color: Colors.secondary, marginTop: 4 },
  wrong: { fontSize: 14, color: Colors.danger, marginTop: 4 },
  correctAnswer: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  explanation: { fontSize: 14, color: Colors.text, marginTop: 8, fontStyle: "italic" },
});