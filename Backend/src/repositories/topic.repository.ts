import { supabase } from "../lib/supabase";

export async function findAllTopics() {
  return supabase
    .from("topics")
    .select("id, title, slug, sort_order")
    .order("sort_order", { ascending: true });
}

export async function findTopicBySlug(slug: string) {
  return supabase
    .from("topics")
    .select("id, title, slug, sort_order, content_images")
    .eq("slug", slug)
    .single();
}

export async function findTopicById(topicId: string) {
  return supabase
    .from("topics")
    .select("id, title, slug, sort_order")
    .eq("id", topicId)
    .single();
}
