import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../_hooks/useAuth";
import { Container } from "../_components/layout/container";
import { Input } from "../_components/ui/input";
import { Button } from "../_components/ui/button";
import { Colors } from "../_constants/config";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  function validate() {
    const newErrors = { email: "", password: "", general: "" };
    let isValid = true;

    if (!email) {
      newErrors.email = "Email wajib diisi";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Format email tidak valid";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password wajib diisi";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }

  async function handleLogin() {
    setErrors({ email: "", password: "", general: "" });

    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      const errorData = err.response?.data?.error;
      if (errorData && errorData.code === "INVALID_LOGIN") {
        setErrors({ ...errors, general: "Email atau password salah." });
      } else {
        setErrors({
          ...errors,
          general: "Gagal login. Periksa koneksi internet Anda.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Ilustrasi Karakter */}
            <Image
              source={require("../../assets/images/Auth Karakter.png")}
              style={styles.illustration}
              resizeMode="contain"
            />

            <Text style={styles.title}>Selamat Datang!</Text>
            <Text style={styles.subtitle}>
              Sudah siap menaklukkan tantangan angka hari ini? Yuk, masuk!
            </Text>

            {errors.general ? (
              <Text style={styles.errorGeneral}>{errors.general}</Text>
            ) : null}

            <View style={styles.formContainer}>
              <View>
                <Input
                  placeholder="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors({ ...errors, email: "" });
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>

              <View>
                <Input
                  placeholder="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors({ ...errors, password: "" });
                  }}
                  secureTextEntry={!isPasswordVisible}
                  iconRight={
                    <TouchableOpacity
                      onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                      <Ionicons
                        name={isPasswordVisible ? "eye-off" : "eye"}
                        size={24}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>
                  }
                />
                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>

              <Button title="Login" onPress={handleLogin} loading={loading} />

              <Text
                style={styles.link}
                onPress={() => router.push("/(auth)/register")}
              >
                Belum punya akun? <Text style={styles.linkBold}>Daftar</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  illustration: {
    width: "100%",
    height: 200,
    marginBottom: 24,
    alignSelf: "center",
  },
  title: {
    fontSize: 32,
    fontFamily: "Galano-Bold",
    marginBottom: 8,
    color: Colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Galano",
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  formContainer: {
    gap: 16,
  },
  link: {
    textAlign: "center",
    color: Colors.textSecondary,
    marginTop: 16,
    fontFamily: "Galano",
    fontSize: 14,
  },
  linkBold: {
    color: Colors.primary,
    fontFamily: "Galano-Bold",
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: "Galano",
  },
  errorGeneral: {
    color: Colors.danger,
    fontSize: 14,
    textAlign: "center",
    padding: 12,
    backgroundColor: Colors.danger + "20",
    borderRadius: 8,
    marginBottom: 16,
    fontFamily: "Galano-Medium",
  },
});
