import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { io as ClientIO } from 'socket.io-client';
import axios from 'axios';
import { RoomManager } from '../server/dist/server/src/rooms/roomManager.js';
import { registerSocketHandlers } from '../server/dist/server/src/sockets/socketHandler.js';
import { isOriginAllowed, getAllowedOrigins, CONFIG } from '../server/dist/server/src/config/constants.js';
import { GAMES_METADATA } from '../server/dist/shared/games.js';
import { SOCKET_EVENTS } from '../server/dist/shared/types.js';

test('Integration Test Suite: API, CORS, Health Checks, and Real-Time Multiplayer', async (t) => {
  // Setup real Express + Socket.IO server matching production configuration
  const app = express();
  const httpServer = createServer(app);

  const corsOptions = {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(express.json());

  const ioServer = new Server(httpServer, {
    cors: corsOptions,
    pingInterval: 10000,
    pingTimeout: 5000,
    transports: ['websocket', 'polling'],
  });

  const roomManager = new RoomManager(ioServer);
  registerSocketHandlers(ioServer, roomManager);

  // Health check endpoints matching server.ts
  const handleHealthCheck = (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'friends-arcade-backend',
      uptimeSec: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: CONFIG.NODE_ENV,
      activeRooms: roomManager.getRoomCount(),
      cors: {
        allowedOrigins: getAllowedOrigins(),
      },
    });
  };

  app.get('/health', handleHealthCheck);
  app.get('/api/health', handleHealthCheck);

  app.get('/api/games', (req, res) => {
    res.json({
      success: true,
      games: Object.values(GAMES_METADATA),
    });
  });

  app.get('/api/rooms/:roomId', (req, res) => {
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

  // Start test server on dynamic open port
  await new Promise(resolve => httpServer.listen(0, resolve));
  const port = httpServer.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Backend Health Check Verification (GET /health)
    await t.test('1. Verify GET /health returns 200 OK with correct payload', async () => {
      const res = await fetch(`${baseUrl}/health`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.status, 'ok');
      assert.equal(data.service, 'friends-arcade-backend');
      assert.equal(typeof data.uptimeSec, 'number');
      assert.equal(typeof data.activeRooms, 'number');
      assert.ok(Array.isArray(data.cors.allowedOrigins));
    });

    // 2. Backward Compatibility GET /api/health
    await t.test('2. Verify GET /api/health alias returns 200 OK', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.status, 'ok');
    });

    // 3. Centralized Axios Instance API Connectivity
    await t.test('3. Verify Axios API requests work through centralized config', async () => {
      const axiosClient = axios.create({
        baseURL: baseUrl,
        timeout: 5000,
        withCredentials: true,
      });

      const healthRes = await axiosClient.get('/health');
      assert.equal(healthRes.status, 200);
      assert.equal(healthRes.data.status, 'ok');

      const gamesRes = await axiosClient.get('/api/games');
      assert.equal(gamesRes.status, 200);
      assert.equal(gamesRes.data.success, true);
      assert.ok(gamesRes.data.games.length >= 6);
    });

    // 4. CORS Origins Testing
    await t.test('4. Verify CORS allows production origins with credentials', async () => {
      const originsToTest = [
        'https://friendsarcade.fun',
        'https://www.friendsarcade.fun',
        'http://localhost:5173',
        'https://friendsarcade.netlify.app',
        'https://deploy-preview-42--friendsarcade.netlify.app',
      ];

      for (const origin of originsToTest) {
        const res = await fetch(`${baseUrl}/health`, {
          headers: { Origin: origin },
        });
        assert.equal(res.status, 200);
        assert.equal(res.headers.get('access-control-allow-origin'), origin, `Origin ${origin} should be reflected`);
        assert.equal(res.headers.get('access-control-allow-credentials'), 'true', 'Credentials should be true');
      }
    });

    await t.test('5. Verify CORS blocks unauthorized origins', async () => {
      // Temporarily ensure CLIENT_ORIGIN is not wildcard for this test
      const prevOrigin = CONFIG.CLIENT_ORIGIN;
      CONFIG.CLIENT_ORIGIN = 'https://friendsarcade.fun';

      try {
        const res = await fetch(`${baseUrl}/health`, {
          headers: { Origin: 'https://malicious-attacker.com' },
        });
        assert.equal(res.status, 200);
        assert.equal(res.headers.get('access-control-allow-origin'), null, 'Unauthorized origin must not receive allow-origin header');
      } finally {
        CONFIG.CLIENT_ORIGIN = prevOrigin;
      }
    });

    // 6. Multiplayer Room Creation & Joining via Socket.IO
    await t.test('6. Verify Multiplayer Room Creation & Joining across multiple browser clients', async () => {
      try {
        const client1 = ClientIO(baseUrl, {
          transports: ['websocket', 'polling'],
          extraHeaders: { Origin: 'https://friendsarcade.fun' },
        });
        await new Promise(resolve => client1.on('connect', resolve));
        assert.ok(client1.connected);

        // Create room with Tic-Tac-Toe
        let createdRoom = null;
        await new Promise(resolve => {
          client1.emit(
            SOCKET_EVENTS.ROOM_CREATE,
            { playerName: 'Player1', avatar: '👾', gameId: 'tic-tac-toe' },
            response => {
              assert.equal(response.success, true);
              assert.ok(response.room);
              assert.equal(response.room.roomId.length, 6);
              createdRoom = response.room;
              resolve(true);
            }
          );
        });

        // Verify room details via REST API endpoint (/api/rooms/:roomId)
        const roomApiRes = await fetch(`${baseUrl}/api/rooms/${createdRoom.roomId}`, {
          headers: { Origin: 'https://friendsarcade.fun' },
        });
        assert.equal(roomApiRes.status, 200);
        const roomApiData = await roomApiRes.json();
        assert.equal(roomApiData.success, true);
        assert.equal(roomApiData.room.roomId, createdRoom.roomId);
        assert.equal(roomApiData.room.playerCount, 1);
        assert.equal(roomApiData.room.canJoin, true);

        // Connect Client 2 (second browser)
        const client2 = ClientIO(baseUrl, {
          transports: ['websocket', 'polling'],
          extraHeaders: { Origin: 'https://friendsarcade.fun' },
        });
        await new Promise(resolve => client2.on('connect', resolve));
        assert.ok(client2.connected);

        // Client 1 listening for Client 2 join notification
        let client1Notified = false;
        client1.on(SOCKET_EVENTS.ROOM_UPDATED, room => {
          if (room.players.some(p => p.playerName === 'Player2')) {
            client1Notified = true;
          }
        });

        // Client 2 joins using the 6-character room code
        await new Promise(resolve => {
          client2.emit(
            SOCKET_EVENTS.ROOM_JOIN,
            { roomId: createdRoom.roomId, playerName: 'Player2', avatar: '🦊' },
            response => {
              assert.equal(response.success, true);
              assert.equal(response.room.players.length, 2);
              resolve(true);
            }
          );
        });

        await new Promise(r => setTimeout(r, 60));
        assert.equal(client1Notified, true);

        // 7. Multiplayer Game Synchronization
        // Client 2 marks ready
        await new Promise(resolve => {
          client2.emit(SOCKET_EVENTS.PLAYER_READY, { isReady: true }, response => {
            assert.equal(response.success, true);
            resolve(true);
          });
        });

        let c1GameState = null;
        let c2GameState = null;
        client1.on(SOCKET_EVENTS.GAME_STATE, s => { c1GameState = s; });
        client2.on(SOCKET_EVENTS.GAME_STATE, s => { c2GameState = s; });

        // Host starts game
        await new Promise(resolve => {
          client1.emit(SOCKET_EVENTS.GAME_START, response => {
            assert.equal(response.success, true);
            resolve(true);
          });
        });

        await new Promise(r => setTimeout(r, 60));
        assert.ok(c1GameState);
        assert.ok(c2GameState);

        // Turn-based move
        const currentTurnClient = c1GameState.currentTurn === client1.id ? client1 : client2;
        await new Promise(resolve => {
          currentTurnClient.emit(SOCKET_EVENTS.GAME_ACTION, { action: 'make_move', payload: { index: 4 } }, res => {
            assert.equal(res.success, true);
            resolve(true);
          });
        });

        await new Promise(r => setTimeout(r, 60));
        assert.ok(c1GameState.board[4] !== null);
        assert.equal(c1GameState.board[4], c2GameState.board[4]);

        client1.disconnect();
        client2.disconnect();
      } catch (e) {
        console.error('STEP 6 FAILED WITH ERROR:', e);
        throw e;
      }
    });

    // 8. Reconnection after temporary disconnection
    await t.test('7. Verify reconnection works after temporary disconnection', async () => {
      const host = ClientIO(baseUrl, { transports: ['websocket'] });
      await new Promise(resolve => host.on('connect', resolve));

      let roomId = '';
      await new Promise(resolve => {
        host.emit(
          SOCKET_EVENTS.ROOM_CREATE,
          { playerName: 'GraceHost', avatar: '🚀', gameId: 'rock-paper-scissors' },
          res => {
            roomId = res.room.roomId;
            resolve(true);
          }
        );
      });

      const guest = ClientIO(baseUrl, { transports: ['websocket'] });
      await new Promise(resolve => guest.on('connect', resolve));

      await new Promise(resolve => {
        guest.emit(
          SOCKET_EVENTS.ROOM_JOIN,
          { roomId, playerName: 'TemporaryGuest', avatar: '🤖' },
          resolve
        );
      });

      // Temporary disconnect of guest
      guest.disconnect();
      await new Promise(r => setTimeout(r, 100));

      const roomAfterDisconnect = roomManager.getRoom(roomId);
      const disconnectedPlayer = roomAfterDisconnect.players.find(p => p.playerName === 'TemporaryGuest');
      assert.ok(disconnectedPlayer);
      assert.equal(disconnectedPlayer.connected, false);

      // Reconnect with new socket connection but same player name
      const reconnectedGuest = ClientIO(baseUrl, { transports: ['websocket'] });
      await new Promise(resolve => reconnectedGuest.on('connect', resolve));

      await new Promise(resolve => {
        reconnectedGuest.emit(
          SOCKET_EVENTS.ROOM_JOIN,
          { roomId, playerName: 'TemporaryGuest', avatar: '🤖' },
          res => {
            assert.equal(res.success, true);
            assert.equal(res.room.players.length, 2);
            const player = res.room.players.find(p => p.playerName === 'TemporaryGuest');
            assert.equal(player.connected, true);
            resolve(true);
          }
        );
      });

      host.disconnect();
      reconnectedGuest.disconnect();
    });
  } finally {
    roomManager.destroy();
    ioServer.close();
    httpServer.close();
  }
});
