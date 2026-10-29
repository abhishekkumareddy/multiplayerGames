import { GameMetadata } from './types.js';

export const GAMES_METADATA: Record<string, GameMetadata> = {
  'tic-tac-toe': {
    id: 'tic-tac-toe',
    name: 'Tic-Tac-Toe',
    tagline: 'Classic 3-in-a-row grid duel',
    description: 'Outsmart your opponent in this timeless battle of Xs and Os. Align three in a row to claim victory!',
    minPlayers: 2,
    maxPlayers: 2,
    category: 'Classic',
    estimatedTime: '2-3 min',
    accentColor: '#3B82F6', // Blue
    bgGradient: 'from-blue-600 to-indigo-700',
    icon: 'Grid',
  },
  'rock-paper-scissors': {
    id: 'rock-paper-scissors',
    name: 'Rock Paper Scissors',
    tagline: 'Simultaneous mind games & showdowns',
    description: 'Pick your move simultaneously. Rock crushes Scissors, Scissors cuts Paper, Paper covers Rock. Best of 5 rounds!',
    minPlayers: 2,
    maxPlayers: 2,
    category: 'Party',
    estimatedTime: '2-4 min',
    accentColor: '#EF4444', // Coral / Red
    bgGradient: 'from-rose-500 to-red-700',
    icon: 'HandMetal',
  },
  'connect-four': {
    id: 'connect-four',
    name: 'Connect Four',
    tagline: 'Drop chips & connect 4 discs',
    description: 'Drop your colored chips into the 7x6 grid. Connect 4 horizontally, vertically, or diagonally before your rival!',
    minPlayers: 2,
    maxPlayers: 2,
    category: 'Puzzle',
    estimatedTime: '3-6 min',
    accentColor: '#EAB308', // Yellow
    bgGradient: 'from-amber-500 to-yellow-600',
    icon: 'CircleDot',
  },
  'memory-match': {
    id: 'memory-match',
    name: 'Memory Match',
    tagline: 'Test your brain & flip matching pairs',
    description: 'Take turns flipping hidden arcade cards. Find matching pairs to earn points and keep your turn alive!',
    minPlayers: 2,
    maxPlayers: 4,
    category: 'Puzzle',
    estimatedTime: '3-5 min',
    accentColor: '#10B981', // Emerald green
    bgGradient: 'from-emerald-500 to-teal-700',
    icon: 'Sparkles',
  },
  'reaction-challenge': {
    id: 'reaction-challenge',
    name: 'Reaction Challenge',
    tagline: 'Split-second speed showdown',
    description: 'Wait for the random green signal. Tap the instant it turns green! Beware of false starts. Fastest finger wins!',
    minPlayers: 2,
    maxPlayers: 6,
    category: 'Action',
    estimatedTime: '2-3 min',
    accentColor: '#06B6D4', // Cyan
    bgGradient: 'from-cyan-500 to-blue-600',
    icon: 'Zap',
  },
  'quick-quiz': {
    id: 'quick-quiz',
    name: 'Quick Quiz',
    tagline: 'High-speed multiplayer trivia mania',
    description: 'Race against time and friends in curated questions across gaming, science, pop culture, and tech. Speed = bonus points!',
    minPlayers: 2,
    maxPlayers: 8,
    category: 'Party',
    estimatedTime: '4-7 min',
    accentColor: '#8B5CF6', // Purple
    bgGradient: 'from-purple-500 to-indigo-800',
    icon: 'HelpCircle',
  },
};
