import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import BottomBar from "../components/BottomBar";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BASE_URL from "../config/api";

export default function Profile() {
  const router = useRouter();
  const [utente, setUtente] = useState(null);
  const [tipo, setTipo] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    caricaProfilo();
  }, []);

  async function caricaProfilo() {
    try {
      const IDUtente = await AsyncStorage.getItem("IDUtente");
      const t = await AsyncStorage.getItem("tipo");
      setTipo(t);

      const response = await fetch(`${BASE_URL}/profilo.php?IDUtente=${IDUtente}`);
      const data = await response.json();
      if (data.success) {
        setUtente(data.utente);
      }
    } catch (e) {
      console.log("Errore caricamento profilo");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await AsyncStorage.removeItem("IDUtente");
    await AsyncStorage.removeItem("tipo");
    router.replace("/login");
  }

  if (loading) return (
    <View style={styles.container}>
      <ActivityIndicator color="#c9b99a" style={{ marginTop: 40 }} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>EVENTLY</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.subtitle}>IL MIO PROFILO</Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {utente?.Nome?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.nomeUtente}>{utente?.Nome}</Text>
          <Text style={styles.tipoUtente}>{tipo?.toUpperCase()}</Text>
        </View>

        <View style={styles.linea} />

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>EMAIL</Text>
          <Text style={styles.infoValue}>{utente?.Email}</Text>
        </View>

        <View style={styles.linea} />

        {tipo === "privato" && (
          <>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/mie-richieste")}
            >
              <Text style={styles.menuItemText}>LE MIE RICHIESTE</Text>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/preferiti")}
            >
              <Text style={styles.menuItemText}>I MIEI PREFERITI</Text>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>
          </>
        )}

        {tipo === "locale" && (
          <>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/locale")}
            >
              <Text style={styles.menuItemText}>GESTISCI RICHIESTE</Text>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/miei-eventi")}
            >
              <Text style={styles.menuItemText}>I MIEI EVENTI</Text>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>
          </>
        )}

        {tipo === "admin" && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/admin")}
          >
            <Text style={styles.menuItemText}>PANNELLO ADMIN</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
        )}

        <View style={styles.linea} />

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>ESCI</Text>
        </TouchableOpacity>

      </ScrollView>

      <BottomBar paginaAttiva="profilo" />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  content: {
    paddingBottom: 60,
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
  avatarContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#c9b99a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#c9b99a",
    fontSize: 32,
    fontWeight: "200",
  },
  nomeUtente: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "200",
    letterSpacing: 4,
    marginBottom: 8,
  },
  tipoUtente: {
    color: "#555",
    fontSize: 10,
    letterSpacing: 4,
  },
  linea: {
    height: 1,
    backgroundColor: "#1a1a1a",
    marginHorizontal: 30,
  },
  infoBox: {
    padding: 30,
  },
  infoLabel: {
    color: "#c9b99a",
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 8,
  },
  infoValue: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "200",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 30,
  },
  menuItemText: {
    color: "#ffffff",
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: "300",
  },
  menuItemArrow: {
    color: "#c9b99a",
    fontSize: 16,
  },
  logoutBtn: {
    margin: 30,
    borderWidth: 1,
    borderColor: "#333",
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 40,
  },
  logoutText: {
    color: "#555",
    fontSize: 11,
    letterSpacing: 4,
  },
});