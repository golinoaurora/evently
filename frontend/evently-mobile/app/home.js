import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BASE_URL from "../config/api";

const { width } = Dimensions.get("window");
const API_URL = `${BASE_URL}/eventi.php`;

export default function Home() {
  const router = useRouter();
  const [eventi, setEventi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tipo, setTipo] = useState("");

  useEffect(() => {
    caricaTipo();
    caricaEventi();
  }, []);

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

  function renderEvento({ item }) {
    const data = new Date(item.DataEvento);
    const giorno = data.toLocaleDateString("it-IT", { day: "2-digit" });
    const mese = data.toLocaleDateString("it-IT", { month: "short" }).toUpperCase();

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/event-detail?id=${item.ID}`)}
      >
        {/* Data */}
        <View style={styles.cardDateBox}>
          <Text style={styles.cardGiorno}>{giorno}</Text>
          <Text style={styles.cardMese}>{mese}</Text>
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitolo}>{item.Titolo}</Text>
          <Text style={styles.cardLuogo}>📍 {item.NomeLuogo}</Text>
          <Text style={styles.cardDescrizione} numberOfLines={2}>
            {item.Descrizione}
          </Text>
        </View>

        {/* Prezzo */}
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

      {/* Lista eventi */}
      {loading ? (
        <ActivityIndicator color="#c9b99a" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={eventi}
          keyExtractor={(item) => String(item.ID)}
          renderItem={renderEvento}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bottom bar */}
      <View style={styles.bottomBar}>

        {/* Home */}
        <TouchableOpacity style={styles.bottomBtn}>
          <Text style={styles.bottomIcon}>🏠</Text>
        </TouchableOpacity>

        {/* Bottone centrale — per privato e locale */}
        {(tipo === "privato" || tipo === "locale") && (
          <TouchableOpacity
            style={styles.bottomBtnCenter}
            onPress={() => router.push("/create-event")}
          >
            <Text style={styles.bottomIconCenter}>+</Text>
          </TouchableOpacity>
        )}

        {/* Profilo */}
        <TouchableOpacity
          style={styles.bottomBtn}
          onPress={() => router.push("/profile")}
        >
          <Text style={styles.bottomIcon}>👤</Text>
        </TouchableOpacity>

      </View>

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
    paddingBottom: 20,
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
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "#0f0f0f",
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 10,
  },
  bottomBtn: {
    padding: 10,
  },
  bottomIcon: {
    fontSize: 22,
  },
  bottomBtnCenter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#c9b99a",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomIconCenter: {
    color: "#0a0a0a",
    fontSize: 28,
    fontWeight: "200",
    lineHeight: 32,
  },
});