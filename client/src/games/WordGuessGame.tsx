import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRoom } from '../hooks/useRoom';
import { WordGuessState } from '@shared/types';
import { sounds } from '../utils/sound';
import { Crown, RotateCcw, Delete, CornerDownLeft } from 'lucide-react';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

export const WordGuessGame: React.FC = () => {
  const { gameState, sendGameAction, myPlayer, room, voteRematch } = useRoom();
  const state = gameState as WordGuessState | null;

  const [currentGuess, setCurrentGuess] = useState('');
  const myGuessState = myPlayer ? state?.playerGuesses[myPlayer.socketId] : null;

  const handleKeyPress = (key: string) => {
    if (!myGuessState || myGuessState.solved || myGuessState.attemptsUsed >= 6) return;

    if (key === 'ENTER') {
      if (currentGuess.length === 5) {
        sounds.playPop();
        sendGameAction('guess_word', { word: currentGuess });
        setCurrentGuess('');
      } else {
        sounds.playError();
      }
    } else if (key === 'BACK' || key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER') {
        handleKeyPress('ENTER');
      } else if (key === 'BACKSPACE') {
        handleKeyPress('BACK');
      } else if (/^[A-Z]$/.test(key)) {
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, myGuessState]);

  if (!state || !myGuessState) return null;

  // Build letter feedback status map for virtual keyboard
  const keyStatus: Record<string, 'correct' | 'present' | 'absent'> = {};
  myGuessState.attempts.forEach(attempt => {
    attempt.word.split('').forEach((letter, idx) => {
      const fb = attempt.feedback[idx];
      if (fb === 'correct') {
        keyStatus[letter] = 'correct';
      } else if (fb === 'present' && keyStatus[letter] !== 'correct') {
        keyStatus[letter] = 'present';
      } else if (!keyStatus[letter]) {
        keyStatus[letter] = 'absent';
      }
    });
  });

  return (
    <div className="w-full max-w-xl flex flex-col items-center">
      {/* Rivals Progress Tracker */}
      <div className="w-full mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {room?.players.map(p => {
          const pGuess = state.playerGuesses[p.socketId];
          const isMe = p.socketId === myPlayer?.socketId;

          return (
            <div
              key={p.socketId}
              className={`p-2.5 rounded-2xl border transition-all ${
                isMe
                  ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-400/40'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base">{p.avatar}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {p.playerName}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">
                  {pGuess?.attemptsUsed || 0}/6 Guesses
                </span>
                {pGuess?.solved ? (
                  <span className="text-emerald-500 font-extrabold">Solved! 🎉</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* 6x5 Wordle Letter Grid */}
      <div className="flex flex-col gap-1.5 mb-4 select-none">
        {Array.from({ length: 6 }).map((_, rowIdx) => {
          const attempt = myGuessState.attempts[rowIdx];
          const isCurrentRow = rowIdx === myGuessState.attemptsUsed;

          return (
            <div key={rowIdx} className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, colIdx) => {
                let letter = '';
                let feedback: 'correct' | 'present' | 'absent' | null = null;

                if (attempt) {
                  letter = attempt.word[colIdx] || '';
                  feedback = attempt.feedback[colIdx];
                } else if (isCurrentRow) {
                  letter = currentGuess[colIdx] || '';
                }

                return (
                  <div
                    key={colIdx}
                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center font-black text-lg sm:text-xl border-2 transition-all ${
                      feedback === 'correct'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : feedback === 'present'
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : feedback === 'absent'
                        ? 'bg-slate-700 border-slate-700 text-slate-300'
                        : letter
                        ? 'border-slate-400 text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800'
                        : 'border-slate-300 dark:border-slate-800 bg-transparent'
                    }`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Virtual On-Screen Keyboard */}
      <div className="w-full flex flex-col gap-1.5 max-w-md select-none">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {row.map(k => {
              const status = keyStatus[k];
              const isSpecial = k === 'ENTER' || k === 'BACK';

              return (
                <button
                  key={k}
                  onClick={() => handleKeyPress(k)}
                  className={`h-11 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer ${
                    isSpecial ? 'px-2.5 sm:px-3 text-[11px]' : 'flex-1'
                  } ${
                    status === 'correct'
                      ? 'bg-emerald-500 text-white'
                      : status === 'present'
                      ? 'bg-amber-500 text-white'
                      : status === 'absent'
                      ? 'bg-slate-700 text-slate-400'
                      : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {k === 'BACK' ? <Delete className="w-4 h-4" /> : k}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Game Over Banner */}
      {state.phase === 'game_over' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center"
        >
          <Crown className="w-10 h-10 text-amber-400 mx-auto mb-2" />
          <h3 className="text-xl font-display font-extrabold text-slate-900 dark:text-white">
            {state.winner === 'tie'
              ? 'Tied Match!'
              : state.winner
              ? `${room?.players.find(p => p.socketId === state.winner)?.playerName} Solved It! 🎉`
              : 'Nobody Solved the Word!'}
          </h3>
          <p className="text-sm font-black text-amber-500 mt-1 mb-4">
            Hidden Word: {state.targetWord}
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
