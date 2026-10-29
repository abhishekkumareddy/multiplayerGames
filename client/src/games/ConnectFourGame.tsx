import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRoom } from '../hooks/useRoom';
import { ConnectFourState } from '@shared/types';
import { sounds } from '../utils/sound';
import { Trophy, ChevronDown } from 'lucide-react';

export const ConnectFourGame: React.FC = () => {
  const { gameState, myPlayer, room, sendGameAction } = useRoom();
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const state = gameState as ConnectFourState;
  if (!state || !room || !myPlayer) return null;

  const isMyTurn = state.currentTurn === myPlayer.socketId;
  const myColor = state.colors[myPlayer.socketId];
  const opponent = room.players.find(p => p.socketId !== myPlayer.socketId);
  const opponentColor = myColor === 'red' ? 'yellow' : 'red';

  const handleDropChip = (col: number) => {
    if (!isMyTurn || state.winner !== null) return;
    if (state.board[0][col] !== null) return; // Column full
    sounds.playMove();
    sendGameAction('drop_chip', { col });
  };

  const isCellWinning = (r: number, c: number) => {
    if (!state.winningCells) return false;
    return state.winningCells.some(([wr, wc]) => wr === r && wc === c);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto py-2">
      {/* Player Header */}
      <div className="w-full flex items-center justify-between bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 mb-4 border border-slate-800 shadow-xl">
        <div className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
          isMyTurn && !state.winner ? 'ring-2 ring-amber-500 bg-amber-500/10' : ''
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md ${
            myColor === 'red'
              ? 'bg-gradient-to-br from-rose-500 to-red-600'
              : 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950'
          }`}>
            {myPlayer.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-sm sm:text-base">{myPlayer.playerName}</span>
              <span className="text-xs bg-slate-700 text-slate-300 font-semibold px-1.5 py-0.5 rounded">You</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs font-mono">
              <span className={`flex items-center gap-1 font-bold ${myColor === 'red' ? 'text-rose-400' : 'text-amber-400'}`}>
                ● {myColor.toUpperCase()}
              </span>
              <span>•</span>
              <span className="text-slate-200 font-bold text-sm">
                {state.roundsWon[myPlayer.socketId] || 0} pts
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center px-4">
          <span className="text-xs font-black tracking-widest text-slate-500">ROUND</span>
          <span className="text-xl font-black text-amber-400">{state.round}</span>
        </div>

        <div className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
          !isMyTurn && !state.winner ? 'ring-2 ring-slate-600 bg-slate-800/40' : ''
        }`}>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className="font-bold text-white text-sm sm:text-base">{opponent?.playerName || 'Opponent'}</span>
            </div>
            <div className="flex items-center justify-end gap-2 mt-0.5 text-xs font-mono">
              <span className="text-slate-200 font-bold text-sm">
                {opponent ? state.roundsWon[opponent.socketId] || 0 : 0} pts
              </span>
              <span>•</span>
              <span className={`flex items-center gap-1 font-bold ${opponentColor === 'red' ? 'text-rose-400' : 'text-amber-400'}`}>
                ● {opponentColor.toUpperCase()}
              </span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md ${
            opponentColor === 'red'
              ? 'bg-gradient-to-br from-rose-500 to-red-600'
              : 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950'
          }`}>
            {opponent?.avatar || '👤'}
          </div>
        </div>
      </div>

      {/* Turn indicator */}
      <div className="mb-4 text-center">
        {state.winner === 'draw' ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 text-amber-300 font-bold text-sm border border-amber-500/30">
            🤝 Board Full — It's a Draw!
          </div>
        ) : state.winner ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm border border-emerald-500/40">
            <Trophy className="w-4 h-4" />
            {state.winner === myPlayer.socketId ? '🎉 4-in-a-Row! You Won!' : `🏆 ${opponent?.playerName} Connected 4!`}
          </div>
        ) : isMyTurn ? (
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-sm border border-amber-500/40"
          >
            👉 Your Turn — Click a column to drop chip
          </motion.div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 text-slate-400 text-sm border border-slate-700">
            ⏳ Waiting for {opponent?.playerName || 'Opponent'}...
          </div>
        )}
      </div>

      {/* Column drop hover arrows */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3 w-full max-w-md px-4 sm:px-6 mb-1 h-6">
        {Array.from({ length: 7 }).map((_, col) => (
          <div key={col} className="flex justify-center items-center">
            {isMyTurn && !state.winner && hoveredCol === col && state.board[0][col] === null && (
              <motion.div
                initial={{ y: -4, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={myColor === 'red' ? 'text-rose-500' : 'text-amber-400'}
              >
                <ChevronDown className="w-5 h-5 animate-bounce" />
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* 7x6 Connect Four Board */}
      <div className="p-3 sm:p-5 bg-blue-900/90 rounded-3xl border-4 border-blue-700 shadow-2xl backdrop-blur-xl max-w-md sm:max-w-lg w-full">
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {Array.from({ length: 7 }).map((_, col) => {
            const isColFull = state.board[0][col] !== null;
            return (
              <div
                key={col}
                onMouseEnter={() => setHoveredCol(col)}
                onMouseLeave={() => setHoveredCol(null)}
                onClick={() => handleDropChip(col)}
                className={`flex flex-col gap-2 sm:gap-3 ${
                  isMyTurn && !isColFull && !state.winner
                    ? 'cursor-pointer hover:opacity-95'
                    : 'cursor-default'
                }`}
              >
                {Array.from({ length: 6 }).map((_, row) => {
                  const cell = state.board[row][col];
                  const isWinning = isCellWinning(row, col);

                  return (
                    <div
                      key={row}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-950/80 shadow-inner flex items-center justify-center p-0.5 relative overflow-hidden"
                    >
                      {cell && (
                        <motion.div
                          initial={{ y: -100, scale: 0.8 }}
                          animate={{ y: 0, scale: 1 }}
                          transition={{ type: 'spring', damping: 14, stiffness: 200 }}
                          className={`w-full h-full rounded-full shadow-md flex items-center justify-center ${
                            cell === 'red'
                              ? 'bg-gradient-to-br from-rose-500 to-red-600 border-2 border-rose-400'
                              : 'bg-gradient-to-br from-amber-400 to-yellow-500 border-2 border-yellow-300'
                          } ${isWinning ? 'ring-4 ring-white animate-pulse shadow-lg shadow-white/50' : ''}`}
                        >
                          <div className="w-4 h-4 rounded-full border border-white/20 bg-white/10" />
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Rematch button */}
      {state.winner && (
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
            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
          >
            Play Next Round 🔄
          </button>
        </motion.div>
      )}
    </div>
  );
};
