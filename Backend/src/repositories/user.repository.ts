import { supabase } from "../lib/supabase";

export async function findUserById(userId: string) {
  const { data, error } = await supabase
    .from("app_users")
    .select("id, email, username, created_at")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

export async function findUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("email", email)
    .single();

  if (error) return null;
  return data;
}

export async function createUser(
  email: string,
  hashedPassword: string,
  username?: string,
) {
  const { data, error } = await supabase
    .from("app_users")
    .insert({
      email,
      password_hash: hashedPassword,
      username,
    })
    .select()
    .single();

  return { data, error };
}

export async function getUserStats(
  userId: string,
): Promise<{ total_attempts: number; badges_earned: number }> {
  // Count total quiz attempts
  const { count: attemptCount } = await supabase
    .from("quiz_attempts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("submitted_at", "is", null);

  // Count badges earned
  const { count: badgeCount } = await supabase
    .from("user_badges")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  return {
    total_attempts: attemptCount || 0,
    badges_earned: badgeCount || 0,
  };
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const { data } = await supabase
    .from("app_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  return !!data;
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  const { data } = await supabase
    .from("app_users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  return !!data;
}
