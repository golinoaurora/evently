import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BASE_URL from "../config/api";
import BottomBar from "../components/BottomBar";

const API_URL = `${BASE_URL}/eventi.php`;
const CATEGORIE = ["TUTTI", "MUSICA", "ARTE", "SPORT", "FOOD", "PARTY"];

export default function Home() {
  const router = useRouter();
  const [eventi, setEventi] = useState([]);
  const [eventiFiltrati, setEventiFiltrati] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tipo, setTipo] = useState("");
  const [categoriaAttiva, setCategoriaAttiva] = useState("TUTTI");

  useFocusEffect(
    useCallback(() => {
      caricaTipo();
      caricaEventi();
    }, [])
  );

  useEffect(() => {
    applicaFiltri();
  }, [eventi, categoriaAttiva]);

  async function caricaTipo() {
    const t = await AsyncStorage.getItem("tipo");
    setTipo(t);
  }

  async function caricaEventi() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data.success) {
        setEventi(data.eventi);
      } else {
        setError("Errore nel caricamento eventi");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function applicaFiltri() {
    let filtrati = [...eventi];
    if (categoriaAttiva !== "TUTTI") {
      filtrati = filtrati.filter(e => e.Categoria?.toUpperCase() === categoriaAttiva);
    }
    setEventiFiltrati(filtrati);
  }

  function renderEvento({ item, index }) {
    const data = new Date(item.DataEvento);
    const giorno = data.toLocaleDateString("it-IT", { day: "2-digit" });
    const mese = data.toLocaleDateString("it-IT", { month: "short" }).toUpperCase();
    const isGratuito = item.Prezzo == 0;
    const hasImage = item.ImageUrl && item.ImageUrl.trim() !== "";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/event-detail?id=${item.ID}`)}
        activeOpacity={0.85}
      >
        {hasImage ? (
          <Image source={{ uri: item.ImageUrl }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={index % 2 === 0 ? ["#FF1493", "#C800FF"] : ["#1E50FF", "#C800FF"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.cardImage}
          />
        )}
        <LinearGradient
          colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.85)"]}
          style={styles.cardOverlay}
        >
          <View style={styles.cardBadgeRow}>
            {item.Categoria && (
              <View style={styles.badgeCategoria}>
                <Text style={styles.badgeCategoriaText}>{item.Categoria}</Text>
              </View>
            )}
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
          <View style={styles.cardInfo}>
            <View style={styles.cardDateInline}>
              <Text style={styles.cardGiorno}>{giorno}</Text>
              <Text style={styles.cardMese}> {mese}</Text>
            </View>
            <Text style={styles.cardTitolo} numberOfLines={1}>{item.Titolo}</Text>
            <View style={styles.cardLuogoRow}>
              <View style={styles.cardLuogoDot} />
              <Text style={styles.cardLuogo} numberOfLines={1}>{item.NomeLuogo} · {item.Citta}</Text>
            </View>
            <View style={styles.cardBottom}>
              <Text style={styles.cardOra}>🕐 {item.Ora?.slice(0, 5)}</Text>
              <Text style={styles.cardPosti}>
                <Text style={{ color: "#39FF6E", fontWeight: "700" }}>
                  {Math.max(0, item.MaxPartecipanti - (item.Iscritti || 0))}
                </Text>{" "}posti
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.glowPink} />
      <View style={styles.glowBlue} />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerSub}>Scopri cosa accade</Text>
            <Text style={styles.headerTitle}>EVEN<Text style={styles.headerAccent}>TLY</Text></Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => router.push("/notifiche")}>
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categorieWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categorieContent}>
          {CATEGORIE.map((cat) => (
            <TouchableOpacity key={cat} onPress={() => setCategoriaAttiva(cat)} style={{ borderRadius: 100, overflow: "hidden" }}>
              {categoriaAttiva === cat ? (
                <LinearGradient colors={["#FF1493", "#C800FF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.categoriaGradient}>
                  <Text style={styles.categoriaTextActive}>{cat}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.categoriaDefault}>
                  <Text style={styles.categoriaText}>{cat}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Eventi in programma</Text>
        <Text style={styles.sectionCount}>{eventiFiltrati.length} eventi</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#FF1493" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : eventiFiltrati.length === 0 ? (
        <Text style={styles.emptyText}>Nessun evento trovato</Text>
      ) : (
        <FlatList
          data={eventiFiltrati}
          keyExtractor={(item) => String(item.ID)}
          renderItem={renderEvento}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomBar paginaAttiva="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  glowPink: { position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,20,147,0.15)" },
  glowBlue: { position: "absolute", top: 200, left: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(30,80,255,0.12)" },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerSub: { color: "#777", fontSize: 13, letterSpacing: 1, marginBottom: 2 },
  headerTitle: { color: "#fff", fontSize: 40, fontWeight: "900", letterSpacing: -2 },
  headerAccent: { color: "#FF1493" },
  notifBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: "#FF149340", alignItems: "center", justifyContent: "center", position: "relative", backgroundColor: "#0a0a0a" },
  notifIcon: { fontSize: 20 },
  notifDot: { position: "absolute", top: 6, right: 6, width: 10, height: 10, borderRadius: 5, backgroundColor: "#39FF6E", borderWidth: 2, borderColor: "#000" },
  categorieWrapper: { paddingVertical: 6, marginBottom: 16 },
  categorieContent: { paddingHorizontal: 20, gap: 8, alignItems: "center" },
  categoriaGradient: { paddingVertical: 9, paddingHorizontal: 20, borderRadius: 100 },
  categoriaDefault: { paddingVertical: 9, paddingHorizontal: 20, borderRadius: 100, borderWidth: 1, borderColor: "#333" },
  categoriaText: { color: "#666", fontSize: 11, letterSpacing: 2, fontWeight: "600" },
  categoriaTextActive: { color: "#fff", fontSize: 11, letterSpacing: 2, fontWeight: "800" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  sectionCount: { color: "#FF1493", fontSize: 12, letterSpacing: 1, fontWeight: "600" },
  lista: { paddingHorizontal: 20, paddingBottom: 100 },
  card: { borderRadius: 20, marginBottom: 20, overflow: "hidden", height: 220, borderWidth: 1, borderColor: "#FF149330", shadowColor: "#FF1493", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  cardImage: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" },
  cardOverlay: { flex: 1, justifyContent: "space-between", padding: 16 },
  cardBadgeRow: { flexDirection: "row", gap: 6 },
  badgeCategoria: { borderRadius: 100, paddingVertical: 7, paddingHorizontal: 14, borderWidth: 1, borderColor: "#333", backgroundColor: "#1a1a1a", alignItems: "center", justifyContent: "center" },
  badgeCategoriaText: { color: "#aaa", fontSize: 10, letterSpacing: 2, fontWeight: "600" },
  badgeFree: { backgroundColor: "#39FF6E", borderRadius: 100, paddingVertical: 7, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" },
  badgeFreeText: { color: "#000", fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  badgePrice: { backgroundColor: "#FF1493", borderRadius: 100, paddingVertical: 7, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", shadowColor: "#FF1493", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 8 },
  badgePriceText: { color: "#fff", fontSize: 13, fontWeight: "900", letterSpacing: 1 },
  cardInfo: { gap: 5 },
  cardDateInline: { flexDirection: "row", alignItems: "baseline" },
  cardGiorno: { color: "#fff", fontSize: 28, fontWeight: "900", lineHeight: 30 },
  cardMese: { color: "#FF1493", fontSize: 13, letterSpacing: 2, fontWeight: "800" },
  cardTitolo: { color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  cardLuogoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardLuogoDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#39FF6E" },
  cardLuogo: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "500" },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardOra: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "500" },
  cardPosti: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "500" },
  errorText: { color: "#FF1493", textAlign: "center", marginTop: 40 },
  emptyText: { color: "#666", textAlign: "center", marginTop: 60, fontSize: 14, letterSpacing: 2 },
});