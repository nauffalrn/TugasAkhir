import { supabase } from "../lib/supabase";

export async function findUserByEmail(email: string) {
  const { data } = await supabase
    .from("app_users")
    .select("id,email,username,password_hash")
    .eq("email", email)
    .maybeSingle();
  return data;
}

export async function findUserById(userId: string) {
  const { data, error } = await supabase
    .from("app_users")
    .select("id, email, username, created_at")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

export async function checkEmailExists(email: string) {
  const { data } = await supabase
    .from("app_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  return !!data;
}

export async function checkUsernameExists(username: string) {
  const { data } = await supabase
    .from("app_users")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  return !!data;
}

export async function createUser(
  email: string,
  passwordHash: string,
  username: string | null,
) {
  const { data, error } = await supabase
    .from("app_users")
    .insert({ email, password_hash: passwordHash, username })
    .select("id,email,username,created_at")
    .single();
  return { data, error };
}
