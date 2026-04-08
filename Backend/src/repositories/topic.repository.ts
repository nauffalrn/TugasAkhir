import { supabase } from "../lib/supabase";

export async function findAllTopics() {
  return await supabase
    .from("topics")
    .select(
      `
      id,
      title,
      slug,
      sort_order,
      created_at, 
      content_images
    `,
    )
    .order("sort_order", { ascending: true });
}

export async function findTopicBySlug(slug: string) {
  return await supabase
    .from("topics")
    .select(
      `
      id,
      title,
      slug,
      sort_order,
      created_at,
      content_images
    `,
    ) // ✅ FIX: Tambahkan created_at
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
