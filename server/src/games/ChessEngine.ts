import { Chess, Square, PieceSymbol } from 'chess.js';
import { BaseGameEngine, GameEngineCallbacks } from './BaseGameEngine.js';
import { ChessState, Player } from '../../../shared/types.js';

export class ChessEngine extends BaseGameEngine {
  private chess: Chess;
  private whitePlayer: Player;
  private blackPlayer: Player;
  private capturedPieces: { w: string[]; b: string[] } = { w: [], b: [] };
  private lastMove?: { from: string; to: string };
  private drawOfferedBy: string | null = null;

  constructor(roomId: string, players: Player[], callbacks: GameEngineCallbacks) {
    super(roomId, 'chess', players, callbacks);
    this.chess = new Chess();
    this.whitePlayer = players[0];
    this.blackPlayer = players[1] || players[0];
  }

  public getState(): ChessState {
    const isCheck = this.chess.isCheck();
    const isCheckmate = this.chess.isCheckmate();
    const isDraw = this.chess.isDraw();

    let drawReason: ChessState['drawReason'];
    if (this.chess.isStalemate()) drawReason = 'stalemate';
    else if (this.chess.isThreefoldRepetition()) drawReason = 'threefold_repetition';
    else if (this.chess.isInsufficientMaterial()) drawReason = 'insufficient_material';
    else if (this.chess.isDrawByFiftyMoves()) drawReason = 'fifty_move_rule';

    let winner: string | 'draw' | null = null;
    let winnerReason: string | undefined;

    if (isCheckmate) {
      // If checkmate, turn is the mated player; winner is the opposite player
      winner = this.chess.turn() === 'w' ? this.blackPlayer.socketId : this.whitePlayer.socketId;
      winnerReason = 'Checkmate';
    } else if (isDraw) {
      winner = 'draw';
      winnerReason = drawReason ? drawReason.replace('_', ' ') : 'Draw';
    }

    const turnPlayerId = this.chess.turn() === 'w' ? this.whitePlayer.socketId : this.blackPlayer.socketId;

    return {
      fen: this.chess.fen(),
      turn: this.chess.turn(),
      turnPlayerId,
      players: {
        white: {
          socketId: this.whitePlayer.socketId,
          playerName: this.whitePlayer.playerName,
          avatar: this.whitePlayer.avatar,
        },
        black: {
          socketId: this.blackPlayer.socketId,
          playerName: this.blackPlayer.playerName,
          avatar: this.blackPlayer.avatar,
        },
      },
      history: this.chess.history(),
      isCheck,
      isCheckmate,
      isDraw,
      drawReason,
      winner,
      winnerReason,
      capturedPieces: { ...this.capturedPieces },
      lastMove: this.lastMove,
    };
  }

