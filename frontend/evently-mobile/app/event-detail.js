import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
      if (data.success) setPreferito(data.preferito);
    } catch (e) {}
  }

  async function handlePreferito() {
    try {
      const IDUtente = await AsyncStorage.getItem("IDUtente");
      const response = await fetch(`${BASE_URL}/aggiungi-preferito.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ IDEvento: id, IDUtente }),
      });
      const data = await response.json();
      if (data.success) setPreferito(data.preferito);
    } catch (e) {}
  }

  async function handlePartecipa() {
    try {
      const IDUtente = await AsyncStorage.getItem("IDUtente");
      const response = await fetch(`${BASE_URL}/partecipa.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ IDEvento: id, IDUtente }),
      });
      const data = await response.json();
      setMessaggio(data.message);
      caricaPartecipanti();
    } catch (e) {
      setMessaggio("Errore di connessione.");
    }
  }

  async function caricaPartecipanti() {
    try {
      const response = await fetch(`${BASE_URL}/partecipanti-evento.php?IDEvento=${id}`);
      const data = await response.json();
      if (data.success) setPartecipanti(data.partecipanti);
    } catch (e) {}
  }

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator color="#FF1493" size="large" />
    </View>
  );

  if (error) return (
    <View style={styles.loadingContainer}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  const postiRimanenti = Math.max(0, evento.MaxPartecipanti - evento.Iscritti);
  const isGratuito = evento.Prezzo == 0;
  const hasImage = evento.ImageUrl && evento.ImageUrl.trim() !== "";

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Hero con foto o gradiente */}
        <View style={styles.hero}>
          {hasImage ? (
            <Image
              source={{ uri: evento.ImageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={["#FF1493", "#C800FF", "#1E50FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroImage}
            />
          )}

          {/* Overlay scuro */}
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
            style={styles.heroOverlayGradient}
          />

          {/* Bottoni navigazione */}
          <View style={styles.heroNav}>
            <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            {tipo === "privato" && (
              <TouchableOpacity style={styles.navBtn} onPress={handlePreferito}>
                <Ionicons
                  name={preferito ? "heart" : "heart-outline"}
                  size={22}
                  color={preferito ? "#FF1493" : "#fff"}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Data grande in basso */}
          <View style={styles.heroDateBox}>
            <Text style={styles.heroGiorno}>
              {new Date(evento.DataEvento).toLocaleDateString("it-IT", { day: "2-digit" })}
            </Text>
            <Text style={styles.heroMese}>
              {new Date(evento.DataEvento).toLocaleDateString("it-IT", { month: "short" }).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Contenuto */}
        <View style={styles.body}>

          <View style={styles.badgeRow}>
            {evento.Categoria && (
              <View style={styles.badgeCategoria}>
                <Text style={styles.badgeCategoriaText}>{evento.Categoria}</Text>
              </View>
            )}
            <View style={isGratuito ? styles.badgeFree : styles.badgePrice}>
              <Text style={isGratuito ? styles.badgeFreeText : styles.badgePriceText}>
                {isGratuito ? "GRATUITO" : `€ ${evento.Prezzo}`}
              </Text>
            </View>
          </View>

          <Text style={styles.titolo}>{evento.Titolo}</Text>

          <View style={styles.infoRiga}>
            <Ionicons name="location-outline" size={14} color="#39FF6E" />
            <Text style={styles.infoText}>{evento.NomeLuogo}</Text>
          </View>
          <View style={styles.infoRiga}>
            <Ionicons name="map-outline" size={14} color="#39FF6E" />
            <Text style={styles.infoText}>{evento.Via} {evento.NumeroCivico}, {evento.Citta}</Text>
          </View>
          <View style={styles.infoRiga}>
            <Ionicons name="time-outline" size={14} color="#39FF6E" />
            <Text style={styles.infoText}>{evento.Ora?.slice(0, 5)}</Text>
          </View>

          <View style={styles.linea} />

          <Text style={styles.sectionLabel}>DESCRIZIONE</Text>
          <Text style={styles.descrizione}>{evento.Descrizione}</Text>

          <View style={styles.linea} />

          <View style={styles.postiRow}>
            <View>
              <Text style={styles.sectionLabel}>POSTI RIMANENTI</Text>
              <Text style={[styles.postiValue, postiRimanenti <= 5 && { color: "#FF1493" }]}>
                {postiRimanenti} / {evento.MaxPartecipanti}
              </Text>
            </View>
            <View style={styles.postiBar}>
              <View style={[styles.postiBarFill, {
                width: `${Math.min(100, (evento.Iscritti / evento.MaxPartecipanti) * 100)}%`,
                backgroundColor: postiRimanenti <= 5 ? "#FF1493" : "#39FF6E"
              }]} />
            </View>
          </View>

          {messaggio ? <Text style={styles.messaggio}>{messaggio}</Text> : null}

          {tipo === "privato" && !isOrganizzatore && (
            <TouchableOpacity style={styles.btnPartecipa} onPress={handlePartecipa}>
              <LinearGradient colors={["#FF1493", "#C800FF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGradient}>
                <Text style={styles.btnText}>PARTECIPA →</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {tipo === "privato" && isOrganizzatore && (
            <View style={styles.organizzatoreBox}>
              <Ionicons name="star" size={16} color="#C9A96E" />
              <Text style={styles.organizzatoreText}>SEI L'ORGANIZZATORE</Text>
            </View>
          )}

          {(tipo === "locale" || isOrganizzatore) && (
            <View style={styles.partecipantiBox}>
              <Text style={styles.sectionLabel}>PARTECIPANTI ({partecipanti.length})</Text>
              <View style={styles.linea} />
              {partecipanti.length === 0 ? (
                <Text style={styles.emptyText}>Nessun partecipante ancora</Text>
              ) : (
                partecipanti.map((p, index) => (
                  <View key={index} style={styles.partecipanteRow}>
                    <View style={styles.partecipanteAvatar}>
                      <Text style={styles.partecipanteInitial}>{p.Nome[0]}</Text>
                    </View>
                    <View>
                      <Text style={styles.partecipanteNome}>{p.Nome}</Text>
                      <Text style={styles.partecipanteEmail}>{p.Email}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  content: { paddingBottom: 80 },
  loadingContainer: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  hero: { height: 280, position: "relative" },
  heroImage: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" },
  heroOverlayGradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  heroNav: { position: "absolute", top: 50, left: 20, right: 20, flexDirection: "row", justifyContent: "space-between" },
  navBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  heroDateBox: { position: "absolute", bottom: 20, left: 20 },
  heroGiorno: { color: "#fff", fontSize: 52, fontWeight: "900", lineHeight: 52 },
  heroMese: { color: "rgba(255,255,255,0.7)", fontSize: 14, letterSpacing: 4, fontWeight: "600" },
  body: { padding: 24 },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 16, marginTop: 4 },
  badgeCategoria: { backgroundColor: "#1a1a1a", borderRadius: 100, paddingVertical: 4, paddingHorizontal: 12 },
  badgeCategoriaText: { color: "#555", fontSize: 9, letterSpacing: 2 },
  badgeFree: { backgroundColor: "#39FF6E", borderRadius: 100, paddingVertical: 4, paddingHorizontal: 12 },
  badgeFreeText: { color: "#000", fontSize: 9, fontWeight: "700", letterSpacing: 2 },
  badgePrice: { backgroundColor: "#1E50FF", borderRadius: 100, paddingVertical: 4, paddingHorizontal: 12 },
  badgePriceText: { color: "#fff", fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  titolo: { color: "#fff", fontSize: 26, fontWeight: "900", letterSpacing: -0.5, marginBottom: 16 },
  infoRiga: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  infoText: { color: "#555", fontSize: 13 },
  linea: { height: 1, backgroundColor: "#111", marginVertical: 20 },
  sectionLabel: { color: "#333", fontSize: 9, letterSpacing: 4, marginBottom: 10 },
  descrizione: { color: "#888", fontSize: 14, lineHeight: 22 },
  postiRow: { gap: 10 },
  postiValue: { color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 4 },
  postiBar: { height: 4, backgroundColor: "#1a1a1a", borderRadius: 2, overflow: "hidden" },
  postiBarFill: { height: "100%", borderRadius: 2 },
  messaggio: { color: "#39FF6E", textAlign: "center", marginTop: 16, fontSize: 12, letterSpacing: 1 },
  btnPartecipa: { borderRadius: 14, overflow: "hidden", marginTop: 24 },
  btnGradient: { padding: 18, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 13, fontWeight: "700", letterSpacing: 4 },
  organizzatoreBox: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: "#C9A96E", padding: 16, borderRadius: 12, marginTop: 24 },
  organizzatoreText: { color: "#C9A96E", fontSize: 11, letterSpacing: 3 },
  partecipantiBox: { marginTop: 24 },
  emptyText: { color: "#333", fontSize: 12, textAlign: "center", marginTop: 16 },
  partecipanteRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#111" },
  partecipanteAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FF1493", alignItems: "center", justifyContent: "center" },
  partecipanteInitial: { color: "#fff", fontSize: 14, fontWeight: "700" },
  partecipanteNome: { color: "#fff", fontSize: 14, fontWeight: "300" },
  partecipanteEmail: { color: "#333", fontSize: 11, marginTop: 2 },
  errorText: { color: "#FF1493", textAlign: "center" },
});