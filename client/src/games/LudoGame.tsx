import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoom } from '../hooks/useRoom';
import { LudoColor, LudoState } from '@shared/types';
import { sounds } from '../utils/sound';
import { Dices, Crown, RotateCcw, Sparkles } from 'lucide-react';

const COLOR_CLASSES: Record<LudoColor, { bg: string; text: string; border: string; lightBg: string; ring: string }> = {
  red: {
    bg: 'bg-rose-500',
    text: 'text-rose-500',
    border: 'border-rose-500',
    lightBg: 'bg-rose-500/20',
    ring: 'ring-rose-400',
  },
  green: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-500',
    border: 'border-emerald-500',
    lightBg: 'bg-emerald-500/20',
    ring: 'ring-emerald-400',
  },
  yellow: {
    bg: 'bg-amber-400',
    text: 'text-amber-500',
    border: 'border-amber-400',
    lightBg: 'bg-amber-400/20',
    ring: 'ring-amber-300',
  },
  blue: {
    bg: 'bg-blue-500',
    text: 'text-blue-500',
    border: 'border-blue-500',
    lightBg: 'bg-blue-500/20',
    ring: 'ring-blue-400',
  },
};

const START_OFFSETS: Record<LudoColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// 52-tile track coordinates mapped to 15x15 grid [row, col] (0-indexed)
const TRACK_COORDS: [number, number][] = [
  // Red start & arm going right (indices 0..4)
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  // Turning up into top arm (indices 5..10)
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  // Green entry top edge (index 11..12)
  [0, 7], [0, 8],
  // Green arm going down (indices 13..17) - 13 is Green Start
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  // Turning right into right arm (indices 18..23)
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  // Yellow entry right edge (indices 24..25)
  [7, 14], [8, 14],
  // Yellow arm going left (indices 26..30) - 26 is Yellow Start
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  // Turning down into bottom arm (indices 31..36)
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  // Blue entry bottom edge (indices 37..38)
  [14, 7], [14, 6],
  // Blue arm going up (indices 39..43) - 39 is Blue Start
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  // Turning left into left arm (indices 44..49)
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  // Red entry left edge (indices 50..51)
  [7, 0], [6, 0]
];

// Colored home paths (steps 51..55)
const HOME_PATHS: Record<LudoColor, [number, number][]> = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
};

// Yard token positions (4 tokens per yard inside 6x6 boxes)
const YARD_TOKEN_COORDS: Record<LudoColor, [number, number][]> = {
  red: [[2, 2], [2, 3], [3, 2], [3, 3]],
  green: [[2, 11], [2, 12], [3, 11], [3, 12]],
  yellow: [[11, 11], [11, 12], [12, 11], [12, 12]],
  blue: [[11, 2], [11, 3], [12, 2], [12, 3]],
};

const STAR_SQUARES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

