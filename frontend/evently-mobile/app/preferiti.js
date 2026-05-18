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
import BottomBar from "../components/BottomBar";

export default function Preferiti() {
  const router = useRouter();
  const [preferiti, setPreferiti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    caricaPreferiti();
  }, []);

  async function caricaPreferiti() {
    try {
      const IDUtente = await AsyncStorage.getItem("IDUtente");
      const response = await fetch(`${BASE_URL}/miei-preferiti.php?IDUtente=${IDUtente}`);
      const data = await response.json();
      if (data.success) {
        setPreferiti(data.preferiti);
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
          <Text style={styles.cardDescrizione} numberOfLines={2}>{item.Descrizione}</Text>
        </View>
        <Ionicons name="heart" size={16} color="#FF1493" style={{ marginRight: 12 }} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.glowPink} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← INDIETRO</Text>
        </TouchableOpacity>
        <Text style={styles.title}>I MIEI <Text style={styles.titleAccent}>PREFERITI</Text></Text>
        <View style={styles.colorLines}>
          <View style={[styles.colorLine, { backgroundColor: "#FF1493", width: 30 }]} />
          <View style={[styles.colorLine, { backgroundColor: "#39FF6E", width: 18 }]} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#FF1493" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : preferiti.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={48} color="#333" />
          <Text style={styles.emptyText}>Nessun evento nei preferiti</Text>
        </View>
      ) : (
        <FlatList
          data={preferiti}
          keyExtractor={(item) => String(item.ID)}
          renderItem={renderEvento}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomBar paginaAttiva="preferiti" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  glowPink: { position: "absolute", top: -60, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,20,147,0.08)" },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: "#0f0f0f" },
  backBtn: { marginBottom: 16 },
  backText: { color: "#FF1493", fontSize: 10, letterSpacing: 3 },
  title: { color: "#fff", fontSize: 24, fontWeight: "900", letterSpacing: -0.5, marginBottom: 10 },
  titleAccent: { color: "#FF1493" },
  colorLines: { flexDirection: "column", gap: 3 },
  colorLine: { height: 2, borderRadius: 1 },
  lista: { padding: 20, paddingBottom: 100 },
  card: { flexDirection: "row", backgroundColor: "#0a0a0a", borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: "#111", overflow: "hidden", alignItems: "center" },
  cardAccent: { width: 3, alignSelf: "stretch" },
  cardContent: { flex: 1, padding: 14 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  cardDateBox: { alignItems: "center" },
  cardGiorno: { color: "#fff", fontSize: 20, fontWeight: "700", lineHeight: 22 },
  cardMese: { color: "#FF1493", fontSize: 9, letterSpacing: 2, fontWeight: "600" },
  badgeFree: { backgroundColor: "#39FF6E", borderRadius: 100, paddingVertical: 3, paddingHorizontal: 10 },
  badgeFreeText: { color: "#000", fontSize: 8, fontWeight: "700", letterSpacing: 2 },
  badgePrice: { backgroundColor: "#1E50FF", borderRadius: 100, paddingVertical: 3, paddingHorizontal: 10 },
  badgePriceText: { color: "#fff", fontSize: 8, fontWeight: "700", letterSpacing: 1 },
  cardTitolo: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: -0.3, marginBottom: 6 },
  cardLuogoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  cardLuogoDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#39FF6E" },
  cardLuogo: { color: "#333", fontSize: 11 },
  cardDescrizione: { color: "#444", fontSize: 11, lineHeight: 16 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyText: { color: "#333", textAlign: "center", marginTop: 16, fontSize: 13, letterSpacing: 2 },
  errorText: { color: "#FF1493", textAlign: "center", marginTop: 40 },
});