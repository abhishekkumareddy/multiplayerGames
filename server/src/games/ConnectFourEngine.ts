import { BaseGameEngine, GameEngineCallbacks } from './BaseGameEngine.js';
import { ConnectFourState, Player } from '../../../shared/types.js';

export class ConnectFourEngine extends BaseGameEngine {
  private static readonly ROWS = 6;
  private static readonly COLS = 7;

  private board: (string | null)[][] = [];
  private currentTurn: string;
  private colors: Record<string, 'red' | 'yellow'> = {};
  private winner: string | 'draw' | null = null;
  private winningCells: [number, number][] | null = null;
  private roundsWon: Record<string, number> = {};
  private round: number = 1;

  constructor(roomId: string, players: Player[], callbacks: GameEngineCallbacks) {
    super(roomId, 'connect-four', players, callbacks);

    this.initBoard();

    this.colors[players[0].socketId] = 'red';
    this.colors[players[1].socketId] = 'yellow';

    this.roundsWon[players[0].socketId] = 0;
    this.roundsWon[players[1].socketId] = 0;

    this.currentTurn = players[0].socketId;
  }

  private initBoard(): void {
    this.board = Array.from({ length: ConnectFourEngine.ROWS }, () =>
      Array(ConnectFourEngine.COLS).fill(null)
    );
  }

  public getState(): ConnectFourState {
    return {
      board: this.board.map(row => [...row]),
      currentTurn: this.currentTurn,
      colors: { ...this.colors },
      winner: this.winner,
      winningCells: this.winningCells ? [...this.winningCells] : null,
      roundsWon: { ...this.roundsWon },
      round: this.round,
    };
  }

  public handleAction(socketId: string, action: string, payload?: any): { success: boolean; error?: string } {
    if (this.isFinished) {
      return { success: false, error: 'Game is finished' };
    }

    if (action === 'drop_chip') {
      const col = payload?.col;

      if (typeof col !== 'number' || col < 0 || col >= ConnectFourEngine.COLS) {
        return { success: false, error: 'Invalid column' };
      }

      if (socketId !== this.currentTurn) {
        return { success: false, error: 'Not your turn' };
      }

      // Check if top cell of column is already filled
      if (this.board[0][col] !== null) {
        return { success: false, error: 'Column is full' };
      }

      // Find lowest available row
      let targetRow = -1;
      for (let r = ConnectFourEngine.ROWS - 1; r >= 0; r--) {
        if (this.board[r][col] === null) {
          targetRow = r;
          break;
        }
      }

      if (targetRow === -1) {
        return { success: false, error: 'Column is full' };
      }

      const color = this.colors[socketId];
      this.board[targetRow][col] = color;

      // Check for win
      const winCheck = this.checkWin(targetRow, col, color);
      if (winCheck) {
        this.winner = socketId;
        this.winningCells = winCheck;
        this.roundsWon[socketId] = (this.roundsWon[socketId] || 0) + 1;
        this.isFinished = true;

        this.callbacks.broadcastState(this.getState());
        this.callbacks.broadcastFinished({
          winner: socketId,
          scores: { ...this.roundsWon }
        });
        return { success: true };
      }

      // Check for board full (draw)
      const isFull = this.board[0].every(cell => cell !== null);
      if (isFull) {
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
    this.initBoard();
    this.winner = null;
    this.winningCells = null;
    this.isFinished = false;
    this.round += 1;
    // Alternate starter
    const starterIndex = (this.round - 1) % this.players.length;
    this.currentTurn = this.players[starterIndex].socketId;
  }

  private checkWin(row: number, col: number, color: string): [number, number][] | null {
    const directions: [number, number][] = [
      [0, 1],  // Horizontal
      [1, 0],  // Vertical
      [1, 1],  // Diagonal down-right (\)
      [1, -1], // Diagonal down-left (/)
    ];

    for (const [dr, dc] of directions) {
      const winning: [number, number][] = [[row, col]];

      // Check in positive direction
      for (let step = 1; step <= 3; step++) {
        const r = row + dr * step;
        const c = col + dc * step;
        if (
          r >= 0 && r < ConnectFourEngine.ROWS &&
          c >= 0 && c < ConnectFourEngine.COLS &&
          this.board[r][c] === color
        ) {
          winning.push([r, c]);
        } else {
          break;
        }
      }

      // Check in negative direction
      for (let step = 1; step <= 3; step++) {
        const r = row - dr * step;
        const c = col - dc * step;
        if (
          r >= 0 && r < ConnectFourEngine.ROWS &&
          c >= 0 && c < ConnectFourEngine.COLS &&
          this.board[r][c] === color
        ) {
          winning.push([r, c]);
        } else {
          break;
        }
      }

      if (winning.length >= 4) {
        return winning;
      }
    }

    return null;
  }

  public handlePlayerDisconnect(socketId: string): void {
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
    // No timers
  }
}
