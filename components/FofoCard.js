// ============================================================
//  COMPONENTE: FofoCard
//  Card reutilizável com estilo "nuvem" — cantos redondos,
//  sombra suave e fundo pastel. Base para cartinhas, botões
//  e painéis em todo o app.
// ============================================================

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, borderRadius, shadows } from '../theme/theme';

/**
 * @param {object}  props
 * @param {React.ReactNode} props.children  — conteúdo do card
 * @param {string}  [props.backgroundColor] — cor de fundo (default: cardWhite)
 * @param {object}  [props.style]            — estilos extras (opcional)
 * @param {'soft'|'medium'|'light'} [props.shadow] — intensidade da sombra
 */
export default function FofoCard({
  children,
  backgroundColor = colors.cardWhite,
  style,
  shadow = 'soft',
}) {
  return (
    <View
      style={[
        styles.card,
        shadows[shadow],
        { backgroundColor },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
  },
});
