import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  Modal,
  Dimensions,
  FlatList,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import ImageViewer from "react-native-image-zoom-viewer";
import { api } from "../../_lib/api";
import { Button } from "../../_components/ui/button";
import { Loading } from "../../_components/ui/loading";
import { Colors } from "../../_constants/config";
import type { Topic } from "../../_types";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get("window");

export default function MateriDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setImageIndex(viewableItems[0].index);
    }
  }).current;

  useEffect(() => {
    if (slug) {
      loadTopic();
    }
  }, [slug]);

  async function loadTopic() {
    try {
      const res = await api.get(`/topics/${slug}`);
      setTopic(res.data.data);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleStartQuiz() {
    if (!topic) return;
    router.push({
      pathname: "/(app)/kuis/select-level",
      params: {
        topicSlug: topic.slug,
        topicTitle: topic.title,
      },
    });
  }

  const renderCarouselItem = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        style={styles.carouselItem}
        activeOpacity={0.9}
        onPress={() => {
          setImageIndex(index);
          setIsViewerVisible(true);
        }}
      >
        <Image
          source={{ uri: item.url }}
          style={styles.carouselImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  };

  if (loading) return <Loading />;
  if (!topic) return <Text>Topic tidak ditemukan</Text>;

  const imagesForViewer =
    topic.content_images?.map((url) => ({
      url: url,
    })) || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{topic?.title}</Text>
      </View>

      <View style={styles.content}>
        {imagesForViewer.length > 0 ? (
          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={imagesForViewer}
              renderItem={renderCarouselItem}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={{
                itemVisiblePercentThreshold: 50,
              }}
            />
            <View style={styles.paginationContainer}>
              {imagesForViewer.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    {
                      backgroundColor:
                        index === imageIndex ? Colors.primary : Colors.border,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholder}>Materi belum tersedia.</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button title="Kerjakan Kuis" onPress={handleStartQuiz} />
        </View>
      </View>

      <Modal
        visible={isViewerVisible}
        transparent={true}
        onRequestClose={() => setIsViewerVisible(false)}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <ImageViewer
            imageUrls={imagesForViewer}
            index={imageIndex}
            onCancel={() => setIsViewerVisible(false)}
            enableSwipeDown={true}
            saveToLocalByLongPress={false}
            renderIndicator={() => <View />}
            renderHeader={() => (
              <TouchableOpacity
                style={styles.closeButtonAbsolute}
                activeOpacity={0.7}
                onPress={() => setIsViewerVisible(false)}
              >
                <Ionicons name="close" size={32} color="white" />
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: "space-between",
  },
  carouselContainer: {
    flex: 1,
    justifyContent: "center",
  },
  carouselItem: {
    width: screenWidth,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  closeButtonAbsolute: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 9999,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 25,
  },
});
