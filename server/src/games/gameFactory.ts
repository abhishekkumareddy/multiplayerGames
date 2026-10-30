import { BaseGameEngine, GameEngineCallbacks } from './BaseGameEngine.js';
import { GameId, Player } from '../../../shared/types.js';
import { TicTacToeEngine } from './TicTacToeEngine.js';
import { RockPaperScissorsEngine } from './RockPaperScissorsEngine.js';
import { ConnectFourEngine } from './ConnectFourEngine.js';
import { MemoryMatchEngine } from './MemoryMatchEngine.js';
import { ReactionChallengeEngine } from './ReactionChallengeEngine.js';
import { QuickQuizEngine } from './QuickQuizEngine.js';
import { ChessEngine } from './ChessEngine.js';
import { LudoEngine } from './LudoEngine.js';
import { DotsAndBoxesEngine } from './DotsAndBoxesEngine.js';
import { Game2048Engine } from './Game2048Engine.js';
import { SudokuEngine } from './SudokuEngine.js';
import { WordGuessEngine } from './WordGuessEngine.js';

export function createGameEngine(
  gameId: GameId,
  roomId: string,
  players: Player[],
  callbacks: GameEngineCallbacks
): BaseGameEngine {
  switch (gameId) {
    case 'tic-tac-toe':
      return new TicTacToeEngine(roomId, players, callbacks);
    case 'rock-paper-scissors':
      return new RockPaperScissorsEngine(roomId, players, callbacks);
    case 'connect-four':
      return new ConnectFourEngine(roomId, players, callbacks);
    case 'memory-match':
      return new MemoryMatchEngine(roomId, players, callbacks);
    case 'reaction-challenge':
      return new ReactionChallengeEngine(roomId, players, callbacks);
    case 'quick-quiz':
      return new QuickQuizEngine(roomId, players, callbacks);
    case 'chess':
      return new ChessEngine(roomId, players, callbacks);
    case 'ludo':
      return new LudoEngine(roomId, players, callbacks);
    case 'dots-and-boxes':
      return new DotsAndBoxesEngine(roomId, players, callbacks);
    case 'game-2048':
      return new Game2048Engine(roomId, players, callbacks);
    case 'sudoku':
      return new SudokuEngine(roomId, players, callbacks);
    case 'word-guess':
      return new WordGuessEngine(roomId, players, callbacks);
    default:
      throw new Error(`Unsupported game: ${gameId}`);
  }
}
