import { BaseGameEngine, GameEngineCallbacks } from './BaseGameEngine.js';
import { Player, QuizPlayerAnswer, QuizQuestionPublic, QuizState } from '../../../shared/types.js';
import { QUIZ_QUESTIONS, QuizQuestionItem } from './quizQuestions.js';

export class QuickQuizEngine extends BaseGameEngine {
  private questions: QuizQuestionItem[] = [];
  private currentQuestionIndex: number = 0;
  private totalQuestions: number = 5;
  private phase: 'question' | 'reveal' | 'scoreboard' | 'game_over' = 'question';
  private answers: Record<string, QuizPlayerAnswer> = {};
  private scores: Record<string, number> = {};
  private winner: string | null = null;
  private secondsRemaining: number = 12;
  private questionStartTime: number = 0;

  private tickInterval: NodeJS.Timeout | null = null;
  private transitionTimer: NodeJS.Timeout | null = null;

  constructor(roomId: string, players: Player[], callbacks: GameEngineCallbacks) {
    super(roomId, 'quick-quiz', players, callbacks);

    players.forEach(p => {
      this.scores[p.socketId] = 0;
    });

    this.selectRandomQuestions();
    this.startQuestion();
  }

  private selectRandomQuestions(): void {
    // Pick 5 random questions from bank
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
    this.questions = shuffled.slice(0, this.totalQuestions);
  }

  public getState(): QuizState {
    const currentQ = this.questions[this.currentQuestionIndex];
    let publicQ: QuizQuestionPublic | null = null;

    if (currentQ) {
      publicQ = {
        id: currentQ.id,
        question: currentQ.question,
        category: currentQ.category,
        options: currentQ.options,
        timeLimitSec: currentQ.timeLimitSec,
      };
    }

    return {
      currentQuestionIndex: this.currentQuestionIndex,
      totalQuestions: this.totalQuestions,
      question: publicQ,
      phase: this.phase,
      answers: { ...this.answers },
      // Only reveal correctOption and explanation during 'reveal' or 'scoreboard' or 'game_over'
      correctOption: this.phase !== 'question' && currentQ ? currentQ.correctOption : null,
      explanation: this.phase !== 'question' && currentQ ? currentQ.explanation : null,
      scores: { ...this.scores },
      winner: this.winner,
      secondsRemaining: this.secondsRemaining,
    };
  }

  // Client-specific state: each player sees only that they have submitted during question phase
  public override getClientState(socketId?: string): any {
    const baseState = this.getState();
    if (this.phase === 'question') {
      const maskedAnswers: Record<string, any> = {};
      for (const [id, ans] of Object.entries(this.answers)) {
        if (id === socketId) {
          maskedAnswers[id] = ans; // Player sees their own submitted answer
        } else {
          maskedAnswers[id] = { hasAnswered: true }; // Opponents only see that player answered
        }
      }
      return {
        ...baseState,
        answers: maskedAnswers,
      };
    }
    return baseState;
  }

  private broadcastToAll(): void {
    this.callbacks.broadcastClientState((socketId: string) => this.getClientState(socketId));
  }

  private startQuestion(): void {
    this.phase = 'question';
    this.answers = {};
    const currentQ = this.questions[this.currentQuestionIndex];
    this.secondsRemaining = currentQ ? currentQ.timeLimitSec : 12;
    this.questionStartTime = Date.now();

    this.broadcastToAll();

    // Setup 1s tick countdown
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = setInterval(() => {
      this.secondsRemaining -= 1;
      if (this.secondsRemaining <= 0) {
        if (this.tickInterval) clearInterval(this.tickInterval);
        this.finishQuestion();
      } else {
        this.broadcastToAll();
      }
    }, 1000);
  }

  public handleAction(socketId: string, action: string, payload?: any): { success: boolean; error?: string } {
    if (this.isFinished) {
      return { success: false, error: 'Game is finished' };
    }

    if (action === 'submit_answer') {
      if (this.phase !== 'question') {
        return { success: false, error: 'Not in question answering phase' };
      }

      if (this.answers[socketId]) {
        return { success: false, error: 'Already answered' };
      }

      const optionIndex = payload?.optionIndex;
      if (typeof optionIndex !== 'number' || optionIndex < 0 || optionIndex > 3) {
        return { success: false, error: 'Invalid option' };
      }

      const currentQ = this.questions[this.currentQuestionIndex];
      const isCorrect = optionIndex === currentQ.correctOption;
      const answerTime = Date.now() - this.questionStartTime;

      let points = 0;
      if (isCorrect) {
        // Base 500 + time bonus up to 500 (ratio of remaining time)
        const timeRatio = Math.max(0, (currentQ.timeLimitSec * 1000 - answerTime) / (currentQ.timeLimitSec * 1000));
        points = Math.round(500 + 500 * timeRatio);
        this.scores[socketId] += points;
      }

      this.answers[socketId] = {
        selectedOption: optionIndex,
        timeMs: answerTime,
        isCorrect,
        pointsEarned: points,
      };

      // Check if all connected players answered
      const allAnswered = this.players.every(p => !p.connected || this.answers[p.socketId] !== undefined);
      if (allAnswered) {
        if (this.tickInterval) clearInterval(this.tickInterval);
        this.finishQuestion();
      } else {
        this.broadcastToAll();
      }

      return { success: true };
    }

    if (action === 'rematch_round') {
      this.resetGame();
      this.broadcastToAll();
      return { success: true };
    }

    return { success: false, error: 'Unknown action' };
  }

  private finishQuestion(): void {
    this.phase = 'reveal';
    this.broadcastToAll();

    // Show answer reveal for 3.5 seconds, then scoreboard
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    this.transitionTimer = setTimeout(() => {
      this.showScoreboard();
    }, 3500);
  }

  private showScoreboard(): void {
    this.phase = 'scoreboard';
    this.broadcastToAll();

    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    this.transitionTimer = setTimeout(() => {
      if (this.currentQuestionIndex + 1 < this.totalQuestions) {
        this.currentQuestionIndex += 1;
        this.startQuestion();
      } else {
        this.finishGame();
      }
    }, 2800);
  }

  private finishGame(): void {
    this.phase = 'game_over';
    this.isFinished = true;

    let maxScore = -1;
    let topPlayer: string | null = null;
    for (const [id, score] of Object.entries(this.scores)) {
      if (score > maxScore) {
        maxScore = score;
        topPlayer = id;
      }
    }
    this.winner = topPlayer;

    this.broadcastToAll();
    this.callbacks.broadcastFinished({
      winner: this.winner,
      scores: { ...this.scores }
    });
  }

  private resetGame(): void {
    this.cleanup();
    this.currentQuestionIndex = 0;
    this.isFinished = false;
    this.winner = null;
    this.players.forEach(p => {
      this.scores[p.socketId] = 0;
    });
    this.selectRandomQuestions();
    this.startQuestion();
  }

  public handlePlayerDisconnect(socketId: string): void {
    if (this.phase === 'question') {
      const allAnswered = this.players.every(p => !p.connected || this.answers[p.socketId] !== undefined);
      if (allAnswered) {
        if (this.tickInterval) clearInterval(this.tickInterval);
        this.finishQuestion();
      }
    }
  }

  public cleanup(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }
  }
}
