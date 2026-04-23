// ============================================================
//  FOFURAS DO DIA — Configuração do Firebase
//
//  ⚠️  Para ativar: copie .env.example para .env e
//  preencha com as suas credenciais do Firebase Console.
//  https://console.firebase.google.com
// ============================================================

import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Lê as variáveis de ambiente (prefixo EXPO_PUBLIC_ é exposto automaticamente pelo Expo)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "PLACEHOLDER_API_KEY",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "PLACEHOLDER_AUTH_DOMAIN",
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "PLACEHOLDER_PROJECT_ID",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "PLACEHOLDER_STORAGE_BUCKET",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
    "PLACEHOLDER_SENDER_ID",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "PLACEHOLDER_APP_ID",
};

// Evita reinicializar o app se o módulo for recarregado (hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Instância do Firestore (banco de dados)
const db = getFirestore(app);

export { app, db };