export const LudoGame: React.FC = () => {
  const { gameState, sendGameAction, myPlayer, voteRematch } = useRoom();
  const state = gameState as LudoState | null;
  const [isRolling, setIsRolling] = useState(false);

  if (!state) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        Initializing Ludo Arena...
      </div>
    );
  }

  const myLudoPlayer = state.players.find(p => p.socketId === myPlayer?.socketId);
  const isMyTurn = myPlayer?.socketId === state.currentTurnSocketId;
  const canRollNow = isMyTurn && state.canRoll && state.phase === 'rolling' && !state.winner;

  const handleRollDice = () => {
    if (!canRollNow || isRolling) return;
    setIsRolling(true);
    sounds.playPop();
    setTimeout(() => {
      sendGameAction('roll_dice');
      setIsRolling(false);
    }, 400);
  };

  const handleTokenClick = (tokenIndex: number) => {
    if (!isMyTurn || state.phase !== 'moving' || !state.movableTokenIndices.includes(tokenIndex)) return;
    sounds.playPop();
    sendGameAction('move_token', { tokenIndex });
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      {/* Top Action & Status Banner */}
      <div className="w-full mb-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Current Turn & Last Action */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg ${
              COLOR_CLASSES[state.currentTurnColor]?.bg || 'bg-slate-700'
            }`}
          >
            {state.diceValue || '🎲'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Turn:</span>
              <span
                className={`text-sm font-extrabold capitalize ${
                  COLOR_CLASSES[state.currentTurnColor]?.text
                }`}
              >
                {state.currentTurnColor} Player
              </span>
              {isMyTurn && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                  Your Turn!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-md">
              {state.lastActionText}
            </p>
          </div>
        </div>

        {/* Dice Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRollDice}
            disabled={!canRollNow || isRolling}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm shadow-xl transition-all cursor-pointer ${
              canRollNow
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 scale-105 active:scale-95 animate-bounce shadow-orange-500/25'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-60 cursor-not-allowed'
            }`}
          >
            <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
            <span>{isRolling ? 'Rolling...' : canRollNow ? 'Roll Dice 🎲' : 'Waiting...'}</span>
          </button>
        </div>
      </div>

      {/* Main Board Arena */}
      <div className="relative p-2 sm:p-4 rounded-3xl bg-slate-900 border-4 border-slate-800 shadow-2xl overflow-hidden max-w-full">
        {/* 15x15 Ludo Grid */}
        <div className="grid grid-cols-15 grid-rows-15 w-[330px] h-[330px] sm:w-[480px] sm:h-[480px] md:w-[540px] md:h-[540px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative">
          {/* 4 Quadrants: Yards */}
          {/* Top-Left: Red Yard (rows 0-5, cols 0-5) */}
          <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-rose-500 p-3 sm:p-4 rounded-tl-2xl flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/80 rounded-2xl p-2 sm:p-3 grid grid-cols-2 grid-rows-2 gap-2 border border-rose-500/40">
              {state.players.find(p => p.color === 'red')?.tokens.map((step, idx) => {
                const inYard = step === -1;
                const isMovable = isMyTurn && myLudoPlayer?.color === 'red' && state.movableTokenIndices.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleTokenClick(idx)}
                    disabled={!isMovable}
                    className={`rounded-full flex items-center justify-center font-black text-xs sm:text-sm shadow-md transition-all ${
                      inYard
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-800/40 border border-slate-700 opacity-20'
                    } ${isMovable ? 'ring-4 ring-white animate-pulse scale-110 cursor-pointer' : ''}`}
                  >
                    {inYard ? '🔴' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Top-Right: Green Yard (rows 0-5, cols 9-14) */}
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-emerald-500 p-3 sm:p-4 rounded-tr-2xl flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/80 rounded-2xl p-2 sm:p-3 grid grid-cols-2 grid-rows-2 gap-2 border border-emerald-500/40">
              {state.players.find(p => p.color === 'green')?.tokens.map((step, idx) => {
                const inYard = step === -1;
                const isMovable = isMyTurn && myLudoPlayer?.color === 'green' && state.movableTokenIndices.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleTokenClick(idx)}
                    disabled={!isMovable}
                    className={`rounded-full flex items-center justify-center font-black text-xs sm:text-sm shadow-md transition-all ${
                      inYard
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-800/40 border border-slate-700 opacity-20'
                    } ${isMovable ? 'ring-4 ring-white animate-pulse scale-110 cursor-pointer' : ''}`}
                  >
                    {inYard ? '🟢' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom-Right: Yellow Yard (rows 9-14, cols 9-14) */}
          <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-amber-400 p-3 sm:p-4 rounded-br-2xl flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/80 rounded-2xl p-2 sm:p-3 grid grid-cols-2 grid-rows-2 gap-2 border border-amber-400/40">
              {state.players.find(p => p.color === 'yellow')?.tokens.map((step, idx) => {
                const inYard = step === -1;
                const isMovable = isMyTurn && myLudoPlayer?.color === 'yellow' && state.movableTokenIndices.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleTokenClick(idx)}
                    disabled={!isMovable}
                    className={`rounded-full flex items-center justify-center font-black text-xs sm:text-sm shadow-md transition-all ${
                      inYard
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800/40 border border-slate-700 opacity-20'
                    } ${isMovable ? 'ring-4 ring-white animate-pulse scale-110 cursor-pointer' : ''}`}
                  >
                    {inYard ? '🟡' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom-Left: Blue Yard (rows 9-14, cols 0-5) */}
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-500 p-3 sm:p-4 rounded-bl-2xl flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/80 rounded-2xl p-2 sm:p-3 grid grid-cols-2 grid-rows-2 gap-2 border border-blue-500/40">
              {state.players.find(p => p.color === 'blue')?.tokens.map((step, idx) => {
                const inYard = step === -1;
                const isMovable = isMyTurn && myLudoPlayer?.color === 'blue' && state.movableTokenIndices.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleTokenClick(idx)}
                    disabled={!isMovable}
                    className={`rounded-full flex items-center justify-center font-black text-xs sm:text-sm shadow-md transition-all ${
                      inYard
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800/40 border border-slate-700 opacity-20'
                    } ${isMovable ? 'ring-4 ring-white animate-pulse scale-110 cursor-pointer' : ''}`}
                  >
                    {inYard ? '🔵' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center: Home Goal Triangle (rows 6-8, cols 6-8) */}
          <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
            <div className="relative w-full h-full">
              {/* 4 Colored Triangles */}
              <div
                className="absolute inset-0 bg-rose-500/60"
                style={{ clipPath: 'polygon(0 0, 50% 50%, 0 100%)' }}
              />
              <div
                className="absolute inset-0 bg-emerald-500/60"
                style={{ clipPath: 'polygon(0 0, 100% 0, 50% 50%)' }}
              />
              <div
                className="absolute inset-0 bg-amber-400/60"
                style={{ clipPath: 'polygon(100% 0, 100% 100%, 50% 50%)' }}
              />
              <div
                className="absolute inset-0 bg-blue-500/60"
                style={{ clipPath: 'polygon(0 100%, 100% 100%, 50% 50%)' }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white drop-shadow">
                🏆
              </div>
            </div>
          </div>

          {/* Track Squares and Moving Tokens */}
          {TRACK_COORDS.map((coord, trackIdx) => {
            const [row, col] = coord;
            const isStar = STAR_SQUARES.has(trackIdx);

            // Find tokens on this track square
            const tokensOnSquare: { color: LudoColor; tokenIdx: number; isMe: boolean }[] = [];
            state.players.forEach(p => {
              p.tokens.forEach((step, tIdx) => {
                if (step >= 0 && step <= 50) {
                  const globalIdx = (START_OFFSETS[p.color] + step) % 52;
                  if (globalIdx === trackIdx) {
                    tokensOnSquare.push({
                      color: p.color,
                      tokenIdx: tIdx,
                      isMe: p.socketId === myPlayer?.socketId,
                    });
                  }
                }
              });
            });

            return (
              <div
                key={`track-${trackIdx}`}
                style={{
                  gridRowStart: row + 1,
                  gridColumnStart: col + 1,
                }}
                className={`border border-slate-800/80 flex items-center justify-center relative ${
                  trackIdx === 0
                    ? 'bg-rose-500/30'
                    : trackIdx === 13
                    ? 'bg-emerald-500/30'
                    : trackIdx === 26
                    ? 'bg-amber-400/30'
                    : trackIdx === 39
                    ? 'bg-blue-500/30'
                    : 'bg-slate-900/60'
                }`}
              >
                {isStar && (
                  <span className="text-[10px] sm:text-xs text-amber-400 font-bold opacity-70">
                    ★
                  </span>
                )}

                {tokensOnSquare.map((tok, tIdx) => {
                  const isMovable =
                    isMyTurn &&
                    tok.isMe &&
                    state.phase === 'moving' &&
                    state.movableTokenIndices.includes(tok.tokenIdx);

                  return (
                    <button
                      key={tIdx}
                      onClick={() => handleTokenClick(tok.tokenIdx)}
                      disabled={!isMovable}
                      className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-lg font-black text-[10px] transition-transform ${
                        COLOR_CLASSES[tok.color]?.bg || 'bg-white'
                      } ${isMovable ? 'ring-2 ring-white scale-125 animate-bounce z-20 cursor-pointer' : ''}`}
                    >
                      <span className="text-[9px] sm:text-[11px] text-white">●</span>
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* Home Stretch Paths */}
          {Object.entries(HOME_PATHS).map(([colr, pathCoords]) => {
            const color = colr as LudoColor;
            return pathCoords.map((coord, stretchIdx) => {
              const [row, col] = coord;
              const stepOnHome = 51 + stretchIdx;

              // Find tokens on this home path square
              const tokensOnSquare: { tokenIdx: number; isMe: boolean }[] = [];
              const p = state.players.find(pl => pl.color === color);
              p?.tokens.forEach((st, tIdx) => {
                if (st === stepOnHome) {
                  tokensOnSquare.push({
                    tokenIdx: tIdx,
                    isMe: p.socketId === myPlayer?.socketId,
                  });
                }
              });

              return (
                <div
                  key={`home-${color}-${stretchIdx}`}
                  style={{
                    gridRowStart: row + 1,
                    gridColumnStart: col + 1,
                  }}
                  className={`border border-slate-800/80 flex items-center justify-center relative ${
                    COLOR_CLASSES[color]?.lightBg
                  }`}
                >
                  {tokensOnSquare.map((tok, tIdx) => {
                    const isMovable =
                      isMyTurn &&
                      tok.isMe &&
                      state.phase === 'moving' &&
                      state.movableTokenIndices.includes(tok.tokenIdx);

                    return (
                      <button
                        key={tIdx}
                        onClick={() => handleTokenClick(tok.tokenIdx)}
                        disabled={!isMovable}
                        className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-lg font-black text-[10px] transition-transform ${
                          COLOR_CLASSES[color]?.bg
                        } ${isMovable ? 'ring-2 ring-white scale-125 animate-bounce z-20 cursor-pointer' : ''}`}
                      >
                        <span className="text-[9px] sm:text-[11px] text-white">●</span>
                      </button>
                    );
                  })}
                </div>
              );
            });
          })}
        </div>
      </div>

      {/* Players Progress Bar at Bottom */}
      <div className="w-full mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {state.players.map(p => {
          const homeCount = p.tokens.filter(t => t === 56).length;
          const isCurrentTurn = state.currentTurnColor === p.color;

          return (
            <div
              key={p.socketId}
              className={`p-3 rounded-2xl border transition-all ${
                isCurrentTurn
                  ? `${COLOR_CLASSES[p.color]?.lightBg} ${COLOR_CLASSES[p.color]?.border} ring-2 ${COLOR_CLASSES[p.color]?.ring}`
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{p.avatar}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {p.playerName}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {p.color} • {homeCount}/4 Home
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full ${COLOR_CLASSES[p.color]?.bg}`}
                  style={{ width: `${(homeCount / 4) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {state.winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl text-center max-w-md w-full">
              <Crown className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h3 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mb-1">
                Ludo Champion!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                All 4 tokens successfully guided home.
              </p>

              <div className="space-y-2 mb-6 text-left">
                {state.rankings.map(r => (
                  <div
                    key={r.socketId}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-500 text-sm">#{r.rank}</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                        {r.playerName}
                      </span>
                    </div>
                    <span className="text-xs font-bold capitalize text-slate-400">{r.color}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={voteRematch}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Rematch</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
