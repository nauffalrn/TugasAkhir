import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Button } from "../../_components/ui/button";
import { Colors } from "../../_constants/config";
import { getBadgeImage } from "../../_utils/badges";
import { api } from "../../_lib/api";

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
  topic_slug?: string;
}

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    result: string;
    topicSlug?: string;
    level?: string;
  }>();

  const [isRetrying, setIsRetrying] = useState(false);

  const result: QuizResult = JSON.parse(params.result as string);
  const topicSlug = params.topicSlug as string;
  const level = parseInt(params.level as string);
  const isPassed = result.score >= 80;

  function handleBackToLevels() {
    router.push({
      pathname: "/(app)/kuis/select-level",
      params: { topicSlug, refresh: Date.now().toString() },
    });
  }

  function handleReview() {
    router.push({
      pathname: "/(app)/kuis/review",
      params: {
        review: JSON.stringify(result.review),
        level: level.toString(),
      },
    });
  }

  function handleGoHome() {
    router.replace("/(app)/(tabs)/kuis");
  }

  async function handleRetryQuiz() {
    if (isRetrying) return;
    setIsRetrying(true);
    try {
      const res = await api.post("/quiz/start", {
        topic_slug: topicSlug,
        level: level,
      });
      const quizData = res.data.data;

      router.replace({
        pathname: "/(app)/kuis/attempt",
        params: {
          attemptId: quizData.attempt_id,
          topicId: quizData.topic_id,
          topicSlug: topicSlug,
          level: level.toString(),
          timeLimit: quizData.time_limit_seconds?.toString() || "0",
          questions: JSON.stringify(quizData.questions),
        },
      });
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error?.message || "Gagal memulai ulang kuis";
      Alert.alert("Error", errorMsg);
      setIsRetrying(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {}
        <Text style={styles.headerTitle}>
          {isPassed ? "🎉 Selamat!" : "💪 Ayo Coba Lagi!"}
        </Text>

        {}
        <View
          style={[
            styles.scoreCircle,
            {
              backgroundColor: isPassed
                ? Colors.successLight
                : Colors.dangerLight,
            },
          ]}
        >
          <Text
            style={[
              styles.scoreNumber,
              { color: isPassed ? Colors.success : Colors.danger },
            ]}
          >
            {result.score.toFixed(0)}
          </Text>
        </View>

        {/* Badge earned */}
        {result.badge_earned && (
          <View style={styles.badgeContainer}>
            <Image
              source={getBadgeImage(`${topicSlug}-level-${level}`)}
              style={styles.badgeImage}
              resizeMode="contain"
            />
            <View style={styles.badgeTextWrap}>
              <Text style={styles.badgeTitle}>Badge Didapatkan!</Text>
              <Text style={styles.badgeSubtitle}>
                🎖️ Level {level} -{" "}
                {["Pemula", "Mahir", "Expert", "Master"][level - 1]}
              </Text>
            </View>
          </View>
        )}

        {/* Unlock notif */}
        {result.unlocked_next_level && (
          <View style={styles.unlockedBox}>
            <Text style={styles.unlockedText}>
              🔓 Level {level + 1} telah terbuka!
            </Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          {result.review && result.review.length > 0 && (
            <View style={styles.reviewSection}>
              <Button
                title="📝 Review Jawaban"
                onPress={handleReview}
                variant="secondary"
                size="large"
                style={styles.btnReview}
              />
            </View>
          )}

          <View style={styles.mainActions}>
            {isPassed && result.unlocked_next_level ? (
              <View style={styles.btnRow}>
                <Button
                  title={isRetrying ? "Memuat..." : "🔄 Ulangi Kuis"}
                  onPress={handleRetryQuiz}
                  variant="secondary"
                  size="medium"
                  style={styles.btnHalf}
                  disabled={isRetrying}
                />
                <Button
                  title={`Lanjut Level ${level + 1} →`}
                  onPress={handleBackToLevels}
                  variant="primary"
                  size="medium"
                  style={styles.btnHalf}
                />
              </View>
            ) : isPassed ? (
              <View style={styles.btnRow}>
                <Button
                  title={isRetrying ? "Memuat..." : "🔄 Ulangi Kuis"}
                  onPress={handleRetryQuiz}
                  variant="secondary"
                  size="medium"
                  style={styles.btnHalf}
                  disabled={isRetrying}
                />
                <Button
                  title="Pilih Level"
                  onPress={handleBackToLevels}
                  variant="primary"
                  size="medium"
                  style={styles.btnHalf}
                />
              </View>
            ) : (
              // Jika tidak lulus, tombol utamanya adalah "Coba Lagi"
              <View style={styles.btnRow}>
                <Button
                  title="Pilih Level"
                  onPress={handleBackToLevels}
                  variant="secondary"
                  size="medium"
                  style={styles.btnHalf}
                />
                <Button
                  title={isRetrying ? "Memuat..." : "Coba Lagi"}
                  onPress={handleRetryQuiz} // ✅ Panggil fungsi baru
                  variant="primary"
                  size="medium"
                  style={styles.btnHalf}
                  disabled={isRetrying}
                />
              </View>
            )}

            <Button
              title="🏠 Menu Utama"
              onPress={handleGoHome}
              variant="secondary"
              size="large"
              style={styles.btnFull}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    marginBottom: 24,
    textAlign: "center",
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  scoreNumber: {
    fontSize: 64,
    fontFamily: "Galano-Bold",
    lineHeight: 72,
  },
  // ✅ Badge - warna netral abu/surface
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    width: "100%",
    marginBottom: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  badgeImage: {
    width: 64,
    height: 64,
  },
  badgeTextWrap: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    marginBottom: 4,
  },
  badgeSubtitle: {
    fontSize: 14,
    fontFamily: "Galano-SemiBold",
    color: Colors.textSecondary, // ✅ abu bukan kuning
  },
  // ✅ Unlock - warna netral, tidak hijau terang
  unlockedBox: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  unlockedText: {
    fontSize: 15,
    fontFamily: "Galano-SemiBold",
    color: Colors.text,
  },
  actions: {
    width: "100%",
    marginTop: 8,
  },
  reviewSection: {
    marginBottom: 90,
  },

  btnReview: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  mainActions: {
    gap: 12,
  },
  btnFull: {
    width: "100%",
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
  },
  btnHalf: {
    flex: 1,
  },
});
