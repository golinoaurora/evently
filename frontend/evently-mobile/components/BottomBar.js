import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BottomBar({ paginaAttiva }) {
  const router = useRouter();
  const [tipo, setTipo] = useState("");

  useEffect(() => {
    caricaTipo();
  }, []);

  async function caricaTipo() {
    const t = await AsyncStorage.getItem("tipo");
    setTipo(t);
  }

  return (
    <View style={styles.bottomBar}>

      {/* Home */}
      <TouchableOpacity
        style={styles.bottomBtn}
        onPress={() => router.push("/home")}
      >
        <Text style={[styles.bottomIcon, paginaAttiva === "home" && styles.iconActive]}>
          🏠
        </Text>
      </TouchableOpacity>

      {/* Cerca */}
      <TouchableOpacity
        style={styles.bottomBtn}
        onPress={() => router.push("/home")}
      >
        <Text style={[styles.bottomIcon, paginaAttiva === "cerca" && styles.iconActive]}>
          🔍
        </Text>
      </TouchableOpacity>

      {/* Crea evento — solo privato e locale */}
      {(tipo === "privato" || tipo === "locale") && (
        <TouchableOpacity
          style={styles.bottomBtnCenter}
          onPress={() => router.push("/create-event")}
        >
          <Text style={styles.bottomIconCenter}>+</Text>
        </TouchableOpacity>
      )}

      {/* Preferiti — solo privato */}
      {tipo === "privato" && (
        <TouchableOpacity
          style={styles.bottomBtn}
          onPress={() => router.push("/preferiti")}
        >
          <Text style={[styles.bottomIcon, paginaAttiva === "preferiti" && styles.iconActive]}>
            ❤️
          </Text>
        </TouchableOpacity>
      )}

      {/* Profilo */}
      <TouchableOpacity
        style={styles.bottomBtn}
        onPress={() => router.push("/profile")}
      >
        <Text style={[styles.bottomIcon, paginaAttiva === "profilo" && styles.iconActive]}>
          👤
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
    height: 70,
    backgroundColor: "#0f0f0f",
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 10,
  },
  bottomBtn: {
    padding: 10,
  },
  bottomIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  iconActive: {
    opacity: 1,
  },
  bottomBtnCenter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#c9b99a",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomIconCenter: {
    color: "#0a0a0a",
    fontSize: 28,
    fontWeight: "200",
    lineHeight: 32,
  },
});