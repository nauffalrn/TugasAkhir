import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, ViewStyle } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Container } from "../components/layout/container";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Colors } from "../constants/config";

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
  unlocked_next_level: boolean;
  badge_earned: boolean;
}

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    result: string;
    topicSlug?: string;
    level?: string;
  }>();

  const result: QuizResult = JSON.parse(params.result as string);
  const topicSlug = params.topicSlug as string;
  const level = parseInt(params.level as string);

  const isPassed = result.score >= 80;
  const percentage = result.score;

  useEffect(() => {
    if (result.unlocked_next_level || result.badge_earned) {
      let message = "";
      if (result.badge_earned) {
        message += "🎖️ Badge baru didapatkan!\n";
      }
      if (result.unlocked_next_level) {
        message += `🔓 Level ${level + 1} terbuka!`;
      }

      setTimeout(() => {
        Alert.alert("🎉 Selamat!", message);
      }, 500);
    }
  }, []);

  function handleBackToLevels() {
    router.push({
      pathname: "/kuis/select-level",
      params: {
        topicSlug,
        refresh: Date.now().toString(),
      },
    });
  }

  function handleRetry() {
    router.push({
      pathname: "/kuis/select-level",
      params: {
        topicSlug,
        refresh: Date.now().toString(),
      },
    });
  }

  function handleNextLevel() {
    router.push({
      pathname: "/kuis/select-level",
      params: {
        topicSlug,
        refresh: Date.now().toString(),
      },
    });
  }

  return (
    <Container>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Score Card */}
        <Card style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>
            {isPassed ? "🎉 Selamat!" : "💪 Coba Lagi"}
          </Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{percentage.toFixed(0)}%</Text>
          </View>
          <Text style={styles.scoreSubtitle}>
            {result.correct_count} dari {result.total_questions} benar
          </Text>

          {(result.unlocked_next_level || result.badge_earned) && (
            <View style={styles.achievementBox}>
              {result.badge_earned && (
                <Text style={styles.achievementText}>🎖️ Badge didapatkan!</Text>
              )}
              {result.unlocked_next_level && (
                <Text style={styles.achievementText}>
                  🔓 Level {level + 1} terbuka!
                </Text>
              )}
            </View>
          )}
        </Card>

        {/* Review Section */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>📝 Review Jawaban</Text>
          {result.review?.map((item, index) => {
            // Calculate styles outside JSX
            const cardStyle = [
              styles.reviewCard,
              item.is_correct ? styles.correctCard : styles.wrongCard,
            ];

            const badgeStyle = [
              styles.resultBadge,
              item.is_correct ? styles.correctBadge : styles.wrongBadge,
            ];

            return (
              <Card key={item.question_id} style={StyleSheet.flatten(cardStyle)}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.questionNumber}>Soal {index + 1}</Text>
                  <Text style={badgeStyle}>
                    {item.is_correct ? "✓ Benar" : "✗ Salah"}
                  </Text>
                </View>

                <Text style={styles.questionText}>{item.prompt}</Text>

                <View style={styles.optionsContainer}>
                  {item.options.map((option, optIndex) => {
                    const isSelected = optIndex === item.selected_index;
                    const isCorrect = optIndex === item.correct_index;

                    // Calculate option style
                    const optionStyle = [
                      styles.optionItem,
                      isSelected && styles.selectedOption,
                      isCorrect && styles.correctOption,
                    ];

                    const textStyle = [
                      styles.optionText,
                      (isSelected || isCorrect) && styles.highlightedText,
                    ];

                    return (
                      <View key={optIndex} style={optionStyle}>
                        <Text style={textStyle}>
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </Text>
                        {isCorrect && <Text style={styles.correctMark}>✓</Text>}
                        {isSelected && !isCorrect && (
                          <Text style={styles.wrongMark}>✗</Text>
                        )}
                      </View>
                    );
                  })}
                </View>

                {item.explanation && (
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationTitle}>💡 Penjelasan:</Text>
                    <Text style={styles.explanationText}>
                      {item.explanation}
                    </Text>
                  </View>
                )}
              </Card>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isPassed && result.unlocked_next_level ? (
            <>
              <Button
                title={`Lanjut ke Level ${level + 1}`}
                onPress={handleNextLevel}
                variant="primary"
                size="large"
                style={styles.button}
              />
              <Button
                title="Kembali ke Daftar Level"
                onPress={handleBackToLevels}
                variant="secondary"
                size="large"
                style={styles.button}
              />
            </>
          ) : isPassed ? (
            <Button
              title="Kembali ke Daftar Level"
              onPress={handleBackToLevels}
              variant="primary"
              size="large"
              style={styles.button}
            />
          ) : (
            <>
              <Button
                title="Coba Lagi"
                onPress={handleRetry}
                variant="primary"
                size="large"
                style={styles.button}
              />
              <Button
                title="Kembali ke Daftar Level"
                onPress={handleBackToLevels}
                variant="secondary"
                size="large"
                style={styles.button}
              />
            </>
          )}
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scoreCard: {
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
  },
  scoreTitle: {
    fontSize: 28,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    marginBottom: 20,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 48,
    fontFamily: "Galano-Bold",
    color: Colors.primary,
  },
  scoreSubtitle: {
    fontSize: 16,
    fontFamily: "Galano",
    color: Colors.textSecondary,
  },
  achievementBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: Colors.successLight,
    borderRadius: 12,
    width: "100%",
  },
  achievementText: {
    fontSize: 16,
    fontFamily: "Galano-SemiBold",
    color: Colors.success,
    textAlign: "center",
    marginVertical: 4,
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewTitle: {
    fontSize: 20,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    marginBottom: 16,
  },
  reviewCard: {
    padding: 16,
    marginBottom: 16,
  },
  correctCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  wrongCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.text,
  },
  resultBadge: {
    fontSize: 14,
    fontFamily: "Galano-SemiBold",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  correctBadge: {
    backgroundColor: Colors.successLight,
    color: Colors.success,
  },
  wrongBadge: {
    backgroundColor: Colors.dangerLight,
    color: Colors.danger,
  },
  questionText: {
    fontSize: 16,
    fontFamily: "Galano",
    color: Colors.text,
    marginBottom: 12,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedOption: {
    backgroundColor: Colors.dangerLight,
    borderColor: Colors.danger,
  },
  correctOption: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },
  optionText: {
    fontSize: 14,
    fontFamily: "Galano",
    color: Colors.text,
    flex: 1,
  },
  highlightedText: {
    fontFamily: "Galano-SemiBold",
  },
  correctMark: {
    fontSize: 20,
    color: Colors.success,
    marginLeft: 8,
  },
  wrongMark: {
    fontSize: 20,
    color: Colors.danger,
    marginLeft: 8,
  },
  explanationBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.infoLight,
    borderRadius: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontFamily: "Galano-Bold",
    color: Colors.info,
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    fontFamily: "Galano",
    color: Colors.text,
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 32,
  },
  button: {
    width: "100%",
  },
});
