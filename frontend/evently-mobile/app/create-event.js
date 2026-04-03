import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BASE_URL from "../config/api";

export default function CreateEvent() {
  const router = useRouter();

  const [tipo, setTipo] = useState("");
  const [luoghi, setLuoghi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLuoghi, setLoadingLuoghi] = useState(true);
  const [messaggio, setMessaggio] = useState("");
  const [errore, setErrore] = useState("");

  // Campi form
  const [titolo, setTitolo] = useState("");
  const [data, setData] = useState("");
  const [numPartecipanti, setNumPartecipanti] = useState("");
  const [messaggio2, setMessaggio2] = useState("");
  const [luogoScelto, setLuogoScelto] = useState(null);
  const [titoloLocale, setTitoloLocale] = useState("");
  const [descrizioneLocale, setDescrizioneLocale] = useState("");
  const [dataLocale, setDataLocale] = useState("");
  const [oraLocale, setOraLocale] = useState("");
  const [prezzoLocale, setPrezzoLocale] = useState("");
  const [maxPartecipantiLocale, setMaxPartecipantiLocale] = useState("");
  const [loadingLocale, setLoadingLocale] = useState(false);
  const [messaggioLocale, setMessaggioLocale] = useState("");

  useEffect(() => {
    caricaTipo();
    caricaLuoghi();
  }, []);

  async function caricaTipo() {
    const t = await AsyncStorage.getItem("tipo");
    setTipo(t);
  }

  async function caricaLuoghi() {
    try {
      const response = await fetch(`${BASE_URL}/luoghi.php`);
      const data = await response.json();
      if (data.success) {
        setLuoghi(data.luoghi);
      }
    } catch (e) {
      setErrore("Errore nel caricamento dei luoghi.");
    } finally {
      setLoadingLuoghi(false);
    }
  }

  async function handleInviaRichiesta() {
    if (!titolo || !data || !numPartecipanti || !luogoScelto) {
      setErrore("Compila tutti i campi e scegli un luogo");
      return;
    }

    setLoading(true);
    setErrore("");

    try {
      const IDUtente = await AsyncStorage.getItem("IDUtente");
      const response = await fetch(`${BASE_URL}/crea-richiesta.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Titolo: titolo,
          DataEvento: data,
          NumeroPartecipanti: numPartecipanti,
          Messaggio: messaggio2,
          IDLuogo: luogoScelto,
          IDUtente: IDUtente,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessaggio("Richiesta inviata! Il locale la valuterà a breve.");
        setTitolo("");
        setData("");
        setNumPartecipanti("");
        setMessaggio2("");
        setLuogoScelto(null);
      } else {
        setErrore(result.message);
      }
    } catch (e) {
      setErrore("Errore di connessione.");
    } finally {
      setLoading(false);
    }
  }

  // Se è un locale, mostra pagina diversa
  if (tipo === "locale") {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← INDIETRO</Text>
          </TouchableOpacity>

          <Text style={styles.titoloPagina}>CREA EVENTO</Text>
          <View style={styles.linea} />
          <Text style={styles.subtitle}>
            Crea un evento direttamente nel tuo locale.
          </Text>

          <Text style={styles.label}>TITOLO EVENTO</Text>
          <TextInput
            style={styles.input}
            placeholder="es. Serata Jazz"
            placeholderTextColor="#555"
            value={titoloLocale}
            onChangeText={setTitoloLocale}
          />

          <Text style={styles.label}>DESCRIZIONE</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Descrivi l'evento..."
            placeholderTextColor="#555"
            value={descrizioneLocale}
            onChangeText={setDescrizioneLocale}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>DATA (AAAA-MM-GG)</Text>
          <TextInput
            style={styles.input}
            placeholder="es. 2026-06-15"
            placeholderTextColor="#555"
            value={dataLocale}
            onChangeText={setDataLocale}
            keyboardType="numeric"
          />

          <Text style={styles.label}>ORA (HH:MM)</Text>
          <TextInput
            style={styles.input}
            placeholder="es. 21:00"
            placeholderTextColor="#555"
            value={oraLocale}
            onChangeText={setOraLocale}
            keyboardType="numeric"
          />

          <Text style={styles.label}>PREZZO (€)</Text>
          <TextInput
            style={styles.input}
            placeholder="es. 10 (0 se gratuito)"
            placeholderTextColor="#555"
            value={prezzoLocale}
            onChangeText={setPrezzoLocale}
            keyboardType="numeric"
          />

          <Text style={styles.label}>MAX PARTECIPANTI</Text>
          <TextInput
            style={styles.input}
            placeholder="es. 100"
            placeholderTextColor="#555"
            value={maxPartecipantiLocale}
            onChangeText={setMaxPartecipantiLocale}
            keyboardType="numeric"
          />

          {/* Selezione luogo */}
          <Text style={styles.label}>SCEGLI IL TUO LUOGO</Text>
          {loadingLuoghi ? (
            <ActivityIndicator color="#c9b99a" />
          ) : (
            luoghi.map((luogo) => (
              <TouchableOpacity
                key={luogo.ID}
                style={[
                  styles.luogoBtn,
                  luogoScelto === luogo.ID && styles.luogoBtnSelected,
                ]}
                onPress={() => setLuogoScelto(luogo.ID)}
              >
                <Text style={[
                  styles.luogoNome,
                  luogoScelto === luogo.ID && styles.luogoNomeSelected,
                ]}>
                  {luogo.Nome}
                </Text>
                <Text style={styles.luogoIndirizzo}>{luogo.Indirizzo}</Text>
              </TouchableOpacity>
            ))
          )}

          {errore ? <Text style={styles.error}>{errore}</Text> : null}
          {messaggioLocale ? <Text style={styles.success}>{messaggioLocale}</Text> : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleCreaEvento}
            disabled={loadingLocale}
          >
            {loadingLocale ? (
              <ActivityIndicator color="#0a0a0a" />
            ) : (
              <Text style={styles.buttonText}>CREA EVENTO</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  async function handleCreaEvento() {
  if (!titoloLocale || !descrizioneLocale || !dataLocale || !oraLocale || !prezzoLocale || !maxPartecipantiLocale || !luogoScelto) {
    setErrore("Compila tutti i campi e scegli un luogo");
    return;
  }

  setLoadingLocale(true);
  setErrore("");

  try {
    const IDUtente = await AsyncStorage.getItem("IDUtente");
    const response = await fetch(`${BASE_URL}/crea-evento-locale.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Titolo: titoloLocale,
        Descrizione: descrizioneLocale,
        DataEvento: dataLocale,
        Ora: oraLocale,
        Prezzo: prezzoLocale,
        MaxPartecipanti: maxPartecipantiLocale,
        IDLuogo: luogoScelto,
        IDUtente: IDUtente,
      }),
    });

    const result = await response.json();

    if (result.success) {
          setMessaggioLocale("Evento creato con successo!");
          setTitoloLocale("");
          setDescrizioneLocale("");
          setDataLocale("");
          setOraLocale("");
          setPrezzoLocale("");
          setMaxPartecipantiLocale("");
          setLuogoScelto(null);
        } else {
          setErrore(result.message);
        }
      } catch (e) {
        setErrore("Errore di connessione.");
      } finally {
        setLoadingLocale(false);
      }
    }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Bottone indietro */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← INDIETRO</Text>
        </TouchableOpacity>

        {/* Titolo pagina */}
        <Text style={styles.titoloPagina}>RICHIESTA EVENTO</Text>
        <View style={styles.linea} />
        <Text style={styles.subtitle}>
          Invia una richiesta al locale. Se approvata, il tuo evento sarà visibile a tutti.
        </Text>

        {/* Form */}
        <Text style={styles.label}>TITOLO EVENTO</Text>
        <TextInput
          style={styles.input}
          placeholder="es. Festa di compleanno"
          placeholderTextColor="#555"
          value={titolo}
          onChangeText={setTitolo}
        />

        <Text style={styles.label}>DATA (AAAA-MM-GG)</Text>
        <TextInput
          style={styles.input}
          placeholder="es. 2026-06-15"
          placeholderTextColor="#555"
          value={data}
          onChangeText={setData}
          keyboardType="numeric"
        />

        <Text style={styles.label}>NUMERO PARTECIPANTI</Text>
        <TextInput
          style={styles.input}
          placeholder="es. 50"
          placeholderTextColor="#555"
          value={numPartecipanti}
          onChangeText={setNumPartecipanti}
          keyboardType="numeric"
        />

        <Text style={styles.label}>MESSAGGIO AL LOCALE (opzionale)</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Descrivi il tuo evento..."
          placeholderTextColor="#555"
          value={messaggio2}
          onChangeText={setMessaggio2}
          multiline
          numberOfLines={4}
        />

        {/* Selezione luogo */}
        <Text style={styles.label}>SCEGLI IL LUOGO</Text>
        {loadingLuoghi ? (
          <ActivityIndicator color="#c9b99a" />
        ) : (
          luoghi.map((luogo) => (
            <TouchableOpacity
              key={luogo.ID}
              style={[
                styles.luogoBtn,
                luogoScelto === luogo.ID && styles.luogoBtnSelected,
              ]}
              onPress={() => setLuogoScelto(luogo.ID)}
            >
              <Text style={[
                styles.luogoNome,
                luogoScelto === luogo.ID && styles.luogoNomeSelected,
              ]}>
                {luogo.Nome}
              </Text>
              <Text style={styles.luogoIndirizzo}>{luogo.Indirizzo}</Text>
            </TouchableOpacity>
          ))
        )}

        {/* Errore */}
        {errore ? <Text style={styles.error}>{errore}</Text> : null}

        {/* Successo */}
        {messaggio ? <Text style={styles.success}>{messaggio}</Text> : null}

        {/* Bottone invia */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleInviaRichiesta}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0a0a0a" />
          ) : (
            <Text style={styles.buttonText}>INVIA RICHIESTA</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 20,
    marginTop: 20,
  },
  backText: {
    color: "#c9b99a",
    fontSize: 10,
    letterSpacing: 3,
  },
  titoloPagina: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "200",
    letterSpacing: 8,
    marginBottom: 12,
  },
  linea: {
    height: 1,
    backgroundColor: "#1a1a1a",
    marginVertical: 16,
  },
  subtitle: {
    color: "#555",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 24,
  },
  label: {
    color: "#c9b99a",
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    color: "#ffffff",
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  inputMultiline: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 0,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
  },
  luogoBtn: {
    borderWidth: 1,
    borderColor: "#1a1a1a",
    padding: 16,
    marginTop: 8,
  },
  luogoBtnSelected: {
    borderColor: "#c9b99a",
    backgroundColor: "#c9b99a22",
  },
  luogoNome: {
    color: "#555",
    fontSize: 14,
    fontWeight: "300",
  },
  luogoNomeSelected: {
    color: "#ffffff",
  },
  luogoIndirizzo: {
    color: "#333",
    fontSize: 11,
    marginTop: 4,
  },
  error: {
    color: "#e07070",
    fontSize: 12,
    textAlign: "center",
    marginTop: 16,
  },
  success: {
    color: "#c9b99a",
    fontSize: 12,
    textAlign: "center",
    marginTop: 16,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: "#c9b99a",
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 36,
    marginBottom: 24,
  },
  buttonText: {
    color: "#0a0a0a",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 4,
  },
});