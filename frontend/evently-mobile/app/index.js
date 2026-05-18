import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function Splash() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const line1Anim = useRef(new Animated.Value(0)).current;
  const line2Anim = useRef(new Animated.Value(0)).current;
  const line3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]),
      Animated.stagger(150, [
        Animated.timing(line1Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(line2Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(line3Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(taglineAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/login");
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Glow sfondo */}
      <View style={styles.glowPink} />
      <View style={styles.glowBlue} />
      <View style={styles.glowGreen} />

      {/* Logo testo */}
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.logoText}>
          EVEN<Text style={styles.logoAccent}>TLY</Text>
        </Text>

        {/* Linee colorate animate */}
        <View style={styles.colorLines}>
          <Animated.View style={[styles.colorLine, { backgroundColor: "#FF1493", width: 50, opacity: line1Anim }]} />
          <Animated.View style={[styles.colorLine, { backgroundColor: "#39FF6E", width: 30, opacity: line2Anim }]} />
          <Animated.View style={[styles.colorLine, { backgroundColor: "#1E50FF", width: 40, opacity: line3Anim }]} />
        </View>
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineAnim }]}>
        YOUR NIGHT STARTS HERE
      </Animated.Text>

      {/* Dots */}
      <Animated.View style={[styles.dots, { opacity: taglineAnim }]}>
        <View style={[styles.dot, { backgroundColor: "#FF1493" }]} />
        <View style={[styles.dot, { backgroundColor: "#39FF6E" }]} />
        <View style={[styles.dot, { backgroundColor: "#1E50FF" }]} />
      </Animated.View>

      {/* Footer */}
      <Animated.Text style={[styles.footer, { opacity: taglineAnim }]}>
        EVENTLY © 2026
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  glowPink: { position: "absolute", top: height * 0.1, right: -80, width: 250, height: 250, borderRadius: 125, backgroundColor: "rgba(255,20,147,0.1)" },
  glowBlue: { position: "absolute", bottom: height * 0.1, left: -80, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(30,80,255,0.08)" },
  glowGreen: { position: "absolute", top: height * 0.5, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(57,255,110,0.05)" },
  logoContainer: { alignItems: "flex-start", marginBottom: 24 },
  logoText: { color: "#fff", fontSize: 72, fontWeight: "900", letterSpacing: -3, lineHeight: 72 },
  logoAccent: { color: "#FF1493" },
  colorLines: { flexDirection: "column", gap: 5, marginTop: 16 },
  colorLine: { height: 3, borderRadius: 2 },
  tagline: { color: "#333", fontSize: 11, letterSpacing: 6, fontWeight: "300", marginTop: 8 },
  dots: { flexDirection: "row", gap: 6, marginTop: 32 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  footer: { position: "absolute", bottom: 48, color: "#1a1a1a", fontSize: 9, letterSpacing: 4 },
});