import * as topicRepo from "../repositories/topic.repository";

export async function getAllTopics() {
  const { data, error } = await topicRepo.findAllTopics();
  if (error) {
    throw { code: "DB_ERROR", message: error.message };
  }
  return data || [];
}

export async function getTopicBySlug(slug: string) {
  const { data, error } = await topicRepo.findTopicBySlug(slug);
  if (error) {
    throw { code: "DB_ERROR", message: error.message };
  }
  if (!data) {
    throw { code: "NOT_FOUND", message: "Topic tidak ditemukan" };
  }
  return data;
}