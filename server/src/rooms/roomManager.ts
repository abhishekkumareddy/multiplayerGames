import { randomInt } from 'node:crypto';
import { Server } from 'socket.io';
import { GameId, Player, Room, RoomError, SOCKET_EVENTS } from '../../../shared/types.js';
import { GAMES_METADATA } from '../../../shared/games.js';
import { CONFIG } from '../config/constants.js';
import { BaseGameEngine } from '../games/BaseGameEngine.js';
import { createGameEngine } from '../games/gameFactory.js';

export class RoomManager {
  private io: Server;
  private rooms: Map<string, Room> = new Map();
  private engines: Map<string, BaseGameEngine> = new Map();
  private socketToRoom: Map<string, string> = new Map();
  private disconnectTimers: Map<string, NodeJS.Timeout> = new Map(); // key: `${roomId}:${socketId}`
  private emptyRoomTimers: Map<string, NodeJS.Timeout> = new Map(); // key: roomId
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(io: Server) {
    this.io = io;
    this.startPeriodicCleanup();
  }

  private generateRoomCode(): string {
    const chars = CONFIG.ROOM_CODE_CHARS;
    let code = '';
    for (let i = 0; i < CONFIG.ROOM_CODE_LENGTH; i++) {
      code += chars[randomInt(chars.length)];
    }
    return code;
  }

