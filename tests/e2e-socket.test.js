import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { io as ClientIO } from 'socket.io-client';
import { RoomManager } from '../server/dist/server/src/rooms/roomManager.js';
import { registerSocketHandlers } from '../server/dist/server/src/sockets/socketHandler.js';
import { SOCKET_EVENTS } from '../server/dist/shared/types.js';

test('End-to-End Real-Time Socket.IO Multiplayer Match', async () => {
  const app = express();
  const httpServer = createServer(app);
  const ioServer = new Server(httpServer, {
    cors: { origin: '*' },
    transports: ['websocket'],
  });

  const roomManager = new RoomManager(ioServer);
  registerSocketHandlers(ioServer, roomManager);

  await new Promise(resolve => httpServer.listen(0, resolve));
  const port = httpServer.address().port;
  const serverUrl = `http://localhost:${port}`;

  try {
    // 1. Connect Client 1 (Alice - Host)
    const client1 = ClientIO(serverUrl, { transports: ['websocket'] });
    await new Promise(resolve => client1.on('connect', resolve));
    assert.ok(client1.connected);

    // 2. Alice creates a Tic-Tac-Toe room
    let createdRoomId = '';
    await new Promise(resolve => {
      client1.emit(
        SOCKET_EVENTS.ROOM_CREATE,
        { playerName: 'Alice', avatar: '🦊', gameId: 'tic-tac-toe' },
        response => {
          assert.equal(response.success, true);
          assert.ok(response.room);
          createdRoomId = response.room.roomId;
          assert.equal(createdRoomId.length, 6);
          resolve(true);
        }
      );
    });

    // 3. Connect Client 2 (Bob - Friend)
    const client2 = ClientIO(serverUrl, { transports: ['websocket'] });
    await new Promise(resolve => client2.on('connect', resolve));
    assert.ok(client2.connected);

    // 4. Bob joins Alice's room
    let client1NotifiedOfBob = false;
    client1.on(SOCKET_EVENTS.ROOM_UPDATED, room => {
      if (room.players.some(p => p.playerName === 'Bob')) {
        client1NotifiedOfBob = true;
      }
    });

    await new Promise(resolve => {
      client2.emit(
        SOCKET_EVENTS.ROOM_JOIN,
        { roomId: createdRoomId, playerName: 'Bob', avatar: '🐼' },
        response => {
          assert.equal(response.success, true);
          assert.equal(response.room.players.length, 2);
          resolve(true);
        }
      );
    });

    await new Promise(r => setTimeout(r, 60));
    assert.equal(client1NotifiedOfBob, true);

    // 5. Bob marks himself ready
    await new Promise(resolve => {
      client2.emit(SOCKET_EVENTS.PLAYER_READY, { isReady: true }, response => {
        assert.equal(response.success, true);
        resolve(true);
      });
    });

    // 6. Alice (host) starts game
    let client1GameState = null;
    let client2GameState = null;

    client1.on(SOCKET_EVENTS.GAME_STATE, state => {
      client1GameState = state;
    });
    client2.on(SOCKET_EVENTS.GAME_STATE, state => {
      client2GameState = state;
    });

    await new Promise(resolve => {
      client1.emit(SOCKET_EVENTS.GAME_START, response => {
        assert.equal(response.success, true);
        resolve(true);
      });
    });

    await new Promise(r => setTimeout(r, 60));
    assert.ok(client1GameState);
    assert.ok(client2GameState);
    assert.equal(client1GameState.currentTurn, client1.id);

    // 7. Bob attempts illegal out-of-turn move
    await new Promise(resolve => {
      client2.emit(SOCKET_EVENTS.GAME_ACTION, { action: 'make_move', payload: { index: 0 } }, response => {
        assert.equal(response.success, false);
        assert.equal(response.error, 'Not your turn');
        resolve(true);
      });
    });

    // 8. Alice makes valid move: index 0
    await new Promise(resolve => {
      client1.emit(SOCKET_EVENTS.GAME_ACTION, { action: 'make_move', payload: { index: 0 } }, response => {
        assert.equal(response.success, true);
        resolve(true);
      });
    });

    await new Promise(r => setTimeout(r, 60));
    assert.equal(client2GameState.board[0], 'X');
    assert.equal(client2GameState.currentTurn, client2.id);

    // 9. Play through to a win:
    // Bob: index 3
    await new Promise(r => client2.emit(SOCKET_EVENTS.GAME_ACTION, { action: 'make_move', payload: { index: 3 } }, r));
    // Alice: index 1
    await new Promise(r => client1.emit(SOCKET_EVENTS.GAME_ACTION, { action: 'make_move', payload: { index: 1 } }, r));
    // Bob: index 4
    await new Promise(r => client2.emit(SOCKET_EVENTS.GAME_ACTION, { action: 'make_move', payload: { index: 4 } }, r));

    // Listen for game:finished
    let finishedResult = null;
    client1.on(SOCKET_EVENTS.GAME_FINISHED, res => {
      finishedResult = res;
    });

    // Alice: index 2 -> 3 in a row on top row!
    await new Promise(r => client1.emit(SOCKET_EVENTS.GAME_ACTION, { action: 'make_move', payload: { index: 2 } }, r));

    await new Promise(r => setTimeout(r, 60));
    assert.ok(finishedResult);
    assert.equal(finishedResult.winner, client1.id);
    assert.equal(finishedResult.scores[client1.id], 1);

    // Clean disconnect
    client1.disconnect();
    client2.disconnect();
  } finally {
    roomManager.destroy();
    ioServer.close();
    httpServer.close();
  }
});
