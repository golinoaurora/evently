import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import Avatar from "boring-avatars";
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from "react-native";
import BASE_URL from "../config/api";

const VARIANTI = ["beam", "marble", "pixel", "sunset", "ring", "bauhaus"];

// Palette in linea con i colori della vostra app
const PALETTE_APP = ["#c9b99a", "#a08060", "#7a5c3a", "#3a2a1a", "#1a1008"];

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
        body: JSON.stringify({
          IDUtente,
          avatar_config: varianteScelta,
          bio,
        }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Salvato", "Profilo aggiornato", [
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
    <View style={styles.container}>
      <ActivityIndicator color="#c9b99a" style={{ marginTop: 40 }} />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <View style={styles.header}>
        <Text style={styles.title}>EVENTLY</Text>
        <View style={styles.titleUnderline} />
        <Text style={styles.subtitle}>MODIFICA PROFILO</Text>
      </View>

      {/* Anteprima avatar */}
      <View style={styles.anteprima}>
        <Avatar
          size={90}
          name={utente?.Nome || "utente"}
          variant={varianteScelta}
          colors={PALETTE_APP}
        />
        <Text style={styles.nomeUtente}>{utente?.Nome}</Text>
      </View>

      {/* Scelta stile */}
      <Text style={styles.label}>STILE AVATAR</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.variantiRow}>
        {VARIANTI.map(v => (
          <TouchableOpacity
            key={v}
            onPress={() => setVarianteScelta(v)}
            style={styles.varianteItem}
          >
            <View style={[
              styles.varianteBordo,
              varianteScelta === v && styles.varianteBordoAttivo
            ]}>
              <Avatar size={50} name={utente?.Nome || "utente"} variant={v} colors={PALETTE_APP} />
            </View>
            <Text style={[
              styles.varianteLabel,
              varianteScelta === v && styles.varianteLabelAttiva
            ]}>
              {v.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bio */}
      <View style={styles.linea} />
      <Text style={styles.label}>BIO <Text style={styles.contatore}>{bio.length}/200</Text></Text>
      <TextInput
        style={styles.bioInput}
        value={bio}
        onChangeText={setBio}
        placeholder="Scrivi qualcosa su di te..."
        placeholderTextColor="#444"
        multiline
        maxLength={200}
      />

      {/* Salva */}
      <TouchableOpacity
        style={[styles.salvaBtn, salvataggio && styles.salvaBtnDisabilitato]}
        onPress={handleSalva}
        disabled={salvataggio}
      >
        <Text style={styles.salvaBtnText}>
          {salvataggio ? "SALVATAGGIO..." : "SALVA"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.annullaBtn} onPress={() => router.back()}>
        <Text style={styles.annullaBtnText}>ANNULLA</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: "#0a0a0a" },
  content:             { paddingBottom: 60 },
  header:              { alignItems: "center", paddingTop: 60, paddingBottom: 20,
                         borderBottomWidth: 1, borderBottomColor: "#1a1a1a" },
  title:               { color: "#ffffff", fontSize: 24, fontWeight: "200", letterSpacing: 10 },
  titleUnderline:      { width: 30, height: 1, backgroundColor: "#c9b99a", marginTop: 8, marginBottom: 8 },
  subtitle:            { color: "#c9b99a", fontSize: 9, letterSpacing: 4 },
  anteprima:           { alignItems: "center", paddingVertical: 36 },
  nomeUtente:          { color: "#ffffff", fontSize: 18, fontWeight: "200",
                         letterSpacing: 4, marginTop: 14 },
  label:               { color: "#c9b99a", fontSize: 10, letterSpacing: 3,
                         marginHorizontal: 30, marginBottom: 14, marginTop: 24 },
  contatore:           { color: "#555", fontWeight: "400" },
  variantiRow:         { paddingLeft: 30, marginBottom: 10 },
  varianteItem:        { alignItems: "center", marginRight: 20 },
  varianteBordo:       { borderWidth: 1, borderColor: "#222", borderRadius: 4,
                         padding: 6, marginBottom: 6 },
  varianteBordoAttivo: { borderColor: "#c9b99a" },
  varianteLabel:       { color: "#444", fontSize: 8, letterSpacing: 2 },
  varianteLabelAttiva: { color: "#c9b99a" },
  linea:               { height: 1, backgroundColor: "#1a1a1a", marginHorizontal: 30, marginTop: 10 },
  bioInput:            { marginHorizontal: 30, borderWidth: 1, borderColor: "#222",
                         padding: 16, color: "#ffffff", fontSize: 14,
                         fontWeight: "200", minHeight: 100, textAlignVertical: "top" },
  salvaBtn:            { marginHorizontal: 30, marginTop: 36, borderWidth: 1,
                         borderColor: "#c9b99a", paddingVertical: 16, alignItems: "center" },
  salvaBtnDisabilitato:{ borderColor: "#444" },
  salvaBtnText:        { color: "#c9b99a", fontSize: 10, letterSpacing: 4 },
  annullaBtn:          { marginHorizontal: 30, marginTop: 14, paddingVertical: 16, alignItems: "center" },
  annullaBtnText:      { color: "#333", fontSize: 10, letterSpacing: 4 },
});