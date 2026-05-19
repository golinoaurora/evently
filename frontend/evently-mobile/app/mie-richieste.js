import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BASE_URL from "../config/api";

export default function MieRichieste() {
  const router = useRouter();
  const [richieste, setRichieste] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    caricaRichieste();
  }, []);

  async function caricaRichieste() {
    try {
      const IDUtente = await AsyncStorage.getItem("IDUtente");
      const response = await fetch(`${BASE_URL}/mie-richieste.php?IDUtente=${IDUtente}`);
      const data = await response.json();
      if (data.success) {
        setRichieste(data.richieste);
      } else {
        setError("Errore nel caricamento");
      }
    } catch (e) {
      setError("Errore di connessione.");
    } finally {
      setLoading(false);
    }
  }

  function getStatoConfig(stato) {
    switch(stato) {
      case "in_attesa": return { label: "IN ATTESA", color: "#555", bg: "#1a1a1a", icon: "time-outline" };
      case "approvato_admin": return { label: "APPROVATO ADMIN", color: "#C9A96E", bg: "#C9A96E20", icon: "checkmark-outline" };
      case "approvato": return { label: "APPROVATO", color: "#39FF6E", bg: "#39FF6E20", icon: "checkmark-done-outline" };
      case "rifiutato": return { label: "RIFIUTATO", color: "#FF1493", bg: "#FF149320", icon: "close-outline" };
      default: return { label: stato, color: "#555", bg: "#1a1a1a", icon: "help-outline" };
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.glowPink} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← INDIETRO</Text>
        </TouchableOpacity>
        <Text style={styles.title}>LE MIE <Text style={styles.titleAccent}>RICHIESTE</Text></Text>
        <View style={styles.colorLines}>
          <View style={[styles.colorLine, { backgroundColor: "#FF1493", width: 30 }]} />
          <View style={[styles.colorLine, { backgroundColor: "#C9A96E", width: 18 }]} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#FF1493" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : richieste.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color="#333" />
          <Text style={styles.emptyText}>Non hai ancora inviato richieste</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.lista}>
          {richieste.map((r) => {
            const stato = getStatoConfig(r.Stato);
            return (
              <View key={r.ID} style={styles.card}>
                <View style={[styles.cardAccent, { backgroundColor: stato.color }]} />
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardTitolo}>{r.Titolo}</Text>
                    <View style={[styles.statoBadge, { backgroundColor: stato.bg, borderColor: stato.color }]}>
                      <Ionicons name={stato.icon} size={10} color={stato.color} />
                      <Text style={[styles.statoTesto, { color: stato.color }]}>{stato.label}</Text>
                    </View>
                  </View>

                  <View style={styles.cardInfoRow}>
                    <Ionicons name="location-outline" size={12} color="#39FF6E" />
                    <Text style={styles.cardInfo}>{r.NomeLuogo}</Text>
                  </View>
                  <View style={styles.cardInfoRow}>
                    <Ionicons name="calendar-outline" size={12} color="#39FF6E" />
                    <Text style={styles.cardInfo}>{r.DataEvento}</Text>
                  </View>
                  <View style={styles.cardInfoRow}>
                    <Ionicons name="people-outline" size={12} color="#39FF6E" />
                    <Text style={styles.cardInfo}>{r.NumeroPartecipanti} partecipanti</Text>
                  </View>

                  {r.Messaggio ? (
                    <View style={styles.messaggioBox}>
                      <Text style={styles.cardMessaggio}>"{r.Messaggio}"</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  glowPink: { position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,20,147,0.15)" },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: "#111" },
  backBtn: { marginBottom: 16 },
  backText: { color: "#FF1493", fontSize: 12, letterSpacing: 3, fontWeight: "600" },
  title: { color: "#fff", fontSize: 36, fontWeight: "900", letterSpacing: -1, marginBottom: 12 },
  titleAccent: { color: "#FF1493" },
  colorLines: { flexDirection: "column", gap: 4 },
  colorLine: { height: 2, borderRadius: 1 },
  lista: { padding: 20, paddingBottom: 100 },
  card: {
    flexDirection: "row",
    backgroundColor: "#0a0a0a",
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1a1a1a",
    overflow: "hidden",
    shadowColor: "#FF1493",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  cardAccent: { width: 4 },
  cardBody: { flex: 1, padding: 16 },
  cardTop: { marginBottom: 12 },
  cardTitolo: { color: "#fff", fontSize: 17, fontWeight: "700", letterSpacing: -0.3, marginBottom: 10 },
  statoBadge: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", borderWidth: 1, borderRadius: 100, paddingVertical: 5, paddingHorizontal: 12 },
  statoTesto: { fontSize: 9, letterSpacing: 2, fontWeight: "700" },
  cardInfoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 7 },
  cardInfo: { color: "#777", fontSize: 13 },
  messaggioBox: { backgroundColor: "#0f0f0f", borderRadius: 10, padding: 12, marginTop: 10, borderLeftWidth: 2, borderLeftColor: "#C9A96E" },
  cardMessaggio: { color: "#666", fontSize: 12, fontStyle: "italic" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 100 },
  emptyText: { color: "#555", textAlign: "center", marginTop: 20, fontSize: 14, letterSpacing: 2 },
  errorText: { color: "#FF1493", textAlign: "center", marginTop: 40 },
});