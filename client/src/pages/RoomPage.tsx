import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoom } from '../hooks/useRoom';
import { GAMES_METADATA } from '@shared/games';
import { GameId } from '@shared/types';
import { sounds } from '../utils/sound';
import { InviteModal } from '../components/InviteModal';
import { ChatDrawer } from '../components/ChatDrawer';
import { TicTacToeGame } from '../games/TicTacToeGame';
import { RockPaperScissorsGame } from '../games/RockPaperScissorsGame';
import { ConnectFourGame } from '../games/ConnectFourGame';
import { MemoryMatchGame } from '../games/MemoryMatchGame';
import { ReactionChallengeGame } from '../games/ReactionChallengeGame';
import { QuickQuizGame } from '../games/QuickQuizGame';
import { ChessGame } from '../games/ChessGame';
import { LudoGame } from '../games/LudoGame';
import { DotsAndBoxesGame } from '../games/DotsAndBoxesGame';
import { Game2048 } from '../games/Game2048';
import { SudokuGame } from '../games/SudokuGame';
import { WordGuessGame } from '../games/WordGuessGame';
import {
  Crown,
  CheckCircle2,
  Clock,
  Share2,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

export const RoomPage: React.FC = () => {
  const {
    room,
    myPlayer,
    isHost,
    toggleReady,
    selectGame,
    startGame,
    voteRematch,
    error,
    departureNotice,
    clearDepartureNotice,
  } = useRoom();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showGamePicker, setShowGamePicker] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!room || !myPlayer) return null;

  const currentGameMeta = room.game ? GAMES_METADATA[room.game] : null;
  const connectedPlayers = room.players.filter(p => p.connected);
  const isReady = myPlayer.isReady;

  const canStartGame =
    isHost &&
    connectedPlayers.length >= room.minPlayers &&
    connectedPlayers.length <= room.maxPlayers &&
    connectedPlayers.every(p => p.isHost || p.isReady);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.roomId);
    setCopiedCode(true);
    sounds.playPop();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const renderActiveGame = () => {
    switch (room.game) {
      case 'chess':
        return <ChessGame />;
      case 'ludo':
        return <LudoGame />;
      case 'tic-tac-toe':
        return <TicTacToeGame />;
      case 'rock-paper-scissors':
        return <RockPaperScissorsGame />;
      case 'connect-four':
        return <ConnectFourGame />;
      case 'dots-and-boxes':
        return <DotsAndBoxesGame />;
      case 'game-2048':
        return <Game2048 />;
      case 'sudoku':
        return <SudokuGame />;
      case 'word-guess':
        return <WordGuessGame />;
      case 'memory-match':
        return <MemoryMatchGame />;
      case 'reaction-challenge':
        return <ReactionChallengeGame />;
      case 'quick-quiz':
        return <QuickQuizGame />;
      default:
        return (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Select a game to start playing
          </div>
        );
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col p-4 sm:p-6 max-w-5xl mx-auto w-full">
      {/* Invite Friends Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        roomId={room.roomId}
      />

      {/* Floating Chat Drawer */}
      <ChatDrawer />

      {/* Real-Time Player Departure Alert */}
      <AnimatePresence>
        {departureNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className={`mb-4 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-lg border transition-all ${
              departureNotice.remainingCount >= 3
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/40'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{departureNotice.avatar || '👋'}</span>
              <div>
                <div className="text-sm font-extrabold flex items-center flex-wrap gap-2">
                  <span>{departureNotice.message}</span>
                  {departureNotice.remainingCount >= 3 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-sm">
                      {departureNotice.remainingCount} players remaining
                    </span>
                  )}
                </div>
                {departureNotice.hostReassigned && (
                  <div className="text-xs opacity-90 mt-0.5 font-semibold">
                    👑 Host role transferred to {departureNotice.newHostName}.
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={clearDepartureNotice}
              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-xs font-bold cursor-pointer"
              title="Dismiss"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error alert if any */}
      {error && (
        <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error.message}</span>
        </div>
      )}

      {/* ----------------- LOBBY VIEW ----------------- */}
      {room.status === 'waiting' ? (
        <div className="space-y-6">
          {/* Top Banner: Room Code & Quick Invite */}
          <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl backdrop-blur-xl">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                <span>Room Code</span>
                <span>•</span>
                <span className="text-emerald-500 font-extrabold">Waiting for Players</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl font-mono font-black text-amber-500 tracking-wider">
                  {room.roomId}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Copy Code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Invite Friends</span>
              </button>
            </div>
          </div>

          {/* Selected Game Card */}
          {currentGameMeta && (
            <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-3xl shadow-md text-white">
                  🎮
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-display font-extrabold text-slate-900 dark:text-white">
                      {currentGameMeta.name}
                    </h3>
                    <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {currentGameMeta.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                    {currentGameMeta.description}
                  </p>
                </div>
              </div>

              {isHost && (
                <button
                  onClick={() => setShowGamePicker(!showGamePicker)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors shrink-0 cursor-pointer"
                >
                  {showGamePicker ? 'Close Picker' : 'Change Game'}
                </button>
              )}
            </div>
          )}

          {/* Game Picker Drawer (Host only) */}
          <AnimatePresence>
            {showGamePicker && isHost && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl overflow-hidden"
              >
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">
                  Select Game for this Room (12 Games Available)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.values(GAMES_METADATA).map(g => (
                    <button
                      key={g.id}
                      onClick={() => {
                        selectGame(g.id);
                        setShowGamePicker(false);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        room.game === g.id
                          ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-400/40'
                          : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {g.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {g.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {g.tagline}
                      </div>
                      <div className="text-[10px] text-amber-500 font-bold mt-2">
                        {g.minPlayers === g.maxPlayers
                          ? `${g.minPlayers} Players`
                          : `${g.minPlayers}-${g.maxPlayers} Players`}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Connected Players Section */}
          <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white">
                  Players in Room ({connectedPlayers.length}/{room.maxPlayers})
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                Min: {room.minPlayers} required
              </span>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {room.players.map(p => {
                const isMe = p.socketId === myPlayer.socketId;

                return (
                  <div
                    key={p.socketId}
                    className={`p-4 rounded-2xl border transition-all ${
                      p.connected
                        ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80'
                        : 'bg-slate-100/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-2xl shadow-inner shrink-0 relative">
                        {p.avatar}
                        {p.isHost && (
                          <div
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow"
                            title="Room Host"
                          >
                            <Crown className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                            {p.playerName}
                          </span>
                          {isMe && (
                            <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-1.5 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </div>

                        {/* Status Pills */}
                        <div className="mt-1 flex items-center gap-1.5">
                          {!p.connected ? (
                            <span className="text-[11px] text-rose-500 font-medium">
                              Disconnected
                            </span>
                          ) : p.isHost ? (
                            <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                              👑 Room Host
                            </span>
                          ) : p.isReady ? (
                            <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-500/80 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Not Ready
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ready & Start Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              {/* Ready Toggle for Non-Host */}
              {!isHost ? (
                <div className="w-full sm:w-auto">
                  <button
                    onClick={() => toggleReady(!isReady)}
                    className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm transition-all transform active:scale-95 shadow-lg cursor-pointer ${
                      isReady
                        ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
                    }`}
                  >
                    {isReady ? 'Cancel Ready ⏳' : "I'm Ready! ⚡"}
                  </button>
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  You are the host. Select game & start when players are ready.
                </div>
              )}

              {/* Start Button for Host */}
              {isHost && (
                <button
                  onClick={startGame}
                  disabled={!canStartGame}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950 stroke-none" />
                  <span>Start Game</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ----------------- IN-GAME OR FINISHED VIEW ----------------- */
        <div className="flex flex-col items-center">
          {/* Header Action Bar */}
          <div className="w-full flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Game:
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {currentGameMeta?.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {room.status === 'finished' && (
                <button
                  onClick={voteRematch}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Play Rematch</span>
                </button>
              )}
            </div>
          </div>

          {/* Render Game Arena */}
          {renderActiveGame()}
        </div>
      )}
    </div>
  );
};
