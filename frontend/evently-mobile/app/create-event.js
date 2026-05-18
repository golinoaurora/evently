import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
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

const CATEGORIE = ["MUSICA", "ARTE", "SPORT", "FOOD", "PARTY", "ALTRO"];

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
  const [dataObj, setDataObj] = useState(null);
  const [mostraCalendario, setMostraCalendario] = useState(false);
  const [ora, setOra] = useState("");
  const [numPartecipanti, setNumPartecipanti] = useState("");
  const [messaggio2, setMessaggio2] = useState("");
  const [luogoScelto, setLuogoScelto] = useState(null);
  const [categoria, setCategoria] = useState("ALTRO");

  // Campi locale
  const [titoloLocale, setTitoloLocale] = useState("");
  const [descrizioneLocale, setDescrizioneLocale] = useState("");
  const [dataLocale, setDataLocale] = useState("");
  const [dataLocaleObj, setDataLocaleObj] = useState(null);
  const [mostraCalendarioLocale, setMostraCalendarioLocale] = useState(false);
  const [oraLocale, setOraLocale] = useState("");
  const [prezzoLocale, setPrezzoLocale] = useState("");
  const [maxPartecipantiLocale, setMaxPartecipantiLocale] = useState("");
  const [loadingLocale, setLoadingLocale] = useState(false);
  const [messaggioLocale, setMessaggioLocale] = useState("");
  const [categoriaLocale, setCategoriaLocale] = useState("ALTRO");
  const [imageUrlLocale, setImageUrlLocale] = useState("");

  const oggi = new Date();
  const dopodomani = new Date(oggi);
  dopodomani.setDate(oggi.getDate() + 2);
  dopodomani.setHours(0, 0, 0, 0);
  const maxData = new Date();
  maxData.setFullYear(oggi.getFullYear() + 2);

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

  function formatData(date) {
    const anno = date.getFullYear();
    const mese = String(date.getMonth() + 1).padStart(2, "0");
    const giorno = String(date.getDate()).padStart(2, "0");
    return `${anno}-${mese}-${giorno}`;
  }

  function formatDataLeggibile(date) {
    return date.toLocaleDateString("it-IT", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric",
    });
  }

  function renderCategorie(categoriaAttiva, setCateg) {
    return (
      <View>
        <Text style={styles.label}>CATEGORIA</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8, marginBottom: 8 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {CATEGORIE.map((cat) => (
              <TouchableOpacity key={cat} onPress={() => setCateg(cat)} style={{ borderRadius: 100, overflow: "hidden" }}>
                {categoriaAttiva === cat ? (
                  <LinearGradient colors={["#FF1493", "#C800FF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.catGradient}>
                    <Text style={styles.catTextActive}>{cat}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.catDefault}>
                    <Text style={styles.catText}>{cat}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  function renderCampoData(label, valore, valoreObj, setValore, setValoreObj, mostra, setMostra) {
    if (Platform.OS === "web") {
      return (
        <>
          <Text style={styles.label}>{label}</Text>
          <TextInput style={styles.input} placeholder="AAAA-MM-GG" placeholderTextColor="#333" value={valore} onChangeText={setValore} keyboardType="numeric" />
        </>
      );
    }
    return (
      <>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity style={styles.dataBtn} onPress={() => setMostra(true)}>
          <Text style={[styles.dataBtnText, !valore && { color: "#333" }]}>
            {valoreObj ? formatDataLeggibile(valoreObj) : "Seleziona una data..."}
          </Text>
          <Text style={styles.dataIcon}>📅</Text>
        </TouchableOpacity>
        {mostra && (
          <DateTimePicker
            value={valoreObj || dopodomani}
            mode="date"
            minimumDate={dopodomani}
            maximumDate={maxData}
            onChange={(event, selectedDate) => {
              setMostra(false);
              if (selectedDate) {
                setValoreObj(selectedDate);
                setValore(formatData(selectedDate));
              }
            }}
          />
        )}
      </>
    );
  }

  function renderPickerLuogo() {
    return (
      <View>
        <Text style={styles.label}>SCEGLI IL LUOGO</Text>
        <TouchableOpacity style={styles.pickerBtn} onPress={() => setMostraLuoghi(!mostraLuoghi)}>
          <Text style={[styles.pickerBtnText, !nomeLuogoScelto && { color: "#333" }]}>
            {nomeLuogoScelto || "Seleziona un luogo..."}
          </Text>
          <Text style={styles.pickerArrow}>{mostraLuoghi ? "▲" : "▼"}</Text>
        </TouchableOpacity>
        {mostraLuoghi && (
          <View style={styles.pickerDropdown}>
            <TextInput style={styles.pickerSearch} placeholder="Cerca luogo..." placeholderTextColor="#333" value={cercaLuogo} onChangeText={filtraLuoghi} />
            {loadingLuoghi ? (
              <ActivityIndicator color="#FF1493" style={{ padding: 16 }} />
            ) : luoghiFiltrati.length === 0 ? (
              <Text style={styles.pickerEmpty}>Nessun luogo trovato</Text>
            ) : (
              luoghiFiltrati.map((luogo) => (
                <TouchableOpacity key={luogo.ID} style={styles.pickerItem} onPress={() => {
                  setLuogoScelto(luogo.ID);
                  setNomeLuogoScelto(luogo.Nome);
                  setMostraLuoghi(false);
                  setCercaLuogo("");
                  setLuoghiFiltrati(luoghi);
                }}>
                  <Text style={styles.pickerItemText}>{luogo.Nome}</Text>
                  <Text style={styles.pickerItemSub}>{luogo.Via} {luogo.NumeroCivico}, {luogo.Citta}</Text>
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
    setLoading(true);
    setErrore("");
    try {
      const IDUtente = await AsyncStorage.getItem("IDUtente");
      const response = await fetch(`${BASE_URL}/crea-richiesta.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Titolo: titolo, DataEvento: data, Ora: ora,
          NumeroPartecipanti: numPartecipanti, Messaggio: messaggio2,
          IDLuogo: luogoScelto, IDUtente, Categoria: categoria,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setMessaggio("Richiesta inviata! Il locale la valuterà a breve.");
        setTitolo(""); setData(""); setDataObj(null); setOra("");
        setNumPartecipanti(""); setMessaggio2(""); setLuogoScelto(null);
        setNomeLuogoScelto(""); setCategoria("ALTRO");
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
    if (!titoloLocale || !descrizioneLocale || !dataLocale || !oraLocale || !prezzoLocale || !maxPartecipantiLocale) {
      setErrore("Compila tutti i campi");
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
          Titolo: titoloLocale, Descrizione: descrizioneLocale,
          DataEvento: dataLocale, Ora: oraLocale, Prezzo: prezzoLocale,
          MaxPartecipanti: maxPartecipantiLocale, IDUtente,
          Categoria: categoriaLocale, ImageUrl: imageUrlLocale || null,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setMessaggioLocale("Evento creato con successo!");
        setTitoloLocale(""); setDescrizioneLocale(""); setDataLocale("");
        setDataLocaleObj(null); setOraLocale(""); setPrezzoLocale("");
        setMaxPartecipantiLocale(""); setCategoriaLocale("ALTRO"); setImageUrlLocale("");
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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← INDIETRO</Text>
          </TouchableOpacity>
          <Text style={styles.titoloPagina}>CREA EVENTO</Text>
          <View style={styles.linea} />
          <Text style={styles.subtitle}>Crea un evento direttamente nel tuo locale.</Text>

          <Text style={styles.label}>TITOLO EVENTO</Text>
          <TextInput style={styles.input} placeholder="es. Serata Jazz" placeholderTextColor="#333" value={titoloLocale} onChangeText={setTitoloLocale} />

          <Text style={styles.label}>DESCRIZIONE</Text>
          <TextInput style={[styles.input, styles.inputMultiline]} placeholder="Descrivi l'evento..." placeholderTextColor="#333" value={descrizioneLocale} onChangeText={setDescrizioneLocale} multiline numberOfLines={4} />

          {renderCategorie(categoriaLocale, setCategoriaLocale)}
          {renderCampoData("DATA", dataLocale, dataLocaleObj, setDataLocale, setDataLocaleObj, mostraCalendarioLocale, setMostraCalendarioLocale)}

          <Text style={styles.label}>ORA (HH:MM)</Text>
          <TextInput style={styles.input} placeholder="es. 21:00" placeholderTextColor="#333" value={oraLocale} onChangeText={setOraLocale} keyboardType="numeric" />

          <Text style={styles.label}>PREZZO (€)</Text>
          <TextInput style={styles.input} placeholder="es. 10 (0 se gratuito)" placeholderTextColor="#333" value={prezzoLocale} onChangeText={setPrezzoLocale} keyboardType="numeric" />

          <Text style={styles.label}>MAX PARTECIPANTI</Text>
          <TextInput style={styles.input} placeholder="es. 100" placeholderTextColor="#333" value={maxPartecipantiLocale} onChangeText={setMaxPartecipantiLocale} keyboardType="numeric" />

          <Text style={styles.label}>URL IMMAGINE (opzionale)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://images.unsplash.com/..."
            placeholderTextColor="#333"
            value={imageUrlLocale}
            onChangeText={setImageUrlLocale}
            autoCapitalize="none"
            keyboardType="url"
          />
          <Text style={styles.urlSuggerimento}>
            💡 Trova foto gratis su unsplash.com — cerca l'evento, clicca su una foto e copia il link
          </Text>

          {errore ? <Text style={styles.error}>{errore}</Text> : null}
          {messaggioLocale ? <Text style={styles.success}>{messaggioLocale}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleCreaEvento} disabled={loadingLocale}>
            <LinearGradient colors={["#FF1493", "#C800FF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buttonGradient}>
              {loadingLocale ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>CREA EVENTO →</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← INDIETRO</Text>
        </TouchableOpacity>
        <Text style={styles.titoloPagina}>RICHIESTA EVENTO</Text>
        <View style={styles.linea} />
        <Text style={styles.subtitle}>Invia una richiesta al locale. Se approvata, il tuo evento sarà visibile a tutti.</Text>

        <Text style={styles.label}>TITOLO EVENTO</Text>
        <TextInput style={styles.input} placeholder="es. Festa di compleanno" placeholderTextColor="#333" value={titolo} onChangeText={setTitolo} />

        {renderCategorie(categoria, setCategoria)}
        {renderCampoData("DATA", data, dataObj, setData, setDataObj, mostraCalendario, setMostraCalendario)}

        <Text style={styles.label}>ORA (HH:MM)</Text>
        <TextInput style={styles.input} placeholder="es. 21:00" placeholderTextColor="#333" value={ora} onChangeText={setOra} keyboardType="numeric" />

        <Text style={styles.label}>NUMERO PARTECIPANTI</Text>
        <TextInput style={styles.input} placeholder="es. 50" placeholderTextColor="#333" value={numPartecipanti} onChangeText={setNumPartecipanti} keyboardType="numeric" />

        <Text style={styles.label}>MESSAGGIO AL LOCALE (opzionale)</Text>
        <TextInput style={[styles.input, styles.inputMultiline]} placeholder="Descrivi il tuo evento..." placeholderTextColor="#333" value={messaggio2} onChangeText={setMessaggio2} multiline numberOfLines={4} />

        {renderPickerLuogo()}

        {errore ? <Text style={styles.error}>{errore}</Text> : null}
        {messaggio ? <Text style={styles.success}>{messaggio}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleInviaRichiesta} disabled={loading}>
          <LinearGradient colors={["#FF1493", "#C800FF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buttonGradient}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>INVIA RICHIESTA →</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  content: { padding: 28, paddingBottom: 80 },
  backBtn: { marginBottom: 20, marginTop: 20 },
  backText: { color: "#FF1493", fontSize: 10, letterSpacing: 3 },
  titoloPagina: { color: "#fff", fontSize: 28, fontWeight: "900", letterSpacing: -1, marginBottom: 12 },
  linea: { height: 2, backgroundColor: "#FF1493", width: 40, marginBottom: 16 },
  subtitle: { color: "#333", fontSize: 12, lineHeight: 18, marginBottom: 24 },
  label: { color: "#333", fontSize: 9, letterSpacing: 4, marginBottom: 8, marginTop: 16 },
  input: { borderBottomWidth: 1, borderBottomColor: "#1a1a1a", color: "#fff", fontSize: 15, fontWeight: "300", paddingVertical: 12 },
  inputMultiline: { borderWidth: 1, borderColor: "#1a1a1a", padding: 12, height: 100, textAlignVertical: "top", marginTop: 8 },
  dataBtn: { borderBottomWidth: 1, borderBottomColor: "#1a1a1a", paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dataBtnText: { color: "#fff", fontSize: 14, fontWeight: "300" },
  dataIcon: { fontSize: 16 },
  catGradient: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: 100 },
  catDefault: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: 100, borderWidth: 1, borderColor: "#1a1a1a" },
  catText: { color: "#333", fontSize: 10, letterSpacing: 2 },
  catTextActive: { color: "#fff", fontSize: 10, letterSpacing: 2, fontWeight: "700" },
  pickerBtn: { borderWidth: 1, borderColor: "#1a1a1a", padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  pickerBtnText: { color: "#fff", fontSize: 14, fontWeight: "300" },
  pickerArrow: { color: "#FF1493", fontSize: 12 },
  pickerDropdown: { borderWidth: 1, borderColor: "#1a1a1a", borderTopWidth: 0, backgroundColor: "#0a0a0a", maxHeight: 200 },
  pickerSearch: { borderBottomWidth: 1, borderBottomColor: "#1a1a1a", color: "#fff", padding: 12, fontSize: 13 },
  pickerItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#111" },
  pickerItemText: { color: "#fff", fontSize: 13, fontWeight: "300" },
  pickerItemSub: { color: "#333", fontSize: 11, marginTop: 2 },
  pickerEmpty: { color: "#333", padding: 16, textAlign: "center", fontSize: 12 },
  urlSuggerimento: { color: "#333", fontSize: 10, marginTop: 6, lineHeight: 16 },
  error: { color: "#FF1493", fontSize: 12, textAlign: "center", marginTop: 16 },
  success: { color: "#39FF6E", fontSize: 12, textAlign: "center", marginTop: 16, letterSpacing: 1 },
  button: { borderRadius: 14, overflow: "hidden", marginTop: 36, marginBottom: 24 },
  buttonGradient: { padding: 18, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 13, fontWeight: "700", letterSpacing: 4 },
});