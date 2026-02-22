import { supabase } from "../lib/supabase";

export async function findAllTopics() {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .order("sort_order");
  return { data, error };
}

export async function findTopicBySlug(slug: string) {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("slug", slug)
    .single();
  return { data, error };
}
