import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoom } from '../hooks/useRoom';
import { RPSChoice, RPSState } from '@shared/types';
import { sounds } from '../utils/sound';
import { Trophy } from 'lucide-react';

const CHOICES: { id: RPSChoice; label: string; icon: string; color: string; border: string }[] = [
  { id: 'rock', label: 'Rock', icon: '🪨', color: 'from-amber-600 to-red-600', border: 'border-amber-500/40' },
  { id: 'paper', label: 'Paper', icon: '📄', color: 'from-blue-600 to-indigo-600', border: 'border-blue-500/40' },
  { id: 'scissors', label: 'Scissors', icon: '✂️', color: 'from-emerald-600 to-teal-600', border: 'border-emerald-500/40' },
];

export const RockPaperScissorsGame: React.FC = () => {
  const { gameState, myPlayer, room, sendGameAction } = useRoom();
  const state = gameState as (RPSState & { myChoice?: RPSChoice });

  if (!state || !room || !myPlayer) return null;

  const opponent = room.players.find(p => p.socketId !== myPlayer.socketId);
  const myChoice = state.myChoice || (state.revealedChoices ? state.revealedChoices[myPlayer.socketId] : null);
  const opponentChoice = state.revealedChoices && opponent ? state.revealedChoices[opponent.socketId] : null;

  const hasMyChoice = state.hasChosen[myPlayer.socketId];
  const hasOpponentChoice = opponent ? state.hasChosen[opponent.socketId] : false;

  const handleSelectChoice = (choice: RPSChoice) => {
    if (state.phase !== 'choosing' || hasMyChoice) return;
    sounds.playMove();
    sendGameAction('make_choice', { choice });
  };

  const isGameOver = state.phase === 'game_over';
  const isRevealed = state.phase === 'revealed' || isGameOver;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto py-2">
      {/* Score & Header */}
      <div className="w-full flex items-center justify-between bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 mb-6 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-2xl shadow-md">
            {myPlayer.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-sm sm:text-base">{myPlayer.playerName}</span>
              <span className="text-xs bg-blue-500/20 text-blue-400 font-semibold px-1.5 py-0.5 rounded">You</span>
            </div>
            <div className="text-xl font-black text-blue-400 mt-0.5 font-mono">
              {state.scores[myPlayer.socketId] || 0} pts
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center px-4">
          <span className="text-xs font-black tracking-widest text-slate-500">ROUND</span>
          <span className="text-2xl font-black text-amber-400">
            {state.currentRound} <span className="text-slate-500 text-sm font-normal">/ {state.maxRounds}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className="font-bold text-white text-sm sm:text-base">{opponent?.playerName || 'Opponent'}</span>
            </div>
            <div className="text-xl font-black text-rose-400 mt-0.5 font-mono">
              {opponent ? state.scores[opponent.socketId] || 0 : 0} pts
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 to-red-600 flex items-center justify-center text-2xl shadow-md">
            {opponent?.avatar || '👤'}
          </div>
        </div>
      </div>

      {/* Arena Stage */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Phase / Result Message */}
        <div className="mb-8 text-center min-h-[44px] flex items-center justify-center">
          {isGameOver ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/20 text-amber-400 font-bold text-base border border-amber-500/40"
            >
              <Trophy className="w-5 h-5 text-amber-400" />
              {state.winner === myPlayer.socketId
                ? '🏆 Match Won! Victory is yours!'
                : `💥 ${opponent?.playerName || 'Opponent'} won the match!`}
            </motion.div>
          ) : isRevealed ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold text-base border ${
                state.roundWinner === 'tie'
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : state.roundWinner === myPlayer.socketId
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              }`}
            >
              {state.roundWinner === 'tie'
                ? '🤝 Draw Round!'
                : state.roundWinner === myPlayer.socketId
                ? '🎉 You won this round!'
                : `💥 ${opponent?.playerName || 'Opponent'} won this round!`}
            </motion.div>
          ) : (
            <div className="text-slate-400 font-medium text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              Choose your move simultaneously!
            </div>
          )}
        </div>

        {/* Showdown Arena (Revealed vs Choosing) */}
        {isRevealed ? (
          <div className="flex items-center justify-center gap-6 sm:gap-12 my-6">
            {/* My choice */}
            <motion.div
              initial={{ x: -60, scale: 0.5 }}
              animate={{ x: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center text-5xl sm:text-6xl shadow-xl shadow-blue-500/20">
                {CHOICES.find(c => c.id === myChoice)?.icon || '❓'}
              </div>
              <span className="text-sm font-bold text-blue-400 mt-2">You</span>
            </motion.div>

            <span className="text-2xl sm:text-3xl font-black text-slate-600">VS</span>

            {/* Opponent Choice */}
            <motion.div
              initial={{ x: 60, scale: 0.5 }}
              animate={{ x: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-5xl sm:text-6xl shadow-xl shadow-rose-500/20">
                {CHOICES.find(c => c.id === opponentChoice)?.icon || '❓'}
              </div>
              <span className="text-sm font-bold text-rose-400 mt-2">{opponent?.playerName || 'Opponent'}</span>
            </motion.div>
          </div>
        ) : (
          /* Choice Action Area */
          <div className="w-full flex flex-col items-center my-4">
            <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-md">
              {CHOICES.map(c => {
                const isSelected = myChoice === c.id;
                return (
                  <motion.button
                    key={c.id}
                    whileHover={!hasMyChoice ? { scale: 1.05 } : {}}
                    whileTap={!hasMyChoice ? { scale: 0.95 } : {}}
                    onClick={() => handleSelectChoice(c.id)}
                    disabled={hasMyChoice}
                    className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border transition-all duration-200 select-none ${
                      isSelected
                        ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-500 shadow-lg shadow-blue-500/30'
                        : hasMyChoice
                        ? 'bg-slate-800/40 border-slate-800 opacity-40 cursor-not-allowed'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 cursor-pointer hover:border-slate-500'
                    }`}
                  >
                    <span className="text-4xl sm:text-5xl mb-2">{c.icon}</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-200">{c.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Lock Status */}
            <div className="mt-6 flex items-center gap-6 text-xs sm:text-sm font-semibold">
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${hasMyChoice ? 'bg-emerald-400' : 'bg-slate-600 animate-pulse'}`} />
                <span className={hasMyChoice ? 'text-emerald-400' : 'text-slate-400'}>
                  {hasMyChoice ? 'Your move locked in' : 'Choose your move'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${hasOpponentChoice ? 'bg-emerald-400' : 'bg-slate-600 animate-pulse'}`} />
                <span className={hasOpponentChoice ? 'text-emerald-400' : 'text-slate-400'}>
                  {hasOpponentChoice ? `${opponent?.playerName} locked in` : `Waiting for ${opponent?.playerName || 'Opponent'}`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rematch Button if Match Over */}
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
            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-500/25 transition-all transform active:scale-95"
          >
            Play Another Match 🔄
          </button>
        </motion.div>
      )}
    </div>
  );
};
