import { BaseGameEngine, GameEngineCallbacks } from './BaseGameEngine.js';
import { Player, TicTacToeState } from '../../../shared/types.js';

export class TicTacToeEngine extends BaseGameEngine {
  private board: (string | null)[] = Array(9).fill(null);
  private currentTurn: string;
  private symbols: Record<string, 'X' | 'O'> = {};
  private winner: string | 'draw' | null = null;
  private winningLine: number[] | null = null;
  private roundsWon: Record<string, number> = {};
  private round: number = 1;

  private static readonly WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  constructor(roomId: string, players: Player[], callbacks: GameEngineCallbacks) {
    super(roomId, 'tic-tac-toe', players, callbacks);

    // Initialize symbols
    this.symbols[players[0].socketId] = 'X';
    this.symbols[players[1].socketId] = 'O';

    this.roundsWon[players[0].socketId] = 0;
    this.roundsWon[players[1].socketId] = 0;

    // First player starts
    this.currentTurn = players[0].socketId;
  }

  public getState(): TicTacToeState {
    return {
      board: [...this.board],
      currentTurn: this.currentTurn,
      symbols: { ...this.symbols },
      winner: this.winner,
      winningLine: this.winningLine,
      roundsWon: { ...this.roundsWon },
      round: this.round,
    };
  }

  public handleAction(socketId: string, action: string, payload?: any): { success: boolean; error?: string } {
    if (this.isFinished) {
      return { success: false, error: 'Game is finished' };
    }

    if (action === 'make_move') {
      const cellIndex = payload?.index;

      if (typeof cellIndex !== 'number' || cellIndex < 0 || cellIndex > 8) {
        return { success: false, error: 'Invalid cell index' };
      }

      if (socketId !== this.currentTurn) {
        return { success: false, error: 'Not your turn' };
      }

      if (this.board[cellIndex] !== null) {
        return { success: false, error: 'Cell is already occupied' };
      }

      const symbol = this.symbols[socketId];
      this.board[cellIndex] = symbol;

      // Check for winner
      const winCheck = this.checkWinner();
      if (winCheck) {
        this.winner = socketId;
        this.winningLine = winCheck.line;
        this.roundsWon[socketId] = (this.roundsWon[socketId] || 0) + 1;
        this.isFinished = true;

        this.callbacks.broadcastState(this.getState());
        this.callbacks.broadcastFinished({
          winner: socketId,
          scores: { ...this.roundsWon }
        });
        return { success: true };
      }

      // Check for draw
      if (this.board.every(cell => cell !== null)) {
        this.winner = 'draw';
        this.isFinished = true;

        this.callbacks.broadcastState(this.getState());
        this.callbacks.broadcastFinished({
          winner: null,
          scores: { ...this.roundsWon }
        });
        return { success: true };
      }

      // Switch turn
      const otherPlayer = this.players.find(p => p.socketId !== socketId);
      if (otherPlayer) {
        this.currentTurn = otherPlayer.socketId;
      }

      this.callbacks.broadcastState(this.getState());
      return { success: true };
    }

    if (action === 'rematch_round') {
      this.resetRound();
      this.callbacks.broadcastState(this.getState());
      return { success: true };
    }

    return { success: false, error: 'Unknown action' };
  }

  private resetRound(): void {
    this.board = Array(9).fill(null);
    this.winner = null;
    this.winningLine = null;
    this.isFinished = false;
    this.round += 1;
    // Alternate starting player each round
    const starterIndex = (this.round - 1) % this.players.length;
    this.currentTurn = this.players[starterIndex].socketId;
  }

  private checkWinner(): { symbol: string; line: number[] } | null {
    for (const line of TicTacToeEngine.WINNING_COMBINATIONS) {
      const [a, b, c] = line;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return { symbol: this.board[a]!, line };
      }
    }
    return null;
  }

  public handlePlayerDisconnect(socketId: string): void {
    // If opponent is still here and game in progress, opponent gets win by forfeit
    if (!this.isFinished) {
      const remainingPlayer = this.players.find(p => p.socketId !== socketId && p.connected);
      if (remainingPlayer) {
        this.winner = remainingPlayer.socketId;
        this.roundsWon[remainingPlayer.socketId] = (this.roundsWon[remainingPlayer.socketId] || 0) + 1;
        this.isFinished = true;
        this.callbacks.broadcastState(this.getState());
        this.callbacks.broadcastFinished({
          winner: remainingPlayer.socketId,
          scores: { ...this.roundsWon },
          reason: 'Opponent disconnected'
        });
      }
    }
  }

  public cleanup(): void {
    // No timers to clean
  }
}
