export type GameId =
  | 'tic-tac-toe'
  | 'rock-paper-scissors'
  | 'connect-four'
  | 'memory-match'
  | 'reaction-challenge'
  | 'quick-quiz'
  | 'chess'
  | 'ludo'
  | 'dots-and-boxes'
  | 'game-2048'
  | 'sudoku'
  | 'word-guess';

export type GameCategory =
  | 'Board Games'
  | 'Puzzle Games'
  | 'Strategy Games'
  | 'Casual Games'
  | 'Party Games';

export interface GameMetadata {
  id: GameId;
  name: string;
  tagline: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  category: GameCategory;
  estimatedTime: string;
  accentColor: string;
  bgGradient: string;
  icon: string;
}

export interface Player {
  socketId: string;
  playerName: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
  connected: boolean;
  disconnectedAt?: number | null;
}

export type RoomStatus = 'waiting' | 'in_game' | 'finished';

export interface Room {
  roomId: string;
  hostId: string;
  status: RoomStatus;
  game: GameId | null;
  players: Player[];
  gameState: any;
  createdAt: number;
  lastActivity: number;
  maxPlayers: number;
  minPlayers: number;
  rematchVotes: string[]; // socketIds
}

export type RoomErrorCode =
  | 'ROOM_NOT_FOUND'
  | 'ROOM_FULL'
  | 'GAME_ALREADY_STARTED'
  | 'INVALID_CODE'
  | 'INVALID_NAME'
  | 'NOT_IN_ROOM'
  | 'NOT_HOST'
  | 'NOT_ENOUGH_PLAYERS'
  | 'PLAYERS_NOT_READY'
  | 'INVALID_MOVE'
  | 'NOT_YOUR_TURN'
  | 'SERVER_ERROR';

export interface RoomError {
  code: RoomErrorCode;
  message: string;
}

