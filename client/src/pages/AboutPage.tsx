import React from 'react';
import { usePageMeta, Link } from '../router/Router';
import { AdContainer } from '../components/AdContainer';
import {
  Gamepad2,
  Users,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Code2,
  CheckCircle2,
  Crown,
  Dices,
} from 'lucide-react';

interface AboutPageProps {
  onOpenCreate?: () => void;
  onOpenJoin?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenCreate, onOpenJoin }) => {
  usePageMeta(
    'About Us — Friends Arcade',
    'Learn about Friends Arcade: our mission to provide instant, browser-based real-time multiplayer games for friends worldwide.',
    '/about'
  );

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full transition-colors">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link to="/" className="hover:text-blue-500 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-white font-medium">About Us</span>
      </nav>

      {/* Hero Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Our Mission & Platform
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Frictionless Multiplayer Gaming for Friends
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          Friends Arcade was created with one simple conviction: playing online games with friends should not require installing mobile apps, creating password-heavy accounts, or waiting through intrusive lobbies.
        </p>
      </div>

      {/* Non-intrusive Ad slot */}
      <AdContainer format="horizontal" />

      {/* Main Narrative */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">What is Friends Arcade?</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Friends Arcade is an online multiplayer gaming platform where friends can generate a unique 6-character room code, share a 1-click link (e.g. <code>https://friendsarcade.fun/?room=AB12CD</code>), and jump directly into board games, puzzle showdowns, reaction duels, and trivia competitions.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
            Every session is private to your room code. Whether you're on a laptop at work, a tablet on the sofa, or a phone on the go, our responsive web client adapts fluidly without requiring native app downloads.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Instant Room Creation & Play With Friends</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Friends Arcade is engineered for frictionless, instantaneous multiplayer gaming:
          </p>
          <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Real-Time Multiplayer:</strong> Low-latency WebSockets guarantee instant turn updates, timer synchronizations, and synchronized dice rolls.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Instant Room Creation:</strong> Launch a private game in seconds with a unique 6-character room code or shareable invitation link.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>No Complicated Setup:</strong> Zero downloads, zero password registrations, and zero complicated configurations.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Supported Games Catalog */}
      <section className="my-10">
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mb-6">
          Games Available on Friends Arcade
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-1">Chess</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Full server-authoritative chess with castling, en passant, promotion, move history, checkmate validation, and draw rules.
            </p>
            <span className="text-[11px] font-mono text-slate-400">2 Players • Board Games</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-1">Ludo Express</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Classic 2-4 player Ludo board game. Roll 6 to emerge from the yard, navigate track safe zones, capture opponents, and guide all 4 tokens home.
            </p>
            <span className="text-[11px] font-mono text-slate-400">2-4 Players • Board Games</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-amber-600 dark:text-amber-400 font-bold text-sm mb-1">Connect Four</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Gravity chip-drop grid. Connect 4 discs horizontally, vertically, or diagonally before your rival.
            </p>
            <span className="text-[11px] font-mono text-slate-400">2 Players • Strategy Games</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-purple-600 dark:text-purple-400 font-bold text-sm mb-1">Dots and Boxes</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Take turns drawing lines between dots on a 4x4 grid. Complete 4-sided boxes to claim points and earn bonus turns.
            </p>
            <span className="text-[11px] font-mono text-slate-400">2-4 Players • Strategy Games</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-orange-600 dark:text-orange-400 font-bold text-sm mb-1">2048 Battle</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Slide number tiles across the board. Merge identical numbers to double their value and compete for the highest score.
            </p>
            <span className="text-[11px] font-mono text-slate-400">2-4 Players • Puzzle Games</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-cyan-600 dark:text-cyan-400 font-bold text-sm mb-1">Sudoku Duel</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Fill the 9x9 grid with numbers 1 to 9 without repeats in any row, column, or 3x3 box. Compete for accuracy and speed.
            </p>
            <span className="text-[11px] font-mono text-slate-400">2-4 Players • Puzzle Games</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-teal-600 dark:text-teal-400 font-bold text-sm mb-1">Word Guess</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Guess the hidden 5-letter word in 6 attempts. Colored clues reveal correct letters and exact positions.
            </p>
            <span className="text-[11px] font-mono text-slate-400">2-4 Players • Puzzle Games</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-blue-600 dark:text-blue-400 font-bold text-sm mb-1">Tic-Tac-Toe Duel</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              The timeless 3-in-a-row grid duel. Turn alternation, win-line highlights, and round rematch tracking.
            </p>
            <span className="text-[11px] font-mono text-slate-400">2 Players • Casual Games</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-rose-600 dark:text-rose-400 font-bold text-sm mb-1">Rock Paper Scissors</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Simultaneous move selection with a suspenseful reveal countdown and Best-of-5 tournament scoring.
            </p>
            <span className="text-[11px] font-mono text-slate-400">2 Players • Casual Games</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-1">Memory Match</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Flip hidden cards to find matching pairs. Matching grants bonus turns and points across 2 to 4 players.
            </p>
            <span className="text-[11px] font-mono text-slate-400">2-4 Players • Casual Games</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-cyan-600 dark:text-cyan-400 font-bold text-sm mb-1">Reaction Challenge</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Precision millisecond speed showdown with synchronized green signals and false start penalties.
            </p>
            <span className="text-[11px] font-mono text-slate-400">2-6 Players • Party Games</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-purple-600 dark:text-purple-400 font-bold text-sm mb-1">Quick Quiz Trivia</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              High-speed trivia across gaming, pop culture, science, and tech. Speed bonuses reward quick thinking!
            </p>
            <span className="text-[11px] font-mono text-slate-400">2-8 Players • Party Games</span>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
          <strong>Strategic Guides:</strong> Check out our comprehensive <Link to="/guides" className="text-blue-600 dark:text-blue-300 underline font-semibold">Game Strategy Guides</Link> detailing board theory for Chess, Ludo, Connect Four, and more.
        </div>
      </section>

      {/* Technology & Infrastructure */}
      <section className="my-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-md">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-500" />
          Production Engineering Stack
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Client Layer (Netlify)</span>
            Built on React 18, Vite, TypeScript, and Tailwind CSS. Deployed on global CDN edge nodes for instant sub-second asset delivery.
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Real-Time Core (Render)</span>
            Node.js and Express server with Socket.IO persistent WebSockets. Runs authoritative game engines and sub-millisecond move broadcasts.
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Zero Asset Audio Synthesis</span>
            Custom Web Audio API synthesizer generates arcade chimes, countdown beeps, and victory fanfares without bulky sound files.
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <div className="my-10 p-8 rounded-3xl bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 border border-blue-500/20 text-center shadow-lg">
        <h3 className="text-2xl font-display font-black text-slate-900 dark:text-white mb-2">
          Ready to Challenge Your Friends?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto mb-6">
          Create a private room in under two seconds. Share the link or room code and crown the ultimate arcade champion!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onOpenCreate}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Create a Free Room</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onOpenJoin}
            className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-sm transition-all cursor-pointer"
          >
            Join Existing Room
          </button>
        </div>
      </div>
    </div>
  );
};
