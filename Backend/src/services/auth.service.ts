import { env } from "../config/env";
import * as userRepo from "../repositories/user.repository";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

export async function registerUser(email: string, password: string, username?: string) {
  // Cek email exists
  const emailExists = await userRepo.checkEmailExists(email);
  if (emailExists) {
    throw { code: "EMAIL_EXISTS", message: "Email sudah terdaftar" };
  }

  // Cek username exists
  if (username) {
    const usernameExists = await userRepo.checkUsernameExists(username);
    if (usernameExists) {
      throw { code: "USERNAME_EXISTS", message: "Username sudah dipakai" };
    }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

  // Create user
  const { data, error } = await userRepo.createUser(email, passwordHash, username || null);
  if (error) {
    throw { code: "DB_ERROR", message: error.message };
  }

  return data;
}

export async function loginUser(email: string, password: string) {
  // Find user
  const user = await userRepo.findUserByEmail(email);
  if (!user) {
    throw { code: "INVALID_LOGIN", message: "Email / password salah" };
  }

  // Verify password
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw { code: "INVALID_LOGIN", message: "Email / password salah" };
  }

  // Generate token
  const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: "7d" });

  return {
    token,
    user: { id: user.id, email: user.email, username: user.username },
  };
}