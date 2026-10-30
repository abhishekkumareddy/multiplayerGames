import React from 'react';
import { motion } from 'framer-motion';
import { useRoom } from '../hooks/useRoom';
import { DotsAndBoxesState } from '@shared/types';
import { sounds } from '../utils/sound';
import { Crown, RotateCcw } from 'lucide-react';

const PLAYER_COLORS = [
  { line: 'bg-blue-500', box: 'bg-blue-500/20 text-blue-500 border-blue-500/40' },
  { line: 'bg-rose-500', box: 'bg-rose-500/20 text-rose-500 border-rose-500/40' },
  { line: 'bg-emerald-500', box: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40' },
  { line: 'bg-amber-400', box: 'bg-amber-400/20 text-amber-500 border-amber-400/40' },
];

export const DotsAndBoxesGame: React.FC = () => {
  const { gameState, sendGameAction, myPlayer, room, voteRematch } = useRoom();
  const state = gameState as DotsAndBoxesState | null;

  if (!state) return null;

  const isMyTurn = state.currentTurn === myPlayer?.socketId;
  const isFinished = !!state.winner;

  // Map each player to a color
  const playerColorMap: Record<string, typeof PLAYER_COLORS[0]> = {};
  room?.players.forEach((p, idx) => {
    playerColorMap[p.socketId] = PLAYER_COLORS[idx % PLAYER_COLORS.length];
  });

  const handleLineClick = (type: 'h' | 'v', row: number, col: number) => {
    if (!isMyTurn || isFinished) return;
    if (type === 'h' && state.horizontalLines[row][col]) return;
    if (type === 'v' && state.verticalLines[row][col]) return;

    sounds.playPop();
    sendGameAction('draw_line', { type, row, col });
  };

  return (
    <div className="w-full max-w-xl flex flex-col items-center">
      {/* Top Banner: Turn & Scoreboard */}
      <div className="w-full mb-6 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          {room?.players.map((p, idx) => {
            const pColor = playerColorMap[p.socketId];
            const isTurn = state.currentTurn === p.socketId;

            return (
              <div
                key={p.socketId}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                  isTurn
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-400/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                }`}
              >
                <span>{p.avatar}</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[80px]">
                  {p.playerName}
                </span>
                <span className="text-xs font-black text-amber-500">
                  {state.scores[p.socketId] || 0}
                </span>
              </div>
            );
          })}
        </div>

        <div>
          {isMyTurn && !isFinished ? (
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-slate-950 animate-pulse">
              Your Turn!
            </span>
          ) : !isFinished ? (
            <span className="text-xs font-bold text-slate-400">Waiting...</span>
          ) : null}
        </div>
      </div>

      {/* Grid Container */}
      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 border-4 border-slate-800 shadow-2xl relative select-none">
        {/* 3x3 Boxes Grid */}
        <div className="relative">
          {Array.from({ length: 4 }).map((_, r) => (
            <React.Fragment key={`row-${r}`}>
              {/* Horizontal line row */}
              <div className="flex items-center">
                {Array.from({ length: 3 }).map((_, c) => {
                  const lineOwner = state.horizontalLines[r][c];
                  const ownerColor = lineOwner ? playerColorMap[lineOwner]?.line : null;

                  return (
                    <React.Fragment key={`h-${r}-${c}`}>
                      {/* Dot */}
                      <div className="w-4 h-4 rounded-full bg-slate-200 shadow-md ring-2 ring-slate-700 z-10 shrink-0" />

                      {/* Horizontal Line Segment */}
                      <button
                        onClick={() => handleLineClick('h', r, c)}
                        disabled={!isMyTurn || !!lineOwner || isFinished}
                        className={`h-3 w-16 sm:w-24 transition-all cursor-pointer ${
                          lineOwner
                            ? `${ownerColor} shadow-md`
                            : isMyTurn && !isFinished
                            ? 'bg-slate-800 hover:bg-slate-700'
                            : 'bg-slate-800/60 opacity-60'
                        }`}
                      />
                    </React.Fragment>
                  );
                })}
                {/* Last Dot of the row */}
                <div className="w-4 h-4 rounded-full bg-slate-200 shadow-md ring-2 ring-slate-700 z-10 shrink-0" />
              </div>

              {/* Vertical line row & Box spaces (between dot rows) */}
              {r < 3 && (
                <div className="flex items-center">
                  {Array.from({ length: 3 }).map((_, c) => {
                    const vLineOwner = state.verticalLines[r][c];
                    const vOwnerColor = vLineOwner ? playerColorMap[vLineOwner]?.line : null;
                    const boxOwner = state.boxes[r][c];
                    const boxOwnerPlayer = room?.players.find(p => p.socketId === boxOwner);

                    return (
                      <React.Fragment key={`v-${r}-${c}`}>
                        {/* Vertical Line */}
                        <button
                          onClick={() => handleLineClick('v', r, c)}
                          disabled={!isMyTurn || !!vLineOwner || isFinished}
                          className={`w-3 h-16 sm:h-24 transition-all cursor-pointer ${
                            vLineOwner
                              ? `${vOwnerColor} shadow-md`
                              : isMyTurn && !isFinished
                              ? 'bg-slate-800 hover:bg-slate-700'
                              : 'bg-slate-800/60 opacity-60'
                          }`}
                        />

                        {/* Box Territory */}
                        <div
                          className={`w-16 sm:w-24 h-16 sm:h-24 flex items-center justify-center font-black text-xl sm:text-2xl transition-all rounded-lg ${
                            boxOwnerPlayer
                              ? `${playerColorMap[boxOwnerPlayer.socketId]?.box} border`
                              : 'bg-slate-950/40'
                          }`}
                        >
                          {boxOwnerPlayer?.avatar}
                        </div>
                      </React.Fragment>
                    );
                  })}

                  {/* Last Vertical Line of row */}
                  {(() => {
                    const vLastOwner = state.verticalLines[r][3];
                    const vLastOwnerColor = vLastOwner ? playerColorMap[vLastOwner]?.line : null;
                    return (
                      <button
                        onClick={() => handleLineClick('v', r, 3)}
                        disabled={!isMyTurn || !!vLastOwner || isFinished}
                        className={`w-3 h-16 sm:h-24 transition-all cursor-pointer ${
                          vLastOwner
                            ? `${vLastOwnerColor} shadow-md`
                            : isMyTurn && !isFinished
                            ? 'bg-slate-800 hover:bg-slate-700'
                            : 'bg-slate-800/60 opacity-60'
                        }`}
                      />
                    );
                  })()}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Game Over Banner */}
      {isFinished && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center"
        >
          <Crown className="w-10 h-10 text-amber-400 mx-auto mb-2" />
          <h3 className="text-xl font-display font-extrabold text-slate-900 dark:text-white">
            {state.winner === 'draw'
              ? "It's a Draw!"
              : `${room?.players.find(p => p.socketId === state.winner)?.playerName} Wins! 🎉`}
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Total boxes completed: {state.completedBoxes}/9
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
