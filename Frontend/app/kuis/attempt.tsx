import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Container } from "../components/layout/container";
import { Colors } from "../constants/config";
import { api } from "../lib/api";

interface Question {
  id: string;
  prompt: string;
  options: string[];
  hint?: string;
}

export default function AttemptScreen() {
  const params = useLocalSearchParams();

  // ✅ Ambil semua data dari params (sudah dikirim dari select-level)
  const attemptId = params.attemptId as string;
  const topicId = params.topicId as string;
  const topicSlug = params.topicSlug as string;
  const level = parseInt(params.level as string);
  const timeLimit = parseInt(params.timeLimit as string) || 0;
  const questions: Question[] = JSON.parse(params.questions as string);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: number;
  }>({});
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnswered = selectedAnswers[currentQuestion?.id] !== undefined;

  // ✅ Timer - hanya jika ada time limit
  useEffect(() => {
    if (timeLimit > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  function handleSelectAnswer(optionIndex: number) {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
    setShowHint(false);
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowHint(false);
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowHint(false);
    }
  }

  async function handleSubmit() {
    if (submitting) return;

    const unanswered = questions.filter(
      (q) => selectedAnswers[q.id] === undefined,
    );

    if (unanswered.length > 0) {
      Alert.alert(
        "Belum Selesai",
        `Masih ada ${unanswered.length} soal yang belum dijawab. Yakin ingin submit?`,
        [
          { text: "Lanjut Mengerjakan", style: "cancel" },
          { text: "Submit", onPress: () => doSubmit() },
        ],
      );
      return;
    }

    await doSubmit();
  }

  async function doSubmit() {
    if (submitting) return;

    try {
      setSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const answers = questions.map((q) => ({
        question_id: q.id,
        selected_index: selectedAnswers[q.id] ?? 0,
      }));

      const res = await api.post("/quiz/submit", {
        attempt_id: attemptId,
        topic_id: topicId,
        level,
        answers,
      });

      const result = res.data.data;

      router.replace({
        pathname: "/kuis/result",
        params: {
          result: JSON.stringify(result),
          topicSlug,
          level: level.toString(),
        },
      });
    } catch (err: any) {
      console.error("Submit error:", err);
      Alert.alert("Error", "Gagal submit kuis. Coba lagi.");
      setSubmitting(false);
    }
  }

  if (!questions || questions.length === 0) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.levelText}>Level {level}</Text>
          <Text style={styles.progressText}>
            {currentIndex + 1}/{questions.length}
          </Text>
        </View>
        {timeLimit > 0 && (
          <View
            style={[styles.timerBox, timeLeft < 60 && styles.timerBoxDanger]}
          >
            <Text
              style={[
                styles.timerText,
                timeLeft < 60 && styles.timerTextDanger,
              ]}
            >
              ⏱ {formatTime(timeLeft)}
            </Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            },
          ]}
        />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Question */}
        <View style={styles.questionCard}>
          <Text style={styles.questionNumber}>Soal {currentIndex + 1}</Text>
          <Text style={styles.questionText}>{currentQuestion.prompt}</Text>

          {/* Hint */}
          {currentQuestion.hint && (
            <TouchableOpacity
              onPress={() => setShowHint(!showHint)}
              style={styles.hintButton}
            >
              <Text style={styles.hintButtonText}>
                {showHint ? "🙈 Sembunyikan Hint" : "💡 Tampilkan Hint"}
              </Text>
            </TouchableOpacity>
          )}

          {showHint && currentQuestion.hint && (
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>{currentQuestion.hint}</Text>
            </View>
          )}
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion.id] === index;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  isSelected && styles.selectedOption,
                ]}
                onPress={() => handleSelectAnswer(index)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.optionLabel,
                    isSelected && styles.selectedLabel,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLabelText,
                      isSelected && styles.selectedLabelText,
                    ]}
                  >
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text
                  style={[styles.optionText, isSelected && styles.selectedText]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navButtonText}>← Prev</Text>
        </TouchableOpacity>

        {isLastQuestion ? (
          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? "Submitting..." : "Submit ✓"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, !hasAnswered && styles.navButtonDisabled]}
            onPress={handleNext}
          >
            <Text style={styles.navButtonText}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerLeft: {
    gap: 4,
  },
  levelText: {
    fontSize: 18,
    fontFamily: "Galano-Bold",
    color: Colors.text,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "Galano",
    color: Colors.textSecondary,
  },
  timerBox: {
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerBoxDanger: {
    backgroundColor: Colors.dangerLight,
  },
  timerText: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.info,
  },
  timerTextDanger: {
    color: Colors.danger,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.borderLight,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  questionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  questionNumber: {
    fontSize: 14,
    fontFamily: "Galano-SemiBold",
    color: Colors.primary,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 18,
    fontFamily: "Galano-SemiBold",
    color: Colors.text,
    lineHeight: 28,
    marginBottom: 16,
  },
  hintButton: {
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  hintButtonText: {
    fontSize: 14,
    fontFamily: "Galano-SemiBold",
    color: Colors.info,
  },
  hintBox: {
    marginTop: 12,
    backgroundColor: Colors.warningLight || "#FFF9C4",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  hintText: {
    fontSize: 14,
    fontFamily: "Galano",
    color: Colors.text,
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    gap: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  optionLabel: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedLabel: {
    backgroundColor: Colors.primary,
  },
  optionLabelText: {
    fontSize: 14,
    fontFamily: "Galano-Bold",
    color: Colors.textSecondary,
  },
  selectedLabelText: {
    color: Colors.surface,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Galano",
    color: Colors.text,
    lineHeight: 22,
  },
  selectedText: {
    fontFamily: "Galano-SemiBold",
    color: Colors.primary,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.borderLight,
    alignItems: "center",
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 16,
    fontFamily: "Galano-SemiBold",
    color: Colors.text,
  },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.surface,
  },
});
