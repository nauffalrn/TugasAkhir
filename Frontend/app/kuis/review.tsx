import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Container } from "../components/layout/container";
import { Card } from "../components/ui/card";
import { Colors } from "../constants/config";
import { Ionicons } from "@expo/vector-icons"; // ✅ tambah

interface ReviewItem {
  question_id: string;
  prompt: string;
  options: string[];
  selected_index: number;
  correct_index: number;
  is_correct: boolean;
  explanation?: string;
}

export default function ReviewScreen() {
  const params = useLocalSearchParams();
  const review: ReviewItem[] = JSON.parse(params.review as string);
  const level = parseInt(params.level as string);

  const [showNavigator, setShowNavigator] = useState(false);
  const scrollRef = React.useRef<ScrollView>(null);
  const itemPositions = React.useRef<number[]>([]);

  function handleGoToQuestion(index: number) {
    setShowNavigator(false);
    setTimeout(() => {
      if (scrollRef.current && itemPositions.current[index] !== undefined) {
        scrollRef.current.scrollTo({
          y: itemPositions.current[index],
          animated: true,
        });
      }
    }, 100);
  }

  return (
    <Container>
      <View style={styles.header}>
        {/* ✅ Samakan style close/back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Jawaban</Text>
        <TouchableOpacity
          onPress={() => setShowNavigator(true)}
          style={styles.navigatorButton}
        >
          <Text style={styles.navigatorText}>☰</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Level {level}</Text>

        {review.map((item, index) => {
          const cardStyle = StyleSheet.flatten([
            styles.reviewCard,
            item.is_correct ? styles.correctCard : styles.wrongCard,
          ]);

          return (
            <View
              key={item.question_id}
              onLayout={(e) => {
                itemPositions.current[index] = e.nativeEvent.layout.y;
              }}
            >
              <Card style={cardStyle}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.questionNumber}>Soal {index + 1}</Text>
                  <Text
                    style={[
                      styles.resultBadge,
                      item.is_correct ? styles.correctBadge : styles.wrongBadge,
                    ]}
                  >
                    {item.is_correct ? "✓ Benar" : "✗ Salah"}
                  </Text>
                </View>

                <Text style={styles.questionText}>{item.prompt}</Text>

                <View style={styles.optionsContainer}>
                  {item.options.map((option, optIndex) => {
                    const isSelected = optIndex === item.selected_index;
                    const isCorrect = optIndex === item.correct_index;
                    const isEmptyAnswer = item.selected_index === -1;

                    return (
                      <View
                        key={optIndex}
                        style={[
                          styles.optionItem,
                          !isEmptyAnswer &&
                            isSelected &&
                            !isCorrect &&
                            styles.selectedWrongOption,
                          isCorrect && styles.correctOption,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            (isCorrect || (!isEmptyAnswer && isSelected)) &&
                              styles.highlightedText,
                          ]}
                        >
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </Text>
                        {isCorrect && <Text style={styles.correctMark}>✓</Text>}
                        {!isEmptyAnswer && isSelected && !isCorrect && (
                          <Text style={styles.wrongMark}>✗</Text>
                        )}
                      </View>
                    );
                  })}
                </View>

                {item.selected_index === -1 && (
                  <View style={styles.unansweredBox}>
                    <Text style={styles.unansweredText}>
                      ⚠️ Soal ini tidak dijawab
                    </Text>
                  </View>
                )}

                {item.explanation && (
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationTitle}>💡 Penjelasan:</Text>
                    <Text style={styles.explanationText}>
                      {item.explanation}
                    </Text>
                  </View>
                )}
              </Card>
            </View>
          );
        })}

        <View style={styles.bottomSpace} />
      </ScrollView>

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
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: Colors.success },
                  ]}
                />
                <Text style={styles.legendText}>Benar</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: Colors.danger }]}
                />
                <Text style={styles.legendText}>Salah</Text>
              </View>
            </View>

            <FlatList
              data={review}
              numColumns={5}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.navDot,
                    item.is_correct ? styles.navDotCorrect : styles.navDotWrong,
                  ]}
                  onPress={() => handleGoToQuestion(index)}
                >
                  <Text style={styles.navDotText}>{index + 1}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.navGrid}
            />
          </View>
        </View>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    padding: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.dangerLight,
    borderRadius: 12,
  },
  closeText: {
    fontSize: 14,
    fontFamily: "Galano-SemiBold",
    color: Colors.danger,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Galano-Bold",
    color: Colors.text,
  },
  navigatorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  navigatorText: {
    fontSize: 18,
    color: Colors.primary,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Galano",
    color: Colors.textSecondary,
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
  selectedWrongOption: {
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
  unansweredBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: Colors.warningLight,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  unansweredText: {
    fontSize: 13,
    fontFamily: "Galano-SemiBold",
    color: Colors.warning,
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
  bottomSpace: {
    height: 40,
  },
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
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
  },
  navDotCorrect: {
    backgroundColor: Colors.success,
  },
  navDotWrong: {
    backgroundColor: Colors.danger,
  },
  navDotText: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.surface,
  },
});
