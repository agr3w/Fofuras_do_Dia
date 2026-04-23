// ============================================================
//  ADMIN — Painel de Controle (oculto)
//  Para uso do weslley. Adiciona mensagens na coleção
//  "messages" do Firestore com data de desbloqueio.
//
//  Estrutura do documento no Firestore:
//  {
//    text: string,          — texto da mensagem
//    unlockDate: "YYYY-MM-DD", — data de exibição
//    sender: string,        — quem assina (opcional)
//    createdAt: timestamp,  — gerado automaticamente
//  }
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
import { colors, spacing, borderRadius, shadows, typography } from '../theme/theme';

export default function AdminScreen() {
  const [messageText, setMessageText] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [sender, setSender] = useState('Com todo o amor do mundo 💕');
  const [loading, setLoading] = useState(false);

  // Formata input de data automaticamente: YYYY-MM-DD
  const handleDateChange = (text) => {
    // Remove não-numéricos exceto hífen
    let cleaned = text.replace(/[^0-9-]/g, '');
    // Auto-insere hífens
    if (cleaned.length === 4 && !cleaned.includes('-')) cleaned += '-';
    if (cleaned.length === 7 && cleaned.split('-').length === 2) cleaned += '-';
    setUnlockDate(cleaned.slice(0, 10));
  };

  // Valida o formato YYYY-MM-DD
  const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);

  const handleSend = async () => {
    if (!messageText.trim()) {
      Alert.alert('✏️ Ops!', 'Escreva uma mensagem fofa para a Rana!');
      return;
    }
    if (!isValidDate(unlockDate)) {
      Alert.alert('📅 Ops!', 'Digite a data no formato YYYY-MM-DD (ex: 2025-02-14)');
      return;
    }

    setLoading(true);
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
    } catch (error) {
      Alert.alert(
        '❌ Erro ao enviar',
        `Verifique sua conexão e o Firebase.\n\n${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Atalho: preenche com a data de hoje
  const fillToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    setUnlockDate(`${y}-${m}-${d}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Cabeçalho admin */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>📬</Text>
            <Text style={styles.headerTitle}>Painel de Cartinhas</Text>
            <Text style={styles.headerSubtitle}>
              Escreva sua mensagem fofa para a Rana receber no dia certo.
            </Text>
          </View>

          {/* Formulário */}
          <FofoCard style={styles.formCard} backgroundColor={colors.backgroundCream}>
            {/* Campo: Mensagem */}
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

            {/* Campo: Assinatura */}
            <Text style={[styles.label, { marginTop: spacing.md }]}>✍️ Assinatura</Text>
            <TextInput
              style={styles.input}
              placeholder="Com amor 💕"
              placeholderTextColor={colors.textLight}
              value={sender}
              onChangeText={setSender}
            />

            {/* Campo: Data */}
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
              <TouchableOpacity
                style={styles.todayButton}
                onPress={fillToday}
              >
                <Text style={styles.todayButtonText}>Hoje</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.dateHint}>
              Formato: 2025-02-14 (ano-mês-dia)
            </Text>
          </FofoCard>

          {/* Botão enviar */}
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.sendButtonEmoji}>💌</Text>
                <Text style={styles.sendButtonText}>Enviar Cartinha</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Dica sobre a estrutura do Firestore */}
          <FofoCard style={styles.infoCard} backgroundColor={colors.backgroundMint} shadow="light">
            <Text style={styles.infoTitle}>📚 Coleção no Firestore</Text>
            <Text style={styles.infoText}>
              {'Collection: messages\nCampos:\n  • text (string)\n  • unlockDate (YYYY-MM-DD)\n  • sender (string)\n  • createdAt (timestamp)'}
            </Text>
          </FofoCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundCream,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textDark,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textMedium,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },

  // Form
  formCard: {
    gap: 4,
  },
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
  charCount: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: 4,
  },

  // Date Row
  dateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
  },
  todayButton: {
    backgroundColor: colors.primaryAccent,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 6,
    ...shadows.light,
  },
  todayButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  dateHint: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Send Button
  sendButton: {
    backgroundColor: colors.heartRed,
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.md + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.medium,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonEmoji: {
    fontSize: 22,
  },
  sendButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },

  // Info card
  infoCard: {
    marginTop: spacing.sm,
  },
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