  public handleAction(socketId: string, action: string, payload?: any): { success: boolean; error?: string } {
    if (this.isFinished) {
      return { success: false, error: 'Game has already concluded.' };
    }

    switch (action) {
      case 'move': {
        const turnPlayerId = this.chess.turn() === 'w' ? this.whitePlayer.socketId : this.blackPlayer.socketId;
        if (socketId !== turnPlayerId) {
          return { success: false, error: 'Not your turn.' };
        }

        const { from, to, promotion } = payload || {};
        if (!from || !to) {
          return { success: false, error: 'Invalid move parameters.' };
        }

        try {
          const moveResult = this.chess.move({
            from: from as Square,
            to: to as Square,
            promotion: (promotion || 'q') as PieceSymbol,
          });

          if (!moveResult) {
            return { success: false, error: 'Illegal move.' };
          }

          // Track captured pieces
          if (moveResult.captured) {
            if (moveResult.color === 'w') {
              this.capturedPieces.w.push(moveResult.captured);
            } else {
              this.capturedPieces.b.push(moveResult.captured.toUpperCase());
            }
          }

          this.lastMove = { from, to };
          this.drawOfferedBy = null; // Clear any pending draw offer

          const state = this.getState();
          this.callbacks.broadcastState(state);

          if (state.isCheckmate || state.isDraw) {
            this.isFinished = true;
            const scores: Record<string, number> = {};
            if (state.winner === 'draw') {
              scores[this.whitePlayer.socketId] = 1;
              scores[this.blackPlayer.socketId] = 1;
            } else if (state.winner) {
              scores[state.winner] = 3;
              const loser = state.winner === this.whitePlayer.socketId ? this.blackPlayer.socketId : this.whitePlayer.socketId;
              scores[loser] = 0;
            }

            this.callbacks.broadcastFinished({
              winner: state.winner,
              scores,
              reason: state.winnerReason,
            });
          }

          return { success: true };
        } catch (err: any) {
          return { success: false, error: err?.message || 'Illegal chess move.' };
        }
      }

      case 'resign': {
        const isWhite = socketId === this.whitePlayer.socketId;
        const isBlack = socketId === this.blackPlayer.socketId;
        if (!isWhite && !isBlack) {
          return { success: false, error: 'You are not a player in this game.' };
        }

        const winner = isWhite ? this.blackPlayer.socketId : this.whitePlayer.socketId;
        const winnerName = isWhite ? this.blackPlayer.playerName : this.whitePlayer.playerName;
        this.isFinished = true;

        const scores: Record<string, number> = {
          [winner]: 3,
          [socketId]: 0,
        };

        const finalState = {
          ...this.getState(),
          winner,
          winnerReason: `${isWhite ? this.whitePlayer.playerName : this.blackPlayer.playerName} resigned.`,
        };
        this.callbacks.broadcastState(finalState);
        this.callbacks.broadcastFinished({
          winner,
          scores,
          reason: `${winnerName} won by resignation.`,
        });

        return { success: true };
      }

      case 'offer_draw': {
        const isPlayer = socketId === this.whitePlayer.socketId || socketId === this.blackPlayer.socketId;
        if (!isPlayer) return { success: false, error: 'Not a player' };

        this.drawOfferedBy = socketId;
        this.callbacks.broadcastState({
          ...this.getState(),
          drawOfferedBy: socketId,
        });
        return { success: true };
      }

      case 'accept_draw': {
        if (!this.drawOfferedBy || this.drawOfferedBy === socketId) {
          return { success: false, error: 'No active draw offer from opponent' };
        }

        this.isFinished = true;
        const scores: Record<string, number> = {
          [this.whitePlayer.socketId]: 1,
          [this.blackPlayer.socketId]: 1,
        };

        const finalState = {
          ...this.getState(),
          isDraw: true,
          drawReason: 'agreement' as const,
          winner: 'draw',
          winnerReason: 'Draw agreed by players',
        };

        this.callbacks.broadcastState(finalState);
        this.callbacks.broadcastFinished({
          winner: 'draw',
          scores,
          reason: 'Draw agreed by both players',
        });
        return { success: true };
      }

      default:
        return { success: false, error: `Unknown action: ${action}` };
    }
  }

  public handlePlayerDisconnect(socketId: string): void {
    if (this.isFinished) return;

    const isWhite = socketId === this.whitePlayer.socketId;
    const isBlack = socketId === this.blackPlayer.socketId;

    if (isWhite || isBlack) {
      const remainingWinner = isWhite ? this.blackPlayer.socketId : this.whitePlayer.socketId;
      const winnerName = isWhite ? this.blackPlayer.playerName : this.whitePlayer.playerName;
      this.isFinished = true;

      const scores: Record<string, number> = {
        [remainingWinner]: 3,
        [socketId]: 0,
      };

      this.callbacks.broadcastFinished({
        winner: remainingWinner,
        scores,
        reason: `${winnerName} won (opponent disconnected)`,
      });
    }
  }

  public cleanup(): void {
    this.chess.clear();
  }
}
