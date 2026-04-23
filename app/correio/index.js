// ============================================================
//  CORREIO — Tela da Carta Aberta
//  Exibe a mensagem diária da Rana. Busca no Firestore a
//  mensagem com unlockDate === hoje. Mostra placeholder
//  enquanto não há conexão ou mensagem cadastrada.
// ============================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import DecorationRow from '../../components/DecorationRow';
import FofoCard from '../../components/FofoCard';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme/theme';

const { width } = Dimensions.get('window');

// Retorna a data de hoje no formato "YYYY-MM-DD"
function getTodayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Mensagem placeholder quando não há nada no Firestore
const PLACEHOLDER_MESSAGE = {
  text: 'Ei, Rana! 🌸\n\nAinda não há uma cartinha para hoje, mas saiba que você é a coisa mais fofa e especial do universo. 💕\n\nVolta amanhã pra ver sua surpresa! 🐸🧸',
  sender: 'Com todo o amor do mundo 💌',
};

export default function CorreioScreen() {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaceholder, setIsPlaceholder] = useState(false);

  // Animações de entrada
  const fadeAnim = useRef ? useRef(new Animated.Value(0)).current : new Animated.Value(0);
  const scaleAnim = useRef ? useRef(new Animated.Value(0.85)).current : new Animated.Value(0.85);

  // Fix: usar import do useRef
  const fadeRef = React.useRef(new Animated.Value(0));
  const scaleRef = React.useRef(new Animated.Value(0.85));

  useEffect(() => {
    // Animação de abertura da carta
    Animated.parallel([
      Animated.timing(fadeRef.current, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleRef.current, {
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
    try {
      const today = getTodayString();
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, where('unlockDate', '==', today));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setMessage(data);
        setIsPlaceholder(false);
      } else {
        // Sem mensagem para hoje — usa placeholder
        setMessage(PLACEHOLDER_MESSAGE);
        setIsPlaceholder(true);
      }
    } catch (error) {
      console.warn('Firebase não conectado ou erro ao buscar mensagem:', error.message);
      // Mostra placeholder graciosamente
      setMessage(PLACEHOLDER_MESSAGE);
      setIsPlaceholder(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Decoração do topo */}
        <DecorationRow
          emojis={['💌', '🌸', '💕', '🌸', '💌']}
          fontSize={28}
          style={styles.topDecoration}
        />

        {/* Card da Carta Aberta */}
        <Animated.View
          style={[
            styles.letterWrapper,
            {
              opacity: fadeRef.current,
              transform: [{ scale: scaleRef.current }],
            },
          ]}
        >
          {/* Aba superior da carta */}
          <View style={styles.letterTop}>
            <Text style={styles.letterTopEmoji}>💌</Text>
            <Text style={styles.letterTopTitle}>Uma cartinha pra Rana</Text>
            <Text style={styles.letterDate}>
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
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
              <>
                {/* Linhas decorativas de papel pautado */}
                {[...Array(3)].map((_, i) => (
                  <View key={i} style={styles.paperLine} />
                ))}

                {/* Texto da mensagem */}
                <Text style={styles.messageText}>{message?.text}</Text>

                {/* Linhas decorativas finais */}
                {[...Array(2)].map((_, i) => (
                  <View key={i} style={styles.paperLine} />
                ))}

                {/* Assinatura */}
                <View style={styles.signatureContainer}>
                  <Text style={styles.signatureText}>
                    {message?.sender ?? 'Com amor 💕'}
                  </Text>
                  <Text style={styles.signatureEmoji}>🐸🧸</Text>
                </View>
              </>
            )}
          </View>

          {/* Rodapé com aviso de placeholder */}
          {isPlaceholder && !loading && (
            <View style={styles.placeholderBadge}>
              <Text style={styles.placeholderText}>
                💭 Mensagem especial chegando em breve!
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Decorações do fundo */}
        <DecorationRow
          emojis={['🐸', '💕', '🧸', '💕', '🐸']}
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
    alignItems: 'center',
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
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.envelopeBorder,
    ...shadows.medium,
  },
  letterTop: {
    backgroundColor: colors.primaryAccent,
    alignItems: 'center',
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
    fontWeight: '800',
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  letterDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    fontStyle: 'italic',
    textTransform: 'capitalize',
  },

  letterBody: {
    padding: spacing.xl,
    backgroundColor: colors.envelopeYellow,
    minHeight: 260,
    justifyContent: 'center',
  },

  paperLine: {
    height: 1,
    backgroundColor: colors.envelopeBorder,
    marginVertical: 10,
    opacity: 0.5,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 15,
    color: colors.textMedium,
    fontStyle: 'italic',
  },

  // Mensagem
  messageText: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.textDark,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: spacing.sm,
  },

  // Assinatura
  signatureContainer: {
    alignItems: 'flex-end',
    marginTop: spacing.lg,
    gap: 4,
  },
  signatureText: {
    fontSize: 14,
    color: colors.textMedium,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  signatureEmoji: {
    fontSize: 22,
  },

  // Badge placeholder
  placeholderBadge: {
    backgroundColor: colors.bearLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.envelopeBorder,
  },
  placeholderText: {
    fontSize: 12,
    color: colors.textMedium,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Bônus
  bonusCard: {
    width: width - spacing.lg * 2,
    marginTop: spacing.sm,
  },
  bonusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMedium,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bonusText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textDark,
    fontStyle: 'italic',
  },
});
