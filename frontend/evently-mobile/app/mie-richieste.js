import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function MieRichieste() {
  const router = useRouter();
  const [richieste, setRichieste] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    caricaRichieste();
  }, []);

  async function caricaRichieste() {
    try {
      const IDUtente = await AsyncStorage.getItem("IDUtente");
      const response = await fetch(`${BASE_URL}/mie-richieste.php?IDUtente=${IDUtente}`);
      const data = await response.json();
      if (data.success) {
        setRichieste(data.richieste);
      } else {
        setError("Errore nel caricamento");
      }
    } catch (e) {
      setError("Errore di connessione.");
    } finally {
      setLoading(false);
    }
  }

  function getStatoStyle(stato) {
    switch(stato) {
      case "in_attesa": return styles.statoAttesa;
      case "approvato_admin": return styles.statoAdminOk;
      case "approvato": return styles.statoApprovato;
      case "rifiutato": return styles.statoRifiutato;
      default: return styles.statoAttesa;
    }
  }

  function getStatoTesto(stato) {
    switch(stato) {
      case "in_attesa": return "⏳ IN ATTESA";
      case "approvato_admin": return "✓ APPROVATO DALL'ADMIN";
      case "approvato": return "✓✓ APPROVATO";
      case "rifiutato": return "✗ RIFIUTATO";
      default: return stato;
    }
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← INDIETRO</Text>
        </TouchableOpacity>
        <Text style={styles.title}>LE MIE RICHIESTE</Text>
        <View style={styles.titleUnderline} />
      </View>

      {loading ? (
        <ActivityIndicator color="#c9b99a" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : richieste.length === 0 ? (
        <Text style={styles.empty}>Non hai ancora inviato richieste</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.lista}>
          {richieste.map((r) => (
            <View key={r.ID} style={styles.card}>

              <View style={styles.cardTop}>
                <Text style={styles.cardTitolo}>{r.Titolo}</Text>
                <View style={[styles.statoBadge, getStatoStyle(r.Stato)]}>
                  <Text style={styles.statoTesto}>{getStatoTesto(r.Stato)}</Text>
                </View>
              </View>

              <Text style={styles.cardInfo}>📍 {r.NomeLuogo}</Text>
              <Text style={styles.cardInfo}>📅 {r.DataEvento}</Text>
              <Text style={styles.cardInfo}>👥 {r.NumeroPartecipanti} partecipanti</Text>
              {r.Messaggio ? (
                <Text style={styles.cardMessaggio}>"{r.Messaggio}"</Text>
              ) : null}

            </View>
          ))}
        </ScrollView>
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
    borderWidth: 1,
    borderColor: "#1a1a1a",
    padding: 20,
    marginBottom: 16,
    backgroundColor: "#0f0f0f",
  },
  cardTop: {
    marginBottom: 12,
  },
  cardTitolo: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "300",
    letterSpacing: 1,
    marginBottom: 8,
  },
  statoBadge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statoTesto: {
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: "700",
    color: "#0a0a0a",
  },
  statoAttesa: {
    backgroundColor: "#555",
  },
  statoAdminOk: {
    backgroundColor: "#c9b99a",
  },
  statoApprovato: {
    backgroundColor: "#6a994e",
  },
  statoRifiutato: {
    backgroundColor: "#e07070",
  },
  cardInfo: {
    color: "#888",
    fontSize: 12,
    marginBottom: 4,
  },
  cardMessaggio: {
    color: "#555",
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 8,
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