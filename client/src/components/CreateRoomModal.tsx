import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoom } from '../hooks/useRoom';
import { GameId } from '@shared/types';
import { GAMES_METADATA } from '@shared/games';
import { AVATAR_OPTIONS, getStoredPlayerName, setStoredPlayerName, getStoredAvatar, setStoredAvatar } from '../socket/socketClient';
import { sounds } from '../utils/sound';
import { X, Sparkles, PlusCircle } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGameId?: GameId;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, initialGameId }) => {
  const { createRoom, error, clearError } = useRoom();
  const [playerName, setPlayerName] = useState(getStoredPlayerName() || '');
  const [selectedAvatar, setSelectedAvatar] = useState(getStoredAvatar() || '👾');
  const [selectedGame, setSelectedGame] = useState<GameId>(initialGameId || 'chess');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setStoredPlayerName(playerName.trim());
    setStoredAvatar(selectedAvatar);

    const success = await createRoom(playerName.trim(), selectedAvatar, selectedGame);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={() => {
              clearError();
              onClose();
            }}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">Create Game Room</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Set up a private room and invite your friends</p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Player Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Your Nickname
              </label>
              <input
                type="text"
                required
                maxLength={20}
                placeholder="Enter your gamer name"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Choose Avatar
              </label>
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_OPTIONS.map(av => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setSelectedAvatar(av);
                    }}
                    className={`h-11 rounded-xl text-2xl flex items-center justify-center transition-all cursor-pointer ${
                      selectedAvatar === av
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400 scale-105 shadow-md shadow-blue-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Game Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Select Initial Game
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {Object.values(GAMES_METADATA).map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setSelectedGame(g.id);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedGame === g.id
                        ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="font-bold text-xs truncate flex-1">{g.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {g.minPlayers === g.maxPlayers ? `${g.minPlayers}P` : `${g.minPlayers}-${g.maxPlayers}P`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !playerName.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-500/25 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Room...' : 'Create Room & Enter Lobby'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