  public createRoom(
    hostSocketId: string,
    playerName: string,
    avatar: string = '👾',
    gameId: GameId = 'tic-tac-toe'
  ): { success: boolean; room?: Room; error?: RoomError } {
    const cleanName = playerName?.trim();
    if (!cleanName || cleanName.length === 0 || cleanName.length > 20) {
      return {
        success: false,
        error: { code: 'INVALID_NAME', message: 'Name must be between 1 and 20 characters.' },
      };
    }

    let roomId: string;
    let attempts = 0;
    do {
      roomId = this.generateRoomCode();
      attempts++;
      if (attempts > 100) {
        return {
          success: false,
          error: { code: 'SERVER_ERROR', message: 'Failed to generate a unique room code.' },
        };
      }
    } while (this.rooms.has(roomId));

    const metadata = GAMES_METADATA[gameId] || GAMES_METADATA['tic-tac-toe'];

    const hostPlayer: Player = {
      socketId: hostSocketId,
      playerName: cleanName,
      avatar: avatar || '👾',
      isHost: true,
      isReady: true, // Host is ready by default
      score: 0,
      connected: true,
      disconnectedAt: null,
    };

    const room: Room = {
      roomId,
      hostId: hostSocketId,
      status: 'waiting',
      game: gameId,
      players: [hostPlayer],
      gameState: null,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      maxPlayers: metadata.maxPlayers,
      minPlayers: metadata.minPlayers,
      rematchVotes: [],
    };

    this.rooms.set(roomId, room);
    this.socketToRoom.set(hostSocketId, roomId);

    return { success: true, room };
  }

  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId?.toUpperCase());
  }

  public getRoomBySocketId(socketId: string): Room | undefined {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return undefined;
    return this.rooms.get(roomId);
  }

  public joinRoom(
    roomIdInput: string,
    socketId: string,
    playerName: string,
    avatar: string = '🚀'
  ): { success: boolean; room?: Room; error?: RoomError } {
    const roomId = roomIdInput?.trim().toUpperCase();
    if (!roomId || roomId.length !== CONFIG.ROOM_CODE_LENGTH) {
      return {
        success: false,
        error: { code: 'INVALID_CODE', message: 'Room code must be 6 characters.' },
      };
    }

    const cleanName = playerName?.trim();
    if (!cleanName || cleanName.length === 0 || cleanName.length > 20) {
      return {
        success: false,
        error: { code: 'INVALID_NAME', message: 'Name must be between 1 and 20 characters.' },
      };
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      return {
        success: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Room not found. Check code or create a new room.' },
      };
    }

    // Cancel empty room timer if pending
    if (this.emptyRoomTimers.has(roomId)) {
      clearTimeout(this.emptyRoomTimers.get(roomId)!);
      this.emptyRoomTimers.delete(roomId);
    }

    // Check if player is reconnecting with the same name
    const existingPlayer = room.players.find(p => p.playerName.toLowerCase() === cleanName.toLowerCase());
    if (existingPlayer) {
      if (!existingPlayer.connected) {
        // Player reconnecting!
        const timerKey = `${roomId}:${existingPlayer.socketId}`;
        if (this.disconnectTimers.has(timerKey)) {
          clearTimeout(this.disconnectTimers.get(timerKey)!);
          this.disconnectTimers.delete(timerKey);
        }

        // Clean old socket mapping
        this.socketToRoom.delete(existingPlayer.socketId);

        // Update player info
        existingPlayer.socketId = socketId;
        existingPlayer.connected = true;
        existingPlayer.disconnectedAt = null;
        if (avatar) existingPlayer.avatar = avatar;

        this.socketToRoom.set(socketId, roomId);
        room.lastActivity = Date.now();

        return { success: true, room };
      } else if (existingPlayer.socketId === socketId) {
        return { success: true, room };
      } else {
        return {
          success: false,
          error: { code: 'INVALID_NAME', message: 'A player with this name is already in the room.' },
        };
      }
    }

    // Check if room is in game
    if (room.status === 'in_game') {
      return {
        success: false,
        error: { code: 'GAME_ALREADY_STARTED', message: 'Game has already started in this room.' },
      };
    }

    // Check capacity
    const connectedCount = room.players.filter(p => p.connected).length;
    if (connectedCount >= room.maxPlayers) {
      return {
        success: false,
        error: { code: 'ROOM_FULL', message: `Room is full (Maximum ${room.maxPlayers} players).` },
      };
    }

    const newPlayer: Player = {
      socketId,
      playerName: cleanName,
      avatar: avatar || '🎮',
      isHost: false,
      isReady: false,
      score: 0,
      connected: true,
      disconnectedAt: null,
    };

    room.players.push(newPlayer);
    this.socketToRoom.set(socketId, roomId);
    room.lastActivity = Date.now();

    return { success: true, room };
  }

  public leaveRoom(socketId: string): { success: boolean; roomId?: string; room?: Room; destroyed?: boolean } {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return { success: false };

    const room = this.rooms.get(roomId);
    if (!room) {
      this.socketToRoom.delete(socketId);
      return { success: false };
    }

    this.socketToRoom.delete(socketId);

    // Remove player
    const playerIndex = room.players.findIndex(p => p.socketId === socketId);
    if (playerIndex !== -1) {
      const wasHost = room.players[playerIndex].isHost;
      room.players.splice(playerIndex, 1);

      // Also remove rematch vote
      room.rematchVotes = room.rematchVotes.filter(id => id !== socketId);

      // If room is empty, destroy it
      if (room.players.length === 0) {
        this.cleanupRoom(roomId);
        return { success: true, roomId, destroyed: true };
      }

      // If host left, reassign host to first remaining connected player
      if (wasHost) {
        const nextHost = room.players.find(p => p.connected) || room.players[0];
        if (nextHost) {
          nextHost.isHost = true;
          nextHost.isReady = true;
          room.hostId = nextHost.socketId;
        }
      }

      // If in game, notify game engine
      const engine = this.engines.get(roomId);
      if (engine && room.status === 'in_game') {
        engine.handlePlayerDisconnect(socketId);
      }

      room.lastActivity = Date.now();
      return { success: true, roomId, room, destroyed: false };
    }

    return { success: true, roomId, room, destroyed: false };
  }

  public handleDisconnect(socketId: string): { roomId?: string; room?: Room } {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return {};

    const room = this.rooms.get(roomId);
    if (!room) {
      this.socketToRoom.delete(socketId);
      return {};
    }

    const player = room.players.find(p => p.socketId === socketId);
    if (!player) return {};

    player.connected = false;
    player.disconnectedAt = Date.now();
    room.lastActivity = Date.now();

    // Notify game engine
    const engine = this.engines.get(roomId);
    if (engine && room.status === 'in_game') {
      engine.handlePlayerDisconnect(socketId);
    }

    // Check if ANY players are still connected
    const anyConnected = room.players.some(p => p.connected);
    if (!anyConnected) {
      // Start empty room destruction timer
      const timer = setTimeout(() => {
        this.cleanupRoom(roomId);
      }, CONFIG.EMPTY_ROOM_TTL_MS);
      this.emptyRoomTimers.set(roomId, timer);
    }

    // Start disconnect grace period timer for this specific player
    const timerKey = `${roomId}:${socketId}`;
    const graceTimer = setTimeout(() => {
      this.disconnectTimers.delete(timerKey);
      // If still disconnected after grace period, permanently remove
      const currentRoom = this.rooms.get(roomId);
      if (currentRoom) {
        const idx = currentRoom.players.findIndex(p => p.socketId === socketId);
        if (idx !== -1 && !currentRoom.players[idx].connected) {
          this.leaveRoom(socketId);
          this.broadcastRoomUpdate(roomId);
        }
      }
    }, CONFIG.DISCONNECT_GRACE_PERIOD_MS);

    this.disconnectTimers.set(timerKey, graceTimer);

    return { roomId, room };
  }

  public setPlayerReady(socketId: string, isReady: boolean): { success: boolean; room?: Room; error?: RoomError } {
    const room = this.getRoomBySocketId(socketId);
    if (!room) {
      return { success: false, error: { code: 'NOT_IN_ROOM', message: 'You are not in a room.' } };
    }

    const player = room.players.find(p => p.socketId === socketId);
    if (!player) {
      return { success: false, error: { code: 'NOT_IN_ROOM', message: 'Player not found in room.' } };
    }

    player.isReady = isReady;
    room.lastActivity = Date.now();
    return { success: true, room };
  }

  public selectGame(socketId: string, gameId: GameId): { success: boolean; room?: Room; error?: RoomError } {
    const room = this.getRoomBySocketId(socketId);
    if (!room) {
      return { success: false, error: { code: 'NOT_IN_ROOM', message: 'You are not in a room.' } };
    }

    if (room.hostId !== socketId) {
      return { success: false, error: { code: 'NOT_HOST', message: 'Only the host can select games.' } };
    }

    if (room.status === 'in_game') {
      return { success: false, error: { code: 'GAME_ALREADY_STARTED', message: 'Cannot change game during match.' } };
    }

    const meta = GAMES_METADATA[gameId];
    if (!meta) {
      return { success: false, error: { code: 'SERVER_ERROR', message: 'Unknown game.' } };
    }

    room.game = gameId;
    room.minPlayers = meta.minPlayers;
    room.maxPlayers = meta.maxPlayers;
    room.lastActivity = Date.now();
    room.rematchVotes = [];

    return { success: true, room };
  }

  public startGame(socketId: string): { success: boolean; room?: Room; error?: RoomError } {
    const room = this.getRoomBySocketId(socketId);
    if (!room) {
      return { success: false, error: { code: 'NOT_IN_ROOM', message: 'You are not in a room.' } };
    }

    if (room.hostId !== socketId) {
      return { success: false, error: { code: 'NOT_HOST', message: 'Only the host can start the game.' } };
    }

    if (!room.game) {
      return { success: false, error: { code: 'SERVER_ERROR', message: 'No game selected.' } };
    }

    const connectedPlayers = room.players.filter(p => p.connected);
    if (connectedPlayers.length < room.minPlayers) {
      return {
        success: false,
        error: {
          code: 'NOT_ENOUGH_PLAYERS',
          message: `Need at least ${room.minPlayers} players to start ${GAMES_METADATA[room.game]?.name || 'game'}.`,
        },
      };
    }

    if (connectedPlayers.length > room.maxPlayers) {
      return {
        success: false,
        error: {
          code: 'ROOM_FULL',
          message: `Too many players for ${GAMES_METADATA[room.game]?.name || 'game'} (Max: ${room.maxPlayers}).`,
        },
      };
    }

    // Check all non-host players are ready
    const nonHostPlayers = connectedPlayers.filter(p => !p.isHost);
    const unreadyPlayers = nonHostPlayers.filter(p => !p.isReady);
    if (unreadyPlayers.length > 0) {
      return {
        success: false,
        error: {
          code: 'PLAYERS_NOT_READY',
          message: `Waiting for ${unreadyPlayers.map(p => p.playerName).join(', ')} to get ready.`,
        },
      };
    }

    // Clean up old engine if any
    if (this.engines.has(room.roomId)) {
      this.engines.get(room.roomId)!.cleanup();
      this.engines.delete(room.roomId);
    }

    // Create game engine callbacks
    const callbacks = {
      broadcastState: (state: any) => {
        room.gameState = state;
        this.io.to(room.roomId).emit(SOCKET_EVENTS.GAME_STATE, state);
      },
      broadcastClientState: (getClientStateForPlayer: (socketId: string) => any) => {
        // Send customized state to each socket in room
        for (const player of room.players) {
          if (player.connected) {
            const playerState = getClientStateForPlayer(player.socketId);
            this.io.to(player.socketId).emit(SOCKET_EVENTS.GAME_STATE, playerState);
          }
        }
      },
      broadcastFinished: (result: { winner: string | null; scores: Record<string, number>; reason?: string }) => {
        room.status = 'finished';
        // Update player overall scores
        for (const [sId, score] of Object.entries(result.scores)) {
          const p = room.players.find(player => player.socketId === sId);
          if (p) p.score = score;
        }
        this.io.to(room.roomId).emit(SOCKET_EVENTS.GAME_FINISHED, result);
        this.broadcastRoomUpdate(room.roomId);
      },
    };

    const engine = createGameEngine(room.game, room.roomId, [...connectedPlayers], callbacks);
    this.engines.set(room.roomId, engine);

    room.status = 'in_game';
    room.gameState = engine.getState();
    room.lastActivity = Date.now();
    room.rematchVotes = [];

    // Broadcast initial state
    callbacks.broadcastClientState((sId: string) => engine.getClientState(sId));

    return { success: true, room };
  }

  public handleGameAction(socketId: string, action: string, payload?: any): { success: boolean; error?: string } {
    const room = this.getRoomBySocketId(socketId);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    const engine = this.engines.get(room.roomId);
    if (!engine) {
      return { success: false, error: 'No active game engine' };
    }

    room.lastActivity = Date.now();
    return engine.handleAction(socketId, action, payload);
  }

  public voteRematch(socketId: string): { success: boolean; room?: Room; error?: RoomError } {
    const room = this.getRoomBySocketId(socketId);
    if (!room) {
      return { success: false, error: { code: 'NOT_IN_ROOM', message: 'You are not in a room.' } };
    }

    if (!room.rematchVotes.includes(socketId)) {
      room.rematchVotes.push(socketId);
    }

    const connectedCount = room.players.filter(p => p.connected).length;
    // If all connected players vote rematch or host triggers rematch, restart game!
    const majorityOrHost = room.rematchVotes.length >= connectedCount || socketId === room.hostId;

    if (majorityOrHost) {
      room.rematchVotes = [];
      // Re-trigger startGame
      return this.startGame(room.hostId);
    }

    room.lastActivity = Date.now();
    return { success: true, room };
  }

  public broadcastRoomUpdate(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      this.io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);
    }
  }

  public cleanupRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Cleanup engine
    const engine = this.engines.get(roomId);
    if (engine) {
      engine.cleanup();
      this.engines.delete(roomId);
    }

    // Cleanup timers
    if (this.emptyRoomTimers.has(roomId)) {
      clearTimeout(this.emptyRoomTimers.get(roomId)!);
      this.emptyRoomTimers.delete(roomId);
    }

    for (const player of room.players) {
      const timerKey = `${roomId}:${player.socketId}`;
      if (this.disconnectTimers.has(timerKey)) {
        clearTimeout(this.disconnectTimers.get(timerKey)!);
        this.disconnectTimers.delete(timerKey);
      }
      this.socketToRoom.delete(player.socketId);
    }

    this.rooms.delete(roomId);
  }

  private startPeriodicCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [roomId, room] of this.rooms.entries()) {
        const isIdle = now - room.lastActivity > CONFIG.ABANDONED_ROOM_TTL_MS;
        const noConnected = !room.players.some(p => p.connected);

        if (isIdle || noConnected) {
          this.cleanupRoom(roomId);
        }
      }
    }, CONFIG.ROOM_CLEANUP_INTERVAL_MS);
  }

  public getRoomCount(): number {
    return this.rooms.size;
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    for (const roomId of this.rooms.keys()) {
      this.cleanupRoom(roomId);
    }
  }
}
