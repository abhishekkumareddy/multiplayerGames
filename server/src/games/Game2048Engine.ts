import { BaseGameEngine, GameEngineCallbacks } from './BaseGameEngine.js';
import { Game2048State, Player, Player2048State } from '../../../shared/types.js';

export class Game2048Engine extends BaseGameEngine {
  private boards: Record<string, Player2048State> = {};
  private scores: Record<string, number> = {};

  constructor(roomId: string, players: Player[], callbacks: GameEngineCallbacks) {
    super(roomId, 'game-2048', players, callbacks);

    players.forEach(p => {
      const board = Array.from({ length: 4 }, () => Array(4).fill(0));
      this.spawnRandomTile(board);
      this.spawnRandomTile(board);

      this.boards[p.socketId] = {
        board,
        score: 0,
        bestTile: 2,
        gameOver: false,
      };
      this.scores[p.socketId] = 0;
    });
  }

  private spawnRandomTile(board: number[][]): boolean {
    const emptyCells: [number, number][] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 0) emptyCells.push([r, c]);
      }
    }

    if (emptyCells.length === 0) return false;
    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[r][c] = Math.random() < 0.9 ? 2 : 4;
    return true;
  }

  private canMove(board: number[][]): boolean {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 0) return true;
        if (c < 3 && board[r][c] === board[r][c + 1]) return true;
        if (r < 3 && board[r][c] === board[r + 1][c]) return true;
      }
    }
    return false;
  }

  private slideLine(line: number[]): { newLine: number[]; points: number; moved: boolean } {
    const nonZero = line.filter(v => v !== 0);
    const result: number[] = [];
    let points = 0;
    let i = 0;

    while (i < nonZero.length) {
      if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
        const merged = nonZero[i] * 2;
        result.push(merged);
        points += merged;
        i += 2;
      } else {
        result.push(nonZero[i]);
        i++;
      }
    }

    while (result.length < 4) {
      result.push(0);
    }

    const moved = result.some((v, idx) => v !== line[idx]);
    return { newLine: result, points, moved };
  }

  public getState(): Game2048State {
    const allOver = Object.values(this.boards).every(b => b.gameOver);
    let winner: string | 'draw' | null = null;

    if (allOver) {
      const sorted = Object.entries(this.scores).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 1 && sorted[0][1] === sorted[1][1]) {
        winner = 'draw';
      } else if (sorted.length > 0) {
        winner = sorted[0][0];
      }
    }

    return {
      boards: { ...this.boards },
      scores: { ...this.scores },
      winner,
      isOver: allOver,
    };
  }

  public handleAction(socketId: string, action: string, payload?: any): { success: boolean; error?: string } {
    if (this.isFinished) {
      return { success: false, error: 'Game has concluded' };
    }

    const pState = this.boards[socketId];
    if (!pState || pState.gameOver) {
      return { success: false, error: 'Cannot move' };
    }

    if (action === 'slide') {
      const dir = payload?.direction; // 'up' | 'down' | 'left' | 'right'
      if (!['up', 'down', 'left', 'right'].includes(dir)) {
        return { success: false, error: 'Invalid direction' };
      }

      let totalPoints = 0;
      let anyMoved = false;
      const b = pState.board;

      if (dir === 'left') {
        for (let r = 0; r < 4; r++) {
          const { newLine, points, moved } = this.slideLine(b[r]);
          b[r] = newLine;
          totalPoints += points;
          if (moved) anyMoved = true;
        }
      } else if (dir === 'right') {
        for (let r = 0; r < 4; r++) {
          const line = [...b[r]].reverse();
          const { newLine, points, moved } = this.slideLine(line);
          b[r] = newLine.reverse();
          totalPoints += points;
          if (moved) anyMoved = true;
        }
      } else if (dir === 'up') {
        for (let c = 0; c < 4; c++) {
          const line = [b[0][c], b[1][c], b[2][c], b[3][c]];
          const { newLine, points, moved } = this.slideLine(line);
          for (let r = 0; r < 4; r++) b[r][c] = newLine[r];
          totalPoints += points;
          if (moved) anyMoved = true;
        }
      } else if (dir === 'down') {
        for (let c = 0; c < 4; c++) {
          const line = [b[3][c], b[2][c], b[1][c], b[0][c]];
          const { newLine, points, moved } = this.slideLine(line);
          b[3][c] = newLine[0];
          b[2][c] = newLine[1];
          b[1][c] = newLine[2];
          b[0][c] = newLine[3];
          totalPoints += points;
          if (moved) anyMoved = true;
        }
      }

      if (anyMoved) {
        this.spawnRandomTile(b);
        pState.score += totalPoints;
        this.scores[socketId] = pState.score;

        let maxTile = 2;
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (b[r][c] > maxTile) maxTile = b[r][c];
          }
        }
        pState.bestTile = maxTile;

        if (!this.canMove(b)) {
          pState.gameOver = true;
        }

        const state = this.getState();
        this.callbacks.broadcastState(state);

        if (state.isOver) {
          this.isFinished = true;
          this.callbacks.broadcastFinished({
            winner: state.winner,
            scores: { ...this.scores },
            reason: '2048 game completed!',
          });
        }
      }

      return { success: true };
    }

    return { success: false, error: `Unknown action: ${action}` };
  }

  public handlePlayerDisconnect(socketId: string): void {
    if (this.boards[socketId]) {
      this.boards[socketId].gameOver = true;
      this.callbacks.broadcastState(this.getState());
    }
  }

  public cleanup(): void {}
}
