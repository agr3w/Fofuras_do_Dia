// ============================================================
//  COMPONENTE: DecorationRow
//  Fileira decorativa animada com "balanço" suave.
//  Suporta dois modos:
//    • emojis  — array de strings (retrocompatível)
//    • items   — array de { type: 'emoji'|'image', value, source, size }
// ============================================================

import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, StyleSheet } from 'react-native';

/**
 * @param {object}   props
 * @param {string[]} [props.emojis]   — array de emojis (modo legado)
 * @param {Array}    [props.items]    — array de { type, value?, source?, size? }
 * @param {number}   [props.fontSize] — tamanho dos emojis (default: 32)
 * @param {number}   [props.imageSize]— tamanho das imagens (default: 40)
 * @param {object}   [props.style]    — estilos extras no container
 *
 * @example
 * // Modo legado (emojis)
 * <DecorationRow emojis={['🐸', '🌸', '🧸']} fontSize={28} />
 *
 * // Modo rico (misto)
 * <DecorationRow items={[
 *   { type: 'image', source: require('../assets/images/sanrio/keroppi.png'), size: 40 },
 *   { type: 'emoji', value: '🌸' },
 *   { type: 'image', source: require('../assets/images/sanrio/bear.png'), size: 40 },
 * ]} />
 */
export default function DecorationRow({
  emojis,
  items,
  fontSize = 32,
  imageSize = 40,
  style,
}) {
  // Normaliza para um único array interno
  const resolvedItems = items
    ? items
    : (emojis || ['🐸', '🧸', '🌸', '🐸', '🧸', '💕', '🌸']).map((e) => ({
        type: 'emoji',
        value: e,
      }));

  const anims = useRef(resolvedItems.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(anim, { toValue: 1,  duration: 900, useNativeDriver: true }),
          Animated.timing(anim, { toValue: -1, duration: 900, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0,  duration: 900, useNativeDriver: true }),
        ])
      )
    );
    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={[styles.row, style]}>
      {resolvedItems.map((item, i) => {
        const rotate = anims[i].interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['-12deg', '0deg', '12deg'],
        });

        if (item.type === 'image') {
          const size = item.size ?? imageSize;
          return (
            <Animated.View
              key={i}
              style={[styles.imageWrap, { transform: [{ rotate }] }]}
            >
              <Image
                source={item.source}
                style={{ width: size, height: size }}
                resizeMode="contain"
              />
            </Animated.View>
          );
        }

        // Padrão: emoji como texto
        return (
          <Animated.Text
            key={i}
            style={[
              styles.emoji,
              { fontSize, transform: [{ rotate }] },
            ]}
          >
            {item.value ?? item}
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
  imageWrap: {
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
