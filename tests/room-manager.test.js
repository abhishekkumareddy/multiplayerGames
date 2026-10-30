import test from 'node:test';
import assert from 'node:assert/strict';
import { RoomManager } from '../server/dist/server/src/rooms/roomManager.js';

// Mock Socket.io Server
class MockIO {
  to(room) {
    return {
      emit: () => {},
    };
  }
}

test('RoomManager - Create room without database', () => {
  const io = new MockIO();
  const rm = new RoomManager(io);

  const res = rm.createRoom('socket-1', 'Alice', '🦊', 'tic-tac-toe');
  assert.equal(res.success, true);
  assert.ok(res.room);
  assert.equal(res.room.roomId.length, 6);
  assert.equal(res.room.hostId, 'socket-1');
  assert.equal(res.room.players.length, 1);
  assert.equal(res.room.players[0].playerName, 'Alice');
  assert.equal(res.room.players[0].isHost, true);

  rm.destroy();
});

test('RoomManager - Join room validation', () => {
  const io = new MockIO();
  const rm = new RoomManager(io);

  const createRes = rm.createRoom('socket-1', 'Alice', '🦊', 'tic-tac-toe');
  const code = createRes.room.roomId;

  // Join with invalid code
  const invalidRes = rm.joinRoom('BADCOD', 'socket-2', 'Bob', '🐼');
  assert.equal(invalidRes.success, false);
  assert.equal(invalidRes.error.code, 'ROOM_NOT_FOUND');

  // Join with valid code
  const validRes = rm.joinRoom(code, 'socket-2', 'Bob', '🐼');
  assert.equal(validRes.success, true);
  assert.equal(validRes.room.players.length, 2);

  // Join full room (TicTacToe max is 2)
  const fullRes = rm.joinRoom(code, 'socket-3', 'Charlie', '🐯');
  assert.equal(fullRes.success, false);
  assert.equal(fullRes.error.code, 'ROOM_FULL');

  rm.destroy();
});

test('RoomManager - Leave room and host reassignment', () => {
  const io = new MockIO();
  const rm = new RoomManager(io);

  const createRes = rm.createRoom('socket-1', 'Alice', '🦊', 'connect-four');
  const code = createRes.room.roomId;
  rm.joinRoom(code, 'socket-2', 'Bob', '🐼');

  // Alice (host) leaves
  const leaveRes = rm.leaveRoom('socket-1');
  assert.equal(leaveRes.success, true);
  assert.equal(leaveRes.destroyed, false);

  const room = rm.getRoom(code);
  assert.ok(room);
  assert.equal(room.players.length, 1);
  assert.equal(room.hostId, 'socket-2');
  assert.equal(room.players[0].isHost, true);

  // Bob leaves -> room destroyed
  const leaveBob = rm.leaveRoom('socket-2');
  assert.equal(leaveBob.destroyed, true);
  assert.equal(rm.getRoom(code), undefined);

  rm.destroy();
});

test('RoomManager - Disconnect and reconnection grace period', () => {
  const io = new MockIO();
  const rm = new RoomManager(io);

  const createRes = rm.createRoom('socket-1', 'Alice', '🦊', 'memory-match');
  const code = createRes.room.roomId;
  rm.joinRoom(code, 'socket-2', 'Bob', '🐼');

  // Bob disconnects
  rm.handleDisconnect('socket-2');
  const roomAfterDc = rm.getRoom(code);
  const bobPlayer = roomAfterDc.players.find(p => p.playerName === 'Bob');
  assert.equal(bobPlayer.connected, false);

  // Bob reconnects with new socket ID 'socket-2-new'
  const reconnectRes = rm.joinRoom(code, 'socket-2-new', 'Bob', '🐼');
  assert.equal(reconnectRes.success, true);

  const roomAfterRc = rm.getRoom(code);
  const reconnectedBob = roomAfterRc.players.find(p => p.playerName === 'Bob');
  assert.equal(reconnectedBob.connected, true);
  assert.equal(reconnectedBob.socketId, 'socket-2-new');

  rm.destroy();
});

test('RoomManager - Real-Time Departure Notification with >3 players', () => {
  const io = new MockIO();
  const rm = new RoomManager(io);

  const createRes = rm.createRoom('socket-1', 'Abhishek', '👑', 'ludo');
  const code = createRes.room.roomId;
  rm.joinRoom(code, 'socket-2', 'Bob', '🐼');
  rm.joinRoom(code, 'socket-3', 'Charlie', '🦊');
  rm.joinRoom(code, 'socket-4', 'Diana', '🦄');

  assert.equal(rm.getRoom(code).players.length, 4);

  // Abhishek leaves room -> 3 players remaining, Bob becomes host
  const leaveRes = rm.leaveRoom('socket-1');
  assert.equal(leaveRes.success, true);
  assert.equal(leaveRes.departedPlayer.playerName, 'Abhishek');
  assert.equal(leaveRes.departedPlayer.remainingCount, 3);
  assert.equal(leaveRes.departedPlayer.hostReassigned, true);
  assert.equal(leaveRes.departedPlayer.newHostName, 'Bob');

  // Charlie leaves room -> 2 players remaining, no host reassign
  const leaveCharlie = rm.leaveRoom('socket-3');
  assert.equal(leaveCharlie.departedPlayer.playerName, 'Charlie');
  assert.equal(leaveCharlie.departedPlayer.remainingCount, 2);
  assert.equal(leaveCharlie.departedPlayer.hostReassigned, false);

  rm.destroy();
});
