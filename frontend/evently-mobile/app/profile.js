import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import BottomBar from "../components/BottomBar";
import Avatar from "boring-avatars";
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

  useFocusEffect(
    useCallback(() => {
      caricaProfilo();
    }, [])
  );

  async function caricaProfilo() {
    try {
      const IDUtente = await AsyncStorage.getItem("IDUtente");
      const t = await AsyncStorage.getItem("tipo");
      setTipo(t);
      const response = await fetch(`${BASE_URL}/profilo.php?IDUtente=${IDUtente}`);
      const data = await response.json();
      if (data.success) setUtente(data.utente);
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

        <View style={styles.header}>
          <Text style={styles.title}>EVENTLY</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.subtitle}>IL MIO PROFILO</Text>
        </View>

        <View style={styles.avatarContainer}>
          <Avatar
            size={80}
            name={utente?.Nome || "utente"}
            variant={utente?.avatar_config || "beam"}
            colors={["#c9b99a", "#a08060", "#7a5c3a", "#3a2a1a", "#1a1008"]}
          />
          <Text style={styles.nomeUtente}>{utente?.Nome}</Text>
          <Text style={styles.tipoUtente}>{tipo?.toUpperCase()}</Text>

          {utente?.bio ? (
            <Text style={styles.bioText}>{utente.bio}</Text>
          ) : null}

          {tipo === "privato" && (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push("/modifica-profilo")}
            >
              <Text style={styles.editBtnText}>MODIFICA PROFILO</Text>
            </TouchableOpacity>
          )}
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
  nomeUtente: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "200",
    letterSpacing: 4,
    marginBottom: 8,
    marginTop: 16,
  },
  tipoUtente: {
    color: "#555",
    fontSize: 10,
    letterSpacing: 4,
  },
  bioText: {
    color: "#888",
    fontSize: 13,
    fontWeight: "200",
    letterSpacing: 1,
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  editBtn: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#c9b99a",
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  editBtnText: {
    color: "#c9b99a",
    fontSize: 9,
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