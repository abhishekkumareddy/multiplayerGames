import { BaseGameEngine, GameEngineCallbacks } from './BaseGameEngine.js';
import { LudoColor, LudoPlayer, LudoState, Player } from '../../../shared/types.js';

const COLORS: LudoColor[] = ['red', 'green', 'yellow', 'blue'];
const START_OFFSETS: Record<LudoColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Safe squares on 52-tile track
const SAFE_SQUARES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
const HOME_GOAL_STEP = 56;

export class LudoEngine extends BaseGameEngine {
  private ludoPlayers: LudoPlayer[];
  private turnOrder: LudoColor[];
  private currentTurnIndex: number = 0;
  private diceValue: number | null = null;
  private canRoll: boolean = true;
  private movableTokenIndices: number[] = [];
  private phase: 'rolling' | 'moving' | 'game_over' = 'rolling';
  private rankings: { socketId: string; playerName: string; rank: number; color: LudoColor }[] = [];
  private consecutiveSixes: number = 0;
  private lastActionText: string = 'Game started. Red to roll.';

  constructor(roomId: string, players: Player[], callbacks: GameEngineCallbacks) {
    super(roomId, 'ludo', players, callbacks);

    this.ludoPlayers = players.slice(0, 4).map((p, idx) => ({
      socketId: p.socketId,
      playerName: p.playerName,
      avatar: p.avatar,
      color: COLORS[idx],
      tokens: [-1, -1, -1, -1], // -1 = yard, 0..50 = track, 51..55 = home stretch, 56 = home goal
      hasWon: false,
    }));

    this.turnOrder = this.ludoPlayers.map(p => p.color);
    this.currentTurnIndex = 0;
    this.canRoll = true;
    this.lastActionText = `${this.getCurrentPlayer().playerName} (${this.getCurrentPlayer().color}) rolls first.`;
  }

  private getCurrentPlayer(): LudoPlayer {
    const color = this.turnOrder[this.currentTurnIndex];
    return this.ludoPlayers.find(p => p.color === color)!;
  }

  public getState(): LudoState {
    const current = this.getCurrentPlayer();
    const winner = this.rankings.length > 0 ? this.rankings[0].socketId : null;

    return {
      players: this.ludoPlayers.map(p => ({
        ...p,
        tokens: [...p.tokens],
      })),
      turnOrder: [...this.turnOrder],
      currentTurnColor: current?.color || 'red',
      currentTurnSocketId: current?.socketId || '',
      diceValue: this.diceValue,
      canRoll: this.canRoll,
      movableTokenIndices: [...this.movableTokenIndices],
      phase: this.phase,
      winner,
      rankings: [...this.rankings],
      lastActionText: this.lastActionText,
    };
  }

  private getGlobalTrackIndex(color: LudoColor, step: number): number | null {
    if (step < 0 || step > 50) return null; // In yard or in home stretch
    return (START_OFFSETS[color] + step) % 52;
  }

  private calculateMovableTokens(player: LudoPlayer, dice: number): number[] {
    const movable: number[] = [];

    player.tokens.forEach((step, idx) => {
      // In Yard: needs 6 to enter
      if (step === -1) {
        if (dice === 6) movable.push(idx);
      } else if (step < HOME_GOAL_STEP) {
        // In track or home stretch: can move if step + dice <= HOME_GOAL_STEP
        if (step + dice <= HOME_GOAL_STEP) {
          movable.push(idx);
        }
      }
    });

    return movable;
  }

  private advanceTurn(bonusRoll: boolean = false): void {
    this.movableTokenIndices = [];

    if (bonusRoll) {
      this.canRoll = true;
      this.phase = 'rolling';
      return;
    }

    this.consecutiveSixes = 0;

    // Check if remaining active players exist
    const activePlayers = this.ludoPlayers.filter(p => !p.hasWon);
    if (activePlayers.length <= 1) {
      this.phase = 'game_over';
      this.isFinished = true;
      const winner = this.rankings[0]?.socketId || null;
      const scores: Record<string, number> = {};
      this.ludoPlayers.forEach(p => {
        const homeCount = p.tokens.filter(t => t === HOME_GOAL_STEP).length;
        scores[p.socketId] = homeCount * 10;
      });

      this.callbacks.broadcastFinished({
        winner,
        scores,
        reason: `${this.rankings[0]?.playerName || 'Player'} won Ludo!`,
      });
      return;
    }

    // Find next player who hasn't won
    let nextIndex = (this.currentTurnIndex + 1) % this.turnOrder.length;
    while (this.ludoPlayers.find(p => p.color === this.turnOrder[nextIndex])?.hasWon) {
      nextIndex = (nextIndex + 1) % this.turnOrder.length;
    }

    this.currentTurnIndex = nextIndex;
    this.canRoll = true;
    this.phase = 'rolling';
    const nextPlayer = this.getCurrentPlayer();
    this.lastActionText = `${nextPlayer.playerName}'s turn (${nextPlayer.color}).`;
  }

