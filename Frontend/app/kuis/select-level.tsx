import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Container } from "../components/layout/container";
import { Card } from "../components/ui/card";
import { Loading } from "../components/ui/loading";
import { Colors } from "../constants/config";
import { api } from "../lib/api";

const LEVELS = [
  {
    level: 1,
    label: "Level 1 - Pemula",
    icon: "🌱",
    time: "Tanpa batas waktu",
    color: Colors.success,
  },
  {
    level: 2,
    label: "Level 2 - Penjelajah",
    icon: "🎒",
    time: "Tanpa batas waktu",
    color: Colors.info,
  },
  {
    level: 3,
    label: "Level 3 - Ahli",
    icon: "🏆",
    time: "Batas waktu 30 menit",
    color: Colors.warning,
  },
  {
    level: 4,
    label: "Level 4 - Master",
    icon: "⭐",
    time: "Batas waktu 15 menit",
    color: Colors.danger,
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

      // Find progress for this specific topic by slug
      const topicProgress = allProgress.find((p) => p.topic_slug === slug);

      // Default to level 1 only if no progress found
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
      // Default to level 1 only on error
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

        {LEVELS.map((item) => {
          const unlocked = isLevelUnlocked(item.level);
          const prevScore = getPreviousScore(item.level);

          return (
            <TouchableOpacity
              key={item.level}
              onPress={() => startQuiz(item.level)}
              activeOpacity={unlocked ? 0.7 : 1}
              style={styles.levelCardWrapper}
              disabled={!unlocked}
            >
              <View
                style={[
                  styles.levelCardBorder,
                  { borderLeftColor: unlocked ? item.color : "#CCCCCC" },
                ]}
              >
                <Card style={unlocked ? {} : styles.lockedCard}>
                  <View style={styles.levelContent}>
                    <View
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor: unlocked
                            ? item.color + "20"
                            : "#F0F0F0",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.levelIcon,
                          !unlocked && styles.lockedIcon,
                        ]}
                      >
                        {unlocked ? item.icon : "🔒"}
                      </Text>
                    </View>
                    <View style={styles.levelInfo}>
                      <Text
                        style={[
                          styles.levelLabel,
                          !unlocked && styles.lockedText,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {unlocked ? (
                        <View style={styles.levelTime}>
                          <Text style={styles.levelTimeIcon}>⏱</Text>
                          <Text style={styles.levelTimeText}>{item.time}</Text>
                        </View>
                      ) : (
                        <View style={styles.lockInfo}>
                          <Text style={styles.lockText}>
                            🔓 Selesaikan Level {item.level - 1} dengan nilai
                            ≥80
                          </Text>
                          {prevScore !== null && (
                            <Text style={styles.lockScore}>
                              Nilai terbaik Level {item.level - 1}: {prevScore}
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 24,
  },
  header: {
    marginBottom: 24,
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
  levelCardWrapper: {
    marginBottom: 16,
  },
  levelCardBorder: {
    borderLeftWidth: 6,
    borderRadius: 12,
    overflow: "hidden",
  },
  levelContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  levelIcon: {
    fontSize: 32,
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 18,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    marginBottom: 8,
  },
  levelTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.background,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelTimeIcon: {
    fontSize: 14,
  },
  levelTimeText: {
    fontSize: 13,
    fontFamily: "Galano-Medium",
    color: Colors.text,
  },
  lockedCard: {
    backgroundColor: "#F8F8F8",
    opacity: 0.7,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  lockedText: {
    color: "#999999",
  },
  lockInfo: {
    gap: 4,
  },
  lockText: {
    fontSize: 14,
    fontFamily: "Galano-Medium",
    color: "#666666",
  },
  lockScore: {
    fontSize: 12,
    fontFamily: "Galano",
    color: "#999999",
    fontStyle: "italic",
  },
});
