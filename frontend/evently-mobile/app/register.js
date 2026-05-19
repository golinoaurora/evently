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

const { height } = Dimensions.get("window");
const API_URL = `${BASE_URL}/register.php`;

export default function Register() {
  const router = useRouter();

  const [mostraPassword, setMostraPassword] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tipo, setTipo] = useState("privato");
  const [ragioneSociale, setRagioneSociale] = useState("");
  const [partitaIVA, setPartitaIVA] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    if (!nome || !email || !password) {
      setError("Compila tutti i campi");
      return;
    }
    if (tipo === "locale" && (!ragioneSociale || !partitaIVA)) {
      setError("Inserisci ragione sociale e partita IVA");
      return;
    }
    if (tipo === "locale" && partitaIVA.length !== 11) {
      setError("La partita IVA deve essere di 11 cifre");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Inserisci un'email valida");
      return;
    }
    const erroriPassword = [];
    if (password.length < 8) erroriPassword.push("almeno 8 caratteri");
    if (!/[A-Z]/.test(password)) erroriPassword.push("una lettera maiuscola");
    if (!/[0-9]/.test(password)) erroriPassword.push("un numero");
    if (!/[!@#$%^&*]/.test(password)) erroriPassword.push("un carattere speciale (!@#$%^&*)");
    if (erroriPassword.length > 0) {
      setError("La password deve contenere: " + erroriPassword.join(", "));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Nome: nome,
          Email: email,
          PasswordUtente: password,
          tipo: tipo,
          RagioneSociale: ragioneSociale,
          PartitaIVA: partitaIVA,
        }),
      });
      const data = await response.json();
      if (data.success) {
        router.replace("/login");
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

        {/* Glow sfondo */}
        <View style={styles.glowPink} />
        <View style={styles.glowBlue} />
        <View style={styles.glowGreen} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>CREA ACCOUNT</Text>
          </View>
          <Text style={styles.title}>EVEN<Text style={styles.titleAccent}>TLY</Text></Text>
          <Text style={styles.tagline}>YOUR NIGHT STARTS HERE</Text>
          <View style={styles.colorLines}>
            <View style={[styles.colorLine, { backgroundColor: "#FF1493", width: 40 }]} />
            <View style={[styles.colorLine, { backgroundColor: "#39FF6E", width: 24 }]} />
            <View style={[styles.colorLine, { backgroundColor: "#1E50FF", width: 32 }]} />
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Registrati</Text>

          {/* Nome */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NOME</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="il tuo nome"
                placeholderTextColor="#2a2a2a"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
              />
              <View style={styles.inputAccent} />
            </View>
          </View>

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

          {/* Tipo account */}
          <Text style={styles.label}>TIPO ACCOUNT</Text>
          <View style={styles.tipoContainer}>
            <TouchableOpacity
              style={[styles.tipoButton, tipo === "privato" && styles.tipoSelected]}
              onPress={() => setTipo("privato")}
            >
              {tipo === "privato" ? (
                <LinearGradient
                  colors={["#FF1493", "#C800FF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tipoGradient}
                >
                  <Text style={styles.tipoTextSelected}>PRIVATO</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.tipoText}>PRIVATO</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tipoButton, tipo === "locale" && styles.tipoSelected]}
              onPress={() => setTipo("locale")}
            >
              {tipo === "locale" ? (
                <LinearGradient
                  colors={["#FF1493", "#C800FF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tipoGradient}
                >
                  <Text style={styles.tipoTextSelected}>LOCALE</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.tipoText}>LOCALE</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Campi locale */}
          {tipo === "locale" && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>RAGIONE SOCIALE</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="es. Luluma S.r.l."
                    placeholderTextColor="#2a2a2a"
                    value={ragioneSociale}
                    onChangeText={setRagioneSociale}
                    autoCapitalize="words"
                  />
                  <View style={[styles.inputAccent, { backgroundColor: "#39FF6E" }]} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>PARTITA IVA</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="11 cifre"
                    placeholderTextColor="#2a2a2a"
                    value={partitaIVA}
                    onChangeText={setPartitaIVA}
                    keyboardType="numeric"
                    maxLength={11}
                  />
                  <View style={[styles.inputAccent, { backgroundColor: "#39FF6E" }]} />
                </View>
              </View>
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Bottone principale */}
          <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister} disabled={loading}>
            <LinearGradient
              colors={["#FF1493", "#C800FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>REGISTRATI →</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Link login */}
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.link}>
              Hai già un account?{" "}
              <Text style={styles.linkBold}>Accedi</Text>
            </Text>
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
  header: { marginBottom: 40 },
  badge: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16, borderWidth: 1, borderColor: "#FF149340", borderRadius: 100, alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 14, backgroundColor: "#FF149310" },
  badgeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#FF1493" },
  badgeText: { color: "#FF1493", fontSize: 10, letterSpacing: 4, fontWeight: "600" },
  title: { fontSize: 56, fontWeight: "900", color: "#fff", letterSpacing: -3, lineHeight: 62 },
  titleAccent: { color: "#FF1493" },
  tagline: { color: "#333", fontSize: 11, letterSpacing: 5, marginTop: 10, marginBottom: 18 },
  colorLines: { flexDirection: "column", gap: 5 },
  colorLine: { height: 2, borderRadius: 1 },
  form: { marginBottom: 32 },
  formTitle: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 28, letterSpacing: -1 },
  inputGroup: { marginBottom: 24 },
  label: { color: "#555", fontSize: 10, letterSpacing: 4, marginBottom: 10, marginTop: 8, fontWeight: "600" },
  inputWrapper: { borderBottomWidth: 1, borderBottomColor: "#222" },
  passwordRow: { flexDirection: "row", alignItems: "center" },
  input: { color: "#fff", fontSize: 16, fontWeight: "300", paddingVertical: 12 },
  inputAccent: { height: 2, width: 36, backgroundColor: "#FF1493", marginTop: -1 },
  mostraBtn: { color: "#FF1493", fontSize: 10, letterSpacing: 2, fontWeight: "600" },
  tipoContainer: { flexDirection: "row", gap: 12, marginTop: 8, marginBottom: 8 },
  tipoButton: { flex: 1, borderWidth: 1, borderColor: "#222", borderRadius: 12, overflow: "hidden", alignItems: "center" },
  tipoSelected: { borderColor: "#FF1493", shadowColor: "#FF1493", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  tipoGradient: { width: "100%", paddingVertical: 14, alignItems: "center" },
  tipoText: { color: "#444", fontSize: 11, letterSpacing: 3, paddingVertical: 14, fontWeight: "600" },
  tipoTextSelected: { color: "#fff", fontSize: 11, letterSpacing: 3, fontWeight: "800" },
  error: { color: "#FF1493", fontSize: 13, textAlign: "center", marginBottom: 16, letterSpacing: 1, marginTop: 8 },
  btnPrimary: { borderRadius: 16, overflow: "hidden", marginTop: 24, marginBottom: 20, shadowColor: "#FF1493", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  btnGradient: { padding: 20, alignItems: "center" },
  btnPrimaryText: { color: "#fff", fontSize: 12, fontWeight: "800", letterSpacing: 5 },
  link: { color: "#555", textAlign: "center", fontSize: 14 },
  linkBold: { color: "#FF1493", fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  footerText: { color: "#222", fontSize: 10, letterSpacing: 3 },
  footerDots: { flexDirection: "row", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});