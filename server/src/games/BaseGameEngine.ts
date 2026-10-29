import { GameId, Player } from '../../../shared/types.js';

export interface GameEngineCallbacks {
  broadcastState: (state: any) => void;
  broadcastClientState: (getClientStateForPlayer: (socketId: string) => any) => void;
  broadcastFinished: (result: { winner: string | null; scores: Record<string, number>; reason?: string }) => void;
}

export abstract class BaseGameEngine {
  public roomId: string;
  public gameId: GameId;
  public players: Player[];
  protected callbacks: GameEngineCallbacks;
  protected isFinished: boolean = false;

  constructor(roomId: string, gameId: GameId, players: Player[], callbacks: GameEngineCallbacks) {
    this.roomId = roomId;
    this.gameId = gameId;
    this.players = players;
    this.callbacks = callbacks;
  }

  public abstract getState(): any;

  // Allows masking private state (e.g., hidden moves in RPS, hidden quiz answer)
  public getClientState(socketId?: string): any {
    return this.getState();
  }

  public abstract handleAction(socketId: string, action: string, payload?: any): { success: boolean; error?: string };

  public abstract handlePlayerDisconnect(socketId: string): void;

  public abstract cleanup(): void;
}
