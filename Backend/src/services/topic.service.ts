import NodeCache from "node-cache";
import * as topicRepo from "../repositories/topic.repository";
import type { Topic } from "../types";

// Buat instance cache (menyimpan data selama 600 detik / 10 menit)
const cache = new NodeCache({ stdTTL: 600 });

export async function getAllTopics(): Promise<{ topics: Topic[] }> {
  // 1. Cek apakah ada di cache dengan strict typing
  const cachedTopics = cache.get<Topic[]>("all_topics");
  if (cachedTopics) return { topics: cachedTopics };

  const { data, error } = await topicRepo.findAllTopics();
  if (error) throw { code: "DB_ERROR", message: error.message };

  // 3. Simpan hasilnya di cache sebelum dikembalikan
  const topics = data || [];
  cache.set("all_topics", topics);
  return { topics };
}

export async function getTopicBySlug(slug: string): Promise<Topic> {
  const cacheKey = `topic_${slug}`;
  const cachedTopic = cache.get<Topic>(cacheKey);
  if (cachedTopic) return cachedTopic;

  const { data, error } = await topicRepo.findTopicBySlug(slug);
  if (error) throw { code: "DB_ERROR", message: error.message };
  if (!data) throw { code: "NOT_FOUND", message: "Topic not found" };

  // Simpan ke cache
  cache.set(cacheKey, data);
  return data;
}
