// ============================================================
//  ADMIN — Painel de Controle (oculto)
//  Tabs: "Nova Cartinha" (messages) | "Novo Mimo" (coupons)
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import FofoCard from '../components/FofoCard';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';

// ── Tabs disponíveis
const TABS = [
  { key: 'cartinha', label: '💌 Nova Cartinha' },
  { key: 'mimo',     label: '🎁 Novo Mimo' },
];

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState('cartinha');

  // Estado: aba Cartinha
  const [messageText, setMessageText]   = useState('');
  const [unlockDate,  setUnlockDate]    = useState('');
  const [sender,      setSender]        = useState('Com todo o amor do mundo 💕');
  const [loadingMsg,  setLoadingMsg]    = useState(false);

  // Estado: aba Mimo
  const [couponTitle, setCouponTitle]   = useState('');
  const [couponDesc,  setCouponDesc]    = useState('');
  const [loadingCoup, setLoadingCoup]   = useState(false);

  // ── Helpers de data
  const handleDateChange = (text) => {
    let cleaned = text.replace(/[^0-9-]/g, '');
    if (cleaned.length === 4 && !cleaned.includes('-')) cleaned += '-';
    if (cleaned.length === 7 && cleaned.split('-').length === 2) cleaned += '-';
    setUnlockDate(cleaned.slice(0, 10));
  };
  const isValidDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);
  const fillToday = () => {
    const n = new Date();
    setUnlockDate(
      `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
    );
  };

  // ── Enviar Cartinha
  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      Alert.alert('✏️ Ops!', 'Escreva uma mensagem fofa para a Rana!');
      return;
    }
    if (!isValidDate(unlockDate)) {
      Alert.alert('📅 Ops!', 'Digite a data no formato YYYY-MM-DD (ex: 2025-02-14)');
      return;
    }
    setLoadingMsg(true);
    try {
      await addDoc(collection(db, 'messages'), {
        text: messageText.trim(),
        unlockDate,
        sender: sender.trim() || 'Com amor 💕',
        createdAt: serverTimestamp(),
      });
      Alert.alert(
        '💌 Cartinha enviada!',
        `A Rana receberá sua mensagem em ${unlockDate}. 🐸🧸`,
        [{ text: 'Eba! 🎉', onPress: () => { setMessageText(''); setUnlockDate(''); } }]
      );
    } catch (e) {
      Alert.alert('❌ Erro ao enviar', `Verifique sua conexão e o Firebase.\n\n${e.message}`);
    } finally {
      setLoadingMsg(false);
    }
  };

  // ── Salvar Cupão
  const handleSaveCoupon = async () => {
    if (!couponTitle.trim()) {
      Alert.alert('🎁 Ops!', 'Digite um título para o cupão!');
      return;
    }
    setLoadingCoup(true);
    try {
      await addDoc(collection(db, 'coupons'), {
        title: couponTitle.trim(),
        description: couponDesc.trim(),
        createdAt: serverTimestamp(),
      });
      Alert.alert(
        '🎉 Mimo cadastrado!',
        `"${couponTitle.trim()}" foi adicionado à Roleta de Mimos! 🎡`,
        [{ text: 'Arrasou! 💜', onPress: () => { setCouponTitle(''); setCouponDesc(''); } }]
      );
    } catch (e) {
      Alert.alert('❌ Erro', `Não foi possível salvar o cupão.\n\n${e.message}`);
    } finally {
      setLoadingCoup(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Cabeçalho ── */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>📬</Text>
            <Text style={styles.headerTitle}>Painel Admin</Text>
            <Text style={styles.headerSubtitle}>
              Gerencie as cartinhas e os mimos da Rana com amor. 💕
            </Text>
          </View>

          {/* ── Seletor de Tabs ── */}
          <View style={styles.tabRow}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  onPress={() => setActiveTab(tab.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ════════════════════════════════════════
              TAB: Nova Cartinha
          ════════════════════════════════════════ */}
          {activeTab === 'cartinha' && (
            <>
              <FofoCard style={styles.formCard} backgroundColor={colors.backgroundCream}>
                <Text style={styles.label}>💬 Mensagem</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Escreva algo fofo para a Rana... 🌸"
                  placeholderTextColor={colors.textLight}
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  maxLength={600}
                />
                <Text style={styles.charCount}>{messageText.length}/600</Text>

                <Text style={[styles.label, { marginTop: spacing.md }]}>✍️ Assinatura</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Com amor 💕"
                  placeholderTextColor={colors.textLight}
                  value={sender}
                  onChangeText={setSender}
                />

                <Text style={[styles.label, { marginTop: spacing.md }]}>📅 Data de Desbloqueio</Text>
                <View style={styles.dateRow}>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor={colors.textLight}
                    value={unlockDate}
                    onChangeText={handleDateChange}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                  <TouchableOpacity style={styles.todayButton} onPress={fillToday}>
                    <Text style={styles.todayButtonText}>Hoje</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.dateHint}>Formato: 2025-02-14 (ano-mês-dia)</Text>
              </FofoCard>

              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: colors.heartRed }, loadingMsg && styles.buttonDisabled]}
                onPress={handleSendMessage}
                disabled={loadingMsg}
                activeOpacity={0.85}
              >
                {loadingMsg ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Text style={styles.sendButtonEmoji}>💌</Text>
                    <Text style={styles.sendButtonText}>Enviar Cartinha</Text>
                  </>
                )}
              </TouchableOpacity>

              <FofoCard style={styles.infoCard} backgroundColor={colors.backgroundMint} shadow="light">
                <Text style={styles.infoTitle}>📚 Coleção: messages</Text>
                <Text style={styles.infoText}>
                  {'• text (string)\n• unlockDate (YYYY-MM-DD)\n• sender (string)\n• createdAt (timestamp)'}
                </Text>
              </FofoCard>
            </>
          )}

          {/* ════════════════════════════════════════
              TAB: Novo Mimo (Cupão)
          ════════════════════════════════════════ */}
          {activeTab === 'mimo' && (
            <>
              <FofoCard style={styles.formCard} backgroundColor={colors.backgroundCream}>
                <Text style={styles.label}>🏷️ Título do Cupão</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Vale Massagem 💆"
                  placeholderTextColor={colors.textLight}
                  value={couponTitle}
                  onChangeText={setCouponTitle}
                  maxLength={80}
                />
                <Text style={styles.charCount}>{couponTitle.length}/80</Text>

                <Text style={[styles.label, { marginTop: spacing.md }]}>📝 Descrição</Text>
                <TextInput
                  style={[styles.textArea, { minHeight: 100 }]}
                  placeholder="Ex: Válido para 30 minutos de massagem relaxante."
                  placeholderTextColor={colors.textLight}
                  value={couponDesc}
                  onChangeText={setCouponDesc}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={300}
                />
                <Text style={styles.charCount}>{couponDesc.length}/300</Text>
              </FofoCard>

              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: colors.kuromiPurple }, loadingCoup && styles.buttonDisabled]}
                onPress={handleSaveCoupon}
                disabled={loadingCoup}
                activeOpacity={0.85}
              >
                {loadingCoup ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Text style={styles.sendButtonEmoji}>🎁</Text>
                    <Text style={styles.sendButtonText}>Salvar Mimo</Text>
                  </>
                )}
              </TouchableOpacity>

              <FofoCard style={styles.infoCard} backgroundColor={colors.backgroundMint} shadow="light">
                <Text style={styles.infoTitle}>📚 Coleção: coupons</Text>
                <Text style={styles.infoText}>
                  {'• title (string)\n• description (string)\n• createdAt (timestamp)'}
                </Text>
              </FofoCard>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundCream },
  flex:     { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },

  // Header
  header: { alignItems: 'center', marginBottom: spacing.sm },
  headerEmoji: { fontSize: 48, marginBottom: spacing.sm },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.textDark, textAlign: 'center' },
  headerSubtitle: { fontSize: 14, color: colors.textMedium, textAlign: 'center', marginTop: 6, lineHeight: 20 },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.cardWhite,
    borderRadius: borderRadius.pill,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    padding: 4,
    gap: 4,
    ...shadows.light,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.primaryAccent,
    ...shadows.soft,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMedium,
  },
  tabLabelActive: {
    color: colors.white,
    fontWeight: '800',
  },

  // Form
  formCard:  { gap: 4 },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 15,
    color: colors.textDark,
  },
  textArea: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 15,
    color: colors.textDark,
    minHeight: 140,
    lineHeight: 22,
  },
  charCount: { fontSize: 11, color: colors.textLight, textAlign: 'right', marginTop: 4 },

  // Date
  dateRow:       { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  dateInput:     { flex: 1 },
  todayButton: {
    backgroundColor: colors.primaryAccent,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 6,
    ...shadows.light,
  },
  todayButtonText: { fontSize: 13, fontWeight: '700', color: colors.white },
  dateHint:        { fontSize: 11, color: colors.textLight, marginTop: 4, fontStyle: 'italic' },

  // Buttons
  sendButton: {
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.md + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.medium,
  },
  buttonDisabled:    { opacity: 0.6 },
  sendButtonEmoji:   { fontSize: 22 },
  sendButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },

  // Info card
  infoCard:  { marginTop: spacing.sm },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMedium,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoText: {
    fontSize: 12,
    color: colors.textMedium,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 20,
  },
});
