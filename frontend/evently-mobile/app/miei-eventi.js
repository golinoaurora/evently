import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BASE_URL from "../config/api";

export default function MieiEventi() {
  const router = useRouter();
  const [eventi, setEventi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    caricaEventi();
  }, []);

  async function caricaEventi() {
    try {
      const IDUtente = await AsyncStorage.getItem("IDUtente");
      const response = await fetch(`${BASE_URL}/miei-eventi.php?IDUtente=${IDUtente}`);
      const data = await response.json();
      if (data.success) {
        setEventi(data.eventi);
      } else {
        setError("Errore nel caricamento");
      }
    } catch (e) {
      setError("Errore di connessione.");
    } finally {
      setLoading(false);
    }
  }

  function renderEvento({ item, index }) {
    const data = new Date(item.DataEvento);
    const giorno = data.toLocaleDateString("it-IT", { day: "2-digit" });
    const mese = data.toLocaleDateString("it-IT", { month: "short" }).toUpperCase();
    const isGratuito = item.Prezzo == 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/event-detail?id=${item.ID}`)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={index % 2 === 0 ? ["#FF1493", "#C800FF"] : ["#1E50FF", "#39FF6E"]}
          style={styles.cardAccent}
        />
        <View style={styles.cardContent}>
          <View style={styles.cardTop}>
            <View style={styles.cardDateBox}>
              <Text style={styles.cardGiorno}>{giorno}</Text>
              <Text style={styles.cardMese}>{mese}</Text>
            </View>
            {isGratuito ? (
              <View style={styles.badgeFree}>
                <Text style={styles.badgeFreeText}>FREE</Text>
              </View>
            ) : (
              <View style={styles.badgePrice}>
                <Text style={styles.badgePriceText}>€{item.Prezzo}</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardTitolo}>{item.Titolo}</Text>
          <View style={styles.cardLuogoRow}>
            <View style={styles.cardLuogoDot} />
            <Text style={styles.cardLuogo}>{item.NomeLuogo} · {item.Citta}</Text>
          </View>
          <View style={styles.cardBottom}>
            <Text style={styles.cardOra}>🕐 {item.Ora?.slice(0, 5)}</Text>
            <Text style={styles.cardDescrizione} numberOfLines={1}>{item.Descrizione}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#333" style={{ marginRight: 12 }} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.glowGreen} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← INDIETRO</Text>
        </TouchableOpacity>
        <Text style={styles.title}>I MIEI <Text style={styles.titleAccent}>EVENTI</Text></Text>
        <View style={styles.colorLines}>
          <View style={[styles.colorLine, { backgroundColor: "#39FF6E", width: 30 }]} />
          <View style={[styles.colorLine, { backgroundColor: "#1E50FF", width: 18 }]} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#FF1493" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : eventi.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color="#333" />
          <Text style={styles.emptyText}>Non hai ancora creato eventi</Text>
        </View>
      ) : (
        <FlatList
          data={eventi}
          keyExtractor={(item) => String(item.ID)}
          renderItem={renderEvento}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  glowGreen: { position: "absolute", top: -60, left: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(57,255,110,0.12)" },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: "#111" },
  backBtn: { marginBottom: 16 },
  backText: { color: "#FF1493", fontSize: 12, letterSpacing: 3, fontWeight: "600" },
  title: { color: "#fff", fontSize: 36, fontWeight: "900", letterSpacing: -1, marginBottom: 12 },
  titleAccent: { color: "#39FF6E" },
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
    alignItems: "center",
    shadowColor: "#39FF6E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardAccent: { width: 4, alignSelf: "stretch" },
  cardContent: { flex: 1, padding: 16 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  cardDateBox: { alignItems: "center" },
  cardGiorno: { color: "#fff", fontSize: 24, fontWeight: "900", lineHeight: 26 },
  cardMese: { color: "#39FF6E", fontSize: 10, letterSpacing: 2, fontWeight: "700" },
  badgeFree: { backgroundColor: "#39FF6E", borderRadius: 100, paddingVertical: 5, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  badgeFreeText: { color: "#000", fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  badgePrice: { backgroundColor: "#FF1493", borderRadius: 100, paddingVertical: 5, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  badgePriceText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  cardTitolo: { color: "#fff", fontSize: 17, fontWeight: "700", letterSpacing: -0.3, marginBottom: 8 },
  cardLuogoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  cardLuogoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#39FF6E" },
  cardLuogo: { color: "#777", fontSize: 12 },
  cardBottom: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardOra: { color: "#555", fontSize: 11 },
  cardDescrizione: { color: "#444", fontSize: 11, flex: 1 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 100 },
  emptyText: { color: "#555", textAlign: "center", marginTop: 20, fontSize: 14, letterSpacing: 2 },
  errorText: { color: "#FF1493", textAlign: "center", marginTop: 40 },
});