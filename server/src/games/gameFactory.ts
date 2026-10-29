import { BaseGameEngine, GameEngineCallbacks } from './BaseGameEngine.js';
import { GameId, Player } from '../../../shared/types.js';
import { TicTacToeEngine } from './TicTacToeEngine.js';
import { RockPaperScissorsEngine } from './RockPaperScissorsEngine.js';
import { ConnectFourEngine } from './ConnectFourEngine.js';
import { MemoryMatchEngine } from './MemoryMatchEngine.js';
import { ReactionChallengeEngine } from './ReactionChallengeEngine.js';
import { QuickQuizEngine } from './QuickQuizEngine.js';

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
    default:
      throw new Error(`Unsupported game: ${gameId}`);
  }
}
