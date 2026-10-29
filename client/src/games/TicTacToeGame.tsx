import React from 'react';
import { motion } from 'framer-motion';
import { useRoom } from '../hooks/useRoom';
import { TicTacToeState } from '@shared/types';
import { sounds } from '../utils/sound';
import { X, Circle, Trophy } from 'lucide-react';

export const TicTacToeGame: React.FC = () => {
  const { gameState, myPlayer, room, sendGameAction } = useRoom();
  const state = gameState as TicTacToeState;

  if (!state || !room || !myPlayer) return null;

  const isMyTurn = state.currentTurn === myPlayer.socketId;
  const mySymbol = state.symbols[myPlayer.socketId];
  const opponent = room.players.find(p => p.socketId !== myPlayer.socketId);
  const opponentSymbol = opponent ? state.symbols[opponent.socketId] : (mySymbol === 'X' ? 'O' : 'X');

  const handleCellClick = (index: number) => {
    if (!isMyTurn || state.board[index] !== null || state.winner !== null) return;
    sounds.playMove();
    sendGameAction('make_move', { index });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto py-2">
      {/* Player VS Player Score Header */}
      <div className="w-full flex items-center justify-between bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 mb-6 border border-slate-800 shadow-xl">
        {/* My Card */}
        <div className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
          isMyTurn && !state.winner ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''
        }`}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-2xl shadow-md">
            {myPlayer.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-sm sm:text-base truncate max-w-[100px] sm:max-w-[130px]">
                {myPlayer.playerName}
              </span>
              <span className="text-xs bg-blue-500/20 text-blue-400 font-semibold px-1.5 py-0.5 rounded">You</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-blue-400 font-bold">
                {mySymbol === 'X' ? <X className="w-3.5 h-3.5 stroke-[3]" /> : <Circle className="w-3.5 h-3.5 stroke-[3]" />}
                ({mySymbol})
              </span>
              <span>•</span>
              <span className="text-slate-200 font-bold text-sm">
                {state.roundsWon[myPlayer.socketId] || 0} pts
              </span>
            </div>
          </div>
        </div>

        {/* VS Badge */}
        <div className="flex flex-col items-center px-2">
          <span className="text-xs font-black tracking-widest text-slate-500">ROUND</span>
          <span className="text-xl font-extrabold text-amber-400">{state.round}</span>
        </div>

        {/* Opponent Card */}
        <div className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
          !isMyTurn && !state.winner ? 'ring-2 ring-rose-500 bg-rose-500/10' : ''
        }`}>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className="font-bold text-white text-sm sm:text-base truncate max-w-[100px] sm:max-w-[130px]">
                {opponent?.playerName || 'Opponent'}
              </span>
            </div>
            <div className="flex items-center justify-end gap-2 mt-0.5 text-xs text-slate-400 font-mono">
              <span className="text-slate-200 font-bold text-sm">
                {opponent ? state.roundsWon[opponent.socketId] || 0 : 0} pts
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                {opponentSymbol === 'X' ? <X className="w-3.5 h-3.5 stroke-[3]" /> : <Circle className="w-3.5 h-3.5 stroke-[3]" />}
                ({opponentSymbol})
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 to-red-600 flex items-center justify-center text-2xl shadow-md">
            {opponent?.avatar || '👤'}
          </div>
        </div>
      </div>

      {/* Turn & Status Banner */}
      <div className="mb-6 text-center">
        {state.winner === 'draw' ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 text-amber-300 font-bold text-sm border border-amber-500/30">
            🤝 It's a Draw!
          </div>
        ) : state.winner ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm border border-emerald-500/40">
            <Trophy className="w-4 h-4" />
            {state.winner === myPlayer.socketId ? '🎉 You Won This Round!' : `🏆 ${opponent?.playerName} Won!`}
          </div>
        ) : isMyTurn ? (
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 font-bold text-sm border border-blue-500/40 shadow-lg shadow-blue-500/10"
          >
            👉 Your Turn — Tap an empty cell
          </motion.div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 text-slate-400 text-sm border border-slate-700">
            ⏳ Waiting for {opponent?.playerName || 'Opponent'}...
          </div>
        )}
      </div>

      {/* 3x3 Board Grid */}
      <div className="relative p-3 sm:p-4 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="grid grid-cols-3 gap-3 w-72 h-72 sm:w-80 sm:h-80">
          {state.board.map((cell, idx) => {
            const isWinningCell = state.winningLine?.includes(idx);
            return (
              <motion.button
                key={idx}
                whileHover={isMyTurn && !cell && !state.winner ? { scale: 1.05 } : {}}
                whileTap={isMyTurn && !cell && !state.winner ? { scale: 0.95 } : {}}
                onClick={() => handleCellClick(idx)}
                disabled={!isMyTurn || cell !== null || state.winner !== null}
                className={`flex items-center justify-center rounded-2xl text-4xl sm:text-5xl font-black transition-all duration-200 select-none ${
                  isWinningCell
                    ? 'bg-emerald-500/30 border-2 border-emerald-400 shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60'
                } ${
                  isMyTurn && !cell && !state.winner
                    ? 'cursor-pointer hover:border-blue-400/80'
                    : 'cursor-default'
                }`}
              >
                {cell === 'X' && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <X className="w-12 h-12 sm:w-14 sm:h-14 text-blue-400 stroke-[3]" />
                  </motion.div>
                )}
                {cell === 'O' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Circle className="w-11 h-11 sm:w-13 sm:h-13 text-rose-400 stroke-[3]" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Next Round Button if Round Ended */}
      {state.winner && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex gap-3"
        >
          <button
            onClick={() => {
              sounds.playClick();
              sendGameAction('rematch_round');
            }}
            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all transform active:scale-95"
          >
            Play Next Round 🔄
          </button>
        </motion.div>
      )}
    </div>
  );
};
