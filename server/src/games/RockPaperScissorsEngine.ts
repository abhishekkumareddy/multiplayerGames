import { BaseGameEngine, GameEngineCallbacks } from './BaseGameEngine.js';
import { Player, RPSChoice, RPSState } from '../../../shared/types.js';

export class RockPaperScissorsEngine extends BaseGameEngine {
  private currentRound: number = 1;
  private maxRounds: number = 5;
  private pointsToWin: number = 3;
  private phase: 'choosing' | 'revealed' | 'game_over' = 'choosing';
  private choices: Record<string, RPSChoice | null> = {};
  private revealedChoices: Record<string, RPSChoice | null> = {};
  private roundWinner: string | 'tie' | null = null;
  private scores: Record<string, number> = {};
  private matchWinner: string | null = null;
  private timer: number = 15;
  private roundTransitionTimer: NodeJS.Timeout | null = null;

  constructor(roomId: string, players: Player[], callbacks: GameEngineCallbacks) {
    super(roomId, 'rock-paper-scissors', players, callbacks);

    players.forEach(p => {
      this.choices[p.socketId] = null;
      this.revealedChoices[p.socketId] = null;
      this.scores[p.socketId] = 0;
    });
  }

  public getState(): RPSState {
    const hasChosen: Record<string, boolean> = {};
    for (const p of this.players) {
      hasChosen[p.socketId] = this.choices[p.socketId] !== null;
    }

    return {
      currentRound: this.currentRound,
      maxRounds: this.maxRounds,
      phase: this.phase,
      hasChosen,
      revealedChoices: this.phase === 'choosing' ? undefined : { ...this.revealedChoices },
      roundWinner: this.roundWinner,
      scores: { ...this.scores },
      winner: this.matchWinner,
      timer: this.timer,
    };
  }

  // Client-specific state: a player should see their OWN pending choice even during 'choosing', but not opponent's!
  public override getClientState(socketId?: string): any {
    const baseState = this.getState();
    if (this.phase === 'choosing' && socketId) {
      return {
        ...baseState,
        myChoice: this.choices[socketId] || null,
      };
    }
    return baseState;
  }

  private broadcastToAll(): void {
    this.callbacks.broadcastClientState((socketId: string) => this.getClientState(socketId));
  }

  public handleAction(socketId: string, action: string, payload?: any): { success: boolean; error?: string } {
    if (this.isFinished) {
      return { success: false, error: 'Game is finished' };
    }

    if (action === 'make_choice') {
      if (this.phase !== 'choosing') {
        return { success: false, error: 'Not in choosing phase' };
      }

      const choice = payload?.choice as RPSChoice;
      if (!['rock', 'paper', 'scissors'].includes(choice)) {
        return { success: false, error: 'Invalid choice' };
      }

      this.choices[socketId] = choice;

      // Check if both players have chosen
      const allChosen = this.players.every(p => this.choices[p.socketId] !== null);

      if (allChosen) {
        this.evaluateRound();
      } else {
        this.broadcastToAll();
      }

      return { success: true };
    }

    if (action === 'rematch_round') {
      this.resetMatch();
      this.broadcastToAll();
      return { success: true };
    }

    return { success: false, error: 'Unknown action' };
  }

  private evaluateRound(): void {
    this.phase = 'revealed';
    this.revealedChoices = { ...this.choices };

    const p1 = this.players[0].socketId;
    const p2 = this.players[1].socketId;

    const c1 = this.choices[p1]!;
    const c2 = this.choices[p2]!;

    if (c1 === c2) {
      this.roundWinner = 'tie';
    } else if (
      (c1 === 'rock' && c2 === 'scissors') ||
      (c1 === 'scissors' && c2 === 'paper') ||
      (c1 === 'paper' && c2 === 'rock')
    ) {
      this.roundWinner = p1;
      this.scores[p1] += 1;
    } else {
      this.roundWinner = p2;
      this.scores[p2] += 1;
    }

    // Check if match won
    const wonByScore = this.scores[p1] >= this.pointsToWin || this.scores[p2] >= this.pointsToWin;
    const maxRoundsReached = this.currentRound >= this.maxRounds && this.scores[p1] !== this.scores[p2];

    if (wonByScore || maxRoundsReached) {
      this.phase = 'game_over';
      this.isFinished = true;
      if (this.scores[p1] > this.scores[p2]) {
        this.matchWinner = p1;
      } else if (this.scores[p2] > this.scores[p1]) {
        this.matchWinner = p2;
      } else {
        this.matchWinner = null; // tie
      }

      this.broadcastToAll();
      this.callbacks.broadcastFinished({
        winner: this.matchWinner,
        scores: { ...this.scores }
      });
    } else {
      // Broadcast revealed state and schedule next round after 3 seconds
      this.broadcastToAll();

      if (this.roundTransitionTimer) clearTimeout(this.roundTransitionTimer);
      this.roundTransitionTimer = setTimeout(() => {
        this.nextRound();
      }, 3000);
    }
  }

  private nextRound(): void {
    this.currentRound += 1;
    this.phase = 'choosing';
    this.roundWinner = null;
    this.players.forEach(p => {
      this.choices[p.socketId] = null;
      this.revealedChoices[p.socketId] = null;
    });
    this.broadcastToAll();
  }

  private resetMatch(): void {
    if (this.roundTransitionTimer) clearTimeout(this.roundTransitionTimer);
    this.currentRound = 1;
    this.phase = 'choosing';
    this.isFinished = false;
    this.roundWinner = null;
    this.matchWinner = null;
    this.players.forEach(p => {
      this.choices[p.socketId] = null;
      this.revealedChoices[p.socketId] = null;
      this.scores[p.socketId] = 0;
    });
  }

  public handlePlayerDisconnect(socketId: string): void {
    if (!this.isFinished) {
      const remainingPlayer = this.players.find(p => p.socketId !== socketId && p.connected);
      if (remainingPlayer) {
        if (this.roundTransitionTimer) clearTimeout(this.roundTransitionTimer);
        this.matchWinner = remainingPlayer.socketId;
        this.isFinished = true;
        this.phase = 'game_over';
        this.broadcastToAll();
        this.callbacks.broadcastFinished({
          winner: remainingPlayer.socketId,
          scores: { ...this.scores },
          reason: 'Opponent disconnected'
        });
      }
    }
  }

  public cleanup(): void {
    if (this.roundTransitionTimer) {
      clearTimeout(this.roundTransitionTimer);
      this.roundTransitionTimer = null;
    }
  }
}
