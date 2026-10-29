import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GAMES_METADATA } from '@shared/games';
import { X, HelpCircle, Users, CheckCircle, Zap } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'games'>('basics');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] flex flex-col"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-extrabold text-white">How To Play</h2>
              <p className="text-xs text-slate-400">Everything you need to know to play with friends</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-slate-800/80 rounded-2xl mb-6">
            <button
              onClick={() => setActiveTab('basics')}
              className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'basics' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🚀 3 Simple Steps
            </button>
            <button
              onClick={() => setActiveTab('games')}
              className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'games' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🎮 Game Rules
            </button>
          </div>

          {/* Tab Content */}
          <div className="overflow-y-auto pr-2 space-y-4 flex-1">
            {activeTab === 'basics' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Create a Room</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Pick your display name, choose a cool avatar, and pick your initial game. A unique 6-character room code will be generated immediately.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Invite Friends</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Copy the room code or send the 1-click invitation link. Your friends don't need an account or app install — just click and play in any browser.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Ready Up & Compete!</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Everyone clicks "Ready", host starts the game, and all actions sync in real-time with authoritative server rules!
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    Zero database storage: games exist purely in server runtime memory for maximum privacy and zero latency.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.values(GAMES_METADATA).map(g => (
                  <div key={g.id} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-sm">{g.name}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                        {g.minPlayers === g.maxPlayers ? `${g.minPlayers}P` : `${g.minPlayers}-${g.maxPlayers}P`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{g.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
