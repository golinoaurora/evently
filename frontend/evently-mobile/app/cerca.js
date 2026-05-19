import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import BASE_URL from "../config/api";
import BottomBar from "../components/BottomBar";

export default function Cerca() {
  const router = useRouter();
  const [tutti, setTutti] = useState([]);
  const [risultati, setRisultati] = useState([]);
  const [luoghi, setLuoghi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cercato, setCercato] = useState(false);
  const [ricerca, setRicerca] = useState("");
  const [filtroData, setFiltroData] = useState("tutti");
  const [filtroPrezzo, setFiltroPrezzo] = useState("tutti");
  const [filtroLuogo, setFiltroLuogo] = useState("tutti");
  const [mostraFiltri, setMostraFiltri] = useState(false);

  useEffect(() => {
    caricaEventi();
  }, []);

  async function caricaEventi() {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/eventi.php`);
      const data = await response.json();
      if (data.success) {
        setTutti(data.eventi);
        const luoghiUnici = [...new Set(data.eventi.map(e => e.NomeLuogo))];
        setLuoghi(luoghiUnici);
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  }

  function applicaFiltri(testo, fData, fPrezzo, fLuogo) {
    let filtrati = [...tutti];

    if (testo.trim().length >= 2) {
      filtrati = filtrati.filter(e =>
        e.Titolo.toLowerCase().includes(testo.toLowerCase()) ||
        e.NomeLuogo?.toLowerCase().includes(testo.toLowerCase()) ||
        e.Citta?.toLowerCase().includes(testo.toLowerCase()) ||
        e.Categoria?.toLowerCase().includes(testo.toLowerCase())
      );
    }

    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    if (fData === "oggi") {
      filtrati = filtrati.filter(e => new Date(e.DataEvento).toDateString() === oggi.toDateString());
    } else if (fData === "settimana") {
      const fine = new Date(oggi);
      fine.setDate(oggi.getDate() + 7);
      filtrati = filtrati.filter(e => { const d = new Date(e.DataEvento); return d >= oggi && d <= fine; });
    } else if (fData === "mese") {
      filtrati = filtrati.filter(e => { const d = new Date(e.DataEvento); return d.getMonth() === oggi.getMonth() && d.getFullYear() === oggi.getFullYear(); });
    }

    if (fPrezzo === "gratuito") filtrati = filtrati.filter(e => e.Prezzo == 0);
    else if (fPrezzo === "pagamento") filtrati = filtrati.filter(e => e.Prezzo > 0);
    if (fLuogo !== "tutti") filtrati = filtrati.filter(e => e.NomeLuogo === fLuogo);

    setRisultati(filtrati);
    setCercato(true);
  }

  function handleCerca(testo) {
    setRicerca(testo);
    applicaFiltri(testo, filtroData, filtroPrezzo, filtroLuogo);
  }

  function handleFiltroData(f) {
    setFiltroData(f);
    applicaFiltri(ricerca, f, filtroPrezzo, filtroLuogo);
  }

  function handleFiltroPrezzo(f) {
    setFiltroPrezzo(f);
    applicaFiltri(ricerca, filtroData, f, filtroLuogo);
  }

  function handleFiltroLuogo(f) {
    setFiltroLuogo(f);
    applicaFiltri(ricerca, filtroData, filtroPrezzo, f);
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
            <View style={styles.cardTopRight}>
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
          </View>
          <Text style={styles.cardTitolo}>{item.Titolo}</Text>
          <View style={styles.cardLuogoRow}>
            <View style={styles.cardLuogoDot} />
            <Text style={styles.cardLuogo}>{item.NomeLuogo} · {item.Citta}</Text>
          </View>
          <Text style={styles.cardOra}>🕐 {item.Ora?.slice(0, 5)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.glowPink} />
      <View style={styles.glowBlue} />

      <View style={styles.header}>
        <Text style={styles.title}>CER<Text style={styles.titleAccent}>CA</Text></Text>
        <View style={styles.colorLines}>
          <View style={[styles.colorLine, { backgroundColor: "#FF1493", width: 40 }]} />
          <View style={[styles.colorLine, { backgroundColor: "#39FF6E", width: 24 }]} />
          <View style={[styles.colorLine, { backgroundColor: "#1E50FF", width: 32 }]} />
        </View>
      </View>

      {/* Barra ricerca + filtri */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#FF1493" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cerca eventi, luoghi, categorie..."
            placeholderTextColor="#444"
            value={ricerca}
            onChangeText={handleCerca}
          />
          {ricerca.length > 0 && (
            <TouchableOpacity onPress={() => { setRicerca(""); applicaFiltri("", filtroData, filtroPrezzo, filtroLuogo); }}>
              <Ionicons name="close-circle" size={18} color="#333" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filtriBtn, mostraFiltri && styles.filtriBtnActive]}
          onPress={() => setMostraFiltri(!mostraFiltri)}
        >
          <Ionicons name="options-outline" size={20} color={mostraFiltri ? "#FF1493" : "#666"} />
        </TouchableOpacity>
      </View>

      {/* Pannello filtri */}
      {mostraFiltri && (
        <View style={styles.filtriPanel}>
          <Text style={styles.filtroLabel}>DATA</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtroRow}>
            {["tutti", "oggi", "settimana", "mese"].map((f) => (
              <TouchableOpacity key={f} style={[styles.chip, filtroData === f && styles.chipActive]} onPress={() => handleFiltroData(f)}>
                <Text style={[styles.chipText, filtroData === f && styles.chipTextActive]}>
                  {f === "tutti" ? "TUTTI" : f === "oggi" ? "OGGI" : f === "settimana" ? "SETTIMANA" : "MESE"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filtroLabel}>PREZZO</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtroRow}>
            {["tutti", "gratuito", "pagamento"].map((f) => (
              <TouchableOpacity key={f} style={[styles.chip, filtroPrezzo === f && styles.chipActive]} onPress={() => handleFiltroPrezzo(f)}>
                <Text style={[styles.chipText, filtroPrezzo === f && styles.chipTextActive]}>
                  {f === "tutti" ? "TUTTI" : f === "gratuito" ? "GRATUITO" : "A PAGAMENTO"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filtroLabel}>LUOGO</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtroRow}>
            <TouchableOpacity style={[styles.chip, filtroLuogo === "tutti" && styles.chipActive]} onPress={() => handleFiltroLuogo("tutti")}>
              <Text style={[styles.chipText, filtroLuogo === "tutti" && styles.chipTextActive]}>TUTTI</Text>
            </TouchableOpacity>
            {luoghi.map((l) => (
              <TouchableOpacity key={l} style={[styles.chip, filtroLuogo === l && styles.chipActive]} onPress={() => handleFiltroLuogo(l)}>
                <Text style={[styles.chipText, filtroLuogo === l && styles.chipTextActive]}>{l.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Risultati */}
      {loading ? (
        <ActivityIndicator color="#FF1493" style={{ marginTop: 40 }} />
      ) : !cercato ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={56} color="#1a1a1a" />
          <Text style={styles.emptyTitle}>Cosa stai cercando?</Text>
          <Text style={styles.emptySubtitle}>Digita o usa i filtri per trovare eventi</Text>
        </View>
      ) : risultati.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="sad-outline" size={56} color="#1a1a1a" />
          <Text style={styles.emptyTitle}>Nessun risultato</Text>
          <Text style={styles.emptySubtitle}>Prova con un altro termine o filtro</Text>
        </View>
      ) : (
        <>
          <Text style={styles.risultatiCount}>{risultati.length} eventi trovati</Text>
          <FlatList
            data={risultati}
            keyExtractor={(item) => String(item.ID)}
            renderItem={renderEvento}
            contentContainerStyle={styles.lista}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </>
      )}

      <BottomBar paginaAttiva="cerca" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  glowPink: { position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,20,147,0.15)" },
  glowBlue: { position: "absolute", bottom: 100, left: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(30,80,255,0.12)" },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 },
  title: { color: "#fff", fontSize: 36, fontWeight: "900", letterSpacing: -1, marginBottom: 12 },
  titleAccent: { color: "#FF1493" },
  colorLines: { flexDirection: "column", gap: 4 },
  colorLine: { height: 2, borderRadius: 1 },
  searchRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10, marginBottom: 14 },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#0a0a0a", borderWidth: 1, borderColor: "#FF149340", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  searchInput: { flex: 1, color: "#fff", fontSize: 15 },
  filtriBtn: { width: 50, height: 50, borderRadius: 14, backgroundColor: "#0a0a0a", borderWidth: 1, borderColor: "#222", alignItems: "center", justifyContent: "center" },
  filtriBtnActive: { borderColor: "#FF1493", backgroundColor: "#FF149310" },
  filtriPanel: { backgroundColor: "#050505", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#111", marginBottom: 10 },
  filtroLabel: { color: "#777", fontSize: 10, letterSpacing: 3, paddingHorizontal: 20, marginBottom: 8, marginTop: 6, fontWeight: "600" },
  filtroRow: { paddingHorizontal: 20, marginBottom: 4 },
  chip: { borderWidth: 1, borderColor: "#222", borderRadius: 100, paddingVertical: 7, paddingHorizontal: 16, marginRight: 8 },
  chipActive: { borderColor: "#FF1493", backgroundColor: "rgba(255,20,147,0.15)" },
  chipText: { color: "#666", fontSize: 10, letterSpacing: 2 },
  chipTextActive: { color: "#FF1493", fontWeight: "700" },
  risultatiCount: { color: "#555", fontSize: 12, letterSpacing: 1, paddingHorizontal: 24, marginBottom: 12, fontWeight: "500" },
  lista: { paddingHorizontal: 20, paddingBottom: 100 },
  card: { flexDirection: "row", backgroundColor: "#0a0a0a", borderRadius: 18, marginBottom: 14, borderWidth: 1, borderColor: "#1a1a1a", overflow: "hidden", shadowColor: "#FF1493", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  cardAccent: { width: 4 },
  cardContent: { flex: 1, padding: 16 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  cardTopRight: { flexDirection: "row", gap: 6, alignItems: "center" },
  cardDateBox: { alignItems: "center" },
  cardGiorno: { color: "#fff", fontSize: 24, fontWeight: "900", lineHeight: 26 },
  cardMese: { color: "#FF1493", fontSize: 10, letterSpacing: 2, fontWeight: "700" },
  badgeCategoria: { backgroundColor: "#1a1a1a", borderRadius: 100, paddingVertical: 5, paddingHorizontal: 10 },
  badgeCategoriaText: { color: "#777", fontSize: 9, letterSpacing: 1 },
  badgeFree: { backgroundColor: "#39FF6E", borderRadius: 100, paddingVertical: 5, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  badgeFreeText: { color: "#000", fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  badgePrice: { backgroundColor: "#FF1493", borderRadius: 100, paddingVertical: 5, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  badgePriceText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  cardTitolo: { color: "#fff", fontSize: 17, fontWeight: "700", letterSpacing: -0.3, marginBottom: 8 },
  cardLuogoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  cardLuogoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#39FF6E" },
  cardLuogo: { color: "#777", fontSize: 12 },
  cardOra: { color: "#555", fontSize: 11 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 60 },
  emptyTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 20, letterSpacing: -0.5 },
  emptySubtitle: { color: "#444", fontSize: 13, marginTop: 8, textAlign: "center", paddingHorizontal: 40 },
});