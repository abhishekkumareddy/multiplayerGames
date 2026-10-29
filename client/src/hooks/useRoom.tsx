import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { socket } from '../socket/socketClient';
import { ChatMessage, GameId, Player, Room, RoomError, SOCKET_EVENTS } from '@shared/types';
import { sounds } from '../utils/sound';
import confetti from 'canvas-confetti';

interface RoomContextType {
  room: Room | null;
  gameState: any;
  myPlayer: Player | undefined;
  isHost: boolean;
  isConnected: boolean;
  error: RoomError | null;
  chatMessages: ChatMessage[];
  lastGameResult: { winner: string | null; scores: Record<string, number>; reason?: string } | null;
  createRoom: (name: string, avatar: string, gameId?: GameId) => Promise<boolean>;
  joinRoom: (roomId: string, name: string, avatar: string) => Promise<boolean>;
  leaveRoom: () => void;
  toggleReady: (isReady: boolean) => void;
  selectGame: (gameId: GameId) => void;
  startGame: () => void;
  sendGameAction: (action: string, payload?: any) => void;
  voteRematch: () => void;
  sendChatMessage: (text: string) => void;
  clearError: () => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [error, setError] = useState<RoomError | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [lastGameResult, setLastGameResult] = useState<{
    winner: string | null;
    scores: Record<string, number>;
    reason?: string;
  } | null>(null);

  const myPlayer = room?.players.find(p => p.socketId === socket.id);
  const isHost = myPlayer?.isHost ?? false;

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onRoomCreated = (data: { roomId: string; room: Room }) => {
      setRoom(data.room);
      setGameState(data.room.gameState);
      setError(null);
      setChatMessages([]);
      setLastGameResult(null);
      sounds.playPop();
    };

    const onRoomJoined = (data: { roomId: string; room: Room }) => {
      setRoom(data.room);
      setGameState(data.room.gameState);
      setError(null);
      sounds.playPop();
    };

    const onRoomUpdated = (updatedRoom: Room) => {
      setRoom(updatedRoom);
      if (updatedRoom.gameState) {
        setGameState(updatedRoom.gameState);
      }
    };

    const onRoomError = (err: RoomError) => {
      setError(err);
      sounds.playError();
    };

    const onGameState = (state: any) => {
      setGameState(state);
    };

    const onGameFinished = (result: { winner: string | null; scores: Record<string, number>; reason?: string }) => {
      setLastGameResult(result);
      sounds.playWin();

      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
        });
      } catch (e) {}
    };

    const onChatMessage = (msg: ChatMessage) => {
      setChatMessages(prev => [...prev.slice(-49), msg]);
      sounds.playPop();
    };

    const onPlayerDisconnected = () => {
      sounds.playError();
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(SOCKET_EVENTS.ROOM_CREATED, onRoomCreated);
    socket.on(SOCKET_EVENTS.ROOM_JOINED, onRoomJoined);
    socket.on(SOCKET_EVENTS.ROOM_UPDATED, onRoomUpdated);
    socket.on(SOCKET_EVENTS.ROOM_ERROR, onRoomError);
    socket.on(SOCKET_EVENTS.GAME_STATE, onGameState);
    socket.on(SOCKET_EVENTS.GAME_FINISHED, onGameFinished);
    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, onChatMessage);
    socket.on(SOCKET_EVENTS.PLAYER_DISCONNECTED, onPlayerDisconnected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(SOCKET_EVENTS.ROOM_CREATED, onRoomCreated);
      socket.off(SOCKET_EVENTS.ROOM_JOINED, onRoomJoined);
      socket.off(SOCKET_EVENTS.ROOM_UPDATED, onRoomUpdated);
      socket.off(SOCKET_EVENTS.ROOM_ERROR, onRoomError);
      socket.off(SOCKET_EVENTS.GAME_STATE, onGameState);
      socket.off(SOCKET_EVENTS.GAME_FINISHED, onGameFinished);
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE, onChatMessage);
      socket.off(SOCKET_EVENTS.PLAYER_DISCONNECTED, onPlayerDisconnected);
    };
  }, []);

  const createRoom = useCallback(
    async (playerName: string, avatar: string, gameId?: GameId): Promise<boolean> => {
      return new Promise(resolve => {
        socket.emit(
          SOCKET_EVENTS.ROOM_CREATE,
          { playerName, avatar, gameId },
          (response: { success: boolean; room?: Room; error?: RoomError }) => {
            if (response.success && response.room) {
              setRoom(response.room);
              setGameState(response.room.gameState);
              setError(null);
              resolve(true);
            } else {
              if (response.error) setError(response.error);
              resolve(false);
            }
          }
        );
      });
    },
    []
  );

  const joinRoom = useCallback(
    async (roomId: string, playerName: string, avatar: string): Promise<boolean> => {
      return new Promise(resolve => {
        socket.emit(
          SOCKET_EVENTS.ROOM_JOIN,
          { roomId, playerName, avatar },
          (response: { success: boolean; room?: Room; error?: RoomError }) => {
            if (response.success && response.room) {
              setRoom(response.room);
              setGameState(response.room.gameState);
              setError(null);
              resolve(true);
            } else {
              if (response.error) setError(response.error);
              resolve(false);
            }
          }
        );
      });
    },
    []
  );

  const leaveRoom = useCallback(() => {
    socket.emit(SOCKET_EVENTS.ROOM_LEAVE);
    setRoom(null);
    setGameState(null);
    setChatMessages([]);
    setLastGameResult(null);
  }, []);

  const toggleReady = useCallback((isReady: boolean) => {
    sounds.playReady();
    socket.emit(SOCKET_EVENTS.PLAYER_READY, { isReady });
  }, []);

  const selectGame = useCallback((gameId: GameId) => {
    sounds.playClick();
    socket.emit(SOCKET_EVENTS.GAME_SELECT, { gameId });
  }, []);

  const startGame = useCallback(() => {
    sounds.playStart();
    socket.emit(SOCKET_EVENTS.GAME_START);
  }, []);

  const sendGameAction = useCallback((action: string, payload?: any) => {
    socket.emit(SOCKET_EVENTS.GAME_ACTION, { action, payload });
  }, []);

  const voteRematch = useCallback(() => {
    sounds.playClick();
    socket.emit(SOCKET_EVENTS.GAME_REMATCH);
  }, []);

  const sendChatMessage = useCallback((text: string) => {
    socket.emit(SOCKET_EVENTS.CHAT_SEND, { text });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <RoomContext.Provider
      value={{
        room,
        gameState,
        myPlayer,
        isHost,
        isConnected,
        error,
        chatMessages,
        lastGameResult,
        createRoom,
        joinRoom,
        leaveRoom,
        toggleReady,
        selectGame,
        startGame,
        sendGameAction,
        voteRematch,
        sendChatMessage,
        clearError,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = (): RoomContextType => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};
