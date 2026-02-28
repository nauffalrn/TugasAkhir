import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Container } from "../components/layout/container";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Colors } from "../constants/config";
import { getBadgeImage } from "../utils/badges";
import { Ionicons } from "@expo/vector-icons"; // ✅ tambah

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

  const result: QuizResult = JSON.parse(params.result as string);
  const topicSlug = params.topicSlug as string;
  const level = parseInt(params.level as string);
  const isPassed = result.score >= 80;

  // ✅ Tidak ada useEffect popup

  function handleBackToLevels() {
    router.push({
      pathname: "/kuis/select-level",
      params: { topicSlug, refresh: Date.now().toString() },
    });
  }

  function handleRetry() {
    router.push({
      pathname: "/kuis/select-level",
      params: { topicSlug, refresh: Date.now().toString() },
    });
  }

  function handleNextLevel() {
    router.push({
      pathname: "/kuis/select-level",
      params: { topicSlug, refresh: Date.now().toString() },
    });
  }

  function handleReview() {
    router.push({
      pathname: "/kuis/review",
      params: {
        review: JSON.stringify(result.review),
        level: level.toString(),
      },
    });
  }

  // ✅ Ke menu utama (tabs)
  function handleGoHome() {
    router.replace("/(tabs)" as any);
  }

  return (
    <Container>
      {/* ✅ Hapus header home button, tidak perlu back di result */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Score Card */}
        <Card style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>
            {isPassed ? "🎉 Selamat!" : "💪 Coba Lagi"}
          </Text>
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

          {/* ✅ Tampilkan badge image jika badge earned */}
          {result.badge_earned && (
            <View style={styles.badgeContainer}>
              <Image
                source={getBadgeImage(`${topicSlug}-level-${level}`)}
                style={styles.badgeImage}
                resizeMode="contain"
              />
              <Text style={styles.badgeText}>
                🎖️ Badge Level {level} Didapatkan!
              </Text>
            </View>
          )}

          {result.unlocked_next_level && (
            <View style={styles.unlockedBox}>
              <Text style={styles.unlockedText}>
                🔓 Level {level + 1} Terbuka!
              </Text>
            </View>
          )}
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {result.review && result.review.length > 0 && (
            <Button
              title="📝 Review Jawaban"
              onPress={handleReview}
              variant="secondary"
              size="large"
              style={styles.button}
            />
          )}

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

          {/* ✅ Tombol ke menu lain */}
          <Button
            title="🏠 Ke Menu Utama"
            onPress={handleGoHome}
            variant="secondary"
            size="large"
            style={styles.button}
          />
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60, // ✅ ganti header dengan paddingTop langsung
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 56,
    fontFamily: "Galano-Bold",
  },
  badgeContainer: {
    alignItems: "center",
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.secondaryLight,
    borderRadius: 16,
    width: "100%",
  },
  badgeImage: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.secondary,
    textAlign: "center",
  },
  unlockedBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.successLight,
    borderRadius: 12,
    width: "100%",
  },
  unlockedText: {
    fontSize: 16,
    fontFamily: "Galano-SemiBold",
    color: Colors.success,
    textAlign: "center",
  },
  actionButtons: {
    gap: 12,
    marginBottom: 32,
  },
  button: {
    width: "100%",
  },
});
