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
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Colors } from "../constants/config";
import { Ionicons } from "@expo/vector-icons";

interface QuizResult {
  score: number;
  correct_count: number;
  total_questions: number;
  review?: Array<{
    question_id: string;
    prompt: string;
    options: string[];
    selected_index: number;
    correct_index: number;
    is_correct: boolean;
    explanation?: string;
  }>;
}

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    resultData: string;
    slug?: string;
    level?: string;
  }>();

  let result: QuizResult;
  try {
    result = JSON.parse(params.resultData!);
  } catch (error) {
    console.error("Failed to parse result:", error);
    Alert.alert("Error", "Gagal memuat hasil kuis");
    router.back();
    return null;
  }

  const [showReview, setShowReview] = useState(false);
  const isPassed = result.score >= 80;
  const currentLevel = parseInt(params.level || "1");
  const hasNextLevel = currentLevel < 4;
  const percentage = Math.round(
    (result.correct_count / result.total_questions) * 100,
  );

  function goToNextLevel() {
    const nextLevel = currentLevel + 1;
    router.replace(`/kuis/attempt?slug=${params.slug}&level=${nextLevel}`);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!showReview ? (
          // Score Screen
          <>
            <Card
              style={StyleSheet.flatten([
                styles.scoreCard,
                isPassed ? styles.scoreCardPassed : styles.scoreCardFailed,
              ])}
            >
              <View style={styles.scoreHeader}>
                <Text style={styles.scoreEmoji}>{isPassed ? "🎉" : "💪"}</Text>
                <Text style={styles.scoreTitle}>
                  {isPassed ? "Selamat!" : "Terus Semangat!"}
                </Text>
              </View>

              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>{result.score}</Text>
                <Text style={styles.scoreLabel}>Nilai</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{result.correct_count}</Text>
                  <Text style={styles.statLabel}>Benar</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>
                    {result.total_questions - result.correct_count}
                  </Text>
                  <Text style={styles.statLabel}>Salah</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{percentage}%</Text>
                  <Text style={styles.statLabel}>Akurasi</Text>
                </View>
              </View>

              {isPassed && (
                <View style={styles.badgeBanner}>
                  <Ionicons name="trophy" size={24} color={Colors.warning} />
                  <Text style={styles.badgeText}>
                    {hasNextLevel
                      ? `Level ${currentLevel + 1} Unlocked! 🎊`
                      : `Kamu Telah Menyelesaikan Semua Level! 👑`}
                  </Text>
                </View>
              )}
            </Card>

            {/* Action Buttons */}
            <View style={styles.actions}>
              {isPassed && hasNextLevel && (
                <Button
                  title={`🚀 Lanjut ke Level ${currentLevel + 1}`}
                  onPress={goToNextLevel}
                  variant="success"
                  size="large"
                />
              )}

              <Button
                title="📝 Lihat Pembahasan"
                onPress={() => setShowReview(true)}
                variant="outline"
                size="large"
              />

              <Button
                title="🔄 Coba Lagi"
                onPress={() =>
                  router.replace(
                    `/kuis/attempt?slug=${params.slug}&level=${params.level}`,
                  )
                }
                variant="primary"
                size="large"
              />

              <Button
                title="🏠 Kembali ke Menu"
                onPress={() => router.replace("/tabs/kuis")}
                variant="secondary"
                size="large"
              />
            </View>
          </>
        ) : (
          // Review Screen
          <View style={styles.reviewContainer}>
            <View style={styles.reviewHeaderContainer}>
              <TouchableOpacity
                onPress={() => setShowReview(false)}
                style={styles.backBtn}
              >
                <Ionicons name="arrow-back" size={20} color={Colors.primary} />
                <Text style={styles.backBtnText}>Kembali</Text>
              </TouchableOpacity>
              <Text style={styles.reviewTitle}>Pembahasan Soal</Text>
            </View>

            {result.review?.map((item, index) => {
              const selectedAnswer = item.options?.[item.selected_index];
              const correctAnswer = item.options?.[item.correct_index];

              return (
                <Card
                  key={item.question_id}
                  style={
                    item.is_correct
                      ? styles.reviewCardCorrect
                      : styles.reviewCardWrong
                  }
                >
                  <View style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewNumber}>Soal {index + 1}</Text>
                      <View
                        style={
                          item.is_correct
                            ? styles.reviewBadgeCorrect
                            : styles.reviewBadgeWrong
                        }
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

                    <View style={styles.questionBox}>
                      <Text style={styles.questionText}>
                        {item.prompt || "Soal tidak tersedia"}
                      </Text>
                    </View>

                    <View style={styles.answerInfo}>
                      <View style={styles.answerSection}>
                        <Text style={styles.answerLabel}>Jawaban kamu:</Text>
                        <View
                          style={
                            item.is_correct
                              ? styles.answerBoxCorrect
                              : styles.answerBoxWrong
                          }
                        >
                          <Text style={styles.answerText}>
                            {selectedAnswer || "N/A"}
                          </Text>
                        </View>
                      </View>

                      {!item.is_correct && (
                        <View style={styles.answerSection}>
                          <Text style={styles.answerLabel}>Jawaban benar:</Text>
                          <View style={styles.answerBoxCorrect}>
                            <Text style={styles.answerText}>
                              {correctAnswer || "N/A"}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>

                    {item.explanation && (
                      <View style={styles.explanationBox}>
                        <View style={styles.explanationHeader}>
                          <Ionicons
                            name="bulb"
                            size={20}
                            color={Colors.warning}
                          />
                          <Text style={styles.explanationLabel}>
                            Penjelasan:
                          </Text>
                        </View>
                        <Text style={styles.explanationText}>
                          {item.explanation}
                        </Text>
                      </View>
                    )}
                  </View>
                </Card>
              );
            })}

            <Button
              title="✓ Selesai"
              onPress={() => setShowReview(false)}
              variant="primary"
              size="large"
              style={styles.doneBtn}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  scoreCard: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  scoreCardPassed: {
    backgroundColor: Colors.successLight,
    borderWidth: 2,
    borderColor: Colors.success,
  },
  scoreCardFailed: {
    backgroundColor: Colors.dangerLight,
    borderWidth: 2,
    borderColor: Colors.danger,
  },
  scoreHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  scoreEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  scoreTitle: {
    fontSize: 28,
    fontFamily: "Galano-Bold",
    color: Colors.text,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  scoreNumber: {
    fontSize: 48,
    fontFamily: "Galano-Bold",
    color: Colors.primary,
  },
  scoreLabel: {
    fontSize: 16,
    fontFamily: "Galano",
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontFamily: "Galano-Bold",
    color: Colors.text,
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
  badgeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.warning,
  },
  badgeText: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    flex: 1,
  },
  actions: {
    width: "100%",
    gap: 12,
    marginTop: 8,
  },
  // Review styles
  reviewContainer: {
    paddingBottom: 24,
  },
  reviewHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.primary,
  },
  reviewTitle: {
    fontSize: 24,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    flex: 1,
  },
  reviewCard: {
    marginBottom: 16,
    padding: 20,
  },
  reviewCardCorrect: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
  },
  reviewCardWrong: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
  },
  reviewItem: {
    gap: 16,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reviewBadgeWrong: {
    backgroundColor: Colors.lightPink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reviewBadgeText: {
    fontSize: 14,
    fontFamily: "Galano-SemiBold",
  },
  questionBox: {
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  questionText: {
    fontSize: 16,
    fontFamily: "Galano-Medium",
    color: Colors.text,
    lineHeight: 24,
  },
  answerInfo: {
    gap: 12,
  },
  answerSection: {
    gap: 8,
  },
  answerLabel: {
    fontSize: 14,
    fontFamily: "Galano-SemiBold",
    color: Colors.textSecondary,
  },
  answerBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  answerBoxCorrect: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  answerBoxWrong: {
    backgroundColor: Colors.dangerLight,
    borderColor: Colors.danger,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  answerText: {
    fontSize: 15,
    fontFamily: "Galano-Medium",
    color: Colors.text,
    lineHeight: 22,
  },
  explanationBox: {
    padding: 16,
    backgroundColor: Colors.warningLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  explanationLabel: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.text,
  },
  explanationText: {
    fontSize: 14,
    fontFamily: "Galano",
    color: Colors.text,
    lineHeight: 22,
  },
  doneBtn: {
    marginTop: 8,
  },
});
