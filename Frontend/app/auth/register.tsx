import React, { useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { Container } from "../components/layout/container";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Colors } from "../constants/config";

export default function Register() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
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
    } else if (password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }

  async function handleRegister() {
    setErrors({ email: "", password: "", general: "" });

    if (!validate()) return;

    setLoading(true);
    try {
      await register(email, password, username || undefined);
      router.replace("/tabs/materi");
    } catch (err: any) {
      const errorMsg =
        err.message || "Gagal mendaftar. Periksa koneksi internet.";
      setErrors({ ...errors, general: errorMsg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
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

          <Text style={styles.title}>Daftar Akun</Text>
          <Text style={styles.subtitle}>
            Buat akun untuk mulai belajar matematika
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
                placeholder="Username (opsional)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View>
              <Input
                placeholder="Password (min 6 karakter)"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors({ ...errors, password: "" });
                }}
                secureTextEntry
              />
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            <Button title="Daftar" onPress={handleRegister} loading={loading} />

            <Text style={styles.link} onPress={() => router.back()}>
              Sudah punya akun? <Text style={styles.linkBold}>Login</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
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
