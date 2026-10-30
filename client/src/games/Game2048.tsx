import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRoom } from '../hooks/useRoom';
import { Game2048State } from '@shared/types';
import { sounds } from '../utils/sound';
import { Crown, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const TILE_COLORS: Record<number, string> = {
  2: 'bg-amber-100 dark:bg-amber-950 text-slate-800 dark:text-amber-100',
  4: 'bg-amber-200 dark:bg-amber-900 text-slate-800 dark:text-amber-100',
  8: 'bg-orange-400 text-white',
  16: 'bg-orange-500 text-white',
  32: 'bg-orange-600 text-white',
  64: 'bg-red-500 text-white',
  128: 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30',
  256: 'bg-amber-300 text-slate-950 shadow-lg shadow-amber-300/40',
  512: 'bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/50',
  1024: 'bg-yellow-300 text-slate-950 shadow-xl shadow-yellow-300/60',
  2048: 'bg-emerald-400 text-slate-950 shadow-2xl shadow-emerald-400/70 animate-pulse',
};

export const Game2048: React.FC = () => {
  const { gameState, sendGameAction, myPlayer, room, voteRematch } = useRoom();
  const state = gameState as Game2048State | null;

  const myBoardState = myPlayer ? state?.boards[myPlayer.socketId] : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!myBoardState || myBoardState.gameOver) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        sendGameAction('slide', { direction: 'up' });
        sounds.playPop();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        sendGameAction('slide', { direction: 'down' });
        sounds.playPop();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        sendGameAction('slide', { direction: 'left' });
        sounds.playPop();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        sendGameAction('slide', { direction: 'right' });
        sounds.playPop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [myBoardState, sendGameAction]);

  if (!state || !myBoardState) return null;

  const handleSlide = (direction: string) => {
    if (myBoardState.gameOver) return;
    sounds.playPop();
    sendGameAction('slide', { direction });
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
      {/* Header Info & Rivals Scoreboard */}
      <div className="w-full mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {room?.players.map(p => {
          const b = state.boards[p.socketId];
          const isMe = p.socketId === myPlayer?.socketId;

          return (
            <div
              key={p.socketId}
              className={`p-3 rounded-2xl border transition-all ${
                isMe
                  ? 'bg-amber-500/10 border-amber-500/40 ring-2 ring-amber-400/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{p.avatar}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {p.playerName} {isMe ? '(You)' : ''}
                  </div>
                  <div className="text-sm font-black text-amber-500">
                    {b?.score || 0} pts
                  </div>
                </div>
              </div>
              <div className="mt-1 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Best: {b?.bestTile || 2}</span>
                {b?.gameOver && <span className="text-rose-500 font-bold">Game Over</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2048 4x4 Board */}
      <div className="p-3 sm:p-4 rounded-3xl bg-slate-900 border-4 border-slate-800 shadow-2xl relative">
        <div className="grid grid-cols-4 grid-rows-4 gap-2.5 sm:gap-3.5 w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] p-2.5 sm:p-3.5 bg-slate-950 rounded-2xl">
          {myBoardState.board.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`rounded-xl flex items-center justify-center font-black transition-all ${
                  val === 0
                    ? 'bg-slate-900/60'
                    : `${TILE_COLORS[val] || 'bg-emerald-500 text-white'} text-lg sm:text-2xl`
                }`}
              >
                {val > 0 ? val : ''}
              </div>
            ))
          )}
        </div>

        {/* Game Over on Board */}
        {myBoardState.gameOver && (
          <div className="absolute inset-0 bg-black/75 rounded-3xl backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <h4 className="text-xl font-extrabold text-white mb-1">Board Locked!</h4>
            <p className="text-xs text-slate-300">
              No further moves available. Final score: {myBoardState.score}
            </p>
          </div>
        )}
      </div>

      {/* Mobile Controls D-Pad */}
      <div className="mt-4 flex flex-col items-center gap-1 sm:hidden">
        <button
          onClick={() => handleSlide('up')}
          className="p-3 rounded-xl bg-slate-800 text-white shadow active:scale-95"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSlide('left')}
            className="p-3 rounded-xl bg-slate-800 text-white shadow active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleSlide('down')}
            className="p-3 rounded-xl bg-slate-800 text-white shadow active:scale-95"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleSlide('right')}
            className="p-3 rounded-xl bg-slate-800 text-white shadow active:scale-95"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-400 text-center hidden sm:block">
        Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[11px]">↑</kbd>{' '}
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[11px]">↓</kbd>{' '}
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[11px]">←</kbd>{' '}
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[11px]">→</kbd> or WASD to slide tiles
      </div>

      {/* Winner Modal */}
      {state.isOver && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center"
        >
          <Crown className="w-10 h-10 text-amber-400 mx-auto mb-2" />
          <h3 className="text-xl font-display font-extrabold text-slate-900 dark:text-white">
            {state.winner === 'draw'
              ? "It's a Tie!"
              : `${room?.players.find(p => p.socketId === state.winner)?.playerName} Wins the Battle! 🎉`}
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Highest Score: {state.winner ? state.scores[state.winner] : 0} points
          </p>

          <button
            onClick={voteRematch}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs mx-auto shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Rematch</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};
