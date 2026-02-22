import * as topicRepo from "../repositories/topic.repository";
import type { Topic } from "../types";

export async function getAllTopics(): Promise<{ topics: Topic[] }> {
  const { data, error } = await topicRepo.findAllTopics();
  if (error) throw { code: "DB_ERROR", message: error.message };
  return { topics: data || [] };
}

export async function getTopicBySlug(slug: string): Promise<Topic> {
  const { data, error } = await topicRepo.findTopicBySlug(slug);
  if (error) throw { code: "DB_ERROR", message: error.message };
  if (!data) throw { code: "NOT_FOUND", message: "Topic not found" };
  return data;
}
