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
import BottomBar from "../components/BottomBar";

export default function Notifiche() {
  const router = useRouter();
  const [notifiche, setNotifiche] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    caricaNotifiche();
  }, []);

  async function caricaNotifiche() {
    try {
      const IDUtente = await AsyncStorage.getItem("IDUtente");
      const response = await fetch(`${BASE_URL}/notifiche.php?IDUtente=${IDUtente}`);
      const data = await response.json();
      if (data.success) {
        setNotifiche(data.notifiche);
      } else {
        setError("Errore nel caricamento");
      }
    } catch (e) {
      setError("Errore di connessione.");
    } finally {
      setLoading(false);
    }
  }

  function getIconaConfig(tipo) {
    switch(tipo) {
      case "richiesta_accettata": return { name: "checkmark-circle", color: "#39FF6E" };
      case "richiesta_rifiutata": return { name: "close-circle", color: "#FF1493" };
      case "nuovo_evento": return { name: "star", color: "#C9A96E" };
      default: return { name: "notifications", color: "#1E50FF" };
    }
  }

  function formatData(dataStr) {
    const d = new Date(dataStr);
    return d.toLocaleDateString("it-IT", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.glowPink} />
      <View style={styles.glowBlue} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← INDIETRO</Text>
        </TouchableOpacity>
        <Text style={styles.title}>NOTIFI<Text style={styles.titleAccent}>CHE</Text></Text>
        <View style={styles.colorLines}>
          <View style={[styles.colorLine, { backgroundColor: "#FF1493", width: 40 }]} />
          <View style={[styles.colorLine, { backgroundColor: "#39FF6E", width: 24 }]} />
          <View style={[styles.colorLine, { backgroundColor: "#1E50FF", width: 32 }]} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#FF1493" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : notifiche.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-outline" size={56} color="#333" />
          <Text style={styles.emptyText}>Nessuna notifica</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.lista}>
          {notifiche.map((n) => {
            const icona = getIconaConfig(n.tipo);
            return (
              <View key={n.ID} style={[styles.card, n.letta == 0 && styles.cardNonLetta]}>
                <View style={[styles.iconaBox, { backgroundColor: icona.color + "25" }]}>
                  <Ionicons name={icona.name} size={26} color={icona.color} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardMessaggio}>{n.messaggio}</Text>
                  <Text style={styles.cardData}>{formatData(n.DataCreazione)}</Text>
                </View>
                {n.letta == 0 && <View style={styles.puntino} />}
              </View>
            );
          })}
        </ScrollView>
      )}

      <BottomBar paginaAttiva="notifiche" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  glowPink: { position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,20,147,0.15)" },
  glowBlue: { position: "absolute", bottom: 100, left: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(30,80,255,0.12)" },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: "#111" },
  backBtn: { marginBottom: 12 },
  backText: { color: "#FF1493", fontSize: 12, letterSpacing: 3, fontWeight: "600" },
  title: { color: "#fff", fontSize: 36, fontWeight: "900", letterSpacing: -1, marginBottom: 10 },
  titleAccent: { color: "#FF1493" },
  colorLines: { flexDirection: "column", gap: 3 },
  colorLine: { height: 2, borderRadius: 1 },
  lista: { padding: 16, paddingBottom: 100 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1a1a1a",
    gap: 12,
  },
  cardNonLetta: {
    borderColor: "#FF149350",
    shadowColor: "#FF1493",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  iconaBox: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardContent: { flex: 1 },
  cardMessaggio: { color: "#fff", fontSize: 13, fontWeight: "400", marginBottom: 4, lineHeight: 19 },
  cardData: { color: "#555", fontSize: 11, letterSpacing: 0.5 },
  puntino: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF1493" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 100 },
  emptyText: { color: "#555", textAlign: "center", marginTop: 16, fontSize: 14, letterSpacing: 2 },
  errorText: { color: "#FF1493", textAlign: "center", marginTop: 40 },
});