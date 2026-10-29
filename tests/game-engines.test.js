import test from 'node:test';
import assert from 'node:assert/strict';
import { TicTacToeEngine } from '../server/dist/server/src/games/TicTacToeEngine.js';
import { RockPaperScissorsEngine } from '../server/dist/server/src/games/RockPaperScissorsEngine.js';
import { ConnectFourEngine } from '../server/dist/server/src/games/ConnectFourEngine.js';
import { MemoryMatchEngine } from '../server/dist/server/src/games/MemoryMatchEngine.js';
import { ReactionChallengeEngine } from '../server/dist/server/src/games/ReactionChallengeEngine.js';
import { QuickQuizEngine } from '../server/dist/server/src/games/QuickQuizEngine.js';

function createMockCallbacks() {
  return {
    broadcastState: () => {},
    broadcastClientState: () => {},
    broadcastFinished: () => {},
  };
}

const mockPlayers2 = [
  { socketId: 'p1', playerName: 'Alice', avatar: '🦊', isHost: true, isReady: true, score: 0, connected: true },
  { socketId: 'p2', playerName: 'Bob', avatar: '🐼', isHost: false, isReady: true, score: 0, connected: true },
];

test('Game Engine 1: Tic-Tac-Toe', () => {
  const callbacks = createMockCallbacks();
  const game = new TicTacToeEngine('ROOM1', mockPlayers2, callbacks);

  const s0 = game.getState();
  assert.equal(s0.currentTurn, 'p1');
  assert.equal(s0.winner, null);

  // Player 1 plays cell 0
  const m1 = game.handleAction('p1', 'make_move', { index: 0 });
  assert.equal(m1.success, true);

  // Player 1 tries to play out of turn -> fails
  const m1_illegal = game.handleAction('p1', 'make_move', { index: 1 });
  assert.equal(m1_illegal.success, false);

  // Player 2 plays cell 3
  game.handleAction('p2', 'make_move', { index: 3 });

  // P1: cell 1, P2: cell 4, P1: cell 2 -> P1 wins top row!
  game.handleAction('p1', 'make_move', { index: 1 });
  game.handleAction('p2', 'make_move', { index: 4 });
  game.handleAction('p1', 'make_move', { index: 2 });

  const sFinal = game.getState();
  assert.equal(sFinal.winner, 'p1');
  assert.deepEqual(sFinal.winningLine, [0, 1, 2]);
  assert.equal(sFinal.roundsWon['p1'], 1);
});

test('Game Engine 2: Rock Paper Scissors', () => {
  const callbacks = createMockCallbacks();
  const game = new RockPaperScissorsEngine('ROOM2', mockPlayers2, callbacks);

  // Player 1 chooses rock
  const c1 = game.handleAction('p1', 'make_choice', { choice: 'rock' });
  assert.equal(c1.success, true);

  // P1's choice is hidden from P2
  const sClientP2 = game.getClientState('p2');
  assert.equal(sClientP2.hasChosen['p1'], true);
  assert.equal(sClientP2.revealedChoices, undefined);

  // Player 2 chooses scissors
  game.handleAction('p2', 'make_choice', { choice: 'scissors' });

  const sRevealed = game.getState();
  assert.equal(sRevealed.phase, 'revealed');
  assert.equal(sRevealed.roundWinner, 'p1');
  assert.equal(sRevealed.scores['p1'], 1);

  game.cleanup();
});

test('Game Engine 3: Connect Four', () => {
  const callbacks = createMockCallbacks();
  const game = new ConnectFourEngine('ROOM3', mockPlayers2, callbacks);

  // P1 drops in column 0 (falls to row 5)
  game.handleAction('p1', 'drop_chip', { col: 0 });
  // P2 drops in column 1
  game.handleAction('p2', 'drop_chip', { col: 1 });
  // P1 drops in col 0 again (falls to row 4)
  game.handleAction('p1', 'drop_chip', { col: 0 });
  game.handleAction('p2', 'drop_chip', { col: 1 });
  // P1 drops in col 0 (row 3)
  game.handleAction('p1', 'drop_chip', { col: 0 });
  game.handleAction('p2', 'drop_chip', { col: 1 });
  // P1 drops in col 0 (row 2) -> 4 vertical chips! P1 wins!
  game.handleAction('p1', 'drop_chip', { col: 0 });

  const sFinal = game.getState();
  assert.equal(sFinal.winner, 'p1');
  assert.ok(sFinal.winningCells);
  assert.equal(sFinal.winningCells.length, 4);
});

test('Game Engine 4: Memory Match', () => {
  const callbacks = createMockCallbacks();
  const game = new MemoryMatchEngine('ROOM4', mockPlayers2, callbacks);

  const s0 = game.getState();
  assert.equal(s0.cards.length, 16);
  assert.equal(s0.phase, 'flipping');

  // Flip first card
  const f1 = game.handleAction('p1', 'flip_card', { index: 0 });
  assert.equal(f1.success, true);

  const s1 = game.getState();
  assert.equal(s1.cards[0].isFlipped, true);

  game.cleanup();
});

test('Game Engine 5: Reaction Challenge', () => {
  const callbacks = createMockCallbacks();
  const game = new ReactionChallengeEngine('ROOM5', mockPlayers2, callbacks);

  const s0 = game.getState();
  assert.equal(s0.phase, 'countdown');

  // Early tap during countdown = false start
  game.handleAction('p1', 'tap');
  const sAfterTap = game.getState();
  assert.equal(sAfterTap.playerResults['p1'].falseStart, true);

  game.cleanup();
});

test('Game Engine 6: Quick Quiz', () => {
  const callbacks = createMockCallbacks();
  const game = new QuickQuizEngine('ROOM6', mockPlayers2, callbacks);

  const s0 = game.getState();
  assert.equal(s0.phase, 'question');
  assert.ok(s0.question);
  assert.equal(s0.question.options.length, 4);

  // Player answers
  const ansRes = game.handleAction('p1', 'submit_answer', { optionIndex: 0 });
  assert.equal(ansRes.success, true);

  game.cleanup();
});
