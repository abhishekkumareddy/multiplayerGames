import test from 'node:test';
import assert from 'node:assert/strict';
import { TicTacToeEngine } from '../server/dist/server/src/games/TicTacToeEngine.js';
import { RockPaperScissorsEngine } from '../server/dist/server/src/games/RockPaperScissorsEngine.js';
import { ConnectFourEngine } from '../server/dist/server/src/games/ConnectFourEngine.js';
import { MemoryMatchEngine } from '../server/dist/server/src/games/MemoryMatchEngine.js';
import { ReactionChallengeEngine } from '../server/dist/server/src/games/ReactionChallengeEngine.js';
import { QuickQuizEngine } from '../server/dist/server/src/games/QuickQuizEngine.js';
import { ChessEngine } from '../server/dist/server/src/games/ChessEngine.js';
import { LudoEngine } from '../server/dist/server/src/games/LudoEngine.js';
import { DotsAndBoxesEngine } from '../server/dist/server/src/games/DotsAndBoxesEngine.js';
import { Game2048Engine } from '../server/dist/server/src/games/Game2048Engine.js';
import { SudokuEngine } from '../server/dist/server/src/games/SudokuEngine.js';
import { WordGuessEngine } from '../server/dist/server/src/games/WordGuessEngine.js';

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

test('Game Engine 7: Chess Engine (Server Authoritative)', () => {
  const callbacks = createMockCallbacks();
  const game = new ChessEngine('ROOM_CHESS', mockPlayers2, callbacks);

  const s0 = game.getState();
  assert.equal(s0.turn, 'w');
  assert.equal(s0.turnPlayerId, 'p1');
  assert.equal(s0.isCheck, false);
  assert.equal(s0.winner, null);

  // Black (p2) tries to move on White's turn -> fails
  const illegalTurn = game.handleAction('p2', 'move', { from: 'e7', to: 'e5' });
  assert.equal(illegalTurn.success, false);

  // White plays e2 -> e4
  const m1 = game.handleAction('p1', 'move', { from: 'e2', to: 'e4' });
  assert.equal(m1.success, true);

  const s1 = game.getState();
  assert.equal(s1.turn, 'b');
  assert.equal(s1.turnPlayerId, 'p2');
  assert.deepEqual(s1.history, ['e4']);

  // Black plays e7 -> e5
  const m2 = game.handleAction('p2', 'move', { from: 'e7', to: 'e5' });
  assert.equal(m2.success, true);

  // White plays Scholar's Mate moves:
  // 2. Qh5
  game.handleAction('p1', 'move', { from: 'd1', to: 'h5' });
  // 2... Nc6
  game.handleAction('p2', 'move', { from: 'b8', to: 'c6' });
  // 3. Bc4
  game.handleAction('p1', 'move', { from: 'f1', to: 'c4' });
  // 3... Nf6
  game.handleAction('p2', 'move', { from: 'g8', to: 'f6' });
  // 4. Qxf7# (Checkmate!)
  const mateRes = game.handleAction('p1', 'move', { from: 'h5', to: 'f7' });
  assert.equal(mateRes.success, true);

  const sFinal = game.getState();
  assert.equal(sFinal.isCheckmate, true);
  assert.equal(sFinal.winner, 'p1');
  assert.equal(sFinal.winnerReason, 'Checkmate');
  assert.equal(sFinal.capturedPieces.w.length, 1); // Captured pawn

  game.cleanup();
});

test('Game Engine 8: Ludo Express Engine', () => {
  const callbacks = createMockCallbacks();
  const game = new LudoEngine('ROOM_LUDO', mockPlayers2, callbacks);

  const s0 = game.getState();
  assert.equal(s0.currentTurnColor, 'red');
  assert.equal(s0.currentTurnSocketId, 'p1');
  assert.equal(s0.canRoll, true);
  assert.equal(s0.phase, 'rolling');

  // Player rolls dice
  const rollRes = game.handleAction('p1', 'roll_dice');
  assert.equal(rollRes.success, true);

  const s1 = game.getState();
  assert.ok(s1.diceValue >= 1 && s1.diceValue <= 6);

  // If rolled 6, token can enter track; otherwise no moves
  if (s1.diceValue === 6) {
    assert.ok(s1.movableTokenIndices.length > 0);
    const moveRes = game.handleAction('p1', 'move_token', { tokenIndex: 0 });
    assert.equal(moveRes.success, true);
  }

  game.cleanup();
});

