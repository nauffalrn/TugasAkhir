import { supabase } from "../lib/supabase";

export async function findAllTopics() {
  return supabase.from("topics").select("*").order("sort_order");
}

export async function findTopicBySlug(slug: string) {
  return supabase.from("topics").select("*").eq("slug", slug).single();
}

export async function findTopicById(topicId: string) {
  return supabase.from("topics").select("*").eq("id", topicId).single();
}
