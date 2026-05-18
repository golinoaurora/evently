import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BASE_URL from "../config/api";

export default function BottomBar({ paginaAttiva }) {
  const router = useRouter();
  const [tipo, setTipo] = useState("");
  const [nonLette, setNonLette] = useState(0);

  useFocusEffect(
    useCallback(() => {
      caricaDati();
    }, [])
  );

  async function caricaDati() {
    const t = await AsyncStorage.getItem("tipo");
    setTipo(t);
    if (t === "privato") {
      try {
        const IDUtente = await AsyncStorage.getItem("IDUtente");
        const res = await fetch(`${BASE_URL}/notifiche.php?IDUtente=${IDUtente}`);
        const data = await res.json();
        if (data.success) setNonLette(data.nonLette);
      } catch (e) {}
    }
  }

  return (
    <View style={styles.bottomBar}>

      {/* Home */}
      <TouchableOpacity style={styles.btn} onPress={() => router.push("/home")}>
        <Ionicons
          name={paginaAttiva === "home" ? "home" : "home-outline"}
          size={24}
          color={paginaAttiva === "home" ? "#FF1493" : "#333"}
        />
        <Text style={[styles.label, paginaAttiva === "home" && styles.labelActive]}>
          Home
        </Text>
      </TouchableOpacity>

      {/* Cerca */}
      <TouchableOpacity style={styles.btn} onPress={() => router.push("/home")}>
        <Ionicons
          name={paginaAttiva === "cerca" ? "search" : "search-outline"}
          size={24}
          color={paginaAttiva === "cerca" ? "#FF1493" : "#333"}
        />
        <Text style={[styles.label, paginaAttiva === "cerca" && styles.labelActive]}>
          Cerca
        </Text>
      </TouchableOpacity>

      {/* Crea evento */}
      {(tipo === "privato" || tipo === "locale") && (
        <TouchableOpacity onPress={() => router.push("/create-event")}>
          <LinearGradient
            colors={["#FF1493", "#C800FF"]}
            style={styles.centerBtn}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Notifiche — solo privato */}
      {tipo === "privato" && (
        <TouchableOpacity style={styles.btn} onPress={() => router.push("/notifiche")}>
          <View>
            <Ionicons
              name={paginaAttiva === "notifiche" ? "notifications" : "notifications-outline"}
              size={24}
              color={paginaAttiva === "notifiche" ? "#FF1493" : "#333"}
            />
            {nonLette > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{nonLette > 9 ? "9+" : nonLette}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.label, paginaAttiva === "notifiche" && styles.labelActive]}>
            Notifiche
          </Text>
        </TouchableOpacity>
      )}

      {/* Preferiti — solo privato */}
      {tipo === "privato" && (
        <TouchableOpacity style={styles.btn} onPress={() => router.push("/preferiti")}>
          <Ionicons
            name={paginaAttiva === "preferiti" ? "heart" : "heart-outline"}
            size={24}
            color={paginaAttiva === "preferiti" ? "#FF1493" : "#333"}
          />
          <Text style={[styles.label, paginaAttiva === "preferiti" && styles.labelActive]}>
            Salvati
          </Text>
        </TouchableOpacity>
      )}

      {/* Profilo */}
      <TouchableOpacity style={styles.btn} onPress={() => router.push("/profile")}>
        <Ionicons
          name={paginaAttiva === "profilo" ? "person" : "person-outline"}
          size={24}
          color={paginaAttiva === "profilo" ? "#FF1493" : "#333"}
        />
        <Text style={[styles.label, paginaAttiva === "profilo" && styles.labelActive]}>
          Profilo
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    backgroundColor: "#000",
    borderTopWidth: 1,
    borderTopColor: "#111",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 10,
  },
  btn: {
    alignItems: "center",
    gap: 3,
  },
  label: {
    color: "#333",
    fontSize: 9,
    letterSpacing: 1,
  },
  labelActive: {
    color: "#FF1493",
  },
  centerBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#39FF6E",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#000",
    fontSize: 9,
    fontWeight: "700",
  },
});