import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
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
    } catch (e) {} finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await AsyncStorage.removeItem("IDUtente");
    await AsyncStorage.removeItem("tipo");
    router.replace("/login");
  }

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator color="#FF1493" size="large" />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={styles.glowPink} />
      <View style={styles.glowBlue} />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>EVEN<Text style={styles.headerAccent}>TLY</Text></Text>
          <View style={styles.colorLines}>
            <View style={[styles.colorLine, { backgroundColor: "#FF1493", width: 30 }]} />
            <View style={[styles.colorLine, { backgroundColor: "#39FF6E", width: 18 }]} />
            <View style={[styles.colorLine, { backgroundColor: "#1E50FF", width: 24 }]} />
          </View>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={["#FF1493", "#C800FF"]}
              style={styles.avatarFallback}
            >
              <Text style={styles.avatarInitial}>
                {utente?.Nome?.[0]?.toUpperCase()}
              </Text>
            </LinearGradient>
            <View style={styles.avatarBadge}>
              <View style={styles.avatarBadgeDot} />
            </View>
          </View>

          <Text style={styles.nomeUtente}>{utente?.Nome}</Text>

          <View style={styles.tipoBadge}>
            <Text style={styles.tipoText}>{tipo?.toUpperCase()}</Text>
          </View>

          {utente?.bio ? (
            <Text style={styles.bioText}>{utente.bio}</Text>
          ) : (
            <Text style={styles.bioEmpty}>Nessuna bio ancora</Text>
          )}

          {tipo === "privato" && (
            <TouchableOpacity style={styles.editBtn} onPress={() => router.push("/modifica-profilo")}>
              <LinearGradient colors={["#FF1493", "#C800FF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.editBtnGradient}>
                <Ionicons name="pencil-outline" size={12} color="#fff" />
                <Text style={styles.editBtnText}>MODIFICA PROFILO</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>EMAIL</Text>
          <Text style={styles.infoValue}>{utente?.Email}</Text>
        </View>

        <View style={styles.linea} />

        {tipo === "privato" && (
          <>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/mie-richieste")}>
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBox}>
                  <Ionicons name="document-text-outline" size={18} color="#FF1493" />
                </View>
                <Text style={styles.menuItemText}>LE MIE RICHIESTE</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/preferiti")}>
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBox}>
                  <Ionicons name="heart-outline" size={18} color="#FF1493" />
                </View>
                <Text style={styles.menuItemText}>I MIEI PREFERITI</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#333" />
            </TouchableOpacity>
          </>
        )}

        {tipo === "locale" && (
          <>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/locale")}>
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBox}>
                  <Ionicons name="clipboard-outline" size={18} color="#FF1493" />
                </View>
                <Text style={styles.menuItemText}>GESTISCI RICHIESTE</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/miei-eventi")}>
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBox}>
                  <Ionicons name="calendar-outline" size={18} color="#FF1493" />
                </View>
                <Text style={styles.menuItemText}>I MIEI EVENTI</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#333" />
            </TouchableOpacity>
          </>
        )}

        {tipo === "admin" && (
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/admin")}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBox}>
                <Ionicons name="shield-outline" size={18} color="#FF1493" />
              </View>
              <Text style={styles.menuItemText}>PANNELLO ADMIN</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#333" />
          </TouchableOpacity>
        )}

        <View style={styles.linea} />

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={16} color="#333" />
          <Text style={styles.logoutText}>ESCI</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>EVENTLY © 2026</Text>
          <View style={styles.footerDots}>
            <View style={[styles.dot, { backgroundColor: "#FF1493" }]} />
            <View style={[styles.dot, { backgroundColor: "#39FF6E" }]} />
            <View style={[styles.dot, { backgroundColor: "#1E50FF" }]} />
          </View>
        </View>

      </ScrollView>

      <BottomBar paginaAttiva="profilo" />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  container: { flex: 1, backgroundColor: "#000" },
  content: { paddingBottom: 100 },
  glowPink: { position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,20,147,0.15)" },
  glowBlue: { position: "absolute", top: 300, left: -60, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(30,80,255,0.12)" },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: "#111" },
  headerTitle: { color: "#fff", fontSize: 36, fontWeight: "900", letterSpacing: -1, marginBottom: 10 },
  headerAccent: { color: "#FF1493" },
  colorLines: { flexDirection: "column", gap: 4 },
  colorLine: { height: 2, borderRadius: 1 },
  avatarSection: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 24 },
  avatarWrapper: { position: "relative", marginBottom: 16 },
  avatarFallback: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center" },
  avatarInitial: { color: "#fff", fontSize: 38, fontWeight: "900" },
  avatarBadge: { position: "absolute", bottom: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  avatarBadgeDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: "#39FF6E" },
  nomeUtente: { color: "#fff", fontSize: 26, fontWeight: "800", letterSpacing: -0.5, marginBottom: 8 },
  tipoBadge: { borderWidth: 1, borderColor: "#333", borderRadius: 100, paddingVertical: 5, paddingHorizontal: 16, marginBottom: 12 },
  tipoText: { color: "#666", fontSize: 10, letterSpacing: 4, fontWeight: "600" },
  bioText: { color: "#fff", fontSize: 14, textAlign: "center", paddingHorizontal: 40, lineHeight: 21 },
  bioEmpty: { color: "#333", fontSize: 13, textAlign: "center", fontStyle: "italic" },
  editBtn: { borderRadius: 100, overflow: "hidden", marginTop: 18 },
  editBtnGradient: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, paddingHorizontal: 22 },
  editBtnText: { color: "#fff", fontSize: 10, letterSpacing: 3, fontWeight: "700" },
  infoCard: { paddingHorizontal: 24, paddingVertical: 20 },
  infoLabel: { color: "#555", fontSize: 10, letterSpacing: 4, marginBottom: 6, fontWeight: "600" },
  infoValue: { color: "#fff", fontSize: 16, fontWeight: "400" },
  linea: { height: 1, backgroundColor: "#111", marginHorizontal: 24, marginVertical: 8 },
  menuItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingVertical: 18 },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  menuIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#0f0f0f", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#1a1a1a" },
  menuItemText: { color: "#fff", fontSize: 13, letterSpacing: 2, fontWeight: "500" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 24, marginTop: 24, borderWidth: 1, borderColor: "#222", borderRadius: 14, paddingVertical: 16 },
  logoutText: { color: "#555", fontSize: 12, letterSpacing: 4 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, marginTop: 32 },
  footerText: { color: "#222", fontSize: 10, letterSpacing: 3 },
  footerDots: { flexDirection: "row", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});