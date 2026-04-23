import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DecorationRow from '../../components/DecorationRow';
import FofoCard from '../../components/FofoCard';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';

const { width } = Dimensions.get('window');

export default function PlaylistScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Botão de Voltar */}
      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nossa Playlist 🎵</Text>
        <View style={{ width: 40 }} /> {/* Espaçador para centrar */}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, gap: spacing.lg }}>
          
          <DecorationRow
            emojis={["🐸", "🎧", "💕", "🎧", "🧸"]}
            fontSize={28}
            style={styles.decoration}
          />

          <Text style={styles.sectionDescription}>
            O que está a tocar nos nossos coraçõezinhos agora? 💕
          </Text>

          {/* Tocando Agora: Rana */}
          <FofoCard style={styles.playingCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>🐸</Text>
              <Text style={styles.cardTitle}>A tocar na Rana</Text>
            </View>
            <View style={styles.songRow}>
              <View style={[styles.albumCover, { backgroundColor: colors.melodyPink }]}>
                <Ionicons name="musical-notes" size={24} color={colors.white} />
              </View>
              <View style={styles.songInfo}>
                <Text style={styles.songName}>Música super fofa...</Text>
                <Text style={styles.artistName}>Artista misterioso</Text>
              </View>
            </View>
          </FofoCard>

          {/* Tocando Agora: Weslley */}
          <FofoCard style={styles.playingCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>🧸</Text>
              <Text style={styles.cardTitle}>A tocar no Weslley</Text>
            </View>
            <View style={styles.songRow}>
              <View style={[styles.albumCover, { backgroundColor: colors.primaryAccent }]}>
                <Ionicons name="headset" size={24} color={colors.white} />
              </View>
              <View style={styles.songInfo}>
                <Text style={styles.songName}>Um rap romântico...</Text>
                <Text style={styles.artistName}>Artista misterioso</Text>
              </View>
            </View>
          </FofoCard>

          <DecorationRow
            emojis={["💖", "✨", "💖"]}
            fontSize={22}
            style={styles.decorationMini}
          />

          {/* Playlist Compartilhada */}
          <FofoCard style={styles.playlistCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>🎶</Text>
              <Text style={styles.cardTitle}>Nossa Playlist</Text>
            </View>
            <Text style={styles.playlistDesc}>
              A nossa coleção de músicas para tocar durante as viagens ou quando estamos com saudades!
            </Text>
            
            {/* Placeholder de Músicas */}
            <View style={styles.dummyTrack}>
              <Ionicons name="play-circle" size={24} color={colors.kuromiPurple} />
              <Text style={styles.dummyTrackText}>Música 1 - Muito Amor</Text>
            </View>
            <View style={styles.dummyTrack}>
              <Ionicons name="play-circle" size={24} color={colors.kuromiPurple} />
              <Text style={styles.dummyTrackText}>Música 2 - Saudades</Text>
            </View>

            <TouchableOpacity style={styles.openSpotifyBtn}>
              <Text style={styles.openSpotifyText}>Abrir no Spotify 🟢</Text>
            </TouchableOpacity>
          </FofoCard>

          <DecorationRow
            emojis={["🌸", "🐸", "🧸", "🌸"]}
            fontSize={24}
            style={styles.decoration}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundCream, // Rosa pastel fofinho
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
    backgroundColor: colors.cardWhite,
    borderRadius: borderRadius.round,
    ...shadows.soft,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textDark,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  decoration: {
    marginVertical: spacing.md,
  },
  decorationMini: {
    marginVertical: spacing.sm,
  },
  sectionDescription: {
    fontSize: 16,
    color: colors.textMedium,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  playingCard: {
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.backgroundCream,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  albumCover: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songInfo: {
    flex: 1,
  },
  songName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    color: colors.textMedium,
  },
  playlistCard: {
    backgroundColor: colors.cardWhite,
  },
  playlistDesc: {
    fontSize: 14,
    color: colors.textMedium,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  dummyTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  dummyTrackText: {
    fontSize: 15,
    color: colors.textDark,
  },
  openSpotifyBtn: {
    backgroundColor: '#1DB954', // Verde Spotify
    paddingVertical: spacing.md,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    marginTop: spacing.lg,
    ...shadows.soft,
  },
  openSpotifyText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  }
});
