import { supabase } from "../lib/supabase";

export async function findAllTopics() {
  const { data, error } = await supabase
    .from("topics")
    .select("slug,title,badge_label,content_images,sort_order")
    .order("sort_order", { ascending: true });
  return { data, error };
}

export async function findTopicBySlug(slug: string) {
  const { data, error } = await supabase
    .from("topics")
    .select("id,slug,title,badge_label,content_images,sort_order")
    .eq("slug", slug)
    .maybeSingle();
  return { data, error };
}