import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoom } from '../hooks/useRoom';
import { AVATAR_OPTIONS, getStoredPlayerName, setStoredPlayerName, getStoredAvatar, setStoredAvatar } from '../socket/socketClient';
import { sounds } from '../utils/sound';
import { X, LogIn, ArrowRight } from 'lucide-react';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRoomCode?: string;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ isOpen, onClose, defaultRoomCode = '' }) => {
  const { joinRoom, error, clearError } = useRoom();
  const [roomCode, setRoomCode] = useState(defaultRoomCode);
  const [playerName, setPlayerName] = useState(getStoredPlayerName() || '');
  const [selectedAvatar, setSelectedAvatar] = useState(getStoredAvatar() || '🦊');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultRoomCode) {
      setRoomCode(defaultRoomCode.toUpperCase().trim());
    }
  }, [defaultRoomCode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCode.trim().toUpperCase();
    const cleanName = playerName.trim();

    if (cleanCode.length !== 6 || !cleanName || isSubmitting) return;

    setIsSubmitting(true);
    setStoredPlayerName(cleanName);
    setStoredAvatar(selectedAvatar);

    const success = await joinRoom(cleanCode, cleanName, selectedAvatar);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={() => {
              clearError();
              onClose();
            }}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <LogIn className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-extrabold text-white">Join Game Room</h2>
              <p className="text-xs text-slate-400">Enter the 6-character room code shared by your friend</p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              {error.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Room Code */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Room Code (6 Characters)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="e.g. AB12CD"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-amber-400 font-mono font-black text-xl tracking-widest uppercase placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center transition-all"
              />
            </div>

            {/* Player Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Your Display Name
              </label>
              <input
                type="text"
                required
                maxLength={20}
                placeholder="e.g. SpeedRunner"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm transition-all"
              />
            </div>

            {/* Avatar Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Choose Avatar
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_OPTIONS.map(av => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setSelectedAvatar(av);
                    }}
                    className={`h-11 rounded-xl text-2xl flex items-center justify-center transition-all ${
                      selectedAvatar === av
                        ? 'bg-emerald-600 ring-2 ring-emerald-400 scale-105 shadow-md shadow-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || roomCode.trim().length !== 6 || !playerName.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Joining Room...' : 'Join Room'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
