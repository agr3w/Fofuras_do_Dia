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
//    '@messages'     → array de mensagens (coleção Firestore)
//    '@coupons'      → array de cupões (coleção Firestore)
//    '@settings'     → objeto de configurações (config + global)
//    '@lastSync'     → ISO timestamp da última sincronização
//    '@drawn_mimos'  → array do histórico de mimos sorteados
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
  DRAWN_MIMOS: "@drawn_mimos",
};

// ── Lê valor do AsyncStorage com fallback ─────────────────
// Retorna [] para arrays, ou null para objetos simples
export async function readCache(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ── Salva dado no AsyncStorage ────────────────────────────
async function writeCache(key, data) {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

// ── Serializa um Timestamp do Firestore para ISO string ───
function serializeTimestamp(value) {
  if (!value) return null;
  // Objeto Firestore Timestamp
  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }
  // Já é string ISO
  if (typeof value === "string") return value;
  // Número (epoch ms)
  if (typeof value === "number") return new Date(value).toISOString();
  return null;
}

// ── Merge inteligente do histórico de mimos ───────────────
// Combina o histórico local com o remoto do Firestore.
// Usa o par (couponId + drawnDate) como chave de deduplicação
// para identificar o mesmo evento de sorteio em ambas as fontes.
// Entradas presentes apenas no local (ainda não sincronizadas)
// são preservadas, evitando perda de dados.
function mergeHistories(local, remote) {
  if (remote.length === 0) {
    // Sem dados no servidor → mantém local intacto
    return local;
  }

  // Cria um Set das chaves remotas para lookup rápido
  const remoteKeys = new Set(
    remote.map((item) => {
      const couponId = item.couponId ?? item.id ?? "";
      const drawnDate = item.drawnDate ?? "";
      return `${couponId}|${drawnDate}`;
    })
  );

  // Entradas locais que ainda não chegaram ao servidor
  const localOnly = local.filter((item) => {
    const couponId = item.couponId ?? item.id ?? "";
    const drawnDate = item.drawnDate ?? "";
    return !remoteKeys.has(`${couponId}|${drawnDate}`);
  });

  // Une: remoto (fonte da verdade) + exclusivos locais
  const merged = [...remote, ...localOnly];

  // Ordena do sorteio mais recente para o mais antigo
  merged.sort((a, b) => {
    const dateA = new Date(a.drawnDate || 0).getTime();
    const dateB = new Date(b.drawnDate || 0).getTime();
    return dateB - dateA;
  });

  return merged;
}

// ── Sincronização principal ───────────────────────────────
/**
 * Busca mensagens, cupões, configurações e histórico de mimos
 * diretamente do servidor do Firestore (getDocsFromServer ignora
 * o cache local do Firestore e garante dados frescos) e persiste
 * no AsyncStorage.
 *
 * Para o histórico (@drawn_mimos), faz um merge inteligente:
 * preserva entradas locais que ainda não foram enviadas ao servidor,
 * evitando perda de dados ao instalar o app num novo dispositivo.
 *
 * Chamada silenciosa: não lança exceção — apenas registra no console
 * para não interromper a UI caso o dispositivo esteja offline.
 *
 * @returns {Promise<boolean>} true se sincronizou com sucesso
 */
export async function syncData() {
  try {
    // Busca forçando o servidor (ignora cache do Firestore)
    const [messagesSnap, couponsSnap, settingsSnap, historySnap] =
      await Promise.all([
        getDocsFromServer(collection(db, "messages")),
        getDocsFromServer(collection(db, "coupons")),
        getDocsFromServer(collection(db, "settings")),
        // user_history pode não existir ainda → falha silenciosa
        getDocsFromServer(collection(db, "user_history")).catch(() => ({
          docs: [],
        })),
      ]);

    // ── Mensagens
    const messages = messagesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: serializeTimestamp(doc.data().createdAt),
    }));

    // ── Cupões
    const coupons = couponsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: serializeTimestamp(doc.data().createdAt),
    }));

    // ── Configurações (mescla doc 'config' + doc 'global')
    let settings = null;
    const configDoc = settingsSnap.docs.find((d) => d.id === "config");
    const globalDoc = settingsSnap.docs.find((d) => d.id === "global");

    if (configDoc || globalDoc) {
      settings = {
        ...(configDoc ? configDoc.data() : {}),
        // 'global' contém limiteGiros — mescla por cima
        ...(globalDoc ? globalDoc.data() : {}),
      };
    }

    // ── Histórico remoto (user_history)
    const remoteHistory = historySnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Garante que Timestamps do Firestore sejam serializados
      drawnDate: serializeTimestamp(doc.data().drawnDate),
      expirationDate: serializeTimestamp(doc.data().expirationDate),
      createdAt: serializeTimestamp(doc.data().createdAt),
    }));

    // ── Lê histórico local para o merge
    let localHistory = [];
    try {
      const localRaw = await AsyncStorage.getItem(STORAGE_KEYS.DRAWN_MIMOS);
      localHistory = localRaw ? JSON.parse(localRaw) : [];
    } catch {
      localHistory = [];
    }

    // ── Merge: remoto + locais exclusivos, ordenados por data
    const mergedHistory = mergeHistories(localHistory, remoteHistory);

    // ── Persiste tudo no AsyncStorage
    await Promise.all([
      writeCache(STORAGE_KEYS.MESSAGES, messages),
      writeCache(STORAGE_KEYS.COUPONS, coupons),
      settings !== null
        ? writeCache(STORAGE_KEYS.SETTINGS, settings)
        : Promise.resolve(),
      writeCache(STORAGE_KEYS.DRAWN_MIMOS, mergedHistory),
      writeCache(STORAGE_KEYS.LAST_SYNC, new Date().toISOString()),
    ]);

    console.log(
      `[Sync] ✅ Sincronizado: ${messages.length} msg | ${coupons.length} cupões | ${mergedHistory.length} mimos no histórico.`
    );
    return true;
  } catch (error) {
    // Dispositivo offline ou Firebase não configurado → falha silenciosa.
    // Os dados locais são mantidos intactos (writeCache não foi chamado).
    console.log("[Sync] 📴 Offline ou erro:", error.message);
    return false;
  }
}
