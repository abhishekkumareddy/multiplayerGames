import React from 'react';
import { motion } from 'framer-motion';
import { GameMetadata } from '@shared/types';
import {
  Users,
  Clock,
  Play,
  Grid,
  CircleDot,
  Zap,
  Sparkles,
  HelpCircle,
  Crown,
  Dices,
  Boxes,
  LayoutGrid,
  Binary,
  SpellCheck,
} from 'lucide-react';

interface GameCardProps {
  game: GameMetadata;
  onSelect: (game: GameMetadata) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelect }) => {
  const renderGameIcon = () => {
    switch (game.id) {
      case 'chess':
        return <Crown className="w-8 h-8 text-indigo-500" />;
      case 'ludo':
        return <Dices className="w-8 h-8 text-emerald-500" />;
      case 'dots-and-boxes':
        return <Boxes className="w-8 h-8 text-purple-500" />;
      case 'game-2048':
        return <LayoutGrid className="w-8 h-8 text-amber-500" />;
      case 'sudoku':
        return <Binary className="w-8 h-8 text-cyan-500" />;
      case 'word-guess':
        return <SpellCheck className="w-8 h-8 text-teal-500" />;
      case 'tic-tac-toe':
        return <Grid className="w-8 h-8 text-blue-500" />;
      case 'rock-paper-scissors':
        return <span className="text-3xl">✂️</span>;
      case 'connect-four':
        return <CircleDot className="w-8 h-8 text-amber-500" />;
      case 'memory-match':
        return <Sparkles className="w-8 h-8 text-emerald-500" />;
      case 'reaction-challenge':
        return <Zap className="w-8 h-8 text-cyan-500" />;
      case 'quick-quiz':
        return <HelpCircle className="w-8 h-8 text-purple-500" />;
      default:
        return <Play className="w-8 h-8 text-blue-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Board Games':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Puzzle Games':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Strategy Games':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Casual Games':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Party Games':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col justify-between bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 shadow-md hover:shadow-2xl hover:shadow-blue-500/10 transition-all overflow-hidden"
    >
      {/* Top Section */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            {renderGameIcon()}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getCategoryColor(
                game.category
              )}`}
            >
              {game.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              {game.minPlayers === game.maxPlayers
                ? `${game.minPlayers} Players`
                : `${game.minPlayers}-${game.maxPlayers} Players`}
            </span>
          </div>
        </div>

        {/* Title & Tagline */}
        <h3 className="text-xl font-display font-extrabold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {game.name}
        </h3>
        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2.5">
          {game.tagline}
        </p>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-3">
          {game.description}
        </p>
      </div>

      {/* Footer Section */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>{game.estimatedTime}</span>
        </div>

        <button
          onClick={() => onSelect(game)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all cursor-pointer active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-white stroke-none" />
          <span>Play Now</span>
        </button>
      </div>
    </motion.div>
  );
};
