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

export default function Notifiche() {
  const router = useRouter();
  const [notifiche, setNotifiche] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    caricaNotifiche();
  }, []);

  async function caricaNotifiche() {
    try {
      const IDUtente = await AsyncStorage.getItem("IDUtente");
      const response = await fetch(`${BASE_URL}/notifiche.php?IDUtente=${IDUtente}`);
      const data = await response.json();
      if (data.success) {
        setNotifiche(data.notifiche);
      } else {
        setError("Errore nel caricamento");
      }
    } catch (e) {
      setError("Errore di connessione.");
    } finally {
      setLoading(false);
    }
  }

  function getIcona(tipo) {
    switch(tipo) {
      case "richiesta_approvata": return "✅";
      case "richiesta_rifiutata": return "❌";
      case "nuovo_evento": return "🎉";
      default: return "🔔";
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← INDIETRO</Text>
        </TouchableOpacity>
        <Text style={styles.title}>NOTIFICHE</Text>
        <View style={styles.titleUnderline} />
      </View>

      {loading ? (
        <ActivityIndicator color="#c9b99a" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : notifiche.length === 0 ? (
        <Text style={styles.empty}>Nessuna notifica</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.lista}>
          {notifiche.map((n) => (
            <View key={n.ID} style={[styles.card, n.letta == 0 && styles.cardNonLetta]}>
              <Text style={styles.cardIcona}>{getIcona(n.tipo)}</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardMessaggio}>{n.messaggio}</Text>
                <Text style={styles.cardData}>{n.DataCreazione}</Text>
              </View>
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
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#1a1a1a",
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#0f0f0f",
    alignItems: "center",
  },
  cardNonLetta: {
    borderColor: "#c9b99a",
  },
  cardIcona: {
    fontSize: 24,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardMessaggio: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "300",
    marginBottom: 4,
  },
  cardData: {
    color: "#555",
    fontSize: 11,
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