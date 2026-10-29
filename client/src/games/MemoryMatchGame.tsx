import React from 'react';
import { motion } from 'framer-motion';
import { useRoom } from '../hooks/useRoom';
import { MemoryMatchState } from '@shared/types';
import { sounds } from '../utils/sound';
import { Trophy, HelpCircle } from 'lucide-react';

export const MemoryMatchGame: React.FC = () => {
  const { gameState, myPlayer, room, sendGameAction } = useRoom();
  const state = gameState as MemoryMatchState;

  if (!state || !room || !myPlayer) return null;

  const isMyTurn = state.currentTurn === myPlayer.socketId;
  const currentTurnPlayer = room.players.find(p => p.socketId === state.currentTurn);
  const isGameOver = state.phase === 'game_over';

  const handleCardClick = (index: number) => {
    if (!isMyTurn || state.phase !== 'flipping') return;
    const card = state.cards[index];
    if (card.isFlipped || card.isMatched) return;

    sounds.playMove();
    sendGameAction('flip_card', { index });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto py-2">
      {/* Players Scoreboard */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {room.players.map(p => {
          const isTurn = state.currentTurn === p.socketId && !isGameOver;
          const isMe = p.socketId === myPlayer.socketId;
          const score = state.scores[p.socketId] || 0;

          return (
            <div
              key={p.socketId}
              className={`flex items-center gap-2 p-2.5 rounded-2xl border transition-all ${
                isTurn
                  ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0">
                {p.avatar}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[80px]">
                    {p.playerName}
                  </span>
                  {isMe && <span className="text-[10px] text-emerald-400 font-semibold">(You)</span>}
                </div>
                <div className="text-xs font-mono font-bold text-emerald-400">
                  {score} {score === 1 ? 'pair' : 'pairs'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Turn indicator */}
      <div className="mb-6 text-center">
        {isGameOver ? (
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm border border-emerald-500/40">
            <Trophy className="w-4 h-4" />
            {state.winner === 'draw'
              ? '🤝 Tie Match! Equal pairs found!'
              : state.winner === myPlayer.socketId
              ? '🎉 Victory! You found the most pairs!'
              : `🏆 ${room.players.find(p => p.socketId === state.winner)?.playerName || 'Winner'} won!`}
          </div>
        ) : isMyTurn ? (
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm border border-emerald-500/40"
          >
            👉 Your Turn — Flip {state.flippedIndices.length === 0 ? 'first card' : 'second card'}!
          </motion.div>
        ) : (
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-800 text-slate-400 text-sm border border-slate-700">
            ⏳ {currentTurnPlayer?.playerName || 'Opponent'} is flipping...
          </div>
        )}
      </div>

      {/* 4x4 Cards Grid */}
      <div className="p-4 sm:p-6 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="grid grid-cols-4 gap-3 sm:gap-4 w-72 h-72 sm:w-96 sm:h-96">
          {state.cards.map((card, idx) => {
            const isFlipped = card.isFlipped || card.isMatched;
            const matchedPlayer = card.matchedBy ? room.players.find(p => p.socketId === card.matchedBy) : null;

            return (
              <motion.button
                key={card.id}
                whileHover={isMyTurn && !isFlipped && state.phase === 'flipping' ? { scale: 1.06 } : {}}
                whileTap={isMyTurn && !isFlipped && state.phase === 'flipping' ? { scale: 0.94 } : {}}
                onClick={() => handleCardClick(idx)}
                disabled={!isMyTurn || isFlipped || state.phase !== 'flipping'}
                className={`relative rounded-2xl flex items-center justify-center text-3xl sm:text-4xl transition-all duration-300 select-none shadow-md ${
                  card.isMatched
                    ? 'bg-emerald-950/60 border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                    : isFlipped
                    ? 'bg-slate-800 border-2 border-blue-400 shadow-lg shadow-blue-500/20'
                    : isMyTurn
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-700 cursor-pointer'
                    : 'bg-slate-800/80 border border-slate-800/60 cursor-default'
                }`}
              >
                {isFlipped ? (
                  <motion.div
                    initial={{ rotateY: 90, scale: 0.8 }}
                    animate={{ rotateY: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <span>{card.symbol}</span>
                    {matchedPlayer && (
                      <span className="absolute bottom-1 right-1 text-xs opacity-80" title={`Matched by ${matchedPlayer.playerName}`}>
                        {matchedPlayer.avatar}
                      </span>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-slate-600 flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 opacity-40" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Rematch */}
      {isGameOver && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <button
            onClick={() => {
              sounds.playClick();
              sendGameAction('rematch_round');
            }}
            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95"
          >
            Play Another Game 🔄
          </button>
        </motion.div>
      )}
    </div>
  );
};
