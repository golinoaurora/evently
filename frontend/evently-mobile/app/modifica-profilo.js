import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import Avatar from "boring-avatars";
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from "react-native";
import BASE_URL from "../config/api";

const VARIANTI = ["beam", "marble", "pixel", "sunset", "ring", "bauhaus"];
const PALETTE_APP = ["#FF1493", "#C800FF", "#1E50FF", "#39FF6E", "#C9A96E"];

export default function ModificaProfilo() {
  const router = useRouter();
  const [utente, setUtente] = useState(null);
  const [varianteScelta, setVarianteScelta] = useState("beam");
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
      setVarianteScelta(data.utente.avatar_config || "beam");
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
        body: JSON.stringify({ IDUtente, avatar_config: varianteScelta, bio }),
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

      {/* Header */}
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

      {/* Anteprima avatar */}
      <View style={styles.anteprima}>
        <View style={styles.avatarWrapper}>
          <Avatar
            size={90}
            name={utente?.Nome || "utente"}
            variant={varianteScelta}
            colors={PALETTE_APP}
          />
          <View style={styles.avatarBadge}>
            <Ionicons name="pencil" size={10} color="#fff" />
          </View>
        </View>
        <Text style={styles.nomeUtente}>{utente?.Nome}</Text>
      </View>

      {/* Scelta stile */}
      <Text style={styles.label}>STILE AVATAR</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.variantiRow} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
        {VARIANTI.map(v => (
          <TouchableOpacity key={v} onPress={() => setVarianteScelta(v)} style={styles.varianteItem}>
            <View style={[styles.varianteBordo, varianteScelta === v && styles.varianteBordoAttivo]}>
              {varianteScelta === v && (
                <LinearGradient colors={["#FF1493", "#C800FF"]} style={styles.varianteGlow} />
              )}
              <Avatar size={50} name={utente?.Nome || "utente"} variant={v} colors={PALETTE_APP} />
            </View>
            <Text style={[styles.varianteLabel, varianteScelta === v && styles.varianteLabelAttiva]}>
              {v.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bio */}
      <View style={styles.linea} />

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

      {/* Bottoni */}
      <TouchableOpacity
        style={styles.salvaBtn}
        onPress={handleSalva}
        disabled={salvataggio}
      >
        <LinearGradient
          colors={salvataggio ? ["#333", "#333"] : ["#FF1493", "#C800FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.salvaBtnGradient}
        >
          {salvataggio ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.salvaBtnText}>SALVA →</Text>
          )}
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
  glowPink: { position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,20,147,0.08)" },
  glowBlue: { position: "absolute", top: 400, left: -60, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(30,80,255,0.06)" },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: "#0f0f0f" },
  backBtn: { marginBottom: 16 },
  backText: { color: "#FF1493", fontSize: 10, letterSpacing: 3 },
  title: { color: "#fff", fontSize: 32, fontWeight: "900", letterSpacing: -1, marginBottom: 10 },
  titleAccent: { color: "#FF1493" },
  colorLines: { flexDirection: "column", gap: 3, marginBottom: 12 },
  colorLine: { height: 2, borderRadius: 1 },
  subtitle: { color: "#333", fontSize: 9, letterSpacing: 5 },
  anteprima: { alignItems: "center", paddingVertical: 32 },
  avatarWrapper: { position: "relative", marginBottom: 14 },
  avatarBadge: { position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: "#FF1493", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#000" },
  nomeUtente: { color: "#fff", fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  label: { color: "#333", fontSize: 9, letterSpacing: 4, marginHorizontal: 24, marginBottom: 14, marginTop: 24 },
  variantiRow: { marginBottom: 10 },
  varianteItem: { alignItems: "center" },
  varianteBordo: { borderWidth: 1, borderColor: "#1a1a1a", borderRadius: 12, padding: 8, marginBottom: 6, position: "relative", overflow: "hidden" },
  varianteBordoAttivo: { borderColor: "#FF1493" },
  varianteGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 2 },
  varianteLabel: { color: "#333", fontSize: 8, letterSpacing: 2 },
  varianteLabelAttiva: { color: "#FF1493" },
  linea: { height: 1, backgroundColor: "#0f0f0f", marginHorizontal: 24, marginTop: 10 },
  bioSection: { paddingHorizontal: 24 },
  bioHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 24, marginBottom: 10 },
  contatore: { color: "#333", fontSize: 10, letterSpacing: 2 },
  bioInput: { borderWidth: 1, borderColor: "#1a1a1a", borderRadius: 12, padding: 16, color: "#fff", fontSize: 14, fontWeight: "300", minHeight: 100, textAlignVertical: "top" },
  salvaBtn: { marginHorizontal: 24, marginTop: 32, borderRadius: 14, overflow: "hidden" },
  salvaBtnGradient: { padding: 18, alignItems: "center" },
  salvaBtnText: { color: "#fff", fontSize: 13, fontWeight: "700", letterSpacing: 4 },
  annullaBtn: { marginHorizontal: 24, marginTop: 12, paddingVertical: 16, alignItems: "center" },
  annullaBtnText: { color: "#333", fontSize: 11, letterSpacing: 4 },
});