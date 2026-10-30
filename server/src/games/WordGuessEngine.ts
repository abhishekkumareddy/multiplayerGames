import { BaseGameEngine, GameEngineCallbacks } from './BaseGameEngine.js';
import { Player, WordGuessPlayerState, WordGuessState } from '../../../shared/types.js';

const WORDS = [
  'ARCADE', 'GAMES', 'CHESS', 'PIXEL', 'QUEST', 'LEVEL', 'POWER', 'SCORE', 'BONUS', 'BOARD',
  'SMART', 'SWIFT', 'BRAIN', 'LOGIC', 'MATCH', 'MAGIC', 'PARTY', 'PRIZE', 'SHINE', 'SUPER',
  'CLOUD', 'FLASH', 'SPACE', 'TRACK', 'SPEED', 'TURBO', 'BLAST', 'CHAMP', 'HERO', 'CROWN'
].map(w => w.padEnd(5, 'X').slice(0, 5).toUpperCase());

export class WordGuessEngine extends BaseGameEngine {
  private targetWord: string;
  private maxAttempts: number = 6;
  private playerGuesses: Record<string, WordGuessPlayerState> = {};
  private winner: string | 'tie' | null = null;
  private phase: 'guessing' | 'game_over' = 'guessing';

  constructor(roomId: string, players: Player[], callbacks: GameEngineCallbacks) {
    super(roomId, 'word-guess', players, callbacks);

    this.targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];

    players.forEach(p => {
      this.playerGuesses[p.socketId] = {
        attempts: [],
        solved: false,
        attemptsUsed: 0,
      };
    });
  }

  public getState(): WordGuessState {
    return {
      targetWordLength: 5,
      maxAttempts: this.maxAttempts,
      playerGuesses: { ...this.playerGuesses },
      phase: this.phase,
      winner: this.winner,
      targetWord: this.phase === 'game_over' ? this.targetWord : undefined,
      round: 1,
    };
  }

  private evaluateGuess(guess: string): ('correct' | 'present' | 'absent')[] {
    const feedback: ('correct' | 'present' | 'absent')[] = Array(5).fill('absent');
    const targetArr = this.targetWord.split('');
    const guessArr = guess.split('');

    // First pass: mark correct
    for (let i = 0; i < 5; i++) {
      if (guessArr[i] === targetArr[i]) {
        feedback[i] = 'correct';
        targetArr[i] = '#';
        guessArr[i] = '*';
      }
    }

    // Second pass: mark present
    for (let i = 0; i < 5; i++) {
      if (guessArr[i] !== '*') {
        const foundIdx = targetArr.indexOf(guessArr[i]);
        if (foundIdx !== -1) {
          feedback[i] = 'present';
          targetArr[foundIdx] = '#';
        }
      }
    }

    return feedback;
  }

  public handleAction(socketId: string, action: string, payload?: any): { success: boolean; error?: string } {
    if (this.isFinished || this.phase === 'game_over') {
      return { success: false, error: 'Word guess game has concluded' };
    }

    const pState = this.playerGuesses[socketId];
    if (!pState || pState.solved || pState.attemptsUsed >= this.maxAttempts) {
      return { success: false, error: 'Cannot guess' };
    }

    if (action === 'guess_word') {
      const cleanWord = payload?.word?.trim().toUpperCase();
      if (!cleanWord || cleanWord.length !== 5) {
        return { success: false, error: 'Guess must be exactly 5 letters' };
      }

      const feedback = this.evaluateGuess(cleanWord);
      pState.attempts.push({ word: cleanWord, feedback });
      pState.attemptsUsed++;

      if (cleanWord === this.targetWord) {
        pState.solved = true;
      }

      // Check if all players solved or used all attempts
      const allDone = Object.values(this.playerGuesses).every(
        p => p.solved || p.attemptsUsed >= this.maxAttempts
      );

      if (allDone) {
        this.phase = 'game_over';
        this.isFinished = true;

        // Rank by solved status and fewest attempts
        const solvers = Object.entries(this.playerGuesses).filter(([_, p]) => p.solved);
        if (solvers.length === 0) {
          this.winner = null;
        } else {
          solvers.sort((a, b) => a[1].attemptsUsed - b[1].attemptsUsed);
          if (solvers.length > 1 && solvers[0][1].attemptsUsed === solvers[1][1].attemptsUsed) {
            this.winner = 'tie';
          } else {
            this.winner = solvers[0][0];
          }
        }

        const scores: Record<string, number> = {};
        Object.entries(this.playerGuesses).forEach(([sId, p]) => {
          scores[sId] = p.solved ? (7 - p.attemptsUsed) * 10 : 0;
        });

        this.callbacks.broadcastState(this.getState());
        this.callbacks.broadcastFinished({
          winner: this.winner === 'tie' ? null : this.winner,
          scores,
          reason: `Word was: ${this.targetWord}`,
        });
      } else {
        this.callbacks.broadcastState(this.getState());
      }

      return { success: true };
    }

    return { success: false, error: `Unknown action: ${action}` };
  }

  public handlePlayerDisconnect(socketId: string): void {}

  public cleanup(): void {}
}
