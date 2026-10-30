import dotenv from 'dotenv';
dotenv.config();

export const DEFAULT_ALLOWED_ORIGINS = [
  'https://friendsarcade.fun',
  'https://www.friendsarcade.fun',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://multiplayergames-2.onrender.com',
];

export const NETLIFY_SUBDOMAIN_REGEX = /^https:\/\/[a-zA-Z0-9_-]+\.netlify\.app$/;

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || '*',
  FRONTEND_URL: process.env.FRONTEND_URL || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  ROOM_CODE_LENGTH: 6,
  ROOM_CODE_CHARS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // excludes confusing chars (0, O, 1, I)
  DISCONNECT_GRACE_PERIOD_MS: 30000, // 30 seconds to reconnect
  EMPTY_ROOM_TTL_MS: 60000, // 1 minute to purge empty room
  ABANDONED_ROOM_TTL_MS: 3600000, // 1 hour maximum idle time
  ROOM_CLEANUP_INTERVAL_MS: 60000, // run garbage collection every 60s
  MAX_PLAYERS_DEFAULT: 8,
};

export function getAllowedOrigins(): string[] {
  const origins = new Set<string>(DEFAULT_ALLOWED_ORIGINS);

  if (CONFIG.FRONTEND_URL) {
    CONFIG.FRONTEND_URL.split(',').forEach(o => {
      const trimmed = o.trim();
      if (trimmed) origins.add(trimmed);
    });
  }

  if (CONFIG.CLIENT_ORIGIN && CONFIG.CLIENT_ORIGIN !== '*') {
    CONFIG.CLIENT_ORIGIN.split(',').forEach(o => {
      const trimmed = o.trim();
      if (trimmed) origins.add(trimmed);
    });
  }

  return Array.from(origins);
}

export function isOriginAllowed(origin?: string): boolean {
  // Allow non-browser requests (e.g. server-to-server health checks, curl, mobile native)
  if (!origin) return true;

  // Wildcard allowed
  if (CONFIG.CLIENT_ORIGIN === '*') {
    return true;
  }

  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Netlify subdomain match (*.netlify.app)
  if (NETLIFY_SUBDOMAIN_REGEX.test(origin)) {
    return true;
  }

  return false;
}

