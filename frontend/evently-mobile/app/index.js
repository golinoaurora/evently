import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Animated, Dimensions, Image, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");

export default function Splash() {
  const router = useRouter();

  // Animazione fade-in del logo
  const fadeAnim = new Animated.Value(0);
  const taglineAnim = new Animated.Value(0);

  useEffect(() => {
    // Prima appare il logo
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start(() => {
      // Poi appare il tagline
      Animated.timing(taglineAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    });

    // Dopo 3 secondi va al login
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Linea decorativa in alto */}
      <View style={styles.lineTop} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineAnim }]}>
        YOUR NIGHT STARTS HERE
      </Animated.Text>

      {/* Linea decorativa in basso */}
      <View style={styles.lineBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
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
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: width * 0.65,
    height: width * 0.65,
  },
  tagline: {
    color: "#c9b99a",
    fontSize: 11,
    letterSpacing: 6,
    fontWeight: "300",
    marginTop: 8,
  },
});