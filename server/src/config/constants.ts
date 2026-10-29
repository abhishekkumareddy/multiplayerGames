import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || '*',
  NODE_ENV: process.env.NODE_ENV || 'development',
  ROOM_CODE_LENGTH: 6,
  ROOM_CODE_CHARS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // excludes confusing chars (0, O, 1, I)
  DISCONNECT_GRACE_PERIOD_MS: 30000, // 30 seconds to reconnect
  EMPTY_ROOM_TTL_MS: 60000, // 1 minute to purge empty room
  ABANDONED_ROOM_TTL_MS: 3600000, // 1 hour maximum idle time
  ROOM_CLEANUP_INTERVAL_MS: 60000, // run garbage collection every 60s
  MAX_PLAYERS_DEFAULT: 8,
};
