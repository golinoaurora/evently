import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function EventDetail() {
  const [preferito, setPreferito] = useState(false);
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tipo, setTipo] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [isOrganizzatore, setIsOrganizzatore] = useState(false);
  const [partecipanti, setPartecipanti] = useState([]);

  useEffect(() => {
    caricaTipo();
    caricaEvento();
    caricaPreferito();
    caricaPartecipanti();
  }, []);

  async function handlePreferito() {
    try {
      const IDUtente = await AsyncStorage.getItem("IDUtente");
      const response = await fetch(`${BASE_URL}/aggiungi-preferito.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          IDEvento: id,
          IDUtente: IDUtente,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setPreferito(data.preferito);
      }
    } catch (e) {
      console.log("Errore preferito");
    }
  }

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
        const IDPrivato = await AsyncStorage.getItem("IDPrivato");
        if (data.evento.IDPrivato && String(data.evento.IDPrivato) === IDPrivato) {
          setIsOrganizzatore(true);
        }
      } else {
        setError("Evento non trovato");
      }
    } catch (e) {
      setError("Errore di connessione.");
    } finally {
      setLoading(false);
    }
  }
  async function caricaPreferito() {
    try {
      const IDUtente = await AsyncStorage.getItem("IDUtente");
      const response = await fetch(`${BASE_URL}/controlla-preferito.php?IDEvento=${id}&IDUtente=${IDUtente}`);
      const data = await response.json();
      if (data.success) {
        setPreferito(data.preferito);
      }
    } catch (e) {
      console.log("Errore controllo preferito");
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
   async function caricaPartecipanti() {
    try {
      const response = await fetch(`${BASE_URL}/partecipanti-evento.php?IDEvento=${id}`);
      const data = await response.json();
      if (data.success) {
        setPartecipanti(data.partecipanti);
      }
    } catch (e) {
      console.log("Errore caricamento partecipanti");
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

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← INDIETRO</Text>
      </TouchableOpacity>

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

      <View style={styles.linea} />

      <Text style={styles.titolo}>{evento.Titolo}</Text>
      <Text style={styles.luogo}>📍 {evento.NomeLuogo}</Text>
      <Text style={styles.indirizzo}>{evento.Indirizzo}</Text>

      <View style={styles.linea} />

      <Text style={styles.descrizioneLabel}>DESCRIZIONE</Text>
      <Text style={styles.descrizione}>{evento.Descrizione}</Text>

      <View style={styles.infoRow}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>PREZZO</Text>
          <Text style={styles.infoValue}>
            {evento.Prezzo == 0 ? "Gratuito" : `€${evento.Prezzo}`}
          </Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>POSTI RIMANENTI</Text>
          <Text style={[
            styles.infoValue,
            (evento.MaxPartecipanti - evento.Iscritti) <= 5 && { color: "#e07070" }
          ]}>
            {Math.max(0, evento.MaxPartecipanti - evento.Iscritti)} / {evento.MaxPartecipanti}
          </Text>
        </View>
      </View>

      {messaggio ? <Text style={styles.messaggio}>{messaggio}</Text> : null}

      {tipo === "privato" && (
        <TouchableOpacity
          style={styles.preferitoBtn}
          onPress={handlePreferito}
        >
          <Text style={styles.preferitoText}>
            {preferito ? "❤️ RIMUOVI DAI PREFERITI" : "🤍 AGGIUNGI AI PREFERITI"}
          </Text>
        </TouchableOpacity>
      )}

      {tipo === "privato" && !isOrganizzatore && (
        <TouchableOpacity style={styles.button} onPress={handlePartecipa}>
          <Text style={styles.buttonText}>PARTECIPA</Text>
        </TouchableOpacity>
      )}

      {tipo === "privato" && isOrganizzatore && (
        <View>
          <View style={styles.organizzatoreBox}>
            <Text style={styles.organizzatoreText}>SEI L'ORGANIZZATORE DI QUESTO EVENTO</Text>
          </View>

          <View style={styles.partecipantiBox}>
            <Text style={styles.partecipantiTitolo}>
              PARTECIPANTI ({partecipanti.length})
            </Text>
            <View style={styles.linea} />
            {partecipanti.length === 0 ? (
              <Text style={styles.partecipantiEmpty}>Nessun partecipante ancora</Text>
            ) : (
              partecipanti.map((p, index) => (
                <View key={index} style={styles.partecipanteRow}>
                  <Text style={styles.partecipanteNome}>{p.Nome}</Text>
                  <Text style={styles.partecipanteEmail}>{p.Email}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      )}
      {/* Lista partecipanti — solo per locale */}
      {tipo === "locale" && (
        <View style={styles.partecipantiBox}>
          <Text style={styles.partecipantiTitolo}>
            PARTECIPANTI ({partecipanti.length})
          </Text>
          <View style={styles.linea} />
          {partecipanti.length === 0 ? (
            <Text style={styles.partecipantiEmpty}>Nessun partecipante ancora</Text>
          ) : (
            partecipanti.map((p, index) => (
              <View key={index} style={styles.partecipanteRow}>
                <Text style={styles.partecipanteNome}>{p.Nome}</Text>
                <Text style={styles.partecipanteEmail}>{p.Email}</Text>
              </View>
            ))
          )}
        </View>
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
  preferitoBtn: {
    borderWidth: 1,
    borderColor: "#c9b99a",
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  preferitoText: {
    color: "#c9b99a",
    fontSize: 11,
    letterSpacing: 3,
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
  organizzatoreBox: {
    borderWidth: 1,
    borderColor: "#c9b99a",
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 30,
  },
  organizzatoreText: {
    color: "#c9b99a",
    fontSize: 10,
    letterSpacing: 3,
  },
  partecipantiBox: {
  marginTop: 30,
  borderWidth: 1,
  borderColor: "#1a1a1a",
  padding: 16,
  },
  partecipantiTitolo: {
    color: "#c9b99a",
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 12,
  },
  partecipantiEmpty: {
    color: "#555",
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
  },
  partecipanteRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  partecipanteNome: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "300",
  },
  partecipanteEmail: {
    color: "#555",
    fontSize: 11,
    marginTop: 2,
  },
});