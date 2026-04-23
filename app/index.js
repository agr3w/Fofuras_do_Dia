// ============================================================
//  HOME SCREEN — Fofuras do Dia 🌸
//  A página principal da Rana: fofa, colorida, cheia de amor.
//  Sapinhos 🐸 e ursinhos 🧸 animados, cartinha clicável,
//  botões de funcionalidades futuras e botão secreto do admin.
// ============================================================

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import DecorationRow from '../components/DecorationRow';
import FofoCard from '../components/FofoCard';
import { colors, spacing, borderRadius, shadows, typography } from '../theme/theme';
import { syncData } from '../services/syncService';

const { width } = Dimensions.get('window');

// PIN do painel admin
const ADMIN_PIN = '1234';

export default function HomeScreen() {
  const router = useRouter();

  // Modal do PIN secreto
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [secretPin, setSecretPin] = useState('');

  // Animação de entrada (fade + slide up)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  // Animação de pulso no card da cartinha
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sincroniza silenciosamente em background (offline-first)
    // Se a Rana tiver internet, baixa novidades para o cache.
    // Se estiver offline, o syncData falha silenciosamente.
    syncData();

    // Entrada suave
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

    // Pulso contínuo na cartinha
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Botão secreto: abre modal de PIN (funciona em Android, iOS e Web)
  const handleSecretPress = () => {
    setSecretPin('');
    setIsModalVisible(true);
  };

  const handlePinSubmit = () => {
    if (secretPin === ADMIN_PIN) {
      setIsModalVisible(false);
      setSecretPin('');
      router.push('/admin');
    } else {
      Alert.alert('💔 Ops!', 'PIN incorreto, fofo!');
      setSecretPin('');
    }
  };

  const handlePinCancel = () => {
    setIsModalVisible(false);
    setSecretPin('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cabeçalho ───────────────────────────────────── */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.greeting}>Olá, Rana! 💕</Text>
          <Text style={styles.subtitle}>Tenho algo fofo pra você hoje ✨</Text>
        </Animated.View>

        {/* ── Fileira de Sapinhos e Ursinhos ──────────────── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <DecorationRow
            emojis={['🐸', '🧸', '🌸', '🐸', '🧸', '💕', '🐸']}
            fontSize={34}
            style={styles.topDecoration}
          />
        </Animated.View>

        {/* ── Personagens Sanrio ───────────────────────────── */}
        <Animated.View style={[styles.sanrioRow, { opacity: fadeAnim }]}>
          <View style={styles.sanrioChar}>
            <Text style={styles.sanrioEmoji}>🎀</Text>
            <Text style={styles.sanrioName}>My Melody</Text>
          </View>
          <View style={styles.sanrioChar}>
            <Text style={styles.sanrioEmoji}>🐱</Text>
            <Text style={styles.sanrioName}>Hello Kitty</Text>
          </View>
          <View style={styles.sanrioChar}>
            <Text style={styles.sanrioEmoji}>🐸</Text>
            <Text style={styles.sanrioName}>Keroppi</Text>
          </View>
          <View style={styles.sanrioChar}>
            <Text style={styles.sanrioEmoji}>🖤</Text>
            <Text style={styles.sanrioName}>Kuromi</Text>
          </View>
        </Animated.View>

        {/* ── Card Principal: Cartinha de Hoje ─────────────── */}
        <Animated.View
          style={[
            styles.envelopeWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: pulseAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/correio')}
            style={styles.envelopeTouchable}
          >
            {/* Aba do envelope (triângulo) */}
            <View style={styles.envelopeFlap}>
              <Text style={styles.envelopeFlapEmoji}>💌</Text>
            </View>

            {/* Corpo do envelope */}
            <View style={styles.envelopeBody}>
              <Text style={styles.envelopeTitle}>Cartinha de Hoje</Text>
              <Text style={styles.envelopeHint}>Toque para abrir ✨</Text>

              {/* Decorações no envelope */}
              <View style={styles.envelopeDecors}>
                <Text style={styles.envelopeDecorEmoji}>🌸</Text>
                <View style={styles.envelopeSeal}>
                  <Text style={styles.envelopeSealText}>❤️</Text>
                </View>
                <Text style={styles.envelopeDecorEmoji}>🌸</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Ursinhos e Sapinhos do meio ──────────────────── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <DecorationRow
            emojis={['🧸', '💐', '🐸', '🌷', '🧸']}
            fontSize={28}
            style={styles.middleDecoration}
          />
        </Animated.View>

        {/* ── Botões de Funcionalidades Futuras ────────────── */}
        <Animated.View
          style={[
            styles.futureButtonsRow,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Botão: Roleta de Mimos */}
          <TouchableOpacity
            style={[styles.futureButton, { backgroundColor: colors.kuromiPurple }]}
            activeOpacity={0.8}
            onPress={() => router.push('/roleta')}
          >
            <Text style={styles.futureButtonEmoji}>🎡</Text>
            <Text style={styles.futureButtonLabel}>Roleta{'\n'}de Mimos</Text>
          </TouchableOpacity>

          {/* Botão: Galeria */}
          <TouchableOpacity
            style={[styles.futureButton, { backgroundColor: colors.secondaryAccent }]}
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert('🖼️ Em breve!', 'A Galeria de memórias está chegando!')
            }
          >
            <Text style={styles.futureButtonEmoji}>🖼️</Text>
            <Text style={styles.futureButtonLabel}>Galeria{'\n'}de Lembranças</Text>
          </TouchableOpacity>

          {/* Botão: Playlist */}
          <TouchableOpacity
            style={[styles.futureButton, { backgroundColor: colors.melodyPink }]}
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert('🎵 Em breve!', 'Nossa playlist chegando em breve!')
            }
          >
            <Text style={styles.futureButtonEmoji}>🎵</Text>
            <Text style={styles.futureButtonLabel}>Nossa{'\n'}Playlist</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Fileira final de decorações ───────────────────── */}
        <DecorationRow
          emojis={['💕', '🌸', '🐸', '🧸', '🌸', '💕']}
          fontSize={24}
          style={styles.bottomDecoration}
        />

        {/* ── Botão Secreto (invisível!) ────────────────────── */}
        {/* Fica no rodapé, sem aparência visual — apenas onLongPress */}
        <TouchableOpacity
          style={styles.secretButton}
          onLongPress={handleSecretPress}
          delayLongPress={1500}
          activeOpacity={1}
        >
          <Text style={styles.secretButtonText}>🌟</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Modal de PIN Secreto ─────────────────────── */}
      <Modal
        transparent
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={handlePinCancel}
      >
        <View style={styles.pinOverlay}>
          <View style={styles.pinBox}>
            <Text style={styles.pinEmoji}>🔐</Text>
            <Text style={styles.pinTitle}>Acesso Secreto</Text>
            <Text style={styles.pinSubtitle}>Digite o PIN para continuar</Text>

            <TextInput
              style={styles.pinInput}
              value={secretPin}
              onChangeText={setSecretPin}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
              placeholder="••••"
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
                <Text style={styles.pinButtonConfirmText}>Entrar ✨</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPink,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },

  // Cabeçalho
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  greeting: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textDark,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMedium,
    marginTop: 6,
    textAlign: 'center',
  },

  // Decorações
  topDecoration: {
    marginVertical: spacing.md,
  },
  middleDecoration: {
    marginVertical: spacing.md,
  },
  bottomDecoration: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  // Personagens Sanrio
  sanrioRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  sanrioChar: {
    alignItems: 'center',
  },
  sanrioEmoji: {
    fontSize: 30,
  },
  sanrioName: {
    fontSize: 10,
    color: colors.textMedium,
    marginTop: 4,
    fontWeight: '600',
  },

  // Envelope / Cartinha
  envelopeWrapper: {
    width: width - spacing.lg * 2,
    marginBottom: spacing.md,
  },
  envelopeTouchable: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.envelopeYellow,
    borderWidth: 2.5,
    borderColor: colors.envelopeBorder,
    ...shadows.medium,
  },
  envelopeFlap: {
    backgroundColor: colors.primaryAccent,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.envelopeBorder,
  },
  envelopeFlapEmoji: {
    fontSize: 44,
  },
  envelopeBody: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  envelopeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textDark,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  envelopeHint: {
    fontSize: 14,
    color: colors.textMedium,
    marginTop: 6,
    fontStyle: 'italic',
  },
  envelopeDecors: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  envelopeDecorEmoji: {
    fontSize: 22,
  },
  envelopeSeal: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.sealRed,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF3355',
    ...shadows.soft,
  },
  envelopeSealText: {
    fontSize: 22,
  },

  // Botões futuros
  futureButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  futureButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
  },
  futureButtonEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  futureButtonLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'center',
    lineHeight: 15,
  },

  // Botão Secreto
  secretButton: {
    marginTop: spacing.md,
    padding: spacing.md,
    opacity: 0.15,  // quase invisível — só quem sabe procurar vai achar!
  },
  secretButtonText: {
    fontSize: 14,
    color: colors.textLight,
  },

  // ── Modal PIN Secreto ─────────────────────────────
  pinOverlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 74, 74, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  pinBox: {
    width: '100%',
    backgroundColor: colors.cardWhite,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.cardBorder,
    ...shadows.medium,
  },
  pinEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  pinTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 4,
  },
  pinSubtitle: {
    fontSize: 13,
    color: colors.textMedium,
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  pinInput: {
    width: '100%',
    backgroundColor: colors.backgroundPink,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primaryAccent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 22,
    color: colors.textDark,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: spacing.lg,
  },
  pinButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  pinButton: {
    flex: 1,
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinButtonCancel: {
    backgroundColor: colors.backgroundCream,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
  },
  pinButtonCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMedium,
  },
  pinButtonConfirm: {
    backgroundColor: colors.primaryAccent,
    ...shadows.soft,
  },
  pinButtonConfirmText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
  },
});

