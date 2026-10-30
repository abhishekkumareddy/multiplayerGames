import { io, Socket } from 'socket.io-client';

export const DEFAULT_BACKEND_URL = 'https://multiplayergames-2.onrender.com';

export function normalizeBackendUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim().replace(/\/+$/, '');
  if (url.endsWith('/api')) {
    url = url.slice(0, -4);
  }
  return url;
}

export function getBackendUrl(): string {
  // 1. Explicit VITE_API_URL from Netlify environment variables (Top Priority)
  const envApiUrl = normalizeBackendUrl(import.meta.env.VITE_API_URL);
  if (envApiUrl) {
    return envApiUrl;
  }

  // 2. Fallback to VITE_SOCKET_URL if defined
  const envSocketUrl = normalizeBackendUrl(import.meta.env.VITE_SOCKET_URL);
  if (envSocketUrl) {
    return envSocketUrl;
  }

  const isLocalDev =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  // 3. Custom developer override from localStorage (if set)
  try {
    const custom = localStorage.getItem('friends_arcade_backend_url');
    if (custom && custom.trim()) {
      const trimmed = normalizeBackendUrl(custom);
      // Guard against stale localhost entries when running in production
      if (!isLocalDev && (trimmed.includes('localhost') || trimmed.includes('127.0.0.1'))) {
        localStorage.removeItem('friends_arcade_backend_url');
      } else if (trimmed) {
        return trimmed;
      }
    }
  } catch (e) {}

  // 4. Local development server fallback
  if (isLocalDev) {
    return 'http://localhost:3001';
  }

  // 5. Default production backend URL
  return DEFAULT_BACKEND_URL;
}

export function setCustomBackendUrl(url: string): void {
  try {
    if (!url || url.trim() === '') {
      localStorage.removeItem('friends_arcade_backend_url');
    } else {
      localStorage.setItem('friends_arcade_backend_url', normalizeBackendUrl(url));
    }
    // Reconnect socket & reinitialize API client to new URL
    window.location.reload();
  } catch (e) {}
}

const SOCKET_SERVER_URL = getBackendUrl();

export const socket: Socket = io(SOCKET_SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

export const AVATAR_OPTIONS = [
  '👾', '🦊', '🐼', '🐯', '🚀', '🤖',
  '🦄', '⚡', '🕹️', '👑', '🧙‍♂️', '🐱'
];

export function getStoredPlayerName(): string {
  try {
    return localStorage.getItem('friends_arcade_player_name') || '';
  } catch (e) {
    return '';
  }
}

export function setStoredPlayerName(name: string): void {
  try {
    localStorage.setItem('friends_arcade_player_name', name);
  } catch (e) {}
}

export function getStoredAvatar(): string {
  try {
    return localStorage.getItem('friends_arcade_avatar') || '👾';
  } catch (e) {
    return '👾';
  }
}

export function setStoredAvatar(avatar: string): void {
  try {
    localStorage.setItem('friends_arcade_avatar', avatar);
  } catch (e) {}
}
