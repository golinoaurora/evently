import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomBar from "../components/BottomBar";
import BASE_URL from "../config/api";

export default function Admin() {
  const [richieste, setRichieste] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    caricaRichieste();
  }, []);

  async function caricaRichieste() {
    try {
      const response = await fetch(`${BASE_URL}/richieste-admin.php`);
      const data = await response.json();
      if (data.success) {
        setRichieste(data.richieste);
      } else {
        setError("Errore nel caricamento richieste");
      }
    } catch (e) {
      setError("Errore di connessione.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDecisione(IDRichiesta, stato) {
    try {
      const response = await fetch(`${BASE_URL}/gestisci-richiesta-admin.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ IDRichiesta, Stato: stato }),
      });
      const data = await response.json();
      if (data.success) caricaRichieste();
    } catch (e) {
      setError("Errore di connessione.");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.glowPink} />
      <View style={styles.glowBlue} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>EVEN<Text style={styles.headerAccent}>TLY</Text></Text>
            <View style={styles.colorLines}>
              <View style={[styles.colorLine, { backgroundColor: "#FF1493", width: 30 }]} />
              <View style={[styles.colorLine, { backgroundColor: "#39FF6E", width: 18 }]} />
              <View style={[styles.colorLine, { backgroundColor: "#1E50FF", width: 24 }]} />
            </View>
          </View>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#FF1493" />
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        </View>
        <Text style={styles.headerSub}>Richieste in attesa di approvazione</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#FF1493" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : richieste.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle-outline" size={48} color="#333" />
          <Text style={styles.emptyText}>Nessuna richiesta in attesa</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.lista}>
          {richieste.map((r) => (
            <View key={r.ID} style={styles.card}>
              <LinearGradient
                colors={["#FF1493", "#C800FF"]}
                style={styles.cardAccent}
              />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitolo}>{r.Titolo}</Text>

                <View style={styles.cardInfoRow}>
                  <Ionicons name="person-outline" size={12} color="#39FF6E" />
                  <Text style={styles.cardInfo}>{r.NomeUtente}</Text>
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

                <View style={styles.bttns}>
                  <TouchableOpacity
                    style={styles.btnApprova}
                    onPress={() => handleDecisione(r.ID, "approvato_admin")}
                  >
                    <LinearGradient
                      colors={["#39FF6E", "#00C853"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.btnGradient}
                    >
                      <Ionicons name="checkmark" size={14} color="#000" />
                      <Text style={styles.btnApprovaText}>APPROVA</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnRifiuta}
                    onPress={() => handleDecisione(r.ID, "rifiutato")}
                  >
                    <Ionicons name="close" size={14} color="#FF1493" />
                    <Text style={styles.btnRifiutaText}>RIFIUTA</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <BottomBar paginaAttiva="admin" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  glowPink: { position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,20,147,0.15)" },
  glowBlue: { position: "absolute", top: 300, left: -60, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(30,80,255,0.12)" },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: "#111" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  headerTitle: { color: "#fff", fontSize: 36, fontWeight: "900", letterSpacing: -1, marginBottom: 8 },
  headerAccent: { color: "#FF1493" },
  colorLines: { flexDirection: "column", gap: 4 },
  colorLine: { height: 2, borderRadius: 1 },
  adminBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: "#FF1493", borderRadius: 100, paddingVertical: 6, paddingHorizontal: 14, backgroundColor: "#FF149310" },
  adminBadgeText: { color: "#FF1493", fontSize: 10, letterSpacing: 3, fontWeight: "600" },
  headerSub: { color: "#555", fontSize: 12, letterSpacing: 1 },
  lista: { padding: 20, paddingBottom: 100 },
  card: {
    flexDirection: "row",
    backgroundColor: "#0a0a0a",
    borderRadius: 18,
    marginBottom: 16,
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
  cardTitolo: { color: "#fff", fontSize: 17, fontWeight: "700", letterSpacing: -0.3, marginBottom: 12 },
  cardInfoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 7 },
  cardInfo: { color: "#777", fontSize: 13 },
  messaggioBox: { backgroundColor: "#0f0f0f", borderRadius: 10, padding: 12, marginTop: 10, borderLeftWidth: 2, borderLeftColor: "#FF1493" },
  cardMessaggio: { color: "#666", fontSize: 12, fontStyle: "italic" },
  bttns: { flexDirection: "row", gap: 10, marginTop: 16 },
  btnApprova: { flex: 1, borderRadius: 12, overflow: "hidden" },
  btnGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 14 },
  btnApprovaText: { color: "#000", fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  btnRifiuta: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1, borderColor: "#FF1493", borderRadius: 12, paddingVertical: 14 },
  btnRifiutaText: { color: "#FF1493", fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 100 },
  emptyText: { color: "#555", textAlign: "center", marginTop: 20, fontSize: 14, letterSpacing: 2 },
  errorText: { color: "#FF1493", textAlign: "center", marginTop: 40 },
});