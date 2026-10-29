export type GameId =
  | 'tic-tac-toe'
  | 'rock-paper-scissors'
  | 'connect-four'
  | 'memory-match'
  | 'reaction-challenge'
  | 'quick-quiz';

export interface GameMetadata {
  id: GameId;
  name: string;
  tagline: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  category: 'Classic' | 'Action' | 'Puzzle' | 'Party';
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
  PLAYER_RECONNECTED: 'player:reconnected',
  GAME_STATE: 'game:state',
  GAME_FINISHED: 'game:finished',
  CHAT_MESSAGE: 'chat:message',
} as const;
