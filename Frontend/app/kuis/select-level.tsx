import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Container } from "../components/layout/container";
import { Loading } from "../components/ui/loading";
import { Colors } from "../constants/config";
import { api } from "../lib/api";
import { Ionicons } from "@expo/vector-icons";

const levelConfigs = [
  {
    level: 1,
    title: "Pemula",
    icon: "🌱",
    color: Colors.levelColors.level1,
    lightColor: Colors.successLight,
  },
  {
    level: 2,
    title: "Menengah",
    icon: "🌟",
    color: Colors.levelColors.level2,
    lightColor: Colors.primaryLight,
  },
  {
    level: 3,
    title: "Mahir",
    icon: "🔥",
    color: Colors.levelColors.level3,
    lightColor: Colors.secondaryLight,
  },
  {
    level: 4,
    title: "Expert",
    icon: "👑",
    color: Colors.levelColors.level4,
    lightColor: Colors.dangerLight,
  },
];

interface Progress {
  highest_level_unlocked: number;
  best_score_l1: number | null;
  best_score_l2: number | null;
  best_score_l3: number | null;
  best_score_l4: number | null;
  topic_id: string;
  topic_slug: string;
}

export default function SelectLevel() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  async function loadProgress() {
    try {
      const res = await api.get("/profile/progress");
      const allProgress: Progress[] = res.data.data.progress;
      const topicProgress = allProgress.find((p) => p.topic_slug === slug);

      setProgress(
        topicProgress || {
          highest_level_unlocked: 1,
          best_score_l1: null,
          best_score_l2: null,
          best_score_l3: null,
          best_score_l4: null,
          topic_id: "",
          topic_slug: slug || "",
        },
      );
    } catch (err: any) {
      console.error("Failed to load progress:", err);
      setProgress({
        highest_level_unlocked: 1,
        best_score_l1: null,
        best_score_l2: null,
        best_score_l3: null,
        best_score_l4: null,
        topic_id: "",
        topic_slug: slug || "",
      });
    } finally {
      setLoading(false);
    }
  }

  function isLevelUnlocked(level: number): boolean {
    if (!progress) return level === 1;
    return level <= progress.highest_level_unlocked;
  }

  function getLevelScore(level: number): number | null {
    if (!progress) return null;
    const key = `best_score_l${level}` as keyof Progress;
    return progress[key] as number | null;
  }

  function getPreviousScore(level: number): number | null {
    if (!progress || level === 1) return null;
    const key = `best_score_l${level - 1}` as keyof Progress;
    return progress[key] as number | null;
  }

  function startQuiz(level: number) {
    if (!isLevelUnlocked(level)) {
      const prevLevel = level - 1;
      const prevScore = getPreviousScore(level);

      Alert.alert(
        "🔒 Level Terkunci",
        `Level ini masih terkunci!\n\n` +
          `Untuk membuka Level ${level}, kamu harus:\n` +
          `✅ Selesaikan Level ${prevLevel} dengan nilai minimal 80\n\n` +
          `${prevScore !== null ? `Nilai terbaik Level ${prevLevel}: ${prevScore}` : `Kamu belum mencoba Level ${prevLevel}`}`,
        [{ text: "Mengerti", style: "default" }],
      );
      return;
    }

    router.push(`/kuis/attempt?slug=${slug}&level=${level}`);
  }

  if (loading) return <Loading />;

  return (
    <Container scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Pilih Level Kuis</Text>
          <Text style={styles.subtitle}>
            Pilih level sesuai kemampuan kamu!
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {levelConfigs.map((config) => {
            const unlocked = isLevelUnlocked(config.level);
            const score = getLevelScore(config.level);

            return (
              <TouchableOpacity
                key={config.level}
                style={[
                  styles.levelCard,
                  {
                    backgroundColor: unlocked
                      ? config.lightColor
                      : Colors.borderLight,
                  },
                ]}
                onPress={() => startQuiz(config.level)}
                disabled={!unlocked}
                activeOpacity={0.8}
              >
                <View style={styles.levelHeader}>
                  <View
                    style={[
                      styles.levelIconCircle,
                      {
                        backgroundColor: unlocked
                          ? config.color
                          : Colors.border,
                      },
                    ]}
                  >
                    <Text style={styles.levelIcon}>{config.icon}</Text>
                  </View>
                  {!unlocked && (
                    <View style={styles.lockBadge}>
                      <Ionicons
                        name="lock-closed"
                        size={16}
                        color={Colors.textLight}
                      />
                    </View>
                  )}
                </View>

                <Text
                  style={[
                    styles.levelTitle,
                    { color: unlocked ? Colors.text : Colors.textLight },
                  ]}
                >
                  Level {config.level}
                </Text>
                <Text
                  style={[
                    styles.levelSubtitle,
                    {
                      color: unlocked ? Colors.textSecondary : Colors.textLight,
                    },
                  ]}
                >
                  {config.title}
                </Text>

                {score !== null && (
                  <View
                    style={[
                      styles.scoreBadge,
                      { backgroundColor: config.color },
                    ]}
                  >
                    <Ionicons name="star" size={14} color="#FFFFFF" />
                    <Text style={styles.scoreText}>{score}</Text>
                  </View>
                )}

                {unlocked && (
                  <View
                    style={[
                      styles.playButton,
                      { backgroundColor: config.color },
                    ]}
                  >
                    <Ionicons name="play" size={20} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 28,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Galano",
    color: Colors.textSecondary,
  },
  levelCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    position: "relative",
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  levelIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  levelIcon: {
    fontSize: 32,
  },
  lockBadge: {
    backgroundColor: Colors.border,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  levelTitle: {
    fontSize: 24,
    fontFamily: "Galano-Bold",
    marginBottom: 4,
  },
  levelSubtitle: {
    fontSize: 16,
    fontFamily: "Galano-Medium",
  },
  scoreBadge: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  scoreText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Galano-Bold",
  },
  playButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
});
