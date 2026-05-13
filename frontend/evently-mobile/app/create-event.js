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
  const [luoghiFiltrati, setLuoghiFiltrati] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLuoghi, setLoadingLuoghi] = useState(true);
  const [messaggio, setMessaggio] = useState("");
  const [errore, setErrore] = useState("");
  const [mostraLuoghi, setMostraLuoghi] = useState(false);
  const [nomeLuogoScelto, setNomeLuogoScelto] = useState("");
  const [cercaLuogo, setCercaLuogo] = useState("");

  // Campi privato
  const [titolo, setTitolo] = useState("");
  const [data, setData] = useState("");
  const [ora, setOra] = useState("");
  const [numPartecipanti, setNumPartecipanti] = useState("");
  const [messaggio2, setMessaggio2] = useState("");
  const [luogoScelto, setLuogoScelto] = useState(null);

  // Campi locale
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
        setLuoghiFiltrati(data.luoghi);
      }
    } catch (e) {
      setErrore("Errore nel caricamento dei luoghi.");
    } finally {
      setLoadingLuoghi(false);
    }
  }

  function filtraLuoghi(testo) {
    setCercaLuogo(testo);
    if (testo.trim() === "") {
      setLuoghiFiltrati(luoghi);
    } else {
      setLuoghiFiltrati(
        luoghi.filter(l =>
          l.Nome.toLowerCase().includes(testo.toLowerCase()) ||
          l.Citta.toLowerCase().includes(testo.toLowerCase())
        )
      );
    }
  }

  function validaData(dataStringa) {
    const dataInserita = new Date(dataStringa);
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    const dopodomani = new Date(oggi);
    dopodomani.setDate(oggi.getDate() + 2);
    const maxData = new Date();
    maxData.setFullYear(oggi.getFullYear() + 2);

    if (isNaN(dataInserita.getTime())) {
      return "Inserisci una data valida nel formato AAAA-MM-GG";
    }
    if (dataInserita < dopodomani) {
      return "La data deve essere almeno dopodomani";
    }
    if (dataInserita > maxData) {
      return "La data non può essere oltre 2 anni da oggi";
    }
    return null;
  }

  function renderPickerLuogo() {
    return (
      <View>
        <Text style={styles.label}>SCEGLI IL LUOGO</Text>
        <TouchableOpacity
          style={styles.pickerBtn}
          onPress={() => setMostraLuoghi(!mostraLuoghi)}
        >
          <Text style={[styles.pickerBtnText, !nomeLuogoScelto && { color: "#555" }]}>
            {nomeLuogoScelto || "Seleziona un luogo..."}
          </Text>
          <Text style={styles.pickerArrow}>{mostraLuoghi ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {mostraLuoghi && (
          <View style={styles.pickerDropdown}>
            <TextInput
              style={styles.pickerSearch}
              placeholder="Cerca luogo..."
              placeholderTextColor="#555"
              value={cercaLuogo}
              onChangeText={filtraLuoghi}
            />
            {loadingLuoghi ? (
              <ActivityIndicator color="#c9b99a" style={{ padding: 16 }} />
            ) : luoghiFiltrati.length === 0 ? (
              <Text style={styles.pickerEmpty}>Nessun luogo trovato</Text>
            ) : (
              luoghiFiltrati.map((luogo) => (
                <TouchableOpacity
                  key={luogo.ID}
                  style={styles.pickerItem}
                  onPress={() => {
                    setLuogoScelto(luogo.ID);
                    setNomeLuogoScelto(luogo.Nome);
                    setMostraLuoghi(false);
                    setCercaLuogo("");
                    setLuoghiFiltrati(luoghi);
                  }}
                >
                  <Text style={styles.pickerItemText}>{luogo.Nome}</Text>
                  <Text style={styles.pickerItemSub}>
                    {luogo.Via} {luogo.NumeroCivico}, {luogo.Citta}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>
    );
  }

  async function handleInviaRichiesta() {
    if (!titolo || !data || !ora || !numPartecipanti || !luogoScelto) {
      setErrore("Compila tutti i campi e scegli un luogo");
      return;
    }

    const erroreData = validaData(data);
    if (erroreData) {
      setErrore(erroreData);
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
          Ora: ora,
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
        setOra("");
        setNumPartecipanti("");
        setMessaggio2("");
        setLuogoScelto(null);
        setNomeLuogoScelto("");
      } else {
        setErrore(result.message);
      }
    } catch (e) {
      setErrore("Errore di connessione.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreaEvento() {
    if (!titoloLocale || !descrizioneLocale || !dataLocale || !oraLocale || !prezzoLocale || !maxPartecipantiLocale || !luogoScelto) {
      setErrore("Compila tutti i campi e scegli un luogo");
      return;
    }

    const erroreData = validaData(dataLocale);
    if (erroreData) {
      setErrore(erroreData);
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
        setNomeLuogoScelto("");
      } else {
        setErrore(result.message);
      }
    } catch (e) {
      setErrore("Errore di connessione.");
    } finally {
      setLoadingLocale(false);
    }
  }

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

          {renderPickerLuogo()}

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

        <Text style={styles.titoloPagina}>RICHIESTA EVENTO</Text>
        <View style={styles.linea} />
        <Text style={styles.subtitle}>
          Invia una richiesta al locale. Se approvata, il tuo evento sarà visibile a tutti.
        </Text>

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

        <Text style={styles.label}>ORA (HH:MM)</Text>
        <TextInput
          style={styles.input}
          placeholder="es. 21:00"
          placeholderTextColor="#555"
          value={ora}
          onChangeText={setOra}
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

        {renderPickerLuogo()}

        {errore ? <Text style={styles.error}>{errore}</Text> : null}
        {messaggio ? <Text style={styles.success}>{messaggio}</Text> : null}

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
    padding: 12,
    height: 100,
    textAlignVertical: "top",
  },
  pickerBtn: {
    borderWidth: 1,
    borderColor: "#333",
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  pickerBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "200",
  },
  pickerArrow: {
    color: "#c9b99a",
    fontSize: 12,
  },
  pickerDropdown: {
    borderWidth: 1,
    borderColor: "#333",
    borderTopWidth: 0,
    backgroundColor: "#0f0f0f",
    maxHeight: 200,
  },
  pickerSearch: {
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    color: "#ffffff",
    padding: 12,
    fontSize: 13,
  },
  pickerItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  pickerItemText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "300",
  },
  pickerItemSub: {
    color: "#555",
    fontSize: 11,
    marginTop: 2,
  },
  pickerEmpty: {
    color: "#555",
    padding: 16,
    textAlign: "center",
    fontSize: 12,
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