export interface PlayerDepartedPayload {
  socketId: string;
  playerName: string;
  avatar: string;
  reason: 'left' | 'disconnected';
  remainingCount: number;
  hostReassigned: boolean;
  newHostName?: string;
  message: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

// ----------------- Game Specific States -----------------

// 1. Tic Tac Toe
export interface TicTacToeState {
  board: (string | null)[]; // 9 cells: null | 'X' | 'O'
  currentTurn: string; // socketId
  symbols: Record<string, 'X' | 'O'>;
  winner: string | 'draw' | null; // socketId | 'draw' | null
  winningLine: number[] | null;
  roundsWon: Record<string, number>;
  round: number;
}

// 2. Rock Paper Scissors
export type RPSChoice = 'rock' | 'paper' | 'scissors';
export interface RPSState {
  currentRound: number;
  maxRounds: number;
  phase: 'choosing' | 'revealed' | 'game_over';
  hasChosen: Record<string, boolean>; // public indicator that player has submitted
  revealedChoices?: Record<string, RPSChoice | null>; // only populated after both choose
  roundWinner: string | 'tie' | null; // socketId | 'tie' | null
  scores: Record<string, number>;
  winner: string | null;
  timer: number;
}

// 3. Connect Four
export interface ConnectFourState {
  board: (string | null)[][]; // 6 rows x 7 cols
  currentTurn: string; // socketId
  colors: Record<string, 'red' | 'yellow'>;
  winner: string | 'draw' | null;
  winningCells: [number, number][] | null;
  roundsWon: Record<string, number>;
  round: number;
}

// 4. Memory Match
export interface MemoryCard {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
  matchedBy?: string;
}

export interface MemoryMatchState {
  cards: MemoryCard[];
  currentTurn: string;
  flippedIndices: number[];
  scores: Record<string, number>;
  winner: string | 'draw' | null;
  phase: 'flipping' | 'evaluating' | 'game_over';
}

// 5. Reaction Challenge
export interface ReactionPlayerResult {
  reactionTimeMs: number | null; // null if false start or timed out
  falseStart: boolean;
  rank?: number;
  pointsEarned: number;
}

export interface ReactionState {
  round: number;
  totalRounds: number;
  phase: 'countdown' | 'waiting_for_green' | 'go' | 'round_summary' | 'game_over';
  greenAt: number | null; // server timestamp when turned green
  playerResults: Record<string, ReactionPlayerResult>;
  scores: Record<string, number>;
  winner: string | null;
  roundWinner: string | null;
}

// 6. Quick Quiz
export interface QuizQuestionPublic {
  id: string;
  question: string;
  category: string;
  options: string[];
  timeLimitSec: number;
}

export interface QuizPlayerAnswer {
  selectedOption: number; // 0-3
  timeMs: number;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface QuizState {
  currentQuestionIndex: number;
  totalQuestions: number;
  question: QuizQuestionPublic | null;
  phase: 'question' | 'reveal' | 'scoreboard' | 'game_over';
  answers: Record<string, QuizPlayerAnswer>;
  correctOption: number | null; // only revealed during 'reveal' phase
  explanation: string | null;
  scores: Record<string, number>;
  winner: string | null;
  secondsRemaining: number;
}

// 7. Chess
export interface ChessState {
  fen: string;
  turn: 'w' | 'b';
  turnPlayerId: string; // socketId
  players: {
    white: { socketId: string; playerName: string; avatar: string };
    black: { socketId: string; playerName: string; avatar: string };
  };
  history: string[]; // SAN notation moves e.g. ["e4", "e5", "Nf3"]
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  drawReason?: 'stalemate' | 'threefold_repetition' | 'insufficient_material' | 'fifty_move_rule' | 'resigned' | 'agreement';
  winner: string | 'draw' | null; // socketId or 'draw' or null
  winnerReason?: string;
  capturedPieces: {
    w: string[]; // captured by white
    b: string[]; // captured by black
  };
  lastMove?: { from: string; to: string };
}

// 8. Ludo
export type LudoColor = 'red' | 'green' | 'yellow' | 'blue';

export interface LudoPlayer {
  socketId: string;
  playerName: string;
  avatar: string;
  color: LudoColor;
  tokens: number[]; // 4 tokens: -1 = yard, 0..51 = track, 52..56 = home path, 57 = finished home
  hasWon: boolean;
  rank?: number;
}

export interface LudoState {
  players: LudoPlayer[];
  turnOrder: LudoColor[];
  currentTurnColor: LudoColor;
  currentTurnSocketId: string;
  diceValue: number | null;
  canRoll: boolean;
  movableTokenIndices: number[]; // 0..3 indices of current player
  phase: 'rolling' | 'moving' | 'game_over';
  winner: string | null;
  rankings: { socketId: string; playerName: string; rank: number; color: LudoColor }[];
  lastActionText: string;
}

// 9. Dots and Boxes
export interface DotsAndBoxesState {
  gridSize: number; // 3 -> 3x3 boxes, 4x4 dots
  horizontalLines: (string | null)[][]; // 4 rows x 3 cols: player socketId or null
  verticalLines: (string | null)[][]; // 3 rows x 4 cols: player socketId or null
  boxes: (string | null)[][]; // 3 rows x 3 cols: owner socketId or null
  currentTurn: string; // socketId
  scores: Record<string, number>;
  winner: string | 'draw' | null;
  totalBoxes: number;
  completedBoxes: number;
}

// 10. Game 2048
export interface Player2048State {
  board: number[][]; // 4x4
  score: number;
  bestTile: number;
  gameOver: boolean;
}

export interface Game2048State {
  boards: Record<string, Player2048State>;
  scores: Record<string, number>;
  winner: string | 'draw' | null;
  isOver: boolean;
}

// 11. Sudoku
export interface SudokuState {
  initialBoard: number[][]; // 9x9 (0 for empty)
  currentBoard: number[][]; // 9x9
  solution: number[][];
  pencilMarks: Record<string, number[]>; // "row-col" -> numbers
  scores: Record<string, number>;
  errors: Record<string, number>;
  winner: string | null;
  isComplete: boolean;
  lastCellFilled?: { row: number; col: number; val: number; socketId: string };
}

// 12. Word Guess
export interface WordGuessAttempt {
  word: string;
  feedback: ('correct' | 'present' | 'absent')[];
}

export interface WordGuessPlayerState {
  attempts: WordGuessAttempt[];
  solved: boolean;
  attemptsUsed: number;
}

export interface WordGuessState {
  targetWordLength: number;
  maxAttempts: number;
  playerGuesses: Record<string, WordGuessPlayerState>;
  phase: 'guessing' | 'game_over';
  winner: string | 'tie' | null;
  targetWord?: string;
  round: number;
}

// ----------------- Game Action Payloads -----------------

export interface GameActionPayload {
  gameId: GameId;
  action: string;
  payload?: any;
}

// ----------------- Socket Events -----------------

export const SOCKET_EVENTS = {
  // Client -> Server
  ROOM_CREATE: 'room:create',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  PLAYER_READY: 'player:ready',
  GAME_SELECT: 'game:select',
  GAME_START: 'game:start',
  GAME_ACTION: 'game:action',
  GAME_REMATCH: 'game:rematch',
  CHAT_SEND: 'chat:send',

  // Server -> Client
  ROOM_CREATED: 'room:created',
  ROOM_JOINED: 'room:joined',
  ROOM_UPDATED: 'room:updated',
  ROOM_ERROR: 'room:error',
  PLAYER_DISCONNECTED: 'player:disconnected',
  PLAYER_DEPARTED: 'player:departed',
  PLAYER_RECONNECTED: 'player:reconnected',
  GAME_STATE: 'game:state',
  GAME_FINISHED: 'game:finished',
  CHAT_MESSAGE: 'chat:message',
} as const;
