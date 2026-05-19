import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BASE_URL from "../config/api";

const { width, height } = Dimensions.get("window");

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostraPassword, setMostraPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email || !password) {
      setError("Inserisci email e password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${BASE_URL}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: email, PasswordUtente: password }),
      });
      const data = await response.json();
      if (data.success) {
        await AsyncStorage.setItem("IDUtente", String(data.IDUtente));
        await AsyncStorage.setItem("tipo", data.tipo);
        await AsyncStorage.setItem("IDPrivato", String(data.IDPrivato ?? ""));
        if (data.tipo === "admin") router.replace("/admin");
        else if (data.tipo === "locale") {
          const r = await fetch(`${BASE_URL}/controlla-luogo.php?IDUtente=${data.IDUtente}`);
          const d = await r.json();
          router.replace(d.haLuogo ? "/locale" : "/crea-luogo");
        } else router.replace("/home");
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError("Errore di connessione. Controlla il server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Sfondo con glow colorati */}
        <View style={styles.glowPink} />
        <View style={styles.glowBlue} />
        <View style={styles.glowGreen} />

        {/* Header con badge */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>REGGIO EMILIA</Text>
          </View>

          <Text style={styles.title}>EVEN<Text style={styles.titleAccent}>TLY</Text></Text>
          <Text style={styles.tagline}>YOUR NIGHT STARTS HERE</Text>

          {/* Linee decorative colorate */}
          <View style={styles.colorLines}>
            <View style={[styles.colorLine, { backgroundColor: "#FF1493", width: 40 }]} />
            <View style={[styles.colorLine, { backgroundColor: "#39FF6E", width: 24 }]} />
            <View style={[styles.colorLine, { backgroundColor: "#1E50FF", width: 32 }]} />
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Accedi</Text>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="la tua email"
                placeholderTextColor="#2a2a2a"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={styles.inputAccent} />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="la tua password"
                  placeholderTextColor="#2a2a2a"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!mostraPassword}
                />
                <TouchableOpacity onPress={() => setMostraPassword(!mostraPassword)}>
                  <Text style={styles.mostraBtn}>{mostraPassword ? "NASCONDI" : "MOSTRA"}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputAccent} />
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Bottone principale */}
          <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin} disabled={loading}>
            <LinearGradient
              colors={["#FF1493", "#C800FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>ACCEDI →</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OPPURE</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Bottone secondario */}
          <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push("/register")}>
            <Text style={styles.btnSecondaryText}>CREA ACCOUNT</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>EVENTLY © 2026</Text>
          <View style={styles.footerDots}>
            <View style={[styles.dot, { backgroundColor: "#FF1493" }]} />
            <View style={[styles.dot, { backgroundColor: "#39FF6E" }]} />
            <View style={[styles.dot, { backgroundColor: "#1E50FF" }]} />
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#000", padding: 28, justifyContent: "center", minHeight: height },
  glowPink: { position: "absolute", top: -100, right: -80, width: 300, height: 300, borderRadius: 150, backgroundColor: "rgba(255,20,147,0.18)" },
  glowBlue: { position: "absolute", bottom: 100, left: -80, width: 240, height: 240, borderRadius: 120, backgroundColor: "rgba(30,80,255,0.14)" },
  glowGreen: { position: "absolute", top: "40%", right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(57,255,110,0.08)" },
  header: { marginBottom: 48 },
  badge: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16, borderWidth: 1, borderColor: "#39FF6E40", borderRadius: 100, alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 14, backgroundColor: "#39FF6E10" },
  badgeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#39FF6E" },
  badgeText: { color: "#39FF6E", fontSize: 10, letterSpacing: 4, fontWeight: "600" },
  title: { fontSize: 56, fontWeight: "900", color: "#fff", letterSpacing: -3, lineHeight: 58 },
  titleAccent: { color: "#FF1493" },
  tagline: { color: "#333", fontSize: 11, letterSpacing: 5, marginTop: 10, marginBottom: 18 },
  colorLines: { flexDirection: "column", gap: 5 },
  colorLine: { height: 2, borderRadius: 1 },
  form: { marginBottom: 32 },
  formTitle: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 36, letterSpacing: -1 },  inputGroup: { marginBottom: 32 },
  label: { color: "#555", fontSize: 10, letterSpacing: 4, marginBottom: 12, fontWeight: "600" },
  inputWrapper: { borderBottomWidth: 1, borderBottomColor: "#222" },
  passwordRow: { flexDirection: "row", alignItems: "center" },
  input: { color: "#fff", fontSize: 16, fontWeight: "300", paddingVertical: 12 },
  inputAccent: { height: 2, width: 36, backgroundColor: "#FF1493", marginTop: -1 },
  mostraBtn: { color: "#FF1493", fontSize: 10, letterSpacing: 2, fontWeight: "600" },
  error: { color: "#FF1493", fontSize: 13, textAlign: "center", marginBottom: 16, letterSpacing: 1 },
  btnPrimary: { borderRadius: 16, overflow: "hidden", marginTop: 8, marginBottom: 16, shadowColor: "#FF1493", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  btnGradient: { padding: 20, alignItems: "center" },
  btnPrimaryText: { color: "#fff", fontSize: 12, fontWeight: "800", letterSpacing: 5 },
  divider: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#1a1a1a" },
  dividerText: { color: "#333", fontSize: 10, letterSpacing: 3 },
  btnSecondary: { borderWidth: 1, borderColor: "#333", borderRadius: 16, padding: 20, alignItems: "center" },
  btnSecondaryText: { color: "#aaa", fontSize: 12, fontWeight: "600", letterSpacing: 4 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerText: { color: "#222", fontSize: 10, letterSpacing: 3 },
  footerDots: { flexDirection: "row", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});