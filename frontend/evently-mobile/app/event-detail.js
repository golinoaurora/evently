import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BASE_URL from "../config/api";

const { width } = Dimensions.get("window");

export default function EventDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tipo, setTipo] = useState("");
  const [messaggio, setMessaggio] = useState("");

  useEffect(() => {
    caricaTipo();
    caricaEvento();
  }, []);

  async function caricaTipo() {
    const t = await AsyncStorage.getItem("tipo");
    setTipo(t);
  }

  async function caricaEvento() {
    try {
      const response = await fetch(`${BASE_URL}/evento.php?id=${id}`);
      const data = await response.json();
      if (data.success) {
        setEvento(data.evento);
      } else {
        setError("Evento non trovato");
      }
    } catch (e) {
      setError("Errore di connessione.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePartecipa() {
    try {
      const IDUtente = await AsyncStorage.getItem("IDUtente");
      const response = await fetch(`${BASE_URL}/partecipa.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          IDEvento: id,
          IDUtente: IDUtente,
        }),
      });
      const data = await response.json();
      setMessaggio(data.message);
    } catch (e) {
      setMessaggio("Errore di connessione.");
    }
  }

  if (loading) return (
    <View style={styles.container}>
      <ActivityIndicator color="#c9b99a" style={{ marginTop: 40 }} />
    </View>
  );

  if (error) return (
    <View style={styles.container}>
      <Text style={styles.error}>{error}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Bottone indietro */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← INDIETRO</Text>
      </TouchableOpacity>

      {/* Data e ora */}
      <View style={styles.dataBox}>
        <Text style={styles.data}>
          {new Date(evento.DataEvento).toLocaleDateString("it-IT", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          }).toUpperCase()}
        </Text>
        <Text style={styles.ora}>{evento.Ora.slice(0, 5)}</Text>
      </View>

      {/* Linea decorativa */}
      <View style={styles.linea} />

      {/* Titolo */}
      <Text style={styles.titolo}>{evento.Titolo}</Text>

      {/* Luogo */}
      <Text style={styles.luogo}>📍 {evento.NomeLuogo}</Text>
      <Text style={styles.indirizzo}>{evento.Indirizzo}</Text>

      {/* Linea decorativa */}
      <View style={styles.linea} />

      {/* Descrizione */}
      <Text style={styles.descrizioneLabel}>DESCRIZIONE</Text>
      <Text style={styles.descrizione}>{evento.Descrizione}</Text>

      {/* Info */}
      <View style={styles.infoRow}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>PREZZO</Text>
          <Text style={styles.infoValue}>
            {evento.Prezzo == 0 ? "Gratuito" : `€${evento.Prezzo}`}
          </Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>MAX PARTECIPANTI</Text>
          <Text style={styles.infoValue}>{evento.MaxPartecipanti}</Text>
        </View>
      </View>

      {/* Messaggio feedback */}
      {messaggio ? <Text style={styles.messaggio}>{messaggio}</Text> : null}

      {/* Bottone Partecipa — solo per privati */}
      {tipo === "privato" && (
        <TouchableOpacity style={styles.button} onPress={handlePartecipa}>
          <Text style={styles.buttonText}>PARTECIPA</Text>
        </TouchableOpacity>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  content: {
    padding: 30,
    paddingBottom: 60,
  },
  backBtn: {
    marginBottom: 30,
    marginTop: 20,
  },
  backText: {
    color: "#c9b99a",
    fontSize: 10,
    letterSpacing: 3,
  },
  dataBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  data: {
    color: "#c9b99a",
    fontSize: 10,
    letterSpacing: 2,
    flex: 1,
  },
  ora: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "200",
  },
  linea: {
    height: 1,
    backgroundColor: "#1a1a1a",
    marginVertical: 20,
  },
  titolo: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "200",
    letterSpacing: 2,
    marginBottom: 12,
  },
  luogo: {
    color: "#888",
    fontSize: 13,
    marginBottom: 4,
  },
  indirizzo: {
    color: "#555",
    fontSize: 11,
    letterSpacing: 1,
  },
  descrizioneLabel: {
    color: "#c9b99a",
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 10,
  },
  descrizione: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 20,
  },
  infoBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#1a1a1a",
    padding: 16,
  },
  infoLabel: {
    color: "#c9b99a",
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 6,
  },
  infoValue: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "200",
  },
  messaggio: {
    color: "#c9b99a",
    textAlign: "center",
    marginTop: 20,
    fontSize: 12,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: "#c9b99a",
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "#0a0a0a",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 4,
  },
  error: {
    color: "#e07070",
    textAlign: "center",
    marginTop: 40,
  },
});