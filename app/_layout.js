// ============================================================
//  ROOT LAYOUT — Fofuras do Dia
//  Stack Navigator principal. Sem abas, fluxo limpo e fofo.
// ============================================================

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.backgroundPink} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.backgroundPink,
          },
          headerTintColor: colors.textDark,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.backgroundPink,
          },
        }}
      >
        {/* Home da Rana — sem header */}
        <Stack.Screen name="index" options={{ headerShown: false }} />

        {/* Cartinha de amor */}
        <Stack.Screen
          name="correio/index"
          options={{
            title: '💌 Cartinha de Hoje',
            headerBackTitle: 'Início',
            headerStyle: { backgroundColor: colors.cardPink },
          }}
        />

        {/* Painel Admin — oculto, sem título chamativo */}
        <Stack.Screen
          name="admin"
          options={{
            title: '✏️ Painel',
            headerBackTitle: 'Voltar',
            headerStyle: { backgroundColor: colors.backgroundCream },
          }}
        />
      </Stack>
    </>
  );
}
