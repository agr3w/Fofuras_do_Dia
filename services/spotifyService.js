import * as AuthSession from 'expo-auth-session';

// ============================================================
// SPOTIFY SERVICE (Base)
// Esta é a fundação para conectar o app ao Spotify da Rana ou
// do Weslley, usando o Expo Auth Session.
// ============================================================

// Endpoints do Spotify
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

// Substituir depois pelo teu Client ID criado no Spotify Developer Dashboard
const SPOTIFY_CLIENT_ID = 'COLOQUE_SEU_CLIENT_ID_AQUI'; 

// Escopos necessários para ler o que está a tocar e ver playlists
const scopes = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative'
];

/**
 * Função placeholder que futuramente fará fetch na API do Spotify 
 * para descobrir o que a Rana ou o Weslley estão ouvindo.
 */
export const getCurrentlyPlaying = async (token) => {
  // TODO: Fazer fetch para https://api.spotify.com/v1/me/player/currently-playing
  return null;
};

/**
 * Função placeholder que buscará os dados da playlist compartilhada.
 */
export const getSharedPlaylist = async (token, playlistId) => {
  // TODO: Fazer fetch para https://api.spotify.com/v1/playlists/{playlist_id}
  return null;
};

export { discovery, SPOTIFY_CLIENT_ID, scopes };
