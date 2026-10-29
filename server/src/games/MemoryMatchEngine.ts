import { BaseGameEngine, GameEngineCallbacks } from './BaseGameEngine.js';
import { MemoryCard, MemoryMatchState, Player } from '../../../shared/types.js';

export class MemoryMatchEngine extends BaseGameEngine {
  private static readonly CARD_SYMBOLS = ['🕹️', '👾', '🎮', '🏆', '🚀', '⚡', '💎', '🎲'];

  private cards: { id: number; symbol: string; isFlipped: boolean; isMatched: boolean; matchedBy?: string }[] = [];
  private currentTurn: string;
  private flippedIndices: number[] = [];
  private scores: Record<string, number> = {};
  private winner: string | 'draw' | null = null;
  private phase: 'flipping' | 'evaluating' | 'game_over' = 'flipping';
  private flipBackTimer: NodeJS.Timeout | null = null;

  constructor(roomId: string, players: Player[], callbacks: GameEngineCallbacks) {
    super(roomId, 'memory-match', players, callbacks);

    players.forEach(p => {
      this.scores[p.socketId] = 0;
    });

    this.currentTurn = players[0].socketId;
    this.initCards();
  }

  private initCards(): void {
    const deck: { id: number; symbol: string; isFlipped: boolean; isMatched: boolean }[] = [];
    let id = 0;

    for (const sym of MemoryMatchEngine.CARD_SYMBOLS) {
      // 2 of each symbol for pairs
      deck.push({ id: id++, symbol: sym, isFlipped: false, isMatched: false });
      deck.push({ id: id++, symbol: sym, isFlipped: false, isMatched: false });
    }

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    this.cards = deck;
  }

  public getState(): MemoryMatchState {
    return {
      cards: this.cards.map((c, idx) => ({
        id: c.id,
        // Only show symbol if flipped or matched
        symbol: c.isFlipped || c.isMatched ? c.symbol : '❓',
        isFlipped: c.isFlipped,
        isMatched: c.isMatched,
        matchedBy: c.matchedBy,
      })),
      currentTurn: this.currentTurn,
      flippedIndices: [...this.flippedIndices],
      scores: { ...this.scores },
      winner: this.winner,
      phase: this.phase,
    };
  }

  public handleAction(socketId: string, action: string, payload?: any): { success: boolean; error?: string } {
    if (this.isFinished) {
      return { success: false, error: 'Game is finished' };
    }

    if (action === 'flip_card') {
      const cardIndex = payload?.index;

      if (typeof cardIndex !== 'number' || cardIndex < 0 || cardIndex >= this.cards.length) {
        return { success: false, error: 'Invalid card index' };
      }

      if (this.phase !== 'flipping') {
        return { success: false, error: 'Currently evaluating cards' };
      }

      if (socketId !== this.currentTurn) {
        return { success: false, error: 'Not your turn' };
      }

      const card = this.cards[cardIndex];
      if (card.isMatched || card.isFlipped) {
        return { success: false, error: 'Card already revealed' };
      }

      // Flip the card
      card.isFlipped = true;
      this.flippedIndices.push(cardIndex);

      if (this.flippedIndices.length === 1) {
        // First card flipped
        this.callbacks.broadcastState(this.getState());
        return { success: true };
      }

      if (this.flippedIndices.length === 2) {
        // Second card flipped -> check for match
        const [idx1, idx2] = this.flippedIndices;
        const card1 = this.cards[idx1];
        const card2 = this.cards[idx2];

        if (card1.symbol === card2.symbol) {
          // MATCH!
          card1.isMatched = true;
          card2.isMatched = true;
          card1.matchedBy = socketId;
          card2.matchedBy = socketId;
          this.scores[socketId] += 1;
          this.flippedIndices = [];

          // Check if all matched
          const allMatched = this.cards.every(c => c.isMatched);
          if (allMatched) {
            this.phase = 'game_over';
            this.isFinished = true;
            this.determineWinner();
            this.callbacks.broadcastState(this.getState());
            this.callbacks.broadcastFinished({
              winner: this.winner,
              scores: { ...this.scores }
            });
          } else {
            // Player keeps turn on match!
            this.callbacks.broadcastState(this.getState());
          }
        } else {
          // NO MATCH -> evaluating phase, reveal briefly then flip back
          this.phase = 'evaluating';
          this.callbacks.broadcastState(this.getState());

          if (this.flipBackTimer) clearTimeout(this.flipBackTimer);
          this.flipBackTimer = setTimeout(() => {
            card1.isFlipped = false;
            card2.isFlipped = false;
            this.flippedIndices = [];
            this.phase = 'flipping';

            // Advance to next player
            this.advanceTurn();
            this.callbacks.broadcastState(this.getState());
          }, 1200);
        }

        return { success: true };
      }

      return { success: false, error: 'Cannot flip more than 2 cards' };
    }

    if (action === 'rematch_round') {
      this.resetGame();
      this.callbacks.broadcastState(this.getState());
      return { success: true };
    }

    return { success: false, error: 'Unknown action' };
  }

  private advanceTurn(): void {
    const currentIndex = this.players.findIndex(p => p.socketId === this.currentTurn);
    let nextIndex = (currentIndex + 1) % this.players.length;
    // Skip disconnected players if possible
    let attempts = 0;
    while (!this.players[nextIndex].connected && attempts < this.players.length) {
      nextIndex = (nextIndex + 1) % this.players.length;
      attempts++;
    }
    this.currentTurn = this.players[nextIndex].socketId;
  }

  private determineWinner(): void {
    let highestScore = -1;
    let winners: string[] = [];

    for (const [id, score] of Object.entries(this.scores)) {
      if (score > highestScore) {
        highestScore = score;
        winners = [id];
      } else if (score === highestScore) {
        winners.push(id);
      }
    }

    if (winners.length === 1) {
      this.winner = winners[0];
    } else {
      this.winner = 'draw';
    }
  }

  private resetGame(): void {
    if (this.flipBackTimer) clearTimeout(this.flipBackTimer);
    this.flipBackTimer = null;
    this.flippedIndices = [];
    this.winner = null;
    this.phase = 'flipping';
    this.isFinished = false;
    this.players.forEach(p => {
      this.scores[p.socketId] = 0;
    });
    this.currentTurn = this.players[0].socketId;
    this.initCards();
  }

  public handlePlayerDisconnect(socketId: string): void {
    if (this.currentTurn === socketId && !this.isFinished) {
      if (this.flipBackTimer) {
        clearTimeout(this.flipBackTimer);
        this.flipBackTimer = null;
      }
      this.cards.forEach(c => {
        if (!c.isMatched) c.isFlipped = false;
      });
      this.flippedIndices = [];
      this.phase = 'flipping';
      this.advanceTurn();
      this.callbacks.broadcastState(this.getState());
    }
  }

  public cleanup(): void {
    if (this.flipBackTimer) {
      clearTimeout(this.flipBackTimer);
      this.flipBackTimer = null;
    }
  }
}
