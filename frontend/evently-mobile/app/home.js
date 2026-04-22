import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import BottomBar from "../components/BottomBar";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BASE_URL from "../config/api";

const { width } = Dimensions.get("window");
const API_URL = `${BASE_URL}/eventi.php`;

export default function Home() {
  const router = useRouter();
  const [eventi, setEventi] = useState([]);
  const [eventiFiltrati, setEventiFiltrati] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tipo, setTipo] = useState("");
  const [luoghi, setLuoghi] = useState([]);

  // Filtri
  const [ricerca, setRicerca] = useState("");
  const [filtroData, setFiltroData] = useState("tutti");
  const [filtroPrezzo, setFiltroPrezzo] = useState("tutti");
  const [filtroLuogo, setFiltroLuogo] = useState("tutti");
  const [mostraFiltri, setMostraFiltri] = useState(false);

  useEffect(() => {
    caricaTipo();
    caricaEventi();
  }, []);

  useEffect(() => {
    applicaFiltri();
  }, [eventi, ricerca, filtroData, filtroPrezzo, filtroLuogo]);

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
        // Estrai luoghi unici
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

    // Filtro ricerca testuale
    if (ricerca.trim() !== "") {
      filtrati = filtrati.filter(e =>
        e.Titolo.toLowerCase().includes(ricerca.toLowerCase())
      );
    }

    // Filtro data
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    if (filtroData === "oggi") {
      filtrati = filtrati.filter(e => {
        const dataEvento = new Date(e.DataEvento);
        return dataEvento.toDateString() === oggi.toDateString();
      });
    } else if (filtroData === "settimana") {
      const fineSettimana = new Date(oggi);
      fineSettimana.setDate(oggi.getDate() + 7);
      filtrati = filtrati.filter(e => {
        const dataEvento = new Date(e.DataEvento);
        return dataEvento >= oggi && dataEvento <= fineSettimana;
      });
    } else if (filtroData === "mese") {
      filtrati = filtrati.filter(e => {
        const dataEvento = new Date(e.DataEvento);
        return dataEvento.getMonth() === oggi.getMonth() &&
              dataEvento.getFullYear() === oggi.getFullYear();
      });
    }

    // Filtro prezzo
    if (filtroPrezzo === "gratuito") {
      filtrati = filtrati.filter(e => e.Prezzo == 0);
    } else if (filtroPrezzo === "pagamento") {
      filtrati = filtrati.filter(e => e.Prezzo > 0);
    }

    // Filtro luogo
    if (filtroLuogo !== "tutti") {
      filtrati = filtrati.filter(e => e.NomeLuogo === filtroLuogo);
    }

    setEventiFiltrati(filtrati);
  }

  function renderEvento({ item }) {
    const data = new Date(item.DataEvento);
    const giorno = data.toLocaleDateString("it-IT", { day: "2-digit" });
    const mese = data.toLocaleDateString("it-IT", { month: "short" }).toUpperCase();

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/event-detail?id=${item.ID}`)}
      >
        <View style={styles.cardDateBox}>
          <Text style={styles.cardGiorno}>{giorno}</Text>
          <Text style={styles.cardMese}>{mese}</Text>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitolo}>{item.Titolo}</Text>
          <Text style={styles.cardLuogo}>📍 {item.NomeLuogo}</Text>
          <Text style={styles.cardDescrizione} numberOfLines={2}>
            {item.Descrizione}
          </Text>
        </View>

        <View style={styles.cardPrezzoBox}>
          <Text style={styles.cardPrezzo}>
            {item.Prezzo == 0 ? "FREE" : `€${item.Prezzo}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>EVENTLY</Text>
        <View style={styles.titleUnderline} />
        <Text style={styles.subtitle}>EVENTI IN PROGRAMMA</Text>
      </View>

      {/* Barra ricerca */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cerca evento..."
          placeholderTextColor="#555"
          value={ricerca}
          onChangeText={setRicerca}
        />
        <TouchableOpacity
          style={[styles.filtriBtn, mostraFiltri && styles.filtriBtnActive]}
          onPress={() => setMostraFiltri(!mostraFiltri)}
        >
          <Text style={[styles.filtriBtnText, mostraFiltri && styles.filtriBtnTextActive]}>
            FILTRI
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pannello filtri */}
      {mostraFiltri && (
        <View style={styles.filtriPanel}>

          {/* Filtro data */}
          <Text style={styles.filtroLabel}>DATA</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtroRow}>
            {["tutti", "oggi", "settimana", "mese"].map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filtroChip, filtroData === f && styles.filtroChipActive]}
                onPress={() => setFiltroData(f)}
              >
                <Text style={[styles.filtroChipText, filtroData === f && styles.filtroChipTextActive]}>
                  {f === "tutti" ? "TUTTI" : f === "oggi" ? "OGGI" : f === "settimana" ? "QUESTA SETTIMANA" : "QUESTO MESE"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Filtro prezzo */}
          <Text style={styles.filtroLabel}>PREZZO</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtroRow}>
            {["tutti", "gratuito", "pagamento"].map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filtroChip, filtroPrezzo === f && styles.filtroChipActive]}
                onPress={() => setFiltroPrezzo(f)}
              >
                <Text style={[styles.filtroChipText, filtroPrezzo === f && styles.filtroChipTextActive]}>
                  {f === "tutti" ? "TUTTI" : f === "gratuito" ? "GRATUITO" : "A PAGAMENTO"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Filtro luogo */}
          <Text style={styles.filtroLabel}>LUOGO</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtroRow}>
            <TouchableOpacity
              style={[styles.filtroChip, filtroLuogo === "tutti" && styles.filtroChipActive]}
              onPress={() => setFiltroLuogo("tutti")}
            >
              <Text style={[styles.filtroChipText, filtroLuogo === "tutti" && styles.filtroChipTextActive]}>
                TUTTI
              </Text>
            </TouchableOpacity>
            {luoghi.map((l) => (
              <TouchableOpacity
                key={l}
                style={[styles.filtroChip, filtroLuogo === l && styles.filtroChipActive]}
                onPress={() => setFiltroLuogo(l)}
              >
                <Text style={[styles.filtroChipText, filtroLuogo === l && styles.filtroChipTextActive]}>
                  {l.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

        </View>
      )}

      {/* Lista eventi */}
      {loading ? (
        <ActivityIndicator color="#c9b99a" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : eventiFiltrati.length === 0 ? (
        <Text style={styles.empty}>Nessun evento trovato</Text>
      ) : (
        <FlatList
          data={eventiFiltrati}
          keyExtractor={(item) => String(item.ID)}
          renderItem={renderEvento}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bottom bar */}
      <BottomBar paginaAttiva="home" />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "200",
    letterSpacing: 10,
  },
  titleUnderline: {
    width: 30,
    height: 1,
    backgroundColor: "#c9b99a",
    marginTop: 8,
    marginBottom: 8,
  },
  subtitle: {
    color: "#c9b99a",
    fontSize: 9,
    letterSpacing: 4,
    fontWeight: "300",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    color: "#ffffff",
    fontSize: 13,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  filtriBtn: {
    borderWidth: 1,
    borderColor: "#333",
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  filtriBtnActive: {
    borderColor: "#c9b99a",
    backgroundColor: "#c9b99a22",
  },
  filtriBtnText: {
    color: "#555",
    fontSize: 9,
    letterSpacing: 2,
  },
  filtriBtnTextActive: {
    color: "#c9b99a",
  },
  filtriPanel: {
    backgroundColor: "#0f0f0f",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  filtroLabel: {
    color: "#c9b99a",
    fontSize: 9,
    letterSpacing: 3,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 8,
  },
  filtroRow: {
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  filtroChip: {
    borderWidth: 1,
    borderColor: "#333",
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  filtroChipActive: {
    borderColor: "#c9b99a",
    backgroundColor: "#c9b99a22",
  },
  filtroChipText: {
    color: "#555",
    fontSize: 9,
    letterSpacing: 2,
  },
  filtroChipTextActive: {
    color: "#c9b99a",
  },
  lista: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#1a1a1a",
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#0f0f0f",
    alignItems: "center",
  },
  cardDateBox: {
    alignItems: "center",
    marginRight: 16,
    minWidth: 36,
  },
  cardGiorno: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "200",
  },
  cardMese: {
    color: "#c9b99a",
    fontSize: 9,
    letterSpacing: 2,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitolo: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "300",
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardLuogo: {
    color: "#555",
    fontSize: 11,
    marginBottom: 4,
  },
  cardDescrizione: {
    color: "#888",
    fontSize: 11,
    lineHeight: 16,
  },
  cardPrezzoBox: {
    marginLeft: 12,
    alignItems: "flex-end",
  },
  cardPrezzo: {
    color: "#c9b99a",
    fontSize: 10,
    letterSpacing: 1,
  },
  error: {
    color: "#e07070",
    textAlign: "center",
    marginTop: 40,
  },
  empty: {
    color: "#555",
    textAlign: "center",
    marginTop: 60,
    fontSize: 13,
    letterSpacing: 2,
  },
});