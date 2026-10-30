import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRoom } from '../hooks/useRoom';
import { SudokuState } from '@shared/types';
import { sounds } from '../utils/sound';
import { Crown, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

export const SudokuGame: React.FC = () => {
  const { gameState, sendGameAction, myPlayer, room, voteRematch } = useRoom();
  const state = gameState as SudokuState | null;

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  const handleCellClick = (row: number, col: number) => {
    if (!state || state.initialBoard[row][col] !== 0) return;
    setSelectedCell({ row, col });
    sounds.playPop();
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || !state) return;
    const { row, col } = selectedCell;
    if (state.initialBoard[row][col] !== 0) return;

    sendGameAction('fill_cell', { row, col, val: num });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      const key = parseInt(e.key);
      if (key >= 1 && key <= 9) {
        handleNumberInput(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell]);

  if (!state) return null;

  const selectedVal = selectedCell ? state.currentBoard[selectedCell.row][selectedCell.col] : null;

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
      {/* Top Banner: Players and Scores */}
      <div className="w-full mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {room?.players.map(p => {
          const score = state.scores[p.socketId] || 0;
          const errors = state.errors[p.socketId] || 0;
          const isMe = p.socketId === myPlayer?.socketId;

          return (
            <div
              key={p.socketId}
              className={`p-3 rounded-2xl border transition-all ${
                isMe
                  ? 'bg-blue-500/10 border-blue-500/40 ring-2 ring-blue-400/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{p.avatar}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {p.playerName} {isMe ? '(You)' : ''}
                  </div>
                  <div className="text-sm font-black text-blue-500">{score} pts</div>
                </div>
              </div>
              <div className="mt-1 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Errors: {errors}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 9x9 Sudoku Grid */}
      <div className="p-2 sm:p-4 rounded-3xl bg-slate-900 border-4 border-slate-800 shadow-2xl relative select-none">
        <div className="grid grid-cols-9 grid-rows-9 gap-[1px] bg-slate-700 w-[310px] h-[310px] sm:w-[420px] sm:h-[420px] rounded-xl overflow-hidden border-2 border-slate-600">
          {state.currentBoard.map((row, r) =>
            row.map((val, c) => {
              const isInitial = state.initialBoard[r][c] !== 0;
              const isSelected = selectedCell?.row === r && selectedCell?.col === c;
              const isSameRowOrCol =
                selectedCell && (selectedCell.row === r || selectedCell.col === c);
              const isSameBox =
                selectedCell &&
                Math.floor(selectedCell.row / 3) === Math.floor(r / 3) &&
                Math.floor(selectedCell.col / 3) === Math.floor(c / 3);
              const isSameNumber = selectedVal && selectedVal > 0 && val === selectedVal;

              const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-b-slate-500' : '';
              const borderRight = (c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-r-slate-500' : '';

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  disabled={isInitial}
                  className={`flex items-center justify-center font-bold text-sm sm:text-lg transition-colors cursor-pointer ${borderBottom} ${borderRight} ${
                    isSelected
                      ? '!bg-blue-500 text-white'
                      : isSameNumber
                      ? '!bg-blue-500/30 text-blue-300'
                      : isSameRowOrCol || isSameBox
                      ? 'bg-slate-800/80 text-white'
                      : 'bg-slate-900 text-slate-200'
                  } ${isInitial ? 'font-black text-amber-400 !cursor-default' : ''}`}
                >
                  {val > 0 ? val : ''}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Number Pad (1-9) */}
      <div className="mt-4 flex items-center justify-center gap-1.5 sm:gap-2 max-w-md w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-blue-600 active:scale-95 text-white font-extrabold text-sm sm:text-base shadow-md transition-all cursor-pointer"
          >
            {num}
          </button>
        ))}
      </div>

      <div className="mt-2 text-xs text-slate-400 text-center">
        Select an open cell and click a number or type 1-9 on keyboard (+10 pts correct, -5 pts error)
      </div>

      {/* Completed Game Overlay */}
      {state.isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center"
        >
          <Crown className="w-10 h-10 text-amber-400 mx-auto mb-2" />
          <h3 className="text-xl font-display font-extrabold text-slate-900 dark:text-white">
            Sudoku Puzzle Solved! 🎉
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Winner: {room?.players.find(p => p.socketId === state.winner)?.playerName || 'All Players'}
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
