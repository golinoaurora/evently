import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
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

export default function CreaLuogo() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [via, setVia] = useState("");
  const [numeroCivico, setNumeroCivico] = useState("");
  const [citta, setCitta] = useState("");
  const [cap, setCap] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");

  async function handleCreaLuogo() {
    if (!nome || !via || !numeroCivico || !citta || !cap || !descrizione) {
      setErrore("Compila tutti i campi");
      return;
    }

    setLoading(true);
    setErrore("");

    try {
      const IDUtente = await AsyncStorage.getItem("IDUtente");
      const response = await fetch(`${BASE_URL}/crea-luogo.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Nome: nome,
          Via: via,
          NumeroCivico: numeroCivico,
          Citta: citta,
          CAP: cap,
          Descrizione: descrizione,
          IDUtente: IDUtente,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.replace("/locale");
      } else {
        setErrore(data.message);
      }
    } catch (e) {
      setErrore("Errore di connessione.");
    } finally {
      setLoading(false);
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
        <View style={styles.header}>
          <Text style={styles.title}>EVENTLY</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.subtitle}>CONFIGURA IL TUO LOCALE</Text>
        </View>

        <Text style={styles.descrizioneText}>
          Prima di creare eventi, inserisci i dati del tuo locale.
        </Text>

        <Text style={styles.label}>NOME LOCALE</Text>
        <TextInput
          style={styles.input}
          placeholder="es. Luluma Club"
          placeholderTextColor="#555"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>VIA/PIAZZA</Text>
        <TextInput
          style={styles.input}
          placeholder="es. Via Roma"
          placeholderTextColor="#555"
          value={via}
          onChangeText={setVia}
        />

        <Text style={styles.label}>NUMERO CIVICO</Text>
        <TextInput
          style={styles.input}
          placeholder="es. 15/A"
          placeholderTextColor="#555"
          value={numeroCivico}
          onChangeText={setNumeroCivico}
        />

        <Text style={styles.label}>CITTÀ</Text>
        <TextInput
          style={styles.input}
          placeholder="es. Reggio Emilia"
          placeholderTextColor="#555"
          value={citta}
          onChangeText={setCitta}
        />

        <Text style={styles.label}>CAP</Text>
        <TextInput
          style={styles.input}
          placeholder="es. 42121"
          placeholderTextColor="#555"
          value={cap}
          onChangeText={setCap}
          keyboardType="numeric"
        />

        <Text style={styles.label}>DESCRIZIONE</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Descrivi il tuo locale..."
          placeholderTextColor="#555"
          value={descrizione}
          onChangeText={setDescrizione}
          multiline
          numberOfLines={4}
        />

        {errore ? <Text style={styles.error}>{errore}</Text> : null}

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreaLuogo}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0a0a0a" />
          ) : (
            <Text style={styles.buttonText}>SALVA E CONTINUA</Text>
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
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
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
  descrizioneText: {
    color: "#555",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 30,
    textAlign: "center",
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
  error: {
    color: "#e07070",
    fontSize: 12,
    textAlign: "center",
    marginTop: 16,
  },
  button: {
    backgroundColor: "#c9b99a",
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 36,
  },
  buttonText: {
    color: "#0a0a0a",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 4,
  },
});