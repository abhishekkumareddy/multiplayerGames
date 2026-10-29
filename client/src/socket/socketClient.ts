import { io, Socket } from 'socket.io-client';

export const DEFAULT_BACKEND_URL = 'https://multiplayergames-2.onrender.com';

export function getBackendUrl(): string {
  try {
    const custom = localStorage.getItem('friends_arcade_backend_url');
    if (custom) return custom.trim();
  } catch (e) {}

  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL.trim();
  }

  // Local Vite dev server
  if (typeof window !== 'undefined' && window.location.port === '5173') {
    return 'http://localhost:3001';
  }

  // Live Render backend
  return DEFAULT_BACKEND_URL;
}

export function setCustomBackendUrl(url: string): void {
  try {
    if (!url || url.trim() === '') {
      localStorage.removeItem('friends_arcade_backend_url');
    } else {
      localStorage.setItem('friends_arcade_backend_url', url.trim());
    }
    // Reconnect socket to new URL
    window.location.reload();
  } catch (e) {}
}

const SOCKET_SERVER_URL = getBackendUrl();

export const socket: Socket = io(SOCKET_SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  transports: ['websocket', 'polling'],
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
