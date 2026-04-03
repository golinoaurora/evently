import AsyncStorage from "@react-native-async-storage/async-storage";
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
        <Text style={styles.cardPrezzo}>
          {item.Prezzo == 0 ? "FREE" : `€${item.Prezzo}`}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← INDIETRO</Text>
        </TouchableOpacity>
        <Text style={styles.title}>I MIEI PREFERITI</Text>
        <View style={styles.titleUnderline} />
      </View>

      {loading ? (
        <ActivityIndicator color="#c9b99a" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : preferiti.length === 0 ? (
        <Text style={styles.empty}>Nessun evento nei preferiti</Text>
      ) : (
        <FlatList
          data={preferiti}
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
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  backBtn: {
    marginBottom: 16,
  },
  backText: {
    color: "#c9b99a",
    fontSize: 10,
    letterSpacing: 3,
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "200",
    letterSpacing: 6,
  },
  titleUnderline: {
    width: 30,
    height: 1,
    backgroundColor: "#c9b99a",
    marginTop: 10,
  },
  lista: {
    padding: 20,
    paddingBottom: 60,
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
  cardPrezzo: {
    color: "#c9b99a",
    fontSize: 10,
    letterSpacing: 1,
    marginLeft: 12,
  },
  empty: {
    color: "#555",
    textAlign: "center",
    marginTop: 60,
    fontSize: 13,
    letterSpacing: 2,
  },
  error: {
    color: "#e07070",
    textAlign: "center",
    marginTop: 40,
  },
});