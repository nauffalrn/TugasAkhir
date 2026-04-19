import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Image,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import ImageViewer from "react-native-image-zoom-viewer";
import { Container } from "../../_components/layout/container";
import { Colors } from "../../_constants/config";
import { api } from "../../_lib/api";

interface Question {
  id: string;
  prompt: string;
  options: string[];
  hint?: string;
  assets?: Record<string, string>;
}

const QuestionImage = ({
  url,
  onZoom,
}: {
  url?: string;
  onZoom: (url: string) => void;
}) => {
  if (!url) return null;
  const cacheBustedUrl = `${url}?cb=${new Date().getTime()}`;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onZoom(cacheBustedUrl)}
    >
      <Image
        source={{ uri: cacheBustedUrl }}
        style={styles.assetImage}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

export default function AttemptScreen() {
  const params = useLocalSearchParams();

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
  const [showNavigator, setShowNavigator] = useState(false);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnswered = selectedAnswers[currentQuestion?.id] !== undefined;

  useEffect(() => {
    if (timeLimit > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            doSubmit();
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

  function handleGoToQuestion(index: number) {
    setCurrentIndex(index);
    setShowHint(false);
    setShowNavigator(false);
  }

  function handleExit() {
    Alert.alert(
      "Keluar Kuis",
      "Yakin ingin keluar? Progress kuis tidak akan disimpan.",
      [
        { text: "Lanjut Mengerjakan", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: () => {
            if (timerRef.current) clearInterval(timerRef.current);
            router.back();
          },
        },
      ],
    );
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
        selected_index:
          selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
      }));

      const res = await api.post("/quiz/submit", {
        attempt_id: attemptId,
        topic_id: topicId,
        topic_slug: topicSlug,
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
        {/* ✅ Tombol Keluar */}
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.levelText}>Level {level}</Text>
          <Text style={styles.progressText}>
            {currentIndex + 1}/{questions.length}
          </Text>
        </View>

        <View style={styles.headerRight}>
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
          {/* ✅ Tombol Navigator */}
          <TouchableOpacity
            onPress={() => setShowNavigator(true)}
            style={styles.navigatorButton}
          >
            <Text style={styles.navigatorButtonText}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentIndex + 1) / questions.length) * 100}%` },
          ]}
        />
      </View>

      <FlatList
        data={[{ key: "quiz-content" }]}
        keyExtractor={(item) => item.key}
        renderItem={() => (
          <View style={styles.contentContainer}>
            {/* Question */}
            <View style={styles.questionCard}>
              <Text style={styles.questionNumber}>Soal {currentIndex + 1}</Text>

              <QuestionImage
                url={currentQuestion.assets?.prompt}
                onZoom={setZoomedImageUrl}
              />
              <Text style={styles.questionText}>{currentQuestion.prompt}</Text>

              {/* Hint - hanya level 1 dan 2 */}
              {currentQuestion.hint && (level === 1 || level === 2) && (
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
                const isSelected =
                  selectedAnswers[currentQuestion.id] === index;
                const imageUrl = currentQuestion.assets?.[`option_${index}`];
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
                    <View style={styles.optionContent}>
                      <QuestionImage
                        url={imageUrl}
                        onZoom={setZoomedImageUrl}
                      />
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.selectedText,
                        ]}
                      >
                        {option}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      />

      {/* Navigation */}
      <View style={styles.navigation}>
        {/* ✅ Prev dengan warna */}
        <TouchableOpacity
          style={[
            styles.prevButton,
            currentIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
        >
          <Text style={styles.prevButtonText}>← Prev</Text>
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
          // ✅ Next dengan warna
          <TouchableOpacity
            style={[
              styles.nextButton,
              !hasAnswered && styles.nextButtonUnanswered,
            ]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ✅ Navigator Modal */}
      <Modal
        visible={showNavigator}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNavigator(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Navigasi Soal</Text>
              <TouchableOpacity onPress={() => setShowNavigator(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendAnswered]} />
                <Text style={styles.legendText}>Sudah dijawab</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendUnanswered]} />
                <Text style={styles.legendText}>Belum dijawab</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendCurrent]} />
                <Text style={styles.legendText}>Soal saat ini</Text>
              </View>
            </View>

            <FlatList
              data={questions}
              numColumns={5}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item, index }) => {
                const isAnswered = selectedAnswers[item.id] !== undefined;
                const isCurrent = index === currentIndex;
                return (
                  <TouchableOpacity
                    style={[
                      styles.navDot,
                      isAnswered && styles.navDotAnswered,
                      isCurrent && styles.navDotCurrent,
                    ]}
                    onPress={() => handleGoToQuestion(index)}
                  >
                    <Text
                      style={[
                        styles.navDotText,
                        (isAnswered || isCurrent) && styles.navDotTextActive,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.navGrid}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!zoomedImageUrl}
        transparent={true}
        onRequestClose={() => setZoomedImageUrl(null)}
      >
        {zoomedImageUrl && (
          <ImageViewer
            imageUrls={[{ url: zoomedImageUrl }]}
            enableSwipeDown={true}
            onCancel={() => setZoomedImageUrl(null)}
            saveToLocalByLongPress={false}
            renderHeader={() => (
              <TouchableOpacity
                style={styles.imageModalClose}
                onPress={() => setZoomedImageUrl(null)}
              >
                <Text style={styles.imageModalCloseText}>✕</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </Modal>
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  exitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dangerLight,
    justifyContent: "center",
    alignItems: "center",
  },
  exitText: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.danger,
  },
  headerCenter: {
    alignItems: "center",
    gap: 2,
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timerBox: {
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerBoxDanger: {
    backgroundColor: Colors.dangerLight,
  },
  timerText: {
    fontSize: 14,
    fontFamily: "Galano-Bold",
    color: Colors.info,
  },
  timerTextDanger: {
    color: Colors.danger,
  },
  navigatorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  navigatorButtonText: {
    fontSize: 18,
    color: Colors.primary,
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
    marginBottom: 8,
  },
  assetImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalClose: {
    position: "absolute",
    top: 40,
    right: 24,
    zIndex: 10,
    padding: 12,
  },
  imageModalCloseText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  imageModalFull: {
    width: "100%",
    height: "80%",
  },
  hintButton: {
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 16,
  },
  hintButtonText: {
    fontSize: 14,
    fontFamily: "Galano-SemiBold",
    color: Colors.info,
  },
  hintBox: {
    marginTop: 12,
    backgroundColor: Colors.warningLight,
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
  optionContent: {
    flex: 1,
  },
  optionText: {
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
  prevButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.border,
    alignItems: "center",
  },
  prevButtonText: {
    fontSize: 16,
    fontFamily: "Galano-SemiBold",
    color: Colors.text,
  },
  nextButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  nextButtonUnanswered: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: "Galano-SemiBold",
    color: Colors.surface,
  },
  navButtonDisabled: {
    opacity: 0.4,
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
  // ✅ Modal Navigator
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Galano-Bold",
    color: Colors.text,
  },
  modalClose: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendAnswered: {
    backgroundColor: Colors.success,
  },
  legendUnanswered: {
    backgroundColor: Colors.borderLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legendCurrent: {
    backgroundColor: Colors.primary,
  },
  legendText: {
    fontSize: 13,
    fontFamily: "Galano",
    color: Colors.textSecondary,
  },
  navGrid: {
    gap: 10,
  },
  navDot: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navDotAnswered: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  navDotCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  navDotText: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.textSecondary,
  },
  navDotTextActive: {
    color: Colors.surface,
  },
});