  public handleAction(socketId: string, action: string, payload?: any): { success: boolean; error?: string } {
    if (this.isFinished) {
      return { success: false, error: 'Game has already concluded.' };
    }

    const currentPlayer = this.getCurrentPlayer();
    if (socketId !== currentPlayer.socketId) {
      return { success: false, error: 'Not your turn.' };
    }

    switch (action) {
      case 'roll_dice': {
        if (!this.canRoll || this.phase !== 'rolling') {
          return { success: false, error: 'Cannot roll right now.' };
        }

        // Generate server-authoritative dice roll (1-6)
        const roll = Math.floor(Math.random() * 6) + 1;
        this.diceValue = roll;
        this.canRoll = false;

        if (roll === 6) {
          this.consecutiveSixes++;
          if (this.consecutiveSixes === 3) {
            // 3 consecutive 6s penalties: forfeit turn
            this.lastActionText = `${currentPlayer.playerName} rolled three 6s in a row! Turn forfeited.`;
            this.consecutiveSixes = 0;
            this.advanceTurn(false);
            this.callbacks.broadcastState(this.getState());
            return { success: true };
          }
        } else {
          this.consecutiveSixes = 0;
        }

        // Calculate movable tokens
        const movable = this.calculateMovableTokens(currentPlayer, roll);
        this.movableTokenIndices = movable;

        if (movable.length === 0) {
          // No legal moves
          this.lastActionText = `${currentPlayer.playerName} rolled a ${roll} (no legal moves).`;
          this.phase = 'rolling';
          this.advanceTurn(false);
          this.callbacks.broadcastState(this.getState());
          return { success: true };
        }

        this.phase = 'moving';
        this.lastActionText = `${currentPlayer.playerName} rolled a ${roll}! Select a token to move.`;
        this.callbacks.broadcastState(this.getState());
        return { success: true };
      }

      case 'move_token': {
        if (this.phase !== 'moving' || this.diceValue === null) {
          return { success: false, error: 'Cannot move right now.' };
        }

        const tokenIndex = payload?.tokenIndex;
        if (tokenIndex === undefined || !this.movableTokenIndices.includes(tokenIndex)) {
          return { success: false, error: 'Invalid token choice.' };
        }

        const roll = this.diceValue;
        const currentStep = currentPlayer.tokens[tokenIndex];
        let bonusRoll = roll === 6;
        let captured = false;

        if (currentStep === -1) {
          // Enter track at step 0
          currentPlayer.tokens[tokenIndex] = 0;
          this.lastActionText = `${currentPlayer.playerName} brought a token onto the track!`;
        } else {
          const newStep = currentStep + roll;
          currentPlayer.tokens[tokenIndex] = newStep;

          if (newStep === HOME_GOAL_STEP) {
            this.lastActionText = `🎉 ${currentPlayer.playerName} got a token HOME!`;
            bonusRoll = true;

            // Check if player has won
            if (currentPlayer.tokens.every(t => t === HOME_GOAL_STEP)) {
              currentPlayer.hasWon = true;
              const rank = this.rankings.length + 1;
              currentPlayer.rank = rank;
              this.rankings.push({
                socketId: currentPlayer.socketId,
                playerName: currentPlayer.playerName,
                rank,
                color: currentPlayer.color,
              });
              this.lastActionText = `👑 ${currentPlayer.playerName} won #${rank} place!`;
            }
          } else if (newStep < 51) {
            // On main track: check for captures
            const globalIndex = this.getGlobalTrackIndex(currentPlayer.color, newStep)!;
            if (!SAFE_SQUARES.has(globalIndex)) {
              // Check other players' tokens on this global index
              this.ludoPlayers.forEach(otherPlayer => {
                if (otherPlayer.color !== currentPlayer.color) {
                  otherPlayer.tokens.forEach((otherStep, otherTokenIdx) => {
                    if (otherStep >= 0 && otherStep < 51) {
                      const otherGlobal = this.getGlobalTrackIndex(otherPlayer.color, otherStep);
                      if (otherGlobal === globalIndex) {
                        // Capture!
                        otherPlayer.tokens[otherTokenIdx] = -1;
                        captured = true;
                        bonusRoll = true;
                        this.lastActionText = `💥 ${currentPlayer.playerName} captured ${otherPlayer.playerName}'s token!`;
                      }
                    }
                  });
                }
              });
            }
          }
        }

        // Advance turn or give bonus roll
        this.advanceTurn(bonusRoll);
        this.callbacks.broadcastState(this.getState());
        return { success: true };
      }

      default:
        return { success: false, error: `Unknown action: ${action}` };
    }
  }

  public handlePlayerDisconnect(socketId: string): void {
    const player = this.ludoPlayers.find(p => p.socketId === socketId);
    if (!player || player.hasWon) return;

    player.hasWon = true; // Mark inactive
    if (this.getCurrentPlayer()?.socketId === socketId) {
      this.advanceTurn(false);
      this.callbacks.broadcastState(this.getState());
    }
  }

  public cleanup(): void {
    this.ludoPlayers = [];
  }
}
