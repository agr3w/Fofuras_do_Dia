// ============================================================
//  FOFURAS DO DIA — Tema Visual
//  Paleta pastel fofa inspirada em Sanrio + natureza
// ============================================================

export const colors = {
  // Fundos
  backgroundPink: '#FFF0F3',
  backgroundCream: '#FFF8F0',
  backgroundMint: '#F0FFF4',

  // Acentos principais
  primaryAccent: '#FFB6C1',   // Rosa bebê
  secondaryAccent: '#B5EAD7', // Verde menta suave
  tertiaryAccent: '#FFDAC1',  // Pêssego

  // Temático
  frogGreen: '#C1E1C1',       // Verde sapinho 🐸
  frogDark: '#8FBC8F',        // Verde sapinho escuro (detalhes)
  bearBrown: '#D2A679',       // Marrom ursinho 🧸
  bearLight: '#F5DEB3',       // Bege ursinho claro
  kuromiPurple: '#C8A2C8',    // Roxo Kuromi
  melodyPink: '#FFB7C5',      // Rosa My Melody
  kittyRed: '#FF6B6B',        // Vermelho Hello Kitty
  keroGreen: '#90EE90',       // Verde Keroppi

  // Textos
  textDark: '#4A4A4A',
  textMedium: '#7A7A7A',
  textLight: '#ABABAB',
  textOnAccent: '#FFFFFF',

  // Card / UI
  cardWhite: '#FFFAFB',
  cardPink: '#FFF0F5',
  cardBorder: '#FFD6E0',
  shadowColor: '#FFB6C1',

  // Especiais
  envelopeYellow: '#FFF3C4',
  envelopeBorder: '#F7C59F',
  sealRed: '#FF6B6B',
  heartRed: '#FF4D6D',

  // Utilitários
  white: '#FFFFFF',
  transparent: 'transparent',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 12,
  md: 20,
  lg: 28,
  xl: 40,
  pill: 100,
  circle: 9999,
};

export const shadows = {
  soft: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  medium: {
    shadowColor: colors.primaryAccent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};

export const typography = {
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMedium,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textDark,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textLight,
  },
  button: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
    letterSpacing: 0.3,
  },
};

export default { colors, spacing, borderRadius, shadows, typography };
