import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from "react-native";
import BASE_URL from "../config/api";

export default function ModificaProfilo() {
  const router = useRouter();
  const [utente, setUtente] = useState(null);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvataggio, setSalvataggio] = useState(false);

  useEffect(() => {
    caricaDati();
  }, []);

  async function caricaDati() {
    const IDUtente = await AsyncStorage.getItem("IDUtente");
    const res = await fetch(`${BASE_URL}/profilo.php?IDUtente=${IDUtente}`);
    const data = await res.json();
    if (data.success) {
      setUtente(data.utente);
      setBio(data.utente.bio || "");
    }
    setLoading(false);
  }

  async function handleSalva() {
    setSalvataggio(true);
    try {
      const IDUtente = await AsyncStorage.getItem("IDUtente");
      const res = await fetch(`${BASE_URL}/aggiorna_profilo.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ IDUtente, avatar_config: "beam", bio }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Salvato!", "Profilo aggiornato con successo", [
          { text: "OK", onPress: () => router.replace("/profile") }
        ]);
      } else {
        Alert.alert("Errore", data.message);
      }
    } catch {
      Alert.alert("Errore di rete");
    } finally {
      setSalvataggio(false);
    }
  }

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator color="#FF1493" size="large" />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.glowPink} />
      <View style={styles.glowBlue} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← INDIETRO</Text>
        </TouchableOpacity>
        <Text style={styles.title}>EVEN<Text style={styles.titleAccent}>TLY</Text></Text>
        <View style={styles.colorLines}>
          <View style={[styles.colorLine, { backgroundColor: "#FF1493", width: 30 }]} />
          <View style={[styles.colorLine, { backgroundColor: "#39FF6E", width: 18 }]} />
          <View style={[styles.colorLine, { backgroundColor: "#1E50FF", width: 24 }]} />
        </View>
        <Text style={styles.subtitle}>MODIFICA PROFILO</Text>
      </View>

      {/* Avatar */}
      <View style={styles.anteprima}>
        <View style={styles.avatarWrapper}>
          <LinearGradient colors={["#FF1493", "#C800FF"]} style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>{utente?.Nome?.[0]?.toUpperCase()}</Text>
          </LinearGradient>
          <View style={styles.avatarBadge}>
            <Ionicons name="pencil" size={10} color="#fff" />
          </View>
        </View>
        <Text style={styles.nomeUtente}>{utente?.Nome}</Text>
      </View>

      <View style={styles.linea} />

      {/* Bio */}
      <View style={styles.bioSection}>
        <View style={styles.bioHeader}>
          <Text style={styles.label}>BIO</Text>
          <Text style={styles.contatore}>{bio.length}/200</Text>
        </View>
        <TextInput
          style={styles.bioInput}
          value={bio}
          onChangeText={setBio}
          placeholder="Scrivi qualcosa su di te..."
          placeholderTextColor="#333"
          multiline
          maxLength={200}
        />
      </View>

      <TouchableOpacity style={styles.salvaBtn} onPress={handleSalva} disabled={salvataggio}>
        <LinearGradient
          colors={salvataggio ? ["#333", "#333"] : ["#FF1493", "#C800FF"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.salvaBtnGradient}
        >
          {salvataggio ? <ActivityIndicator color="#fff" /> : <Text style={styles.salvaBtnText}>SALVA →</Text>}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.annullaBtn} onPress={() => router.back()}>
        <Text style={styles.annullaBtnText}>ANNULLA</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  container: { flex: 1, backgroundColor: "#000" },
  content: { paddingBottom: 80 },
  glowPink: { position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,20,147,0.15)" },
  glowBlue: { position: "absolute", top: 400, left: -60, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(30,80,255,0.12)" },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: "#111" },
  backBtn: { marginBottom: 16 },
  backText: { color: "#FF1493", fontSize: 12, letterSpacing: 3, fontWeight: "600" },
  title: { color: "#fff", fontSize: 36, fontWeight: "900", letterSpacing: -1, marginBottom: 10 },
  titleAccent: { color: "#FF1493" },
  colorLines: { flexDirection: "column", gap: 4, marginBottom: 12 },
  colorLine: { height: 2, borderRadius: 1 },
  subtitle: { color: "#555", fontSize: 10, letterSpacing: 5, fontWeight: "600" },
  anteprima: { alignItems: "center", paddingVertical: 32 },
  avatarWrapper: { position: "relative", marginBottom: 14 },
  avatarFallback: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center" },
  avatarInitial: { color: "#fff", fontSize: 38, fontWeight: "900" },
  avatarBadge: { position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: "#FF1493", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#000" },
  nomeUtente: { color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  label: { color: "#555", fontSize: 10, letterSpacing: 4, marginBottom: 14, marginTop: 24, fontWeight: "600" },
  linea: { height: 1, backgroundColor: "#111", marginHorizontal: 24, marginTop: 10 },
  bioSection: { paddingHorizontal: 24 },
  bioHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 24, marginBottom: 10 },
  contatore: { color: "#555", fontSize: 11, letterSpacing: 2 },
  bioInput: { borderWidth: 1, borderColor: "#222", borderRadius: 14, padding: 16, color: "#fff", fontSize: 14, fontWeight: "300", minHeight: 100, textAlignVertical: "top" },
  salvaBtn: { marginHorizontal: 24, marginTop: 32, borderRadius: 16, overflow: "hidden", shadowColor: "#FF1493", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  salvaBtnGradient: { padding: 20, alignItems: "center" },
  salvaBtnText: { color: "#fff", fontSize: 14, fontWeight: "800", letterSpacing: 4 },
  annullaBtn: { marginHorizontal: 24, marginTop: 12, paddingVertical: 16, alignItems: "center" },
  annullaBtnText: { color: "#555", fontSize: 12, letterSpacing: 4 },
});