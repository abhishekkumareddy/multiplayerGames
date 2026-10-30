import { Server, Socket } from 'socket.io';
import { RoomManager } from '../rooms/roomManager.js';
import { ChatMessage, GameId, PlayerDepartedPayload, SOCKET_EVENTS } from '../../../shared/types.js';

export function registerSocketHandlers(io: Server, roomManager: RoomManager) {
  io.on('connection', (socket: Socket) => {
    // 1. Create Room
    socket.on(
      SOCKET_EVENTS.ROOM_CREATE,
      (
        data: { playerName: string; avatar?: string; gameId?: GameId },
        callback?: (res: { success: boolean; room?: any; error?: any }) => void
      ) => {
        try {
          const result = roomManager.createRoom(
            socket.id,
            data?.playerName,
            data?.avatar,
            data?.gameId || 'tic-tac-toe'
          );

          if (!result.success || !result.room) {
            if (callback) callback({ success: false, error: result.error });
            socket.emit(SOCKET_EVENTS.ROOM_ERROR, result.error);
            return;
          }

          socket.join(result.room.roomId);

          socket.emit(SOCKET_EVENTS.ROOM_CREATED, {
            roomId: result.room.roomId,
            room: result.room,
          });

          if (callback) {
            callback({ success: true, room: result.room });
          }
        } catch (err: any) {
          console.error('Error creating room:', err);
          const error = { code: 'SERVER_ERROR', message: 'Failed to create room.' };
          if (callback) callback({ success: false, error });
          socket.emit(SOCKET_EVENTS.ROOM_ERROR, error);
        }
      }
    );

    // 2. Join Room
    socket.on(
      SOCKET_EVENTS.ROOM_JOIN,
      (
        data: { roomId: string; playerName: string; avatar?: string },
        callback?: (res: { success: boolean; room?: any; error?: any }) => void
      ) => {
        try {
          const result = roomManager.joinRoom(
            data?.roomId,
            socket.id,
            data?.playerName,
            data?.avatar
          );

          if (!result.success || !result.room) {
            if (callback) callback({ success: false, error: result.error });
            socket.emit(SOCKET_EVENTS.ROOM_ERROR, result.error);
            return;
          }

          socket.join(result.room.roomId);

          // Acknowledge joining player
          socket.emit(SOCKET_EVENTS.ROOM_JOINED, {
            roomId: result.room.roomId,
            room: result.room,
          });

          // Broadcast updated room state to all players in the room
          roomManager.broadcastRoomUpdate(result.room.roomId);

          // If game is in progress, also send current game state to joining player
          if (result.room.status === 'in_game' && result.room.gameState) {
            socket.emit(SOCKET_EVENTS.GAME_STATE, result.room.gameState);
          }

          if (callback) {
            callback({ success: true, room: result.room });
          }
        } catch (err: any) {
          console.error('Error joining room:', err);
          const error = { code: 'SERVER_ERROR', message: 'Failed to join room.' };
          if (callback) callback({ success: false, error });
          socket.emit(SOCKET_EVENTS.ROOM_ERROR, error);
        }
      }
    );

    // 3. Leave Room
    socket.on(
      SOCKET_EVENTS.ROOM_LEAVE,
      (callback?: (res: { success: boolean }) => void) => {
        try {
          const result = roomManager.leaveRoom(socket.id);
          if (result.roomId) {
            socket.leave(result.roomId);
            if (!result.destroyed && result.departedPlayer) {
              const count = result.departedPlayer.remainingCount;
              const countMsg = `${count} player${count === 1 ? '' : 's'} remaining`;
              const msg = result.departedPlayer.hostReassigned
                ? `${result.departedPlayer.playerName} left the room. (${countMsg}). ${result.departedPlayer.newHostName} is now the host.`
                : `${result.departedPlayer.playerName} left the room. (${countMsg})`;

              const payload: PlayerDepartedPayload = {
                socketId: result.departedPlayer.socketId,
                playerName: result.departedPlayer.playerName,
                avatar: result.departedPlayer.avatar,
                reason: 'left',
                remainingCount: count,
                hostReassigned: result.departedPlayer.hostReassigned,
                newHostName: result.departedPlayer.newHostName,
                message: msg,
              };

              io.to(result.roomId).emit(SOCKET_EVENTS.PLAYER_DEPARTED, payload);

              const systemChat: ChatMessage = {
                id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                senderId: 'system',
                senderName: 'Arcade System',
                avatar: '📢',
                text: msg,
                timestamp: Date.now(),
                isSystem: true,
              };
              io.to(result.roomId).emit(SOCKET_EVENTS.CHAT_MESSAGE, systemChat);

              roomManager.broadcastRoomUpdate(result.roomId);
            }
          }
          if (callback) callback({ success: true });
        } catch (err) {
          console.error('Error leaving room:', err);
          if (callback) callback({ success: false });
        }
      }
    );

    // 4. Toggle Player Ready
    socket.on(
      SOCKET_EVENTS.PLAYER_READY,
      (
        data: { isReady: boolean },
        callback?: (res: { success: boolean; error?: any }) => void
      ) => {
        try {
          const result = roomManager.setPlayerReady(socket.id, data?.isReady);
          if (!result.success || !result.room) {
            if (callback) callback({ success: false, error: result.error });
            socket.emit(SOCKET_EVENTS.ROOM_ERROR, result.error);
            return;
          }

          roomManager.broadcastRoomUpdate(result.room.roomId);
          if (callback) callback({ success: true });
        } catch (err) {
          console.error('Error toggling ready:', err);
          if (callback) callback({ success: false });
        }
      }
    );

    // 5. Select Game (Host only)
    socket.on(
      SOCKET_EVENTS.GAME_SELECT,
      (
        data: { gameId: GameId },
        callback?: (res: { success: boolean; error?: any }) => void
      ) => {
        try {
          const result = roomManager.selectGame(socket.id, data?.gameId);
          if (!result.success || !result.room) {
            if (callback) callback({ success: false, error: result.error });
            socket.emit(SOCKET_EVENTS.ROOM_ERROR, result.error);
            return;
          }

          roomManager.broadcastRoomUpdate(result.room.roomId);
          if (callback) callback({ success: true });
        } catch (err) {
          console.error('Error selecting game:', err);
          if (callback) callback({ success: false });
        }
      }
    );

    // 6. Start Game (Host only)
    socket.on(
      SOCKET_EVENTS.GAME_START,
      (callback?: (res: { success: boolean; error?: any }) => void) => {
        try {
          const result = roomManager.startGame(socket.id);
          if (!result.success || !result.room) {
            if (callback) callback({ success: false, error: result.error });
            socket.emit(SOCKET_EVENTS.ROOM_ERROR, result.error);
            return;
          }

          roomManager.broadcastRoomUpdate(result.room.roomId);
          if (callback) callback({ success: true });
        } catch (err) {
          console.error('Error starting game:', err);
          if (callback) callback({ success: false });
        }
      }
    );

    // 7. Game Action (Client -> Server authoritative move)
    socket.on(
      SOCKET_EVENTS.GAME_ACTION,
      (
        data: { action: string; payload?: any },
        callback?: (res: { success: boolean; error?: string }) => void
      ) => {
        try {
          const result = roomManager.handleGameAction(socket.id, data?.action, data?.payload);
          if (!result.success) {
            if (callback) callback({ success: false, error: result.error });
            socket.emit(SOCKET_EVENTS.ROOM_ERROR, {
              code: 'INVALID_MOVE',
              message: result.error || 'Invalid move',
            });
            return;
          }

          if (callback) callback({ success: true });
        } catch (err) {
          console.error('Error in game action:', err);
          if (callback) callback({ success: false, error: 'Failed to process move' });
        }
      }
    );

    // 8. Rematch Vote
    socket.on(
      SOCKET_EVENTS.GAME_REMATCH,
      (callback?: (res: { success: boolean; error?: any }) => void) => {
        try {
          const result = roomManager.voteRematch(socket.id);
          if (!result.success || !result.room) {
            if (callback) callback({ success: false, error: result.error });
            socket.emit(SOCKET_EVENTS.ROOM_ERROR, result.error);
            return;
          }

          roomManager.broadcastRoomUpdate(result.room.roomId);
          if (callback) callback({ success: true });
        } catch (err) {
          console.error('Error voting rematch:', err);
          if (callback) callback({ success: false });
        }
      }
    );

    // 9. Chat / Quick Emoji reactions
    socket.on(
      SOCKET_EVENTS.CHAT_SEND,
      (data: { text: string }) => {
        try {
          const room = roomManager.getRoomBySocketId(socket.id);
          if (!room) return;

          const player = room.players.find(p => p.socketId === socket.id);
          if (!player) return;

          const cleanText = data?.text?.trim().slice(0, 150);
          if (!cleanText) return;

          const chatMessage: ChatMessage = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            senderId: socket.id,
            senderName: player.playerName,
            avatar: player.avatar,
            text: cleanText,
            timestamp: Date.now(),
          };

          io.to(room.roomId).emit(SOCKET_EVENTS.CHAT_MESSAGE, chatMessage);
        } catch (err) {
          console.error('Error sending chat message:', err);
        }
      }
    );

    // 10. Disconnect Handling
    socket.on('disconnect', () => {
      try {
        const { roomId, room, disconnectedPlayer } = roomManager.handleDisconnect(socket.id);
        if (roomId && room && disconnectedPlayer) {
          const count = disconnectedPlayer.remainingCount;
          const countMsg = `${count} player${count === 1 ? '' : 's'} remaining`;
          const msg = `${disconnectedPlayer.playerName} lost connection. (${countMsg})`;

          const payload: PlayerDepartedPayload = {
            socketId: socket.id,
            playerName: disconnectedPlayer.playerName,
            avatar: disconnectedPlayer.avatar,
            reason: 'disconnected',
            remainingCount: count,
            hostReassigned: false,
            message: msg,
          };

          socket.to(roomId).emit(SOCKET_EVENTS.PLAYER_DISCONNECTED, {
            socketId: socket.id,
            roomId,
            playerName: disconnectedPlayer.playerName,
            remainingCount: count,
            message: msg,
          });

          socket.to(roomId).emit(SOCKET_EVENTS.PLAYER_DEPARTED, payload);

          const systemChat: ChatMessage = {
            id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            senderId: 'system',
            senderName: 'Arcade System',
            avatar: '⚠️',
            text: msg,
            timestamp: Date.now(),
            isSystem: true,
          };
          socket.to(roomId).emit(SOCKET_EVENTS.CHAT_MESSAGE, systemChat);

          roomManager.broadcastRoomUpdate(roomId);
        }
      } catch (err) {
        console.error('Error in disconnect handler:', err);
      }
    });
  });
}
