import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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

export default function CreaLuogo() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [via, setVia] = useState("");
  const [numeroCivico, setNumeroCivico] = useState("");
  const [citta, setCitta] = useState("");
  const [cap, setCap] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");

  async function handleCreaLuogo() {
    if (!nome || !via || !numeroCivico || !citta || !cap || !descrizione) {
      setErrore("Compila tutti i campi");
      return;
    }
    setLoading(true);
    setErrore("");
    try {
      const IDUtente = await AsyncStorage.getItem("IDUtente");
      const response = await fetch(`${BASE_URL}/crea-luogo.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Nome: nome, Via: via, NumeroCivico: numeroCivico,
          Citta: citta, CAP: cap, Descrizione: descrizione, IDUtente,
        }),
      });
      const data = await response.json();
      if (data.success) {
        router.replace("/locale");
      } else {
        setErrore(data.message);
      }
    } catch (e) {
      setErrore("Errore di connessione.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.glowPink} />
        <View style={styles.glowBlue} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>EVEN<Text style={styles.titleAccent}>TLY</Text></Text>
          <View style={styles.colorLines}>
            <View style={[styles.colorLine, { backgroundColor: "#FF1493", width: 30 }]} />
            <View style={[styles.colorLine, { backgroundColor: "#39FF6E", width: 18 }]} />
            <View style={[styles.colorLine, { backgroundColor: "#1E50FF", width: 24 }]} />
          </View>
          <Text style={styles.subtitle}>CONFIGURA IL TUO LOCALE</Text>
          <Text style={styles.descrizioneText}>
            Prima di creare eventi, inserisci i dati del tuo locale.
          </Text>
        </View>

        {/* Campi */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>NOME LOCALE</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} placeholder="es. Luluma Club" placeholderTextColor="#333" value={nome} onChangeText={setNome} />
            <View style={styles.inputAccent} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>VIA/PIAZZA</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} placeholder="es. Via Roma" placeholderTextColor="#333" value={via} onChangeText={setVia} />
            <View style={styles.inputAccent} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>NUMERO CIVICO</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} placeholder="es. 15/A" placeholderTextColor="#333" value={numeroCivico} onChangeText={setNumeroCivico} />
            <View style={styles.inputAccent} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>CITTÀ</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} placeholder="es. Reggio Emilia" placeholderTextColor="#333" value={citta} onChangeText={setCitta} />
            <View style={styles.inputAccent} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>CAP</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} placeholder="es. 42121" placeholderTextColor="#333" value={cap} onChangeText={setCap} keyboardType="numeric" />
            <View style={styles.inputAccent} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>DESCRIZIONE</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Descrivi il tuo locale..."
            placeholderTextColor="#333"
            value={descrizione}
            onChangeText={setDescrizione}
            multiline
            numberOfLines={4}
          />
        </View>

        {errore ? <Text style={styles.error}>{errore}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleCreaLuogo} disabled={loading}>
          <LinearGradient
            colors={["#FF1493", "#C800FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>SALVA E CONTINUA →</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  content: { padding: 28, paddingBottom: 60 },
  glowPink: { position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,20,147,0.08)" },
  glowBlue: { position: "absolute", bottom: 100, left: -60, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(30,80,255,0.06)" },
  header: { alignItems: "flex-start", paddingTop: 60, paddingBottom: 32 },
  title: { color: "#fff", fontSize: 40, fontWeight: "900", letterSpacing: -1, marginBottom: 10 },
  titleAccent: { color: "#FF1493" },
  colorLines: { flexDirection: "column", gap: 3, marginBottom: 20 },
  colorLine: { height: 2, borderRadius: 1 },
  subtitle: { color: "#333", fontSize: 9, letterSpacing: 5, marginBottom: 10 },
  descrizioneText: { color: "#444", fontSize: 13, lineHeight: 20 },
  inputGroup: { marginBottom: 20 },
  label: { color: "#333", fontSize: 9, letterSpacing: 4, marginBottom: 8 },
  inputWrapper: { borderBottomWidth: 1, borderBottomColor: "#1a1a1a" },
  input: { color: "#fff", fontSize: 15, fontWeight: "300", paddingVertical: 10 },
  inputAccent: { height: 1, width: 30, backgroundColor: "#FF1493", marginTop: -1 },
  inputMultiline: { borderWidth: 1, borderColor: "#1a1a1a", borderRadius: 8, padding: 12, height: 100, textAlignVertical: "top", marginTop: 8 },
  error: { color: "#FF1493", fontSize: 12, textAlign: "center", marginTop: 16 },
  button: { borderRadius: 14, overflow: "hidden", marginTop: 36 },
  buttonGradient: { padding: 18, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 13, fontWeight: "700", letterSpacing: 4 },
});