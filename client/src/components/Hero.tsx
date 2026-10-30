import React from 'react';
import { motion } from 'framer-motion';
import { Play, PlusCircle, LogIn, Sparkles, Users, Zap, ShieldCheck, Gamepad2 } from 'lucide-react';

interface HeroProps {
  onPlayNow: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onPlayNow, onCreateRoom, onJoinRoom }) => {
  return (
    <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24">
      {/* Background Soft Gradients (Theme Adaptive) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-orange-400/15 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-rose-600/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/10 dark:bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-400/10 dark:bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
        {/* Arcade Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-soft-md dark:shadow-lg mb-6 backdrop-blur-md"
        >
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Real-Time Multiplayer • Instant Room Creation
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-tight"
        >
          Your Friends.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400">
            Your Games.
          </span>{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500 dark:from-amber-400 dark:to-rose-400">
            Your Fun.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
        >
          Create a room, invite your friends with a 6-character code, and start playing multiplayer Chess, Ludo, and arcade party games instantly.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-5"
        >
          {/* Play Now Button */}
          <button
            onClick={onPlayNow}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-base shadow-soft-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white stroke-none" />
            <span>Browse Games</span>
          </button>

          {/* Create Room Button */}
          <button
            onClick={onCreateRoom}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-base shadow-soft-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create Room</span>
          </button>

          {/* Join Room Button */}
          <button
            onClick={onJoinRoom}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-slate-500 text-slate-800 dark:text-slate-100 font-bold text-base shadow-soft-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer backdrop-blur-sm"
          >
            <LogIn className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <span>Join with Code</span>
          </button>
        </motion.div>

        {/* Quick Highlights Feature Badges (Memory Claims Replaced) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-14 pt-8 border-t border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium"
        >
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Real-Time Sync</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span>Play With Friends</span>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>No Complicated Setup</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
