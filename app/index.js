// ============================================================
//  HOME SCREEN - Fofuras do Dia
//  A pagina principal da Rana: fofa, colorida, cheia de amor.
// ============================================================

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DecorationRow from "../components/DecorationRow";
import { syncData } from "../services/syncService";
import { borderRadius, colors, shadows, spacing } from "../theme/theme";

const { width } = Dimensions.get("window");
const ADMIN_PIN = "1234";

export default function HomeScreen() {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [secretPin, setSecretPin] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    syncData().catch(() => {});

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Animacao fofa: pulo + balance com pausa de 2s entre cada ciclo
    Animated.loop(
      Animated.sequence([
        // Pulo para cima com balanço
        Animated.parallel([
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: -10,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: -1,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: -0.5,
              duration: 120,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 130,
              useNativeDriver: true,
            }),
          ]),
        ]),
        // Pausa de 2 segundos antes do proximo pulo
        Animated.delay(2000),
      ])
    ).start();
  }, []);

  const handleSecretPress = () => {
    setSecretPin("");
    setIsModalVisible(true);
  };
  const handlePinCancel = () => {
    setIsModalVisible(false);
    setSecretPin("");
  };
  const handlePinSubmit = () => {
    if (secretPin === ADMIN_PIN) {
      setIsModalVisible(false);
      setSecretPin("");
      router.push("/admin");
    } else {
      Alert.alert("Ops!", "PIN incorreto, fofo!");
      setSecretPin("");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecalho */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.greeting}>{"Ola, Rana! \uD83D\uDC95"}</Text>
          <Text style={styles.subtitle}>
            {"Tenho algo fofo pra voce hoje \u2728"}
          </Text>
        </Animated.View>

        {/* Fileira decorativa topo */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <DecorationRow
            emojis={[
              "\uD83D\uDC38",
              "\uD83D\uDC30",
              "\uD83C\uDF38",
              "\uD83D\uDC38",
              "\uD83D\uDC30",
              "\uD83D\uDC95",
              "\uD83D\uDC38",
            ]}
            fontSize={34}
            style={styles.topDecoration}
          />
        </Animated.View>

        {/* Personagens Sanrio */}
        <Animated.View style={[styles.sanrioRow, { opacity: fadeAnim }]}>
          <View style={styles.sanrioChar}>
            <Image
              source={require("../assets/images/sanrio/mymelody.png")}
              style={styles.sanrioImage}
              resizeMode="contain"
            />
            <Text style={styles.sanrioName}>My Melody</Text>
          </View>
          <View style={styles.sanrioChar}>
            <Image
              source={require("../assets/images/sanrio/hellokitty.png")}
              style={styles.sanrioImage}
              resizeMode="contain"
            />
            <Text style={styles.sanrioName}>Hello Kitty</Text>
          </View>
          <View style={styles.sanrioChar}>
            <Image
              source={require("../assets/images/sanrio/keroppi.png")}
              style={styles.sanrioImage}
              resizeMode="contain"
            />
            <Text style={styles.sanrioName}>Keroppi</Text>
          </View>
          <View style={styles.sanrioChar}>
            <Image
              source={require("../assets/images/sanrio/kuromi.png")}
              style={styles.sanrioImage}
              resizeMode="contain"
            />
            <Text style={styles.sanrioName}>Kuromi</Text>
          </View>
        </Animated.View>

        {/* Card Principal: Cartinha */}
        <Animated.View
          style={[
            styles.envelopeWrapper,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { translateY: bounceAnim },
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [-1, 1],
                    outputRange: ["-3deg", "3deg"],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/correio")}
            style={styles.envelopeTouchable}
          >
            <View style={styles.envelopeFlap}>
              <Image
                source={require("../assets/images/sanrio/envelope_icon.png")}
                style={styles.envelopeFlapImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.envelopeBody}>
              <Text style={styles.envelopeTitle}>Cartinha de Hoje</Text>
              <Text style={styles.envelopeHint}>
                {"Toque para abrir \u2728"}
              </Text>
              <View style={styles.envelopeDecors}>
                <Ionicons
                  name="flower-outline"
                  size={22}
                  color={colors.kuromiPurple}
                />
                <View style={styles.envelopeSeal}>
                  <Ionicons name="heart" size={22} color={colors.white} />
                </View>
                <Ionicons
                  name="flower-outline"
                  size={22}
                  color={colors.kuromiPurple}
                />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Fileira do meio */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <DecorationRow
            emojis={[
              "\uD83D\uDC30",
              "\uD83D\uDC90",
              "\uD83D\uDC38",
              "\uD83C\uDF37",
              "\uD83D\uDC30",
            ]}
            fontSize={28}
            style={styles.middleDecoration}
          />
        </Animated.View>

        {/* Botoes de Funcionalidades */}
        <Animated.View
          style={[
            styles.futureButtonsRow,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.futureButton,
              { backgroundColor: colors.kuromiPurple },
            ]}
            activeOpacity={0.8}
            onPress={() => router.push("/roleta")}
          >
            <Image
              source={require("../assets/images/sanrio/roulette_icon.png")}
              style={styles.futureButtonImage}
              resizeMode="contain"
            />
            <Text style={[styles.futureButtonLabel, { color: colors.white }]}>
              {"Roleta\nde Mimos"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.futureButton,
              { backgroundColor: colors.secondaryAccent },
            ]}
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert("Em breve!", "A Galeria de memorias esta chegando!")
            }
          >
            <Image
              source={require("../assets/images/sanrio/gallery_icon.png")}
              style={styles.futureButtonImage}
              resizeMode="contain"
            />
            <Text style={styles.futureButtonLabel}>
              {"Galeria\nde Lembrancas"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.futureButton,
              { backgroundColor: colors.melodyPink },
            ]}
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert("Em breve!", "Nossa playlist chegando em breve!")
            }
          >
            <Image
              source={require("../assets/images/sanrio/playlist_icon.png")}
              style={styles.futureButtonImage}
              resizeMode="contain"
            />
            <Text style={styles.futureButtonLabel}>{"Nossa\nPlaylist"}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Fileira final */}
        <DecorationRow
          emojis={[
            "\uD83D\uDC95",
            "\uD83C\uDF38",
            "\uD83D\uDC38",
            "\uD83D\uDC30",
            "\uD83C\uDF38",
            "\uD83D\uDC95",
          ]}
          fontSize={24}
          style={styles.bottomDecoration}
        />

        {/* Botao Secreto (invisivel) */}
        <TouchableOpacity
          style={styles.secretButton}
          onLongPress={handleSecretPress}
          delayLongPress={1500}
          activeOpacity={1}
        >
          <Text style={styles.secretButtonText}>*</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal PIN */}
      <Modal
        transparent
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={handlePinCancel}
      >
        <View style={styles.pinOverlay}>
          <View style={styles.pinBox}>
            <Text style={styles.pinEmoji}>{"\uD83D\uDD10"}</Text>
            <Text style={styles.pinTitle}>Acesso Secreto</Text>
            <Text style={styles.pinSubtitle}>Digite o PIN para continuar</Text>
            <TextInput
              style={styles.pinInput}
              value={secretPin}
              onChangeText={setSecretPin}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
              placeholder="&bull;&bull;&bull;&bull;"
              placeholderTextColor={colors.textLight}
              autoFocus
              onSubmitEditing={handlePinSubmit}
            />
            <View style={styles.pinButtonRow}>
              <TouchableOpacity
                style={[styles.pinButton, styles.pinButtonCancel]}
                onPress={handlePinCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.pinButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pinButton, styles.pinButtonConfirm]}
                onPress={handlePinSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.pinButtonConfirmText}>
                  {"Entrar \u2728"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundPink },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxl, alignItems: "center" },
  header: {
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  greeting: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.textDark,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMedium,
    marginTop: 6,
    textAlign: "center",
  },
  topDecoration: { marginVertical: spacing.md },
  middleDecoration: { marginVertical: spacing.md },
  bottomDecoration: { marginTop: spacing.lg, marginBottom: spacing.sm },
  sanrioRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: width - spacing.lg * 2,
    marginBottom: spacing.lg,
    backgroundColor: colors.cardWhite,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    ...shadows.light,
  },
  sanrioChar: { alignItems: "center" },
  sanrioImage: { width: 48, height: 48 },
  sanrioName: {
    fontSize: 10,
    color: colors.textMedium,
    marginTop: 4,
    fontWeight: "600",
  },
  envelopeWrapper: { width: width - spacing.lg * 2, marginBottom: spacing.md },
  envelopeTouchable: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    backgroundColor: colors.envelopeYellow,
    borderWidth: 2.5,
    borderColor: colors.envelopeBorder,
    ...shadows.medium,
  },
  envelopeFlap: {
    backgroundColor: colors.primaryAccent,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.envelopeBorder,
  },
  envelopeFlapImage: { width: 64, height: 64 },
  envelopeBody: { padding: spacing.xl, alignItems: "center" },
  envelopeTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textDark,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  envelopeHint: {
    fontSize: 14,
    color: colors.textMedium,
    marginTop: 6,
    fontStyle: "italic",
  },
  envelopeDecors: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  envelopeSeal: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.sealRed,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FF3355",
    ...shadows.soft,
  },
  futureButtonsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  futureButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    ...shadows.soft,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
  },
  futureButtonImage: { width: 32, height: 32 },
  futureButtonLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textDark,
    textAlign: "center",
    lineHeight: 15,
  },
  secretButton: { marginTop: spacing.md, padding: spacing.md, opacity: 0.15 },
  secretButtonText: { fontSize: 14, color: colors.textLight },
  pinOverlay: {
    flex: 1,
    backgroundColor: "rgba(74,74,74,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  pinBox: {
    width: "100%",
    backgroundColor: colors.cardWhite,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.cardBorder,
    ...shadows.medium,
  },
  pinEmoji: { fontSize: 40, marginBottom: spacing.sm },
  pinTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textDark,
    marginBottom: 4,
  },
  pinSubtitle: {
    fontSize: 13,
    color: colors.textMedium,
    marginBottom: spacing.lg,
    fontStyle: "italic",
  },
  pinInput: {
    width: "100%",
    backgroundColor: colors.backgroundPink,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primaryAccent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 22,
    color: colors.textDark,
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: spacing.lg,
  },
  pinButtonRow: { flexDirection: "row", gap: spacing.sm, width: "100%" },
  pinButton: {
    flex: 1,
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  pinButtonCancel: {
    backgroundColor: colors.backgroundCream,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
  },
  pinButtonCancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textMedium,
  },
  pinButtonConfirm: { backgroundColor: colors.primaryAccent, ...shadows.soft },
  pinButtonConfirmText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.white,
  },
});
