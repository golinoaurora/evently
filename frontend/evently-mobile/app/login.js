import { useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  View
} from "react-native";
import BASE_URL from "../config/api";

const { width } = Dimensions.get("window");

const API_URL = `${BASE_URL}/login.php`;

export default function Login() {
  const router = useRouter();

  const [mostraPassword, setMostraPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    // Controllo campi vuoti
    if (!email || !password) {
      setError("Inserisci email e password");
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
          Email: email,
          PasswordUtente: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await AsyncStorage.setItem("IDUtente", String(data.IDUtente));
        await AsyncStorage.setItem("tipo", data.tipo);
        await AsyncStorage.setItem("IDPrivato", String(data.IDPrivato ?? ""));
        if (data.tipo === "admin") {
            router.replace("/admin");
        } else if (data.tipo === "locale") {
            router.replace("/locale");
        } else {
            router.replace("/home");
        }
      } else {
        // Mostra il messaggio di errore dal backend
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
          <Text style={styles.subtitle}>Accedi al tuo account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>

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
          <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="la tua password"
                placeholderTextColor="#555"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!mostraPassword}
              />
              <TouchableOpacity onPress={() => setMostraPassword(!mostraPassword)}>
                <Text style={styles.mostraBtn}>{mostraPassword ? "NASCONDI" : "MOSTRA"}</Text>
              </TouchableOpacity>
          </View>

          {/* Messaggio di errore */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Bottone Login */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0a0a0a" />
            ) : (
              <Text style={styles.buttonText}>ACCEDI</Text>
            )}
          </TouchableOpacity>

          {/* Link registrazione */}
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.link}>
              Non hai un account?{" "}
              <Text style={styles.linkBold}>Registrati</Text>
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
  passwordContainer: {
  flexDirection: "row",
  alignItems: "center",
  borderBottomWidth: 1,
  borderBottomColor: "#333",
  },
  inputPassword: {
    flex: 1,
    color: "#ffffff",
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  mostraBtn: {
    color: "#c9b99a",
    fontSize: 9,
    letterSpacing: 2,
  },
});