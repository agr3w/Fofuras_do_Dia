// ============================================================
//  CORREIO — Tela da Carta Aberta
//  Exibe a mensagem diária da Rana. Busca no Firestore a
//  mensagem com unlockDate === hoje. Mostra placeholder
//  enquanto não há conexão ou mensagem cadastrada.
// ============================================================

import { collection, getDocs } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import DecorationRow from "../../components/DecorationRow";
import FofoCard from "../../components/FofoCard";
import { db } from "../../services/firebase";
import { readCache, STORAGE_KEYS } from "../../services/syncService";
import { borderRadius, colors, shadows, spacing } from "../../theme/theme";

const { width } = Dimensions.get("window");

// Retorna a data de hoje no formato "YYYY-MM-DD"
function getTodayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Mensagem placeholder quando não há nada no Firestore
const PLACEHOLDER_MESSAGE = {
  text: "Ei, Rana! 🌸\n\nAinda não há uma cartinha para hoje, mas saiba que você é a coisa mais fofa e especial do universo. 💕\n\nVolta amanhã pra ver sua surpresa! 🐸🧸",
  sender: "Com todo o amor do mundo 💌",
};

export default function CorreioScreen() {
  const [messages, setMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaceholder, setIsPlaceholder] = useState(false);

  // Animações de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  // Animação de transição de texto
  const textFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animação de abertura da carta
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Busca mensagem do Firestore
    loadTodayMessage();
  }, []);

  async function loadTodayMessage() {
    const today = getTodayString();

    try {
      // 1ª tentativa: AsyncStorage (offline-first)
      const cached = await readCache(STORAGE_KEYS.MESSAGES);
      let todayMsgs = [];

      if (cached.length > 0) {
        // Filtra localmente pela data de hoje
        todayMsgs = cached.filter((m) => m.unlockDate === today);
      }

      if (todayMsgs.length === 0) {
        // 2ª tentativa: Firestore (online fallback)
        const snap = await getDocs(collection(db, "messages"));
        const allMessages = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        todayMsgs = allMessages.filter((m) => m.unlockDate === today);
      }

      if (todayMsgs.length > 0) {
        setMessages(todayMsgs);
        setCurrentIndex(0);
        setIsPlaceholder(false);
      } else {
        setMessages([PLACEHOLDER_MESSAGE]);
        setCurrentIndex(0);
        setIsPlaceholder(true);
      }
    } catch (error) {
      console.warn("[Correio] Erro ao carregar mensagem:", error.message);
      setMessages([PLACEHOLDER_MESSAGE]);
      setCurrentIndex(0);
      setIsPlaceholder(true);
    } finally {
      setLoading(false);
    }
  }

  const animateTransition = (callback) => {
    Animated.timing(textFadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const nextMessage = () => {
    if (currentIndex < messages.length - 1) {
      animateTransition(() => setCurrentIndex(currentIndex + 1));
    }
  };

  const prevMessage = () => {
    if (currentIndex > 0) {
      animateTransition(() => setCurrentIndex(currentIndex - 1));
    }
  };

  const currentMsg = messages[currentIndex] || PLACEHOLDER_MESSAGE;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Decoração do topo */}
        <DecorationRow
          emojis={["💌", "🌸", "💕", "🌸", "💌"]}
          fontSize={28}
          style={styles.topDecoration}
        />

        {/* Card da Carta Aberta */}
        <Animated.View
          style={[
            styles.letterWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Aba superior da carta */}
          <View style={styles.letterTop}>
            <Text style={styles.letterTopEmoji}>💌</Text>
            <Text style={styles.letterTopTitle}>Uma cartinha pra Rana</Text>
            <Text style={styles.letterDate}>
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Text>
          </View>

          {/* Corpo da carta */}
          <View style={styles.letterBody}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primaryAccent} />
                <Text style={styles.loadingText}>Abrindo a cartinha... 🎀</Text>
              </View>
            ) : (
              <Animated.View style={{ opacity: textFadeAnim, flex: 1, justifyContent: 'center' }}>
                {/* Linhas decorativas de papel pautado */}
                {[...Array(3)].map((_, i) => (
                  <View key={i} style={styles.paperLine} />
                ))}

                {/* Texto da mensagem */}
                <Text style={styles.messageText}>{currentMsg.text}</Text>

                {/* Linhas decorativas finais */}
                {[...Array(2)].map((_, i) => (
                  <View key={i} style={styles.paperLine} />
                ))}

                {/* Assinatura */}
                <View style={styles.signatureContainer}>
                  <Text style={styles.signatureText}>
                    {currentMsg.sender ?? "Com amor 💕"}
                  </Text>
                  <Text style={styles.signatureEmoji}>🐸🧸</Text>
                </View>
              </Animated.View>
            )}
            
            {/* Navegação caso tenha mais de 1 mensagem */}
            {!loading && messages.length > 1 && (
              <>
                {currentIndex > 0 && (
                  <TouchableOpacity style={[styles.navButton, styles.navLeft]} onPress={prevMessage}>
                    <Ionicons name="chevron-back" size={24} color={colors.white} />
                  </TouchableOpacity>
                )}
                {currentIndex < messages.length - 1 && (
                  <TouchableOpacity style={[styles.navButton, styles.navRight]} onPress={nextMessage}>
                    <Ionicons name="chevron-forward" size={24} color={colors.white} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* Rodapé com aviso de placeholder ou paginação */}
          <View style={styles.footerBadge}>
            {isPlaceholder && !loading ? (
              <Text style={styles.footerText}>
                💭 Mensagem especial chegando em breve!
              </Text>
            ) : !loading && messages.length > 1 ? (
              <Text style={styles.footerText}>
                Cartinha {currentIndex + 1} de {messages.length} 🌸
              </Text>
            ) : null}
          </View>
        </Animated.View>

        {/* Decorações do fundo */}
        <DecorationRow
          emojis={["🐸", "💕", "🧸", "💕", "🐸"]}
          fontSize={24}
          style={styles.bottomDecoration}
        />

        {/* Card de carinho extra */}
        <FofoCard
          backgroundColor={colors.cardPink}
          style={styles.bonusCard}
          shadow="light"
        >
          <Text style={styles.bonusTitle}>Sabia que...</Text>
          <Text style={styles.bonusText}>
            Você é a coisa mais fofa que já aconteceu na minha vida. 🌸
          </Text>
        </FofoCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cardPink,
  },
  scrollContent: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  topDecoration: {
    marginBottom: spacing.lg,
  },
  bottomDecoration: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },

  // Carta
  letterWrapper: {
    width: width - spacing.lg * 2,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.envelopeBorder,
    ...shadows.medium,
  },
  letterTop: {
    backgroundColor: colors.primaryAccent,
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.envelopeBorder,
  },
  letterTopEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  letterTopTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.white,
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  letterDate: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
    fontStyle: "italic",
    textTransform: "capitalize",
  },

  letterBody: {
    padding: spacing.xl,
    backgroundColor: colors.envelopeYellow,
    minHeight: 260,
    justifyContent: "center",
  },

  paperLine: {
    height: 1,
    backgroundColor: colors.envelopeBorder,
    marginVertical: 10,
    opacity: 0.5,
  },

  // Loading
  loadingContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 15,
    color: colors.textMedium,
    fontStyle: "italic",
  },

  // Mensagem
  messageText: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.textDark,
    textAlign: "center",
    fontStyle: "italic",
    paddingHorizontal: spacing.sm,
  },

  // Assinatura
  signatureContainer: {
    alignItems: "flex-end",
    marginTop: spacing.lg,
    gap: 4,
  },
  signatureText: {
    fontSize: 14,
    color: colors.textMedium,
    fontStyle: "italic",
    fontWeight: "600",
  },
  signatureEmoji: {
    fontSize: 22,
  },

  // Badge placeholder / paginação
  footerBadge: {
    backgroundColor: colors.bearLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.envelopeBorder,
    minHeight: 36,
  },
  footerText: {
    fontSize: 12,
    color: colors.textMedium,
    fontStyle: "italic",
    textAlign: "center",
  },
  
  // Navegação
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    ...shadows.soft,
  },
  navLeft: {
    left: -18,
  },
  navRight: {
    right: -18,
  },

  // Bônus
  bonusCard: {
    width: width - spacing.lg * 2,
    marginTop: spacing.sm,
  },
  bonusTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMedium,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bonusText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textDark,
    fontStyle: "italic",
  },
});
