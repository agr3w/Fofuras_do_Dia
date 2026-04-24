// ============================================================
//  ROLETA DE MIMOS 🎡
//  Busca todos os cupões da coleção 'coupons' no Firestore,
//  sorteio animado e exibe o prêmio em um Modal fofo.
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../services/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { readCache, STORAGE_KEYS } from '../../services/syncService';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DecorationRow from '../../components/DecorationRow';
import FofoCard from '../../components/FofoCard';
import { colors, spacing, borderRadius, shadows } from '../../theme/theme';

const { width } = Dimensions.get('window');

// Emojis que aparecem na "roleta" girando durante o sorteio
const SPIN_EMOJIS = ['🎀', '🌸', '🐸', '🧸', '💕', '🎁', '✨', '🎊', '💜', '🎡'];

export default function RoletaScreen() {
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [spinIndex, setSpinIndex] = useState(0);
  const [girosHoje, setGirosHoje] = useState(0);
  const [limiteGiros, setLimiteGiros] = useState(3);

  // Histórico
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [drawnMimos, setDrawnMimos] = useState([]);

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const wheelRotate = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  const modalScale = useRef(new Animated.Value(0.6)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  // Referência para o intervalo do emoji de roleta
  const spinInterval = useRef(null);

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();

    startButtonPulse();
    loadCoupons();
    loadSpinData();

    return () => {
      if (spinInterval.current) clearInterval(spinInterval.current);
    };
  }, []);

  async function loadSpinData() {
    try {
      // Limite de giros configurado no admin
      const settings = await readCache(STORAGE_KEYS.SETTINGS);
      if (settings?.limiteGiros !== undefined) {
        setLimiteGiros(Number(settings.limiteGiros));
      } else {
        // Busca diretamente a chave global no AsyncStorage
        const globalRaw = await AsyncStorage.getItem('@settings_global');
        if (globalRaw) {
          const global = JSON.parse(globalRaw);
          if (global.limiteGiros !== undefined) setLimiteGiros(Number(global.limiteGiros));
        }
      }

      // Histórico local
      const history = await readCache(STORAGE_KEYS.DRAWN_MIMOS);
      setDrawnMimos(history);

      // Giros do dia corrente
      const today = new Date().toISOString().slice(0, 10);
      const stored = await AsyncStorage.getItem('@giros');
      if (stored) {
        const { date, count } = JSON.parse(stored);
        if (date === today) {
          setGirosHoje(count);
        } else {
          // Novo dia: zera o contador
          await AsyncStorage.setItem('@giros', JSON.stringify({ date: today, count: 0 }));
        }
      }
    } catch (e) {
      console.warn('[Roleta] Erro ao carregar dados de giro:', e);
    }
  }

  function startButtonPulse() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, { toValue: 1.06, duration: 800, useNativeDriver: true }),
        Animated.timing(buttonPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }

  async function loadCoupons() {
    try {
      // 1ª tentativa: AsyncStorage (offline-first)
      const cached = await readCache(STORAGE_KEYS.COUPONS);

      if (cached.length > 0) {
        setCoupons(cached);
        return; // dados do cache, pronto!
      }

      // 2ª tentativa: Firestore (online fallback)
      const snap = await getDocs(collection(db, 'coupons'));
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (list.length > 0) {
        setCoupons(list);
      } else {
        // 3ª tentativa: demo hardcoded
        setCoupons([
          { id: 'demo1', title: '🌹 Vale Abraço Especial', description: 'Válido para 1 abraço demorado quando quiser!' },
          { id: 'demo2', title: '☕ Vale Café da Manhã', description: 'Café quentinho na cama, com muito amor.' },
          { id: 'demo3', title: '💆 Vale Massagem', description: 'Válido para 30 minutos de massagem relaxante.' },
        ]);
      }
    } catch (err) {
      console.warn('[Roleta] Erro ao carregar cupões:', err.message);
      // Fallback demo
      setCoupons([
        { id: 'demo1', title: '🌹 Vale Abraço Especial', description: 'Válido para 1 abraço demorado quando quiser!' },
        { id: 'demo2', title: '☕ Vale Café da Manhã', description: 'Café quentinho na cama, com muito amor.' },
        { id: 'demo3', title: '💆 Vale Massagem', description: 'Válido para 30 minutos de massagem relaxante.' },
      ]);
    } finally {
      setLoadingCoupons(false);
    }
  }

  function handleSpin() {
    if (spinning || coupons.length === 0 || girosHoje >= limiteGiros) return;

    setSpinning(true);
    setWinner(null);

    // Gira o ícone da roleta
    wheelRotate.setValue(0);
    Animated.loop(
      Animated.timing(wheelRotate, { toValue: 1, duration: 600, useNativeDriver: true }),
      { iterations: 4 }
    ).start();

    // Troca emojis rapidamente (efeito de roleta)
    let idx = 0;
    spinInterval.current = setInterval(() => {
      idx = (idx + 1) % SPIN_EMOJIS.length;
      setSpinIndex(idx);
    }, 120);

    // Após 2.4 segundos, para e sorteia
    setTimeout(async () => {
      clearInterval(spinInterval.current);
      spinInterval.current = null;

      const picked = coupons[Math.floor(Math.random() * coupons.length)];
      setWinner(picked);
      setSpinning(false);

      // Histórico e expiração
      const validadeDias = picked.validadeDias || 7;
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + validadeDias);

      const drawnCoupon = {
        ...picked,
        drawnDate: new Date().toISOString(),
        expirationDate: expDate.toISOString(),
      };

      const newHistory = [drawnCoupon, ...drawnMimos];
      setDrawnMimos(newHistory);
      await AsyncStorage.setItem(STORAGE_KEYS.DRAWN_MIMOS, JSON.stringify(newHistory));

      try {
        await addDoc(collection(db, 'user_history'), drawnCoupon);
      } catch (e) {
        console.warn('[Roleta] Erro ao salvar histórico online:', e.message);
      }

      // Incrementa giros do dia
      const newCount = girosHoje + 1;
      setGirosHoje(newCount);
      const today = new Date().toISOString().slice(0, 10);
      await AsyncStorage.setItem('@giros', JSON.stringify({ date: today, count: newCount }));

      // Anima abertura do modal
      modalScale.setValue(0.6);
      modalOpacity.setValue(0);
      setModalVisible(true);
      Animated.parallel([
        Animated.spring(modalScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
        Animated.timing(modalOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }, 2400);
  }

  function closeModal() {
    Animated.parallel([
      Animated.timing(modalScale, { toValue: 0.7, duration: 200, useNativeDriver: true }),
      Animated.timing(modalOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setModalVisible(false));
  }

  const wheelSpin = wheelRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cabeçalho ── */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.headerTitle}>Roleta de Mimos</Text>
          <Text style={styles.headerSubtitle}>Pressione o botão e veja que miminho você ganhou! 🎁</Text>
        </Animated.View>

        {/* ── Decorações topo ── */}
        <DecorationRow
          emojis={['💜', '🌸', '🎀', '🌸', '💜']}
          fontSize={28}
          style={styles.topDeco}
        />

        {/* ── Área da Roleta ── */}
        <Animated.View style={[styles.wheelArea, { opacity: fadeAnim }]}>
          {/* Círculo da roleta */}
          <Animated.View style={[styles.wheelCircle, { transform: [{ rotate: spinning ? wheelSpin : '0deg' }] }]}>
            <Text style={styles.wheelEmoji}>
              {spinning ? SPIN_EMOJIS[spinIndex] : '🎡'}
            </Text>
          </Animated.View>

          {/* Stars decorativas ao redor */}
          <View style={styles.starsRing}>
            {['✨', '💜', '✨', '🌸', '✨', '💜', '✨', '🌸'].map((s, i) => {
              const angle = (i / 8) * 2 * Math.PI;
              const r = 110;
              return (
                <Text
                  key={i}
                  style={[
                    styles.starDot,
                    {
                      left: 140 + r * Math.cos(angle) - 10,
                      top: 140 + r * Math.sin(angle) - 10,
                    },
                  ]}
                >
                  {s}
                </Text>
              );
            })}
          </View>

          {/* Status de cupões */}
          {loadingCoupons && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.kuromiPurple} />
              <Text style={styles.loadingText}>Carregando mimos...</Text>
            </View>
          )}
          {!loadingCoupons && coupons.length === 0 && (
            <Text style={styles.emptyText}>
              Nenhum mimo cadastrado ainda. 💜{'\n'}Peça ao admin para adicionar cupões!
            </Text>
          )}
          {!loadingCoupons && coupons.length > 0 && (
            <Text style={styles.couponCount}>
              🎁 {coupons.length} mimo{coupons.length > 1 ? 's' : ''} disponível{coupons.length > 1 ? 'is' : ''}
            </Text>
          )}
        </Animated.View>

        {/* ── Botão Sortear ── */}
        {/* Indicador de giros */}
        {!loadingCoupons && limiteGiros > 0 && (
          <View style={styles.girosIndicator}>
            <Text style={styles.girosText}>
              {girosHoje >= limiteGiros
                ? 'Limite diário atingido! 🧸'
                : `${girosHoje}/${limiteGiros} giros usados hoje`}
            </Text>
          </View>
        )}
        <Animated.View style={{ transform: [{ scale: spinning ? new Animated.Value(0.95) : buttonPulse }] }}>
          <TouchableOpacity
            style={[
              styles.spinButton,
              spinning && styles.spinButtonSpinning,
              (coupons.length === 0 || girosHoje >= limiteGiros) && styles.spinButtonDisabled,
            ]}
            onPress={handleSpin}
            disabled={spinning || coupons.length === 0 || loadingCoupons || girosHoje >= limiteGiros}
            activeOpacity={0.85}
          >
            {spinning ? (
              <>
                <ActivityIndicator color={colors.white} size="small" />
                <Text style={styles.spinButtonText}>Sorteando... ✨</Text>
              </>
            ) : girosHoje >= limiteGiros ? (
              <>
                <Text style={styles.spinButtonEmoji}>🧸</Text>
                <Text style={styles.spinButtonText}>Limite diário atingido!</Text>
              </>
            ) : (
              <>
                <Text style={styles.spinButtonEmoji}>🎡</Text>
                <Text style={styles.spinButtonText}>Sortear Mimo!</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* ── Botão Histórico ── */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => setHistoryModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.historyButtonEmoji}>🎒</Text>
          <Text style={styles.historyButtonText}>Meus Mimos</Text>
        </TouchableOpacity>

        {/* ── Decorações fundo ── */}
        <DecorationRow
          emojis={['🐸', '💕', '🧸', '💕', '🐸']}
          fontSize={24}
          style={styles.bottomDeco}
        />

        {/* ── Preview dos cupões disponíveis ── */}
        {!loadingCoupons && coupons.length > 0 && (
          <Animated.View style={[styles.previewSection, { opacity: fadeAnim }]}>
            <Text style={styles.previewTitle}>💜 Mimos Disponíveis</Text>
            {coupons.map((c) => (
              <FofoCard
                key={c.id}
                backgroundColor={colors.backgroundMint}
                style={styles.previewCard}
                shadow="light"
              >
                <Text style={styles.previewCardTitle}>{c.title}</Text>
                {c.description ? (
                  <Text style={styles.previewCardDesc}>{c.description}</Text>
                ) : null}
              </FofoCard>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* ── Modal do Prêmio ── */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              { opacity: modalOpacity, transform: [{ scale: modalScale }] },
            ]}
          >
            {/* Confetes decorativos */}
            <DecorationRow
              emojis={['🎊', '✨', '💜', '✨', '🎊']}
              fontSize={24}
              style={styles.modalDeco}
            />

            <Text style={styles.modalWinEmoji}>🎁</Text>
            <Text style={styles.modalWinLabel}>Você ganhou!</Text>

            <FofoCard
              backgroundColor={colors.cardPink}
              style={styles.modalCard}
              shadow="medium"
            >
              <Text style={styles.modalCouponTitle}>{winner?.title}</Text>
              {winner?.description ? (
                <Text style={styles.modalCouponDesc}>{winner?.description}</Text>
              ) : null}
              <View style={styles.modalSeal}>
                <Text style={styles.modalSealEmoji}>💜</Text>
              </View>
            </FofoCard>

            <Text style={styles.modalNote}>
              Guarda esse mimo com carinho! 🌸
            </Text>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={closeModal}>
              <Text style={styles.modalCloseBtnText}>Que lindo! 🥰</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalSpinAgain} onPress={() => { closeModal(); setTimeout(handleSpin, 400); }}>
              <Text style={styles.modalSpinAgainText}>Girar de novo 🎡</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* ── Modal de Histórico ── */}
      <Modal
        visible={historyModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <SafeAreaView style={styles.historyModalSafe}>
          <View style={styles.historyModalHeader}>
            <Text style={styles.historyModalTitle}>🎒 Meus Mimos</Text>
            <TouchableOpacity onPress={() => setHistoryModalVisible(false)} style={styles.historyCloseIcon}>
              <Ionicons name="close" size={28} color={colors.textDark} />
            </TouchableOpacity>
          </View>

          {drawnMimos.length === 0 ? (
            <View style={styles.historyEmpty}>
              <Text style={{ fontSize: 40, marginBottom: spacing.sm }}>🧸</Text>
              <Text style={styles.historyEmptyText}>Você ainda não tem mimos na mochila!</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.historyScroll}>
              {drawnMimos.map((item, index) => {
                const now = new Date();
                const exp = new Date(item.expirationDate);
                const isExpired = now > exp;
                const dateStr = exp.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

                return (
                  <FofoCard
                    key={`${item.id}-${index}`}
                    backgroundColor={isExpired ? '#F0F0F0' : colors.backgroundMint}
                    style={[styles.historyCard, isExpired && { opacity: 0.7 }]}
                  >
                    <View style={styles.historyCardRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.historyCardTitle, isExpired && { color: colors.textMedium, textDecorationLine: 'line-through' }]}>
                          {item.title}
                        </Text>
                        <Text style={styles.historyCardDesc} numberOfLines={2}>
                          {item.description}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: isExpired ? '#E0E0E0' : colors.successMint }]}>
                        <Text style={[styles.statusBadgeText, isExpired && { color: colors.textMedium }]}>
                          {isExpired ? 'Expirado' : `Válido até ${dateStr}`}
                        </Text>
                      </View>
                    </View>
                  </FofoCard>
                );
              })}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPink,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },

  // Cabeçalho
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.kuromiPurple,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textMedium,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },

  topDeco: { marginBottom: spacing.md },
  bottomDeco: { marginTop: spacing.xl, marginBottom: spacing.md },

  // Área da roleta
  wheelArea: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    height: 300,
    width: 300,
    position: 'relative',
    justifyContent: 'center',
  },
  wheelCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.kuromiPurple,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#A07CC5',
    ...shadows.medium,
    zIndex: 2,
  },
  wheelEmoji: {
    fontSize: 70,
  },
  starsRing: {
    position: 'absolute',
    width: 300,
    height: 300,
  },
  starDot: {
    position: 'absolute',
    fontSize: 18,
  },
  loadingRow: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMedium,
    fontStyle: 'italic',
  },
  emptyText: {
    position: 'absolute',
    bottom: 0,
    fontSize: 13,
    color: colors.textMedium,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  couponCount: {
    position: 'absolute',
    bottom: 10,
    fontSize: 14,
    color: colors.kuromiPurple,
    fontWeight: '700',
  },

  // Botão Sortear
  spinButton: {
    backgroundColor: colors.kuromiPurple,
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.md + 6,
    paddingHorizontal: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.medium,
    borderWidth: 2,
    borderColor: '#A07CC5',
  },
  spinButtonSpinning: {
    backgroundColor: colors.kuromiPurple,
    opacity: 0.85,
  },
  spinButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  spinButtonEmoji: {
    fontSize: 24,
  },
  spinButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },

  // Preview
  previewSection: {
    width: width - spacing.lg * 2,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.kuromiPurple,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  previewCard: {
    marginBottom: 0,
  },
  previewCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
  },
  previewCardDesc: {
    fontSize: 12,
    color: colors.textMedium,
    marginTop: 4,
    lineHeight: 18,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(100, 60, 140, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    width: width - spacing.lg * 2,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: colors.kuromiPurple,
    ...shadows.medium,
  },
  modalDeco: {
    marginBottom: spacing.sm,
  },
  modalWinEmoji: {
    fontSize: 60,
    marginBottom: spacing.sm,
  },
  modalWinLabel: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.kuromiPurple,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  modalCard: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalCouponTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalCouponDesc: {
    fontSize: 14,
    color: colors.textMedium,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  modalSeal: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.kuromiPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    ...shadows.soft,
  },
  modalSealEmoji: {
    fontSize: 22,
  },
  modalNote: {
    fontSize: 13,
    color: colors.textMedium,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalCloseBtn: {
    backgroundColor: colors.kuromiPurple,
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
    ...shadows.soft,
  },
  modalCloseBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
  modalSpinAgain: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  modalSpinAgainText: {
    fontSize: 14,
    color: colors.kuromiPurple,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Indicador de giros
  girosIndicator: {
    backgroundColor: colors.cardWhite,
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
  },
  girosText: {
    fontSize: 13,
    color: colors.textMedium,
    fontWeight: '600',
  },

  // Botão Histórico
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardWhite,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.pill,
    marginTop: spacing.md,
    ...shadows.soft,
  },
  historyButtonEmoji: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  historyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.kuromiPurple,
  },

  // Modal Histórico
  historyModalSafe: {
    flex: 1,
    backgroundColor: colors.backgroundCream,
  },
  historyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardWhite,
  },
  historyModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textDark,
  },
  historyCloseIcon: {
    padding: spacing.xs,
  },
  historyScroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  historyEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  historyEmptyText: {
    fontSize: 16,
    color: colors.textMedium,
    textAlign: 'center',
    fontWeight: '600',
  },
  historyCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  historyCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 4,
  },
  historyCardDesc: {
    fontSize: 13,
    color: colors.textMedium,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textDark,
  },
});
