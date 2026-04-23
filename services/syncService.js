// ============================================================
//  SYNC SERVICE — Fofuras do Dia
//  Estratégia Offline-First:
//
//  1. syncData() → tenta baixar tudo do Firestore e salva
//     no AsyncStorage como cache local.
//  2. As telas lêem primeiro do AsyncStorage (rápido e offline).
//     Se estiver vazio, fazem fallback ao Firestore.
//
//  Chaves do AsyncStorage:
//    '@messages'  → array de mensagens (coleção Firestore)
//    '@coupons'   → array de cupões (coleção Firestore)
//    '@lastSync'  → ISO timestamp da última sincronização
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocsFromServer } from "firebase/firestore";
import { db } from "./firebase";

// ── Chaves de armazenamento ────────────────────────────────
export const STORAGE_KEYS = {
  MESSAGES: "@messages",
  COUPONS: "@coupons",
  SETTINGS: "@settings",
  LAST_SYNC: "@lastSync",
};

// ── Lê array do AsyncStorage com fallback para [] ─────────
export async function readCache(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ── Salva array no AsyncStorage ───────────────────────────
async function writeCache(key, data) {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

// ── Sincronização principal ───────────────────────────────
/**
 * Busca mensagens e cupões diretamente do servidor do Firestore
 * (getDocsFromServer ignora o cache local do Firestore e garante
 * dados frescos) e persiste no AsyncStorage.
 *
 * Chamada silenciosa: não lança exceção — apenas registra no console
 * para não interromper a UI caso o dispositivo esteja offline.
 *
 * @returns {Promise<boolean>} true se sincronizou com sucesso
 */
export async function syncData() {
  try {
    // Busca forçando o servidor (ignora cache do Firestore)
    const [messagesSnap, couponsSnap, settingsSnap] = await Promise.all([
      getDocsFromServer(collection(db, "messages")),
      getDocsFromServer(collection(db, "coupons")),
      getDocsFromServer(collection(db, "settings")),
    ]);

    const messages = messagesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Serializa o Timestamp do Firestore para string ISO
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? null,
    }));

    const coupons = couponsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? null,
    }));

    let settings = null;
    const configDoc = settingsSnap.docs.find(doc => doc.id === "config");
    if (configDoc) {
      settings = configDoc.data();
    }

    await Promise.all([
      writeCache(STORAGE_KEYS.MESSAGES, messages),
      writeCache(STORAGE_KEYS.COUPONS, coupons),
      writeCache(STORAGE_KEYS.SETTINGS, settings),
      writeCache(STORAGE_KEYS.LAST_SYNC, new Date().toISOString()),
    ]);

    console.log(
      `[Sync] ✅ Sincronizado: ${messages.length} mensagens, ${coupons.length} cupões.`,
    );
    return true;
  } catch (error) {
    // Dispositivo offline ou Firebase não configurado — falha silenciosa
    console.log("[Sync] 📴 Offline ou erro:", error.message);
    return false;
  }
}
