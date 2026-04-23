// ============================================================
//  COMPONENTE: DecorationRow
//  Fileira de emojis fofos com animação de "balanço" suave.
//  Coloca sapinhos 🐸, ursinhos 🧸 e outros personagens
//  decorativos em qualquer tela.
// ============================================================

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

/**
 * @param {object}   props
 * @param {string[]} [props.emojis]     — array de emojis para exibir
 * @param {number}   [props.fontSize]   — tamanho dos emojis (default: 32)
 * @param {object}   [props.style]      — estilos extras no container
 */
export default function DecorationRow({
  emojis = ['🐸', '🧸', '🌸', '🐸', '🧸', '💕', '🌸'],
  fontSize = 32,
  style,
}) {
  // Cria um valor animado por emoji para o efeito de balanço
  const anims = useRef(emojis.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(anim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: -1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      )
    );

    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={[styles.row, style]}>
      {emojis.map((emoji, i) => {
        const rotate = anims[i].interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['-12deg', '0deg', '12deg'],
        });
        return (
          <Animated.Text
            key={i}
            style={[
              styles.emoji,
              { fontSize, transform: [{ rotate }] },
            ]}
          >
            {emoji}
          </Animated.Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  emoji: {
    marginHorizontal: 4,
  },
});
