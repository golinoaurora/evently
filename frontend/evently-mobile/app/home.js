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
  TextInput,
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
  const [luoghi, setLuoghi] = useState([]);
  const [categoriaAttiva, setCategoriaAttiva] = useState("TUTTI");
  const [ricerca, setRicerca] = useState("");
  const [filtroData, setFiltroData] = useState("tutti");
  const [filtroPrezzo, setFiltroPrezzo] = useState("tutti");
  const [filtroLuogo, setFiltroLuogo] = useState("tutti");
  const [mostraFiltri, setMostraFiltri] = useState(false);

  useFocusEffect(
    useCallback(() => {
      caricaTipo();
      caricaEventi();
    }, [])
  );

  useEffect(() => {
    applicaFiltri();
  }, [eventi, ricerca, filtroData, filtroPrezzo, filtroLuogo, categoriaAttiva]);

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
        const luoghiUnici = [...new Set(data.eventi.map(e => e.NomeLuogo))];
        setLuoghi(luoghiUnici);
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
    if (ricerca.trim() !== "") {
      filtrati = filtrati.filter(e => e.Titolo.toLowerCase().includes(ricerca.toLowerCase()));
    }
    if (categoriaAttiva !== "TUTTI") {
      filtrati = filtrati.filter(e => e.Categoria?.toUpperCase() === categoriaAttiva);
    }
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    if (filtroData === "oggi") {
      filtrati = filtrati.filter(e => new Date(e.DataEvento).toDateString() === oggi.toDateString());
    } else if (filtroData === "settimana") {
      const fine = new Date(oggi);
      fine.setDate(oggi.getDate() + 7);
      filtrati = filtrati.filter(e => { const d = new Date(e.DataEvento); return d >= oggi && d <= fine; });
    } else if (filtroData === "mese") {
      filtrati = filtrati.filter(e => { const d = new Date(e.DataEvento); return d.getMonth() === oggi.getMonth() && d.getFullYear() === oggi.getFullYear(); });
    }
    if (filtroPrezzo === "gratuito") filtrati = filtrati.filter(e => e.Prezzo == 0);
    else if (filtroPrezzo === "pagamento") filtrati = filtrati.filter(e => e.Prezzo > 0);
    if (filtroLuogo !== "tutti") filtrati = filtrati.filter(e => e.NomeLuogo === filtroLuogo);
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
        {/* Foto o gradiente */}
        {hasImage ? (
          <Image
            source={{ uri: item.ImageUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={index % 2 === 0 ? ["#FF1493", "#C800FF"] : ["#1E50FF", "#39FF6E"]}
            style={styles.cardImage}
          />
        )}

        {/* Overlay con info */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.95)"]}
          style={styles.cardOverlay}
        >
          {/* Badge top */}
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

          {/* Info bottom */}
          <View style={styles.cardInfo}>
            <View style={styles.cardDateInline}>
              <Text style={styles.cardGiorno}>{giorno}</Text>
              <Text style={styles.cardMese}>{mese}</Text>
            </View>
            <Text style={styles.cardTitolo}>{item.Titolo}</Text>
            <View style={styles.cardLuogoRow}>
              <View style={styles.cardLuogoDot} />
              <Text style={styles.cardLuogo}>{item.NomeLuogo} · {item.Citta}</Text>
            </View>
            <View style={styles.cardBottom}>
              <Text style={styles.cardOra}>🕐 {item.Ora?.slice(0, 5)}</Text>
              <Text style={styles.cardPosti}>
                <Text style={{ color: "#39FF6E" }}>
                  {Math.max(0, item.MaxPartecipanti - (item.Iscritti || 0))}
                </Text>
                {" "}posti
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

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cerca eventi..."
            placeholderTextColor="#2a2a2a"
            value={ricerca}
            onChangeText={(t) => { setRicerca(t); applicaFiltri(); }}
          />
        </View>
        <TouchableOpacity
          style={[styles.filtriBtn, mostraFiltri && styles.filtriBtnActive]}
          onPress={() => setMostraFiltri(!mostraFiltri)}
        >
          <Text style={styles.filtriBtnIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      {mostraFiltri && (
        <View style={styles.filtriPanel}>
          <Text style={styles.filtroLabel}>DATA</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtroRow}>
            {["tutti", "oggi", "settimana", "mese"].map((f) => (
              <TouchableOpacity key={f} style={[styles.chip, filtroData === f && styles.chipActive]} onPress={() => setFiltroData(f)}>
                <Text style={[styles.chipText, filtroData === f && styles.chipTextActive]}>
                  {f === "tutti" ? "TUTTI" : f === "oggi" ? "OGGI" : f === "settimana" ? "SETTIMANA" : "MESE"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.filtroLabel}>PREZZO</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtroRow}>
            {["tutti", "gratuito", "pagamento"].map((f) => (
              <TouchableOpacity key={f} style={[styles.chip, filtroPrezzo === f && styles.chipActive]} onPress={() => setFiltroPrezzo(f)}>
                <Text style={[styles.chipText, filtroPrezzo === f && styles.chipTextActive]}>
                  {f === "tutti" ? "TUTTI" : f === "gratuito" ? "GRATUITO" : "A PAGAMENTO"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.filtroLabel}>LUOGO</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtroRow}>
            <TouchableOpacity style={[styles.chip, filtroLuogo === "tutti" && styles.chipActive]} onPress={() => setFiltroLuogo("tutti")}>
              <Text style={[styles.chipText, filtroLuogo === "tutti" && styles.chipTextActive]}>TUTTI</Text>
            </TouchableOpacity>
            {luoghi.map((l) => (
              <TouchableOpacity key={l} style={[styles.chip, filtroLuogo === l && styles.chipActive]} onPress={() => setFiltroLuogo(l)}>
                <Text style={[styles.chipText, filtroLuogo === l && styles.chipTextActive]}>{l.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorieRow} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        {CATEGORIE.map((cat) => (
          <TouchableOpacity key={cat} onPress={() => setCategoriaAttiva(cat)} style={styles.categoriaItem}>
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
  glowPink: { position: "absolute", top: -60, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,20,147,0.08)" },
  glowBlue: { position: "absolute", top: 200, left: -60, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(30,80,255,0.06)" },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerSub: { color: "#333", fontSize: 12, letterSpacing: 1, marginBottom: 2 },
  headerTitle: { color: "#fff", fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  headerAccent: { color: "#FF1493" },
  notifBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: "#1a1a1a", alignItems: "center", justifyContent: "center", position: "relative" },
  notifIcon: { fontSize: 18 },
  notifDot: { position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: "#39FF6E", borderWidth: 1.5, borderColor: "#000" },
  searchRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#0a0a0a", borderWidth: 1, borderColor: "#1a1a1a", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, color: "#fff", fontSize: 13 },
  filtriBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#0a0a0a", borderWidth: 1, borderColor: "#1a1a1a", alignItems: "center", justifyContent: "center" },
  filtriBtnActive: { borderColor: "#FF1493" },
  filtriBtnIcon: { fontSize: 18, color: "#555" },
  filtriPanel: { backgroundColor: "#050505", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#111", marginBottom: 8 },
  filtroLabel: { color: "#333", fontSize: 9, letterSpacing: 3, paddingHorizontal: 20, marginBottom: 8, marginTop: 6 },
  filtroRow: { paddingHorizontal: 20, marginBottom: 4 },
  chip: { borderWidth: 1, borderColor: "#1a1a1a", borderRadius: 100, paddingVertical: 5, paddingHorizontal: 14, marginRight: 8 },
  chipActive: { borderColor: "#FF1493", backgroundColor: "rgba(255,20,147,0.1)" },
  chipText: { color: "#333", fontSize: 9, letterSpacing: 2 },
  chipTextActive: { color: "#FF1493" },
  categorieRow: { marginBottom: 16 },
  categoriaItem: { borderRadius: 100, overflow: "hidden" },
  categoriaGradient: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: 100 },
  categoriaDefault: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: 100, borderWidth: 1, borderColor: "#1a1a1a" },
  categoriaText: { color: "#333", fontSize: 10, letterSpacing: 2, fontWeight: "500" },
  categoriaTextActive: { color: "#fff", fontSize: 10, letterSpacing: 2, fontWeight: "700" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: -0.3 },
  sectionCount: { color: "#333", fontSize: 11, letterSpacing: 1 },
  lista: { paddingHorizontal: 20, paddingBottom: 100 },
  card: { borderRadius: 16, marginBottom: 16, overflow: "hidden", height: 200 },
  cardImage: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" },
  cardOverlay: { flex: 1, justifyContent: "space-between", padding: 14 },
  cardBadgeRow: { flexDirection: "row", gap: 6 },
  badgeCategoria: { backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 100, paddingVertical: 3, paddingHorizontal: 8 },
  badgeCategoriaText: { color: "#fff", fontSize: 7, letterSpacing: 1 },
  badgeFree: { backgroundColor: "#39FF6E", borderRadius: 100, paddingVertical: 3, paddingHorizontal: 10 },
  badgeFreeText: { color: "#000", fontSize: 8, fontWeight: "700", letterSpacing: 2 },
  badgePrice: { backgroundColor: "#1E50FF", borderRadius: 100, paddingVertical: 3, paddingHorizontal: 10 },
  badgePriceText: { color: "#fff", fontSize: 8, fontWeight: "700", letterSpacing: 1 },
  cardInfo: { gap: 4 },
  cardDateInline: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  cardGiorno: { color: "#fff", fontSize: 22, fontWeight: "900", lineHeight: 24 },
  cardMese: { color: "#FF1493", fontSize: 10, letterSpacing: 2, fontWeight: "700" },
  cardTitolo: { color: "#fff", fontSize: 18, fontWeight: "700", letterSpacing: -0.3 },
  cardLuogoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardLuogoDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#39FF6E" },
  cardLuogo: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardOra: { color: "rgba(255,255,255,0.5)", fontSize: 11 },
  cardPosti: { color: "rgba(255,255,255,0.5)", fontSize: 11 },
  errorText: { color: "#FF1493", textAlign: "center", marginTop: 40 },
  emptyText: { color: "#333", textAlign: "center", marginTop: 60, fontSize: 13, letterSpacing: 2 },
});