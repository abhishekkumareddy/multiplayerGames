import { BaseGameEngine, GameEngineCallbacks } from './BaseGameEngine.js';
import { DotsAndBoxesState, Player } from '../../../shared/types.js';

export class DotsAndBoxesEngine extends BaseGameEngine {
  private gridSize: number = 3; // 3x3 boxes, 4x4 dots
  private horizontalLines: (string | null)[][]; // 4 rows x 3 cols
  private verticalLines: (string | null)[][]; // 3 rows x 4 cols
  private boxes: (string | null)[][]; // 3 rows x 3 cols
  private currentTurnPlayerIndex: number = 0;
  private scores: Record<string, number> = {};
  private completedBoxes: number = 0;

  constructor(roomId: string, players: Player[], callbacks: GameEngineCallbacks) {
    super(roomId, 'dots-and-boxes', players, callbacks);

    // 4 rows x 3 cols for horizontal
    this.horizontalLines = Array.from({ length: 4 }, () => Array(3).fill(null));
    // 3 rows x 4 cols for vertical
    this.verticalLines = Array.from({ length: 3 }, () => Array(4).fill(null));
    // 3 rows x 3 cols for boxes
    this.boxes = Array.from({ length: 3 }, () => Array(3).fill(null));

    players.forEach(p => {
      this.scores[p.socketId] = 0;
    });

    this.currentTurnPlayerIndex = 0;
  }

  public getState(): DotsAndBoxesState {
    const totalBoxes = this.gridSize * this.gridSize; // 9
    let winner: string | 'draw' | null = null;

    if (this.completedBoxes >= totalBoxes) {
      const sorted = Object.entries(this.scores).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 1 && sorted[0][1] === sorted[1][1]) {
        winner = 'draw';
      } else if (sorted.length > 0) {
        winner = sorted[0][0];
      }
    }

    return {
      gridSize: this.gridSize,
      horizontalLines: this.horizontalLines.map(r => [...r]),
      verticalLines: this.verticalLines.map(r => [...r]),
      boxes: this.boxes.map(r => [...r]),
      currentTurn: this.players[this.currentTurnPlayerIndex]?.socketId || '',
      scores: { ...this.scores },
      winner,
      totalBoxes,
      completedBoxes: this.completedBoxes,
    };
  }

  public handleAction(socketId: string, action: string, payload?: any): { success: boolean; error?: string } {
    if (this.isFinished) {
      return { success: false, error: 'Game has ended' };
    }

    const currentTurnSocket = this.players[this.currentTurnPlayerIndex]?.socketId;
    if (socketId !== currentTurnSocket) {
      return { success: false, error: 'Not your turn' };
    }

    if (action === 'draw_line') {
      const { type, row, col } = payload || {};
      if (type !== 'h' && type !== 'v') {
        return { success: false, error: 'Invalid line type' };
      }

      if (type === 'h') {
        if (row < 0 || row > 3 || col < 0 || col > 2 || this.horizontalLines[row][col] !== null) {
          return { success: false, error: 'Line already drawn or out of bounds' };
        }
        this.horizontalLines[row][col] = socketId;
      } else {
        if (row < 0 || row > 2 || col < 0 || col > 3 || this.verticalLines[row][col] !== null) {
          return { success: false, error: 'Line already drawn or out of bounds' };
        }
        this.verticalLines[row][col] = socketId;
      }

      // Check newly completed boxes
      let boxesCompletedThisMove = 0;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (this.boxes[r][c] === null) {
            const top = this.horizontalLines[r][c] !== null;
            const bottom = this.horizontalLines[r + 1][c] !== null;
            const left = this.verticalLines[r][c] !== null;
            const right = this.verticalLines[r][c + 1] !== null;

            if (top && bottom && left && right) {
              this.boxes[r][c] = socketId;
              this.scores[socketId] = (this.scores[socketId] || 0) + 1;
              this.completedBoxes++;
              boxesCompletedThisMove++;
            }
          }
        }
      }

      // If all 9 boxes filled, finish game
      if (this.completedBoxes >= 9) {
        this.isFinished = true;
        const state = this.getState();
        this.callbacks.broadcastState(state);
        this.callbacks.broadcastFinished({
          winner: state.winner,
          scores: { ...this.scores },
          reason: 'All boxes claimed!',
        });
        return { success: true };
      }

      // If player captured box, they keep turn; otherwise next player
      if (boxesCompletedThisMove === 0) {
        this.currentTurnPlayerIndex = (this.currentTurnPlayerIndex + 1) % this.players.length;
      }

      this.callbacks.broadcastState(this.getState());
      return { success: true };
    }

    return { success: false, error: `Unknown action: ${action}` };
  }

  public handlePlayerDisconnect(socketId: string): void {
    if (this.isFinished) return;
    if (this.players[this.currentTurnPlayerIndex]?.socketId === socketId) {
      this.currentTurnPlayerIndex = (this.currentTurnPlayerIndex + 1) % this.players.length;
      this.callbacks.broadcastState(this.getState());
    }
  }

  public cleanup(): void {}
}
