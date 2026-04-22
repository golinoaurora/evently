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
        body: JSON.stringify({
          IDRichiesta: IDRichiesta,
          Stato: stato,
        }),
      });
      const data = await response.json();
      if (data.success) {
        caricaRichieste();
      }
    } catch (e) {
      setError("Errore di connessione.");
    }
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>EVENTLY</Text>
        <View style={styles.titleUnderline} />
        <Text style={styles.subtitle}>PANNELLO ADMIN</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#c9b99a" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : richieste.length === 0 ? (
        <Text style={styles.empty}>Nessuna richiesta in attesa</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.lista}>
          {richieste.map((r) => (
            <View key={r.ID} style={styles.card}>
              <Text style={styles.cardTitolo}>{r.Titolo}</Text>
              <Text style={styles.cardInfo}>👤 {r.NomeUtente}</Text>
              <Text style={styles.cardInfo}>📍 {r.NomeLuogo}</Text>
              <Text style={styles.cardInfo}>📅 {r.DataEvento}</Text>
              <Text style={styles.cardInfo}>👥 {r.NumeroPartecipanti} partecipanti</Text>
              {r.Messaggio ? (
                <Text style={styles.cardMessaggio}>"{r.Messaggio}"</Text>
              ) : null}

              <View style={styles.bttns}>
                <TouchableOpacity
                  style={styles.btnApprova}
                  onPress={() => handleDecisione(r.ID, "approvato_admin")}
                >
                  <Text style={styles.btnApprovaText}>✓ APPROVA</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnRifiuta}
                  onPress={() => handleDecisione(r.ID, "rifiutato")}
                >
                  <Text style={styles.btnRifiutaText}>✗ RIFIUTA</Text>
                </TouchableOpacity>
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
  },
  lista: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    borderWidth: 1,
    borderColor: "#1a1a1a",
    padding: 20,
    marginBottom: 16,
    backgroundColor: "#0f0f0f",
  },
  cardTitolo: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "300",
    letterSpacing: 1,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  bttns: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  btnApprova: {
    flex: 1,
    backgroundColor: "#c9b99a",
    paddingVertical: 12,
    alignItems: "center",
  },
  btnApprovaText: {
    color: "#0a0a0a",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },
  btnRifiuta: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e07070",
    paddingVertical: 12,
    alignItems: "center",
  },
  btnRifiutaText: {
    color: "#e07070",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
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