import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../utils/sound';
import { X, Copy, Check, Share2, Link as LinkIcon } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, roomId }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const inviteUrl = `${window.location.origin}/?room=${roomId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    sounds.playPop();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedCode(true);
    sounds.playPop();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-extrabold text-white">Invite Friends</h2>
              <p className="text-xs text-slate-400">Share your room link or code to play together</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Room Code Card */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Room Code</span>
                <div className="text-2xl font-mono font-black text-amber-400 tracking-widest">{roomId}</div>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-colors"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Direct Invitation Link */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Direct Invitation Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300 select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 shrink-0 transition-all active:scale-95"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <LinkIcon className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Explanatory note */}
            <p className="text-[11px] text-slate-400 text-center pt-2">
              Friends opening the link can join instantly with zero login or setup required!
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
