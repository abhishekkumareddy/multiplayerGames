import React from 'react';
import { motion } from 'framer-motion';
import { useRoom } from '../hooks/useRoom';
import { QuizState } from '@shared/types';
import { sounds } from '../utils/sound';
import { Trophy, Clock, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const QuickQuizGame: React.FC = () => {
  const { gameState, myPlayer, room, sendGameAction } = useRoom();
  const state = gameState as QuizState;

  if (!state || !room || !myPlayer) return null;

  const currentQ = state.question;
  const isGameOver = state.phase === 'game_over';
  const myAnswer = state.answers[myPlayer.socketId];
  const hasAnswered = myAnswer !== undefined;

  const handleSelectOption = (optionIndex: number) => {
    if (state.phase !== 'question' || hasAnswered) return;
    sounds.playMove();
    sendGameAction('submit_answer', { optionIndex });
  };

  const timerRatio = currentQ ? Math.max(0, state.secondsRemaining / currentQ.timeLimitSec) : 0;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto py-2">
      {/* Top Bar: Question Index & Live Score */}
      <div className="w-full flex items-center justify-between bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 mb-4 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
            {currentQ?.category || 'Trivia'}
          </span>
          <span className="text-sm font-extrabold text-white">
            Q{state.currentQuestionIndex + 1} of {state.totalQuestions}
          </span>
        </div>

        {/* My Current Score */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Score:</span>
          <span className="text-base font-black text-amber-400 font-mono">
            {state.scores[myPlayer.socketId] || 0} pts
          </span>
        </div>
      </div>

      {/* Timer Progress Bar (during question phase) */}
      {state.phase === 'question' && (
        <div className="w-full mb-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 mb-1.5 px-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-purple-400" /> Time Remaining
            </span>
            <span className={`text-sm ${state.secondsRemaining <= 3 ? 'text-rose-400 font-black animate-pulse' : 'text-slate-200'}`}>
              {state.secondsRemaining}s
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <motion.div
              className={`h-full rounded-full transition-all duration-1000 ${
                state.secondsRemaining <= 3
                  ? 'bg-rose-500'
                  : state.secondsRemaining <= 6
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500'
              }`}
              style={{ width: `${timerRatio * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Quiz Card */}
      <div className="w-full bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {isGameOver ? (
          /* Game Over Podium */
          <div className="flex flex-col items-center py-6 text-center">
            <Trophy className="w-20 h-20 text-amber-400 mb-4 animate-bounce" />
            <h2 className="text-3xl font-black text-white mb-2">Quiz Finished!</h2>
            <p className="text-amber-300 font-bold text-lg mb-6">
              {state.winner === myPlayer.socketId
                ? '🏆 Congratulations! You are the Quiz Master!'
                : `🏆 ${room.players.find(p => p.socketId === state.winner)?.playerName || 'Winner'} won the quiz!`}
            </p>

            {/* Final Leaderboard */}
            <div className="w-full max-w-sm flex flex-col gap-2.5">
              {room.players
                .map(p => ({ player: p, score: state.scores[p.socketId] || 0 }))
                .sort((a, b) => b.score - a.score)
                .map(({ player, score }, idx) => (
                  <div
                    key={player.socketId}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-amber-400 text-sm">#{idx + 1}</span>
                      <span className="text-xl">{player.avatar}</span>
                      <span className="font-bold text-white text-sm">{player.playerName}</span>
                    </div>
                    <span className="font-mono font-black text-amber-400 text-sm">{score} pts</span>
                  </div>
                ))}
            </div>
          </div>
        ) : state.phase === 'scoreboard' ? (
          /* Scoreboard between questions */
          <div className="flex flex-col items-center py-4">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Standings
            </h3>
            <div className="w-full max-w-sm flex flex-col gap-2.5">
              {room.players
                .map(p => ({ player: p, score: state.scores[p.socketId] || 0 }))
                .sort((a, b) => b.score - a.score)
                .map(({ player, score }, idx) => (
                  <div
                    key={player.socketId}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-amber-400 text-sm">#{idx + 1}</span>
                      <span className="text-xl">{player.avatar}</span>
                      <span className="font-bold text-white text-sm">{player.playerName}</span>
                    </div>
                    <span className="font-mono font-black text-amber-400 text-sm">{score} pts</span>
                  </div>
                ))}
            </div>
            <p className="text-xs text-slate-400 mt-6 animate-pulse">Next question loading...</p>
          </div>
        ) : (
          /* Active Question or Reveal Phase */
          <div>
            {/* Question Text */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-6 leading-snug">
              {currentQ?.question}
            </h2>

            {/* 4 Multiple Choice Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {currentQ?.options.map((opt, idx) => {
                const isSelectedByMe = myAnswer?.selectedOption === idx;
                const isCorrect = state.phase === 'reveal' && state.correctOption === idx;
                const isWrongSelection = state.phase === 'reveal' && isSelectedByMe && !isCorrect;

                return (
                  <motion.button
                    key={idx}
                    whileHover={state.phase === 'question' && !hasAnswered ? { scale: 1.02 } : {}}
                    whileTap={state.phase === 'question' && !hasAnswered ? { scale: 0.98 } : {}}
                    onClick={() => handleSelectOption(idx)}
                    disabled={state.phase !== 'question' || hasAnswered}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-200 select-none ${
                      isCorrect
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                        : isWrongSelection
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : isSelectedByMe
                        ? 'bg-purple-600/30 border-purple-400 ring-2 ring-purple-500 text-white'
                        : state.phase === 'question' && !hasAnswered
                        ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200 cursor-pointer'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 cursor-default'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-500 text-slate-950'
                          : isWrongSelection
                          ? 'bg-rose-500 text-white'
                          : isSelectedByMe
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {OPTION_LETTERS[idx]}
                    </span>
                    <span className="font-semibold text-sm leading-tight flex-1">{opt}</span>
                    {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    {isWrongSelection && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                  </motion.button>
                );
              })}
            </div>

            {/* Answer lock feedback or reveal explanation */}
            {state.phase === 'reveal' ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs sm:text-sm text-purple-200"
              >
                <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Did you know?
                </div>
                <p>{state.explanation}</p>
                {myAnswer && (
                  <div className="mt-2 pt-2 border-t border-purple-500/20 font-bold text-xs">
                    {myAnswer.isCorrect ? (
                      <span className="text-emerald-400">
                        🎉 Correct! You scored +{myAnswer.pointsEarned} points (Speed Bonus included)!
                      </span>
                    ) : (
                      <span className="text-rose-400">❌ Incorrect answer this round.</span>
                    )}
                  </div>
                )}
              </motion.div>
            ) : hasAnswered ? (
              <div className="text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5 py-1">
                <CheckCircle2 className="w-4 h-4" /> Answer locked in! Waiting for other players or timer...
              </div>
            ) : (
              <div className="text-center text-xs text-slate-500 py-1">
                Select an answer quickly for speed bonus points!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rematch button */}
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
            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 transition-all transform active:scale-95"
          >
            Play Another Quiz 🔄
          </button>
        </motion.div>
      )}
    </div>
  );
};
