import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRoom } from '../hooks/useRoom';
import { ReactionState } from '@shared/types';
import { sounds } from '../utils/sound';
import { Trophy, Zap, AlertTriangle } from 'lucide-react';

export const ReactionChallengeGame: React.FC = () => {
  const { gameState, myPlayer, room, sendGameAction } = useRoom();
  const state = gameState as ReactionState;
  const prevPhaseRef = useRef<string>('');

  useEffect(() => {
    if (!state) return;

    if (state.phase === 'countdown' && prevPhaseRef.current !== 'countdown') {
      sounds.playCountdown();
    } else if (state.phase === 'go' && prevPhaseRef.current !== 'go') {
      sounds.playGo();
    } else if (state.phase === 'round_summary' && prevPhaseRef.current !== 'round_summary') {
      sounds.playPop();
    }

    prevPhaseRef.current = state.phase;
  }, [state?.phase]);

  if (!state || !room || !myPlayer) return null;

  const myResult = state.playerResults[myPlayer.socketId];
  const isGameOver = state.phase === 'game_over';

  const handleTap = () => {
    if (state.phase === 'round_summary' || isGameOver) return;
    if (myResult?.falseStart || myResult?.reactionTimeMs !== null) return;

    if (state.phase === 'countdown' || state.phase === 'waiting_for_green') {
      sounds.playError();
    } else if (state.phase === 'go') {
      sounds.playPop();
    }

    sendGameAction('tap');
  };

  const getArenaBackground = () => {
    switch (state.phase) {
      case 'countdown':
        return 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 border-rose-600/50';
      case 'waiting_for_green':
        return 'bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 border-amber-500/50';
      case 'go':
        return 'bg-gradient-to-br from-emerald-600 via-teal-500 to-green-600 border-emerald-300 shadow-2xl shadow-emerald-500/50';
      default:
        return 'bg-slate-900/90 border-slate-800';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto py-2">
      {/* Header with round & scores */}
      <div className="w-full flex items-center justify-between bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 mb-4 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tournament</div>
            <div className="text-sm font-extrabold text-white">
              Round {state.round} of {state.totalRounds}
            </div>
          </div>
        </div>

        {/* Live Top Scores */}
        <div className="flex items-center gap-3">
          {room.players.map(p => (
            <div key={p.socketId} className="flex items-center gap-1.5 text-xs bg-slate-800/80 px-2.5 py-1 rounded-xl">
              <span>{p.avatar}</span>
              <span className="font-bold text-slate-200">{state.scores[p.socketId] || 0} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Reactive Arena Button */}
      <motion.button
        onClick={handleTap}
        whileTap={state.phase === 'go' ? { scale: 0.98 } : {}}
        className={`w-full min-h-[340px] sm:min-h-[380px] rounded-3xl border-4 p-8 flex flex-col items-center justify-center text-center transition-all duration-150 select-none cursor-pointer relative overflow-hidden ${getArenaBackground()}`}
      >
        {state.phase === 'countdown' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-rose-500/30 flex items-center justify-center text-4xl mb-4 border-2 border-rose-500 animate-pulse">
              🔴
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-rose-400 mb-2">GET READY...</h2>
            <p className="text-rose-200/70 text-sm font-medium">Wait for the green signal</p>
          </div>
        )}

        {state.phase === 'waiting_for_green' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-amber-500/30 flex items-center justify-center text-4xl mb-4 border-2 border-amber-500 animate-ping">
              🟡
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-amber-300 mb-2">STEADY...</h2>
            <p className="text-amber-200/80 text-sm font-medium">DON'T TAP YET! Wait for green!</p>
          </div>
        )}

        {state.phase === 'go' && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-full bg-white/30 flex items-center justify-center text-5xl mb-4 border-4 border-white shadow-2xl">
              ⚡
            </div>
            <h2 className="text-5xl sm:text-6xl font-black text-white drop-shadow-md mb-2">TAP NOW!</h2>
            <p className="text-white/90 text-base font-bold">FASTEST FINGER WINS!</p>
          </motion.div>
        )}

        {/* False start banner if tapped early */}
        {myResult?.falseStart && (
          <div className="absolute inset-0 bg-rose-950/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md">
            <AlertTriangle className="w-16 h-16 text-rose-400 mb-3 animate-bounce" />
            <h3 className="text-2xl font-black text-white mb-1">FALSE START!</h3>
            <p className="text-rose-300 text-sm max-w-xs">
              You tapped before green turned on! 0 points for this round.
            </p>
          </div>
        )}

        {/* Tapped in time confirmation */}
        {state.phase === 'go' && myResult?.reactionTimeMs !== null && !myResult?.falseStart && (
          <div className="absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md">
            <div className="text-5xl mb-3">⚡</div>
            <h3 className="text-4xl font-black text-white mb-2">{myResult.reactionTimeMs} ms</h3>
            <p className="text-emerald-300 font-bold">Awesome reaction! Calculating rank...</p>
          </div>
        )}

        {/* Round Summary */}
        {state.phase === 'round_summary' && (
          <div className="flex flex-col items-center w-full max-w-sm">
            <h3 className="text-xl font-bold text-white mb-4">Round Results</h3>
            <div className="w-full flex flex-col gap-2">
              {room.players
                .map(p => ({
                  player: p,
                  result: state.playerResults[p.socketId],
                }))
                .sort((a, b) => (a.result?.rank || 99) - (b.result?.rank || 99))
                .map(({ player, result }) => (
                  <div
                    key={player.socketId}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-400 text-sm">
                        {result?.rank ? `#${result.rank}` : '—'}
                      </span>
                      <span>{player.avatar}</span>
                      <span className="font-bold text-white text-sm">{player.playerName}</span>
                    </div>
                    <div>
                      {result?.falseStart ? (
                        <span className="text-rose-400 font-bold text-xs">False Start</span>
                      ) : result?.reactionTimeMs ? (
                        <span className="text-emerald-400 font-mono font-bold text-sm">
                          {result.reactionTimeMs} ms (+{result.pointsEarned} pts)
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">Timed out</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
            <p className="text-xs text-slate-400 mt-4 animate-pulse">Next round starting shortly...</p>
          </div>
        )}

        {/* Game Over Podium */}
        {isGameOver && (
          <div className="flex flex-col items-center">
            <Trophy className="w-16 h-16 text-amber-400 mb-3" />
            <h2 className="text-3xl font-black text-white mb-2">Tournament Complete!</h2>
            <p className="text-amber-300 font-bold text-lg mb-4">
              {state.winner === myPlayer.socketId
                ? '🏆 You are the Speed Champion!'
                : `🏆 ${room.players.find(p => p.socketId === state.winner)?.playerName || 'Champion'} Won!`}
            </p>
          </div>
        )}
      </motion.button>

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
            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95"
          >
            Play Another Tournament 🔄
          </button>
        </motion.div>
      )}
    </div>
  );
};
