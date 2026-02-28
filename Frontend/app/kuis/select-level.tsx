import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Colors } from "../constants/config";
import { api } from "../lib/api";
import { Ionicons } from "@expo/vector-icons";
import { BottomNav } from "../components/layout/bottom-nav";

interface Progress {
  topic_id: string;
  highest_level_unlocked: number;
  best_score_l1: number | null;
  best_score_l2: number | null;
  best_score_l3: number | null;
  best_score_l4: number | null;
}

const LEVELS = [
  {
    level: 1,
    title: "Level 1 - Pemula",
    description: "Soal dasar dengan hint",
    icon: "🌱",
    color: Colors.success,
  },
  {
    level: 2,
    title: "Level 2 - Mahir",
    description: "Soal menengah dengan hint",
    icon: "⭐",
    color: Colors.info,
  },
  {
    level: 3,
    title: "Level 3 - Expert",
    description: "Soal sulit, timer 30 menit",
    icon: "🔥",
    color: Colors.warning,
  },
  {
    level: 4,
    title: "Level 4 - Master",
    description: "Challenge maksimal, timer 15 menit",
    icon: "👑",
    color: Colors.danger,
  },
];

export default function SelectLevelScreen() {
  const params = useLocalSearchParams();
  const topicSlug = params.topicSlug as string;

  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingQuiz, setStartingQuiz] = useState(false);
  const isRequestingRef = useRef(false);

  useEffect(() => {
    loadProgress();
  }, [params.refresh]);

  async function loadProgress() {
    try {
      setLoading(true);
      const res = await api.get("/profile/progress");
      const allProgress = res.data.data.progress;
      const topicProgress = allProgress.find(
        (p: any) => p.topic_slug === topicSlug,
      );
      if (topicProgress) {
        setProgress(topicProgress);
      } else {
        setProgress({
          topic_id: "",
          highest_level_unlocked: 1,
          best_score_l1: null,
          best_score_l2: null,
          best_score_l3: null,
          best_score_l4: null,
        });
      }
    } catch (err) {
      console.error("Load progress error:", err);
      Alert.alert("Error", "Gagal memuat progress");
    } finally {
      setLoading(false);
    }
  }

  function isLevelUnlocked(level: number): boolean {
    if (level === 1) return true;
    return (progress?.highest_level_unlocked || 1) >= level;
  }

  function getBestScore(level: number): number | null {
    const key = `best_score_l${level}` as keyof Progress;
    return progress?.[key] as number | null;
  }

  async function handleStartQuiz(level: number) {
    if (isRequestingRef.current || startingQuiz) return;

    if (!isLevelUnlocked(level)) {
      Alert.alert(
        "Level Terkunci",
        `Selesaikan Level ${level - 1} dengan nilai ≥80 untuk membuka level ini`,
      );
      return;
    }

    try {
      isRequestingRef.current = true;
      setStartingQuiz(true);

      const res = await api.post("/quiz/start", {
        topic_slug: topicSlug,
        level: level,
      });
      const quizData = res.data.data;

      router.push({
        pathname: "/kuis/attempt",
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
        err.response?.data?.error?.message || "Gagal memulai kuis";
      Alert.alert("Error", errorMsg);
    } finally {
      setStartingQuiz(false);
      isRequestingRef.current = false;
    }
  }

  if (loading) {
    return (
      // ✅ Samakan struktur loading dengan [slug].tsx
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
        <BottomNav />
      </View>
    );
  }

  return (
    // ✅ Ganti Container dengan View biasa, sama seperti [slug].tsx
    <View style={styles.container}>
      {/* Header sama persis style dengan [slug].tsx */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Pilih Level</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Selesaikan level dengan nilai ≥80 untuk membuka level berikutnya
        </Text>

        {LEVELS.map((levelData) => {
          const unlocked = isLevelUnlocked(levelData.level);
          const bestScore = getBestScore(levelData.level);

          return (
            <Card
              key={levelData.level}
              style={StyleSheet.flatten([
                styles.levelCard,
                !unlocked && styles.lockedCard,
              ])}
            >
              <View style={styles.levelContent}>
                <View style={styles.levelHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: levelData.color + "20" },
                    ]}
                  >
                    <Text style={styles.levelIcon}>{levelData.icon}</Text>
                  </View>
                  <View style={styles.levelInfo}>
                    <Text
                      style={[
                        styles.levelTitle,
                        !unlocked && styles.lockedText,
                      ]}
                    >
                      {levelData.title}
                    </Text>
                    <Text style={styles.levelDescription}>
                      {levelData.description}
                    </Text>
                  </View>
                  {!unlocked && <Text style={styles.lockEmoji}>🔒</Text>}
                </View>

                {bestScore !== null && (
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>Best Score:</Text>
                    <Text
                      style={[styles.scoreValue, { color: levelData.color }]}
                    >
                      {bestScore.toFixed(0)}%
                    </Text>
                  </View>
                )}

                {unlocked && (
                  <Button
                    title={startingQuiz ? "Memuat..." : "Mulai Kuis"}
                    onPress={() => handleStartQuiz(levelData.level)}
                    variant="primary"
                    size="medium"
                    style={styles.startButton}
                    disabled={startingQuiz}
                    loading={startingQuiz}
                  />
                )}
              </View>
            </Card>
          );
        })}
      </ScrollView>

      {/* ✅ BottomNav di luar ScrollView, sticky di bawah */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  // ✅ Sama persis dengan [slug].tsx
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  backBtn: {
    padding: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Galano",
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  levelCard: {
    padding: 20,
    marginBottom: 16,
  },
  lockedCard: {
    opacity: 0.6,
  },
  levelContent: {
    gap: 16,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  levelIcon: {
    fontSize: 32,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    marginBottom: 4,
  },
  lockedText: {
    color: Colors.textSecondary,
  },
  levelDescription: {
    fontSize: 14,
    fontFamily: "Galano",
    color: Colors.textSecondary,
  },
  lockEmoji: {
    fontSize: 24,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: "Galano",
    color: Colors.textSecondary,
  },
  scoreValue: {
    fontSize: 20,
    fontFamily: "Galano-Bold",
  },
  startButton: {
    marginTop: 8,
  },
});
