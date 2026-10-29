import React from 'react';
import { motion } from 'framer-motion';
import { GameMetadata } from '@shared/types';
import { Users, Clock, Play, Grid, CircleDot, Zap, Sparkles, HelpCircle } from 'lucide-react';

interface GameCardProps {
  game: GameMetadata;
  onSelect: (game: GameMetadata) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelect }) => {
  // Render icon based on game id
  const renderGameIcon = () => {
    switch (game.id) {
      case 'tic-tac-toe':
        return <Grid className="w-8 h-8 text-blue-400" />;
      case 'rock-paper-scissors':
        return <span className="text-3xl">✂️</span>;
      case 'connect-four':
        return <CircleDot className="w-8 h-8 text-amber-400" />;
      case 'memory-match':
        return <Sparkles className="w-8 h-8 text-emerald-400" />;
      case 'reaction-challenge':
        return <Zap className="w-8 h-8 text-cyan-400" />;
      case 'quick-quiz':
        return <HelpCircle className="w-8 h-8 text-purple-400" />;
      default:
        return <Play className="w-8 h-8 text-white" />;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col justify-between bg-slate-900/90 hover:bg-slate-850 rounded-3xl p-6 border border-slate-800 hover:border-slate-700 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all overflow-hidden"
    >
      {/* Top Card Section */}
      <div>
        {/* Top Badges & Icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            {renderGameIcon()}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {game.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              {game.minPlayers === game.maxPlayers ? `${game.minPlayers} Players` : `${game.minPlayers}-${game.maxPlayers} Players`}
            </span>
          </div>
        </div>

        {/* Title & Tagline */}
        <h3 className="text-xl font-display font-extrabold text-white mb-1 group-hover:text-blue-400 transition-colors">
          {game.name}
        </h3>
        <p className="text-xs font-semibold text-amber-400/90 mb-2.5">
          {game.tagline}
        </p>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4 line-clamp-3">
          {game.description}
        </p>
      </div>

      {/* Bottom Footer Section */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{game.estimatedTime}</span>
        </div>

        <button
          onClick={() => onSelect(game)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-white stroke-none" />
          <span>Play Now</span>
        </button>
      </div>
    </motion.div>
  );
};
