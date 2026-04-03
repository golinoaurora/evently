import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
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

const { width } = Dimensions.get("window");

const API_URL = `${BASE_URL}/register.php`;

export default function Register() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tipo, setTipo] = useState("privato"); // default: utente normale
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    if (!nome || !email || !password) {
      setError("Compila tutti i campi");
      return;
    }

      // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Inserisci un'email valida");
      return;
    }

    // Validazione password — tutti gli errori insieme
    const erroriPassword = [];
    if (password.length < 8) erroriPassword.push("almeno 8 caratteri");
    if (!/[A-Z]/.test(password)) erroriPassword.push("una lettera maiuscola");
    if (!/[0-9]/.test(password)) erroriPassword.push("un numero");
    if (!/[!@#$%^&*]/.test(password)) erroriPassword.push("un carattere speciale (!@#$%^&*)");

    if (erroriPassword.length > 0) {
      setError("La password deve contenere: " + erroriPassword.join(", "));
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Nome: nome,
          Email: email,
          PasswordUtente: password,
          tipo: tipo,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Registrazione riuscita → vai al login
        router.replace("/login");
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError("Errore di connessione. Controlla il server.");
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
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Linea decorativa top */}
        <View style={styles.lineTop} />

        {/* Titolo */}
        <View style={styles.header}>
          <Text style={styles.title}>EVENTLY</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.subtitle}>Crea il tuo account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>

          {/* Campo Nome */}
          <Text style={styles.label}>NOME</Text>
          <TextInput
            style={styles.input}
            placeholder="il tuo nome"
            placeholderTextColor="#555"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />

          {/* Campo Email */}
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="la tua email"
            placeholderTextColor="#555"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Campo Password */}
          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="scegli una password"
            placeholderTextColor="#555"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Selezione tipo account */}
          <Text style={styles.label}>TIPO ACCOUNT</Text>
          <View style={styles.tipoContainer}>
            <TouchableOpacity
              style={[styles.tipoButton, tipo === "privato" && styles.tipoSelected]}
              onPress={() => setTipo("privato")}
            >
              <Text style={[styles.tipoText, tipo === "privato" && styles.tipoTextSelected]}>
                PRIVATO
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tipoButton, tipo === "locale" && styles.tipoSelected]}
              onPress={() => setTipo("locale")}
            >
              <Text style={[styles.tipoText, tipo === "locale" && styles.tipoTextSelected]}>
                LOCALE
              </Text>
            </TouchableOpacity>
          </View>

          {/* Messaggio di errore */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Bottone Registrati */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0a0a0a" />
            ) : (
              <Text style={styles.buttonText}>REGISTRATI</Text>
            )}
          </TouchableOpacity>

          {/* Link login */}
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.link}>
              Hai già un account?{" "}
              <Text style={styles.linkBold}>Accedi</Text>
            </Text>
          </TouchableOpacity>

        </View>

        {/* Linea decorativa bottom */}
        <View style={styles.lineBottom} />

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  lineTop: {
    position: "absolute",
    top: 60,
    width: width * 0.4,
    height: 1,
    backgroundColor: "#c9b99a",
    opacity: 0.5,
  },
  lineBottom: {
    position: "absolute",
    bottom: 60,
    width: width * 0.4,
    height: 1,
    backgroundColor: "#c9b99a",
    opacity: 0.5,
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  title: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "200",
    letterSpacing: 12,
  },
  titleUnderline: {
    width: 40,
    height: 1,
    backgroundColor: "#c9b99a",
    marginTop: 10,
    marginBottom: 14,
  },
  subtitle: {
    color: "#c9b99a",
    fontSize: 11,
    letterSpacing: 4,
    fontWeight: "300",
  },
  form: {
    width: "100%",
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
  tipoContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  tipoButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
  },
  tipoSelected: {
    borderColor: "#c9b99a",
    backgroundColor: "#c9b99a22",
  },
  tipoText: {
    color: "#555",
    fontSize: 10,
    letterSpacing: 3,
  },
  tipoTextSelected: {
    color: "#c9b99a",
  },
  error: {
    color: "#e07070",
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
  link: {
    color: "#555",
    textAlign: "center",
    fontSize: 13,
  },
  linkBold: {
    color: "#c9b99a",
    fontWeight: "600",
  },
});