test('Game Engine 9: Dots and Boxes Engine', () => {
  const callbacks = createMockCallbacks();
  const game = new DotsAndBoxesEngine('ROOM_DOTS', mockPlayers2, callbacks);

  const s0 = game.getState();
  assert.equal(s0.currentTurn, 'p1');
  assert.equal(s0.completedBoxes, 0);

  // p1 draws top line of box (0, 0): h[0][0]
  const l1 = game.handleAction('p1', 'draw_line', { type: 'h', row: 0, col: 0 });
  assert.equal(l1.success, true);

  // Turn changes to p2
  const s1 = game.getState();
  assert.equal(s1.currentTurn, 'p2');

  // p2 draws bottom line: h[1][0]
  game.handleAction('p2', 'draw_line', { type: 'h', row: 1, col: 0 });
  // p1 draws left line: v[0][0]
  game.handleAction('p1', 'draw_line', { type: 'v', row: 0, col: 0 });
  // p2 draws right line: v[0][1] -> Completes box (0, 0)!
  game.handleAction('p2', 'draw_line', { type: 'v', row: 0, col: 1 });

  const s2 = game.getState();
  assert.equal(s2.completedBoxes, 1);
  assert.equal(s2.boxes[0][0], 'p2');
  assert.equal(s2.scores['p2'], 1);
  // p2 completed box -> keeps turn!
  assert.equal(s2.currentTurn, 'p2');

  game.cleanup();
});

test('Game Engine 10: 2048 Battle Engine', () => {
  const callbacks = createMockCallbacks();
  const game = new Game2048Engine('ROOM_2048', mockPlayers2, callbacks);

  const s0 = game.getState();
  assert.ok(s0.boards['p1']);
  assert.ok(s0.boards['p2']);

  // Count non-zero tiles on p1 board (should be 2 initially)
  const initialTiles = s0.boards['p1'].board.flat().filter(v => v > 0).length;
  assert.equal(initialTiles, 2);

  // Slide left
  game.handleAction('p1', 'slide', { direction: 'left' });
  const s1 = game.getState();
  assert.ok(s1.boards['p1'].board.flat().filter(v => v > 0).length >= 2);

  game.cleanup();
});

test('Game Engine 11: Sudoku Duel Engine', () => {
  const callbacks = createMockCallbacks();
  const game = new SudokuEngine('ROOM_SUDOKU', mockPlayers2, callbacks);

  const s0 = game.getState();
  assert.equal(s0.initialBoard[0][0], 5);
  // (0, 2) is open (0)
  assert.equal(s0.initialBoard[0][2], 0);

  // Solution for (0, 2) is 4. Wrong guess (9) -> penalized
  const wrongRes = game.handleAction('p1', 'fill_cell', { row: 0, col: 2, val: 9 });
  assert.equal(wrongRes.success, false);
  assert.equal(game.getState().errors['p1'], 1);

  // Correct guess (4) -> accepted & scored
  const correctRes = game.handleAction('p1', 'fill_cell', { row: 0, col: 2, val: 4 });
  assert.equal(correctRes.success, true);
  assert.equal(game.getState().scores['p1'], 10);
  assert.equal(game.getState().currentBoard[0][2], 4);

  game.cleanup();
});

test('Game Engine 12: Word Guess Engine', () => {
  const callbacks = createMockCallbacks();
  const game = new WordGuessEngine('ROOM_WORD', mockPlayers2, callbacks);

  const s0 = game.getState();
  assert.equal(s0.phase, 'guessing');

  // Submit 5-letter guess
  const g1 = game.handleAction('p1', 'guess_word', { word: 'GAMES' });
  assert.equal(g1.success, true);

  const s1 = game.getState();
  assert.equal(s1.playerGuesses['p1'].attemptsUsed, 1);
  assert.equal(s1.playerGuesses['p1'].attempts[0].feedback.length, 5);

  game.cleanup();
});
