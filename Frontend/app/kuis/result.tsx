import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Container } from "../components/layout/container";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Colors } from "../constants/config";
import type { QuizResult } from "../types";

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    resultData: string;
    slug?: string;
    level?: string;
  }>();

  let result: QuizResult;
  try {
    result = JSON.parse(params.resultData!);
    console.log("=== FULL RESULT DATA ===");
    console.log(JSON.stringify(result, null, 2));
    console.log("=== REVIEW LENGTH ===", result.review?.length);
    if (result.review?.[0]) {
      console.log("=== FIRST REVIEW ITEM ===");
      console.log("prompt:", result.review[0].prompt);
      console.log("options:", result.review[0].options);
      console.log("selected_index:", result.review[0].selected_index);
      console.log("correct_index:", result.review[0].correct_index);
    }
  } catch (error) {
    console.error("Failed to parse result:", error);
    Alert.alert("Error", "Gagal memuat hasil kuis");
    router.back();
    return null;
  }

  const [showReview, setShowReview] = useState(false);
  const isPassed = result.score >= 80;

  function handleRetry() {
    router.back();
  }

  function handleNextLevel() {
    if (params.slug && params.level) {
      const nextLevel = parseInt(params.level) + 1;
      router.replace(`/kuis/attempt?slug=${params.slug}&level=${nextLevel}`);
    }
  }

  function handleGoToMateri() {
    router.replace("/tabs/materi");
  }

  return (
    <Container scroll>
      {!showReview ? (
        // Score Screen
        <View style={styles.scoreContainer}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{result.score}</Text>
            <Text style={styles.scoreLabel}>Skor Kamu</Text>
          </View>

          <View style={styles.resultInfo}>
            <Text style={styles.resultTitle}>
              {isPassed ? "🎉 Luar Biasa!" : "💪 Tetap Semangat!"}
            </Text>
            <Text style={styles.resultDesc}>
              {isPassed
                ? result.unlocked_next_level
                  ? "Kamu berhasil! Level berikutnya sudah terbuka"
                  : "Kamu berhasil! Pertahankan prestasimu"
                : "Jangan menyerah! Coba lagi dan kamu pasti bisa!"}
            </Text>
          </View>

          {isPassed && (
            <>
              <Card style={styles.statsCard}>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text
                      style={[styles.statNumber, { color: Colors.success }]}
                    >
                      {result.correct_count}
                    </Text>
                    <Text style={styles.statLabel}>Benar</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: Colors.danger }]}>
                      {result.total_questions - result.correct_count}
                    </Text>
                    <Text style={styles.statLabel}>Salah</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: Colors.info }]}>
                      {result.total_questions}
                    </Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
                </View>
              </Card>

              {result.badge_earned && (
                <Card style={styles.badgeCard}>
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeIcon}>🏆</Text>
                    <Text style={styles.badgeText}>Badge Baru Didapat!</Text>
                  </View>
                </Card>
              )}
            </>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => setShowReview(true)}
              style={styles.reviewBtn}
            >
              <Text style={styles.reviewBtnText}>📝 Lihat Pembahasan</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRetry} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>🔄 Ulangi Kuis</Text>
            </TouchableOpacity>

            {isPassed && result.unlocked_next_level && (
              <TouchableOpacity
                onPress={handleNextLevel}
                style={styles.nextBtn}
              >
                <Text style={styles.nextBtnText}>
                  ➡️ Lanjut Level Berikutnya
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleGoToMateri}
              style={styles.materiBtn}
            >
              <Text style={styles.materiBtnText}>📚 Kembali ke Materi</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Review Screen
        <View style={styles.reviewContainer}>
          <View style={styles.reviewHeaderContainer}>
            <TouchableOpacity
              onPress={() => setShowReview(false)}
              style={styles.backBtn}
            >
              <Text style={styles.backBtnText}>← Kembali</Text>
            </TouchableOpacity>
            <Text style={styles.reviewTitle}>Pembahasan Soal</Text>
          </View>

          {result.review?.map((item, index) => {
            console.log(`=== ITEM ${index} ===`, {
              prompt: item.prompt,
              options: item.options,
              selected_index: item.selected_index,
              correct_index: item.correct_index,
            });

            const selectedAnswer = item.options?.[item.selected_index];
            const correctAnswer = item.options?.[item.correct_index];

            console.log(
              `Selected: ${selectedAnswer}, Correct: ${correctAnswer}`,
            );

            return (
              <Card key={item.question_id} style={styles.reviewCard}>
                <View style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewNumber}>Soal {index + 1}</Text>
                    <View
                      style={[
                        styles.reviewBadge,
                        item.is_correct
                          ? styles.reviewBadgeCorrect
                          : styles.reviewBadgeWrong,
                      ]}
                    >
                      <Text
                        style={[
                          styles.reviewBadgeText,
                          item.is_correct
                            ? { color: Colors.success }
                            : { color: Colors.danger },
                        ]}
                      >
                        {item.is_correct ? "✓ Benar" : "✗ Salah"}
                      </Text>
                    </View>
                  </View>

                  {/* Tampilkan soal */}
                  <View style={styles.questionBox}>
                    <Text style={styles.questionText}>
                      {item.prompt || "Soal tidak tersedia"}
                    </Text>
                  </View>

                  {/* Always show answer info */}
                  <View style={styles.answerInfo}>
                    <View style={styles.answerRow}>
                      <Text style={styles.answerLabel}>Jawaban kamu:</Text>
                      <View
                        style={[
                          styles.answerBadge,
                          item.is_correct && styles.answerBadgeCorrect,
                        ]}
                      >
                        <Text
                          style={
                            item.is_correct
                              ? styles.answerCorrectText
                              : styles.answerWrongText
                          }
                        >
                          {selectedAnswer || "N/A"}
                        </Text>
                      </View>
                    </View>
                    {!item.is_correct && (
                      <View style={styles.answerRow}>
                        <Text style={styles.answerLabel}>Jawaban benar:</Text>
                        <View
                          style={[
                            styles.answerBadge,
                            styles.answerBadgeCorrect,
                          ]}
                        >
                          <Text style={styles.answerCorrectText}>
                            {correctAnswer || "N/A"}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {item.explanation && (
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationLabel}>
                        💡 Pembahasan:
                      </Text>
                      <Text style={styles.explanationText}>
                        {item.explanation}
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            );
          })}

          <TouchableOpacity
            onPress={() => setShowReview(false)}
            style={styles.doneBtn}
          >
            <Text style={styles.doneBtnText}>Selesai</Text>
          </TouchableOpacity>
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  scoreContainer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  scoreCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scoreNumber: {
    fontSize: 64,
    fontFamily: "Galano-ExtraBold",
    color: Colors.card,
  },
  scoreLabel: {
    fontSize: 16,
    fontFamily: "Galano-SemiBold",
    color: Colors.card,
    marginTop: 8,
  },
  resultInfo: {
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  resultTitle: {
    fontSize: 28,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  resultDesc: {
    fontSize: 16,
    fontFamily: "Galano",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  statsCard: {
    backgroundColor: Colors.softYellow,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontFamily: "Galano-Bold",
  },
  statLabel: {
    fontSize: 14,
    fontFamily: "Galano",
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  badgeCard: {
    backgroundColor: Colors.lavender,
    marginBottom: 16,
  },
  badgeContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 18,
    fontFamily: "Galano-Bold",
    color: Colors.warning,
  },
  actions: {
    width: "100%",
    gap: 12,
    marginTop: 24,
  },
  reviewBtn: {
    backgroundColor: Colors.lightPink,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewBtnText: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.danger,
  },
  retryBtn: {
    backgroundColor: Colors.peach,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryBtnText: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.secondary,
  },
  nextBtn: {
    backgroundColor: Colors.successLight,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.success,
  },
  materiBtn: {
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  materiBtnText: {
    fontSize: 16,
    fontFamily: "Galano-SemiBold",
    color: Colors.textSecondary,
  },
  // Review styles
  reviewContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  reviewHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  backBtn: {
    padding: 8,
    backgroundColor: Colors.lightPink,
    borderRadius: 12,
  },
  backBtnText: {
    fontSize: 16,
    fontFamily: "Galano-SemiBold",
    color: Colors.primary,
  },
  reviewTitle: {
    fontSize: 22,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    flex: 1,
  },
  reviewCard: {
    marginBottom: 16,
    backgroundColor: Colors.card,
  },
  reviewItem: {
    gap: 16,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewNumber: {
    fontSize: 18,
    fontFamily: "Galano-Bold",
    color: Colors.text,
  },
  reviewBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reviewBadgeCorrect: {
    backgroundColor: Colors.successLight,
  },
  reviewBadgeWrong: {
    backgroundColor: Colors.lightPink,
  },
  reviewBadgeText: {
    fontSize: 14,
    fontFamily: "Galano-SemiBold",
  },
  answerInfo: {
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  answerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  answerLabel: {
    fontSize: 15,
    fontFamily: "Galano-Medium",
    color: Colors.textLight,
  },
  answerBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.lightPink,
  },
  answerBadgeCorrect: {
    backgroundColor: Colors.successLight,
  },
  answerWrongText: {
    fontSize: 15,
    fontFamily: "Galano-Bold",
    color: Colors.danger,
  },
  answerCorrectText: {
    fontSize: 15,
    fontFamily: "Galano-Bold",
    color: Colors.success,
  },
  explanationBox: {
    backgroundColor: Colors.skyBlue,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  explanationLabel: {
    fontSize: 15,
    fontFamily: "Galano-SemiBold",
    color: Colors.info,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    fontFamily: "Galano",
    color: Colors.text,
    lineHeight: 22,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  doneBtnText: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.card,
  },
  questionBox: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  questionText: {
    fontSize: 16,
    fontFamily: "Galano-Medium",
    color: Colors.text,
    lineHeight: 24,
  },
});
