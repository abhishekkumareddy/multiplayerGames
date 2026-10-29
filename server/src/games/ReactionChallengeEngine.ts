import { BaseGameEngine, GameEngineCallbacks } from './BaseGameEngine.js';
import { Player, ReactionPlayerResult, ReactionState } from '../../../shared/types.js';

export class ReactionChallengeEngine extends BaseGameEngine {
  private round: number = 1;
  private totalRounds: number = 5;
  private phase: 'countdown' | 'waiting_for_green' | 'go' | 'round_summary' | 'game_over' = 'countdown';
  private greenAt: number | null = null;
  private playerResults: Record<string, ReactionPlayerResult> = {};
  private scores: Record<string, number> = {};
  private winner: string | null = null;
  private roundWinner: string | null = null;

  private stageTimer: NodeJS.Timeout | null = null;

  constructor(roomId: string, players: Player[], callbacks: GameEngineCallbacks) {
    super(roomId, 'reaction-challenge', players, callbacks);

    players.forEach(p => {
      this.scores[p.socketId] = 0;
      this.playerResults[p.socketId] = {
        reactionTimeMs: null,
        falseStart: false,
        pointsEarned: 0,
      };
    });

    // Start round 1
    this.startRound();
  }

  public getState(): ReactionState {
    return {
      round: this.round,
      totalRounds: this.totalRounds,
      phase: this.phase,
      greenAt: this.greenAt,
      playerResults: { ...this.playerResults },
      scores: { ...this.scores },
      winner: this.winner,
      roundWinner: this.roundWinner,
    };
  }

  private startRound(): void {
    this.phase = 'countdown';
    this.greenAt = null;
    this.roundWinner = null;
    this.players.forEach(p => {
      this.playerResults[p.socketId] = {
        reactionTimeMs: null,
        falseStart: false,
        pointsEarned: 0,
      };
    });

    this.callbacks.broadcastState(this.getState());

    // 2.5s countdown before waiting phase
    if (this.stageTimer) clearTimeout(this.stageTimer);
    this.stageTimer = setTimeout(() => {
      this.enterWaitingForGreen();
    }, 2500);
  }

  private enterWaitingForGreen(): void {
    this.phase = 'waiting_for_green';
    this.callbacks.broadcastState(this.getState());

    // Random delay between 1500ms and 4500ms
    const randomDelay = Math.floor(Math.random() * 3000) + 1500;

    if (this.stageTimer) clearTimeout(this.stageTimer);
    this.stageTimer = setTimeout(() => {
      this.triggerGreen();
    }, randomDelay);
  }

  private triggerGreen(): void {
    this.phase = 'go';
    this.greenAt = Date.now();
    this.callbacks.broadcastState(this.getState());

    // Auto finish round after 3.5 seconds if some players didn't react
    if (this.stageTimer) clearTimeout(this.stageTimer);
    this.stageTimer = setTimeout(() => {
      this.finishRound();
    }, 3500);
  }

  public handleAction(socketId: string, action: string, payload?: any): { success: boolean; error?: string } {
    if (this.isFinished) {
      return { success: false, error: 'Game is finished' };
    }

    if (action === 'tap') {
      const currentResult = this.playerResults[socketId];
      if (!currentResult) {
        return { success: false, error: 'Player not recognized' };
      }

      // Check for false start
      if (this.phase === 'countdown' || this.phase === 'waiting_for_green') {
        if (!currentResult.falseStart) {
          currentResult.falseStart = true;
          this.callbacks.broadcastState(this.getState());
        }
        return { success: true };
      }

      if (this.phase === 'go') {
        if (currentResult.falseStart) {
          return { success: false, error: 'Disqualified for false start this round' };
        }

        if (currentResult.reactionTimeMs !== null) {
          return { success: false, error: 'Already tapped' };
        }

        const now = Date.now();
        const reactionTime = Math.max(1, now - (this.greenAt || now));
        currentResult.reactionTimeMs = reactionTime;

        // Check if all connected active players have either tapped or false started
        const allCompleted = this.players.every(p => {
          if (!p.connected) return true;
          const res = this.playerResults[p.socketId];
          return res && (res.falseStart || res.reactionTimeMs !== null);
        });

        if (allCompleted) {
          if (this.stageTimer) clearTimeout(this.stageTimer);
          this.finishRound();
        } else {
          this.callbacks.broadcastState(this.getState());
        }

        return { success: true };
      }

      return { success: false, error: 'Not in active phase' };
    }

    if (action === 'rematch_round') {
      this.resetGame();
      this.callbacks.broadcastState(this.getState());
      return { success: true };
    }

    return { success: false, error: 'Unknown action' };
  }

  private finishRound(): void {
    this.phase = 'round_summary';

    // Collect valid times
    const validResults: { socketId: string; timeMs: number }[] = [];
    for (const p of this.players) {
      const res = this.playerResults[p.socketId];
      if (res && !res.falseStart && res.reactionTimeMs !== null) {
        validResults.push({ socketId: p.socketId, timeMs: res.reactionTimeMs });
      }
    }

    // Sort by fastest time
    validResults.sort((a, b) => a.timeMs - b.timeMs);

    const pointScale = [100, 75, 50, 30, 20, 10];
    validResults.forEach((item, index) => {
      const points = pointScale[index] || 10;
      this.playerResults[item.socketId].rank = index + 1;
      this.playerResults[item.socketId].pointsEarned = points;
      this.scores[item.socketId] += points;
    });

    if (validResults.length > 0) {
      this.roundWinner = validResults[0].socketId;
    } else {
      this.roundWinner = null;
    }

    this.callbacks.broadcastState(this.getState());

    // Check if tournament over
    if (this.round >= this.totalRounds) {
      if (this.stageTimer) clearTimeout(this.stageTimer);
      this.stageTimer = setTimeout(() => {
        this.finishGame();
      }, 3500);
    } else {
      // Advance to next round after 3.5 seconds
      if (this.stageTimer) clearTimeout(this.stageTimer);
      this.stageTimer = setTimeout(() => {
        this.round += 1;
        this.startRound();
      }, 3500);
    }
  }

  private finishGame(): void {
    this.phase = 'game_over';
    this.isFinished = true;

    let maxScore = -1;
    let overallWinner: string | null = null;
    for (const [id, score] of Object.entries(this.scores)) {
      if (score > maxScore) {
        maxScore = score;
        overallWinner = id;
      }
    }
    this.winner = overallWinner;

    this.callbacks.broadcastState(this.getState());
    this.callbacks.broadcastFinished({
      winner: this.winner,
      scores: { ...this.scores }
    });
  }

  private resetGame(): void {
    if (this.stageTimer) clearTimeout(this.stageTimer);
    this.round = 1;
    this.isFinished = false;
    this.winner = null;
    this.players.forEach(p => {
      this.scores[p.socketId] = 0;
    });
    this.startRound();
  }

  public handlePlayerDisconnect(socketId: string): void {
    // If during go phase and waiting for this player, evaluate
    if (this.phase === 'go') {
      const allCompleted = this.players.every(p => {
        if (!p.connected || p.socketId === socketId) return true;
        const res = this.playerResults[p.socketId];
        return res && (res.falseStart || res.reactionTimeMs !== null);
      });
      if (allCompleted) {
        if (this.stageTimer) clearTimeout(this.stageTimer);
        this.finishRound();
      }
    }
  }

  public cleanup(): void {
    if (this.stageTimer) {
      clearTimeout(this.stageTimer);
      this.stageTimer = null;
    }
  }
}
