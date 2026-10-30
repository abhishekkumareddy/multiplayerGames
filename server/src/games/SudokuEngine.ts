import { BaseGameEngine, GameEngineCallbacks } from './BaseGameEngine.js';
import { Player, SudokuState } from '../../../shared/types.js';

// Pre-tested valid Sudoku template
const SOLUTION: number[][] = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

// Initial clues (0 is empty)
const INITIAL_BOARD: number[][] = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

export class SudokuEngine extends BaseGameEngine {
  private initialBoard: number[][];
  private currentBoard: number[][];
  private solution: number[][];
  private scores: Record<string, number> = {};
  private errors: Record<string, number> = {};
  private pencilMarks: Record<string, number[]> = {};
  private lastCellFilled?: { row: number; col: number; val: number; socketId: string };

  constructor(roomId: string, players: Player[], callbacks: GameEngineCallbacks) {
    super(roomId, 'sudoku', players, callbacks);
    this.initialBoard = INITIAL_BOARD.map(r => [...r]);
    this.currentBoard = INITIAL_BOARD.map(r => [...r]);
    this.solution = SOLUTION.map(r => [...r]);

    players.forEach(p => {
      this.scores[p.socketId] = 0;
      this.errors[p.socketId] = 0;
    });
  }

  public getState(): SudokuState {
    const isComplete = this.currentBoard.every((row, r) =>
      row.every((val, c) => val === this.solution[r][c])
    );

    let winner: string | null = null;
    if (isComplete) {
      const sorted = Object.entries(this.scores).sort((a, b) => b[1] - a[1]);
      winner = sorted[0]?.[0] || null;
    }

    return {
      initialBoard: this.initialBoard,
      currentBoard: this.currentBoard.map(r => [...r]),
      solution: this.solution,
      pencilMarks: { ...this.pencilMarks },
      scores: { ...this.scores },
      errors: { ...this.errors },
      winner,
      isComplete,
      lastCellFilled: this.lastCellFilled,
    };
  }

  public handleAction(socketId: string, action: string, payload?: any): { success: boolean; error?: string } {
    if (this.isFinished) return { success: false, error: 'Sudoku game concluded' };

    if (action === 'fill_cell') {
      const { row, col, val } = payload || {};
      if (
        row === undefined ||
        col === undefined ||
        row < 0 ||
        row > 8 ||
        col < 0 ||
        col > 8 ||
        val < 1 ||
        val > 9
      ) {
        return { success: false, error: 'Invalid cell coordinate or value' };
      }

      // Check if original clue
      if (this.initialBoard[row][col] !== 0) {
        return { success: false, error: 'Cannot change initial clue' };
      }

      // Check if already correctly filled
      if (this.currentBoard[row][col] === this.solution[row][col]) {
        return { success: false, error: 'Cell already correctly solved' };
      }

      if (val === this.solution[row][col]) {
        // Correct!
        this.currentBoard[row][col] = val;
        this.scores[socketId] = (this.scores[socketId] || 0) + 10;
        this.lastCellFilled = { row, col, val, socketId };

        const state = this.getState();
        this.callbacks.broadcastState(state);

        if (state.isComplete) {
          this.isFinished = true;
          this.callbacks.broadcastFinished({
            winner: state.winner,
            scores: { ...this.scores },
            reason: 'Sudoku grid completed!',
          });
        }

        return { success: true };
      } else {
        // Incorrect!
        this.errors[socketId] = (this.errors[socketId] || 0) + 1;
        this.scores[socketId] = Math.max(0, (this.scores[socketId] || 0) - 5);
        this.callbacks.broadcastState(this.getState());
        return { success: false, error: 'Incorrect number for this cell' };
      }
    }

    return { success: false, error: `Unknown action: ${action}` };
  }

  public handlePlayerDisconnect(socketId: string): void {}

  public cleanup(): void {}
}
