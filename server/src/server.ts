import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { CONFIG } from './config/constants.js';
import { RoomManager } from './rooms/roomManager.js';
import { registerSocketHandlers } from './sockets/socketHandler.js';
import { GAMES_METADATA } from '../../shared/games.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// CORS configuration
const corsOptions = {
  origin: CONFIG.CLIENT_ORIGIN === '*' ? true : CONFIG.CLIENT_ORIGIN.split(','),
  methods: ['GET', 'POST'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.IO setup
const io = new Server(httpServer, {
  cors: corsOptions,
  pingInterval: 10000,
  pingTimeout: 5000,
  transports: ['websocket', 'polling'],
});

// Initialize in-memory Room Manager
const roomManager = new RoomManager(io);
registerSocketHandlers(io, roomManager);

// API Endpoints
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptimeSec: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: CONFIG.NODE_ENV,
    storage: '100% In-Memory (Zero Database)',
  });
});

app.get('/api/games', (req: Request, res: Response) => {
  res.json({
    success: true,
    games: Object.values(GAMES_METADATA),
  });
});

app.get('/api/rooms/:roomId', (req: Request, res: Response) => {
  const roomId = req.params.roomId?.toUpperCase();
  const room = roomManager.getRoom(roomId);

  if (!room) {
    return res.status(404).json({
      success: false,
      error: { code: 'ROOM_NOT_FOUND', message: 'Room not found.' },
    });
  }

  const connectedCount = room.players.filter(p => p.connected).length;
  const isFull = connectedCount >= room.maxPlayers;
  const inGame = room.status === 'in_game';

  res.json({
    success: true,
    room: {
      roomId: room.roomId,
      game: room.game,
      status: room.status,
      playerCount: connectedCount,
      maxPlayers: room.maxPlayers,
      isFull,
      canJoin: !isFull && !inGame,
    },
  });
});

// Production Client Static Serving & SPA Fallback
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`Serving client production build from ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req: Request, res: Response) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Friends Arcade API</title></head>
        <body style="font-family: sans-serif; background: #0A0F1D; color: #fff; padding: 2rem;">
          <h1>🎮 Friends Arcade Backend Server</h1>
          <p>Server is running in development mode on port ${CONFIG.PORT}.</p>
          <p>Database: <strong>None (In-Memory Runtime Maps)</strong></p>
          <p>To view the frontend, start Vite dev server on port 5173 or build the client.</p>
        </body>
      </html>
    `);
  });
}

// Start server
httpServer.listen(CONFIG.PORT, () => {
  console.log(`===============================================`);
  console.log(`🎮 Friends Arcade Server running on port ${CONFIG.PORT}`);
  console.log(`📡 Real-time WebSockets & In-Memory State ready`);
  console.log(`🚫 Zero Database Mode: 100% In-Memory Runtime`);
  console.log(`===============================================`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('\nShutting down server gracefully...');
  roomManager.destroy();
  io.close(() => {
    httpServer.close(() => {
      console.log('Server terminated cleanly.');
      process.exit(0);
    });
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
