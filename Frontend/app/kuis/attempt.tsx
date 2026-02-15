import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  AppState,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { api } from "../lib/api";
import { Loading } from "../components/ui/loading";
import { Card } from "../components/ui/card";
import { Colors } from "../constants/config";
import type { QuizAttempt } from "../types";

export default function AttemptScreen() {
  const { slug, level } = useLocalSearchParams<{
    slug: string;
    level: string;
  }>();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    startQuiz();
  }, []);

  // Timer dengan background support
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

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/active/) && nextAppState === "background") {
        // Timer tetap jalan
      }
      appState.current = nextAppState;
    });

    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [attempt]);

  async function startQuiz() {
    try {
      const res = await api.post("/quiz/start", {
        topic_slug: slug,
        level: parseInt(level!),
      });
      setAttempt(res.data.data);
    } catch (err: any) {
      const errorMessage = err.message || "Gagal memulai kuis";

      // Check if it's a level locked error
      if (
        errorMessage.includes("terkunci") ||
        errorMessage.includes("Level") ||
        errorMessage.includes("locked")
      ) {
        Alert.alert(
          "🔒 Level Terkunci",
          errorMessage +
            "\n\nKembali dan coba level sebelumnya terlebih dahulu.",
          [
            {
              text: "Kembali",
              style: "default",
              onPress: () => router.back(),
            },
          ],
        );
      } else {
        Alert.alert("❌ Gagal Memulai Kuis", errorMessage, [
          {
            text: "Kembali",
            style: "default",
            onPress: () => router.back(),
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleExit() {
    Alert.alert(
      "Keluar dari Kuis?",
      "Progres kamu akan hilang. Yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: () => router.back(),
        },
      ],
    );
  }

  async function handleSubmit(expired = false) {
    const unanswered = attempt!.questions.filter((q) => !(q.id in answers));

    if (!expired && unanswered.length > 0) {
      return Alert.alert(
        "Ada soal yang belum dijawab",
        `${unanswered.length} soal belum dijawab. Lanjutkan submit?`,
        [
          { text: "Batal", style: "cancel" },
          { text: "Submit", onPress: () => doSubmit() },
        ],
      );
    }

    doSubmit();
  }

  async function doSubmit() {
    setSubmitting(true);
    setShowSidebar(false);
    try {
      const payload = attempt!.questions.map((q) => ({
        question_id: q.id,
        selected_index: answers[q.id] ?? 0,
      }));

      const res = await api.post("/quiz/submit", {
        attempt_id: attempt!.attempt_id,
        topic_id: attempt!.topic_id,
        level: attempt!.level,
        answers: payload,
      });

      router.push({
        pathname: "/kuis/result",
        params: {
          resultData: JSON.stringify(res.data.data),
          slug: attempt!.topic_slug,
          level: attempt!.level.toString(),
        },
      });
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loading />;
  if (!attempt) return <Text>Gagal memuat kuis</Text>;

  const currentQuestion = attempt.questions[currentIndex];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < attempt.questions.length - 1;
  const hasHint =
    currentQuestion.hint && (parseInt(level!) === 1 || parseInt(level!) === 2);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (!timeLeft) return Colors.text;
    if (timeLeft < 60) return Colors.danger; // < 1 menit merah
    if (timeLeft < 300) return Colors.warning; // < 5 menit kuning
    return Colors.secondary;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.exitBtn}>
          <Text style={styles.exitText}>✕ Keluar</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.levelText}>Level {level}</Text>
          {timeLeft !== null && (
            <Text style={[styles.timer, { color: getTimeColor() }]}>
              {formatTime(timeLeft)}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setShowSidebar(true)}
          style={styles.sidebarBtn}
        >
          <Text style={styles.sidebarText}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${((currentIndex + 1) / attempt.questions.length) * 100}%`,
            },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        Soal {currentIndex + 1} dari {attempt.questions.length}
      </Text>

      {/* Question Card */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.questionCard}>
          <Text style={styles.questionNumber}>Soal {currentIndex + 1}</Text>
          <Text style={styles.questionText}>{currentQuestion.prompt}</Text>

          {hasHint && (
            <TouchableOpacity
              onPress={() => setShowHint(true)}
              style={styles.hintBtn}
            >
              <Text style={styles.hintBtnText}>💡 Lihat Hint</Text>
            </TouchableOpacity>
          )}

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = answers[currentQuestion.id] === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() =>
                    setAnswers({ ...answers, [currentQuestion.id]: idx })
                  }
                  style={[styles.option, isSelected && styles.optionSelected]}
                >
                  <View style={styles.optionCircle}>
                    {isSelected && <View style={styles.optionCircleInner} />}
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <View style={styles.navButtons}>
          <TouchableOpacity
            onPress={() => setCurrentIndex(currentIndex - 1)}
            disabled={!canGoPrev}
            style={[styles.navBtn, !canGoPrev && styles.navBtnDisabled]}
          >
            <Text
              style={[
                styles.navBtnText,
                !canGoPrev && styles.navBtnTextDisabled,
              ]}
            >
              ← Sebelumnya
            </Text>
          </TouchableOpacity>

          {canGoNext ? (
            <TouchableOpacity
              onPress={() => setCurrentIndex(currentIndex + 1)}
              style={[styles.navBtn, styles.navBtnPrimary]}
            >
              <Text style={[styles.navBtnText, styles.navBtnTextPrimary]}>
                Selanjutnya →
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => handleSubmit(false)}
              disabled={submitting}
              style={[styles.navBtn, styles.navBtnSuccess]}
            >
              <Text style={[styles.navBtnText, styles.navBtnTextPrimary]}>
                {submitting ? "Menyimpan..." : "Submit ✓"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Hint Modal */}
      <Modal
        visible={showHint}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHint(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💡 Hint</Text>
            <Text style={styles.modalText}>{currentQuestion.hint}</Text>
            <TouchableOpacity
              onPress={() => setShowHint(false)}
              style={styles.modalBtn}
            >
              <Text style={styles.modalBtnText}>Mengerti</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sidebar Modal */}
      <Modal
        visible={showSidebar}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSidebar(false)}
      >
        <View style={styles.sidebarOverlay}>
          <View style={styles.sidebarContent}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Daftar Soal</Text>
              <TouchableOpacity onPress={() => setShowSidebar(false)}>
                <Text style={styles.sidebarClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.sidebarScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.sidebarGrid}>
                {attempt.questions.map((q, idx) => {
                  const isAnswered = q.id in answers;
                  const isCurrent = idx === currentIndex;
                  return (
                    <TouchableOpacity
                      key={q.id}
                      onPress={() => {
                        setCurrentIndex(idx);
                        setShowSidebar(false);
                      }}
                      style={[
                        styles.sidebarItem,
                        isCurrent && styles.sidebarItemCurrent,
                        isAnswered && !isCurrent && styles.sidebarItemAnswered,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sidebarItemText,
                          isCurrent && styles.sidebarItemTextActive,
                        ]}
                      >
                        {idx + 1}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Submit button di sidebar */}
            <View style={styles.sidebarFooter}>
              <TouchableOpacity
                onPress={() => handleSubmit(false)}
                disabled={submitting}
                style={styles.sidebarSubmitBtn}
              >
                <Text style={styles.sidebarSubmitText}>
                  {submitting ? "Menyimpan..." : "✓ Submit Kuis"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 40, // Safe area untuk kamera
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exitBtn: {
    padding: 8,
    backgroundColor: Colors.lightPink,
    borderRadius: 10,
  },
  exitText: {
    fontSize: 14,
    color: Colors.danger,
    fontFamily: "Galano-SemiBold",
  },
  headerCenter: {
    alignItems: "center",
  },
  levelText: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.text,
  },
  timer: {
    fontSize: 18,
    fontFamily: "Galano-Bold",
    marginTop: 4,
  },
  sidebarBtn: {
    padding: 8,
    backgroundColor: Colors.peach,
    borderRadius: 10,
  },
  sidebarText: {
    fontSize: 20,
    color: Colors.primary,
  },
  progressContainer: {
    height: 6,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.primary,
  },
  progressText: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Galano-Medium",
    color: Colors.textSecondary,
    paddingVertical: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  questionCard: {
    backgroundColor: Colors.card,
    marginVertical: 8,
  },
  questionNumber: {
    fontSize: 14,
    fontFamily: "Galano-SemiBold",
    color: Colors.primary,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    fontFamily: "Galano-Medium",
    color: Colors.text,
    lineHeight: 26,
    marginBottom: 16,
  },
  hintBtn: {
    alignSelf: "flex-start",
    backgroundColor: Colors.softYellow,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  hintBtnText: {
    fontSize: 14,
    fontFamily: "Galano-SemiBold",
    color: Colors.warning,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderRadius: 16,
    backgroundColor: Colors.card,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.lightPink + "40",
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  optionCircleInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Galano",
    color: Colors.text,
    lineHeight: 22,
  },
  optionTextSelected: {
    fontFamily: "Galano-SemiBold",
    color: Colors.primary,
  },
  navigationContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtons: {
    flexDirection: "row",
    gap: 12,
  },
  navBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    backgroundColor: Colors.card,
  },
  navBtnDisabled: {
    opacity: 0.3,
  },
  navBtnPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  navBtnSuccess: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  navBtnText: {
    fontSize: 16,
    fontFamily: "Galano-SemiBold",
    color: Colors.text,
  },
  navBtnTextDisabled: {
    color: Colors.textSecondary,
  },
  navBtnTextPrimary: {
    color: Colors.card,
    fontFamily: "Galano-Bold",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(158, 59, 59, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    fontFamily: "Galano",
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  modalBtn: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  modalBtnText: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.card,
  },
  // Sidebar styles
  sidebarOverlay: {
    flex: 1,
    backgroundColor: "rgba(158, 59, 59, 0.6)",
    justifyContent: "flex-end",
  },
  sidebarContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sidebarTitle: {
    fontSize: 20,
    fontFamily: "Galano-Bold",
    color: Colors.text,
  },
  sidebarClose: {
    fontSize: 24,
    color: Colors.textSecondary,
    padding: 4,
  },
  sidebarScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sidebarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 20,
  },
  sidebarItem: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  sidebarItemCurrent: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sidebarItemAnswered: {
    borderColor: Colors.success,
    backgroundColor: Colors.successLight,
  },
  sidebarItemText: {
    fontSize: 18,
    fontFamily: "Galano-SemiBold",
    color: Colors.text,
  },
  sidebarItemTextActive: {
    color: Colors.card,
  },
  sidebarFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  sidebarSubmitBtn: {
    backgroundColor: Colors.success,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sidebarSubmitText: {
    fontSize: 17,
    fontFamily: "Galano-Bold",
    color: Colors.card,
  },
});
