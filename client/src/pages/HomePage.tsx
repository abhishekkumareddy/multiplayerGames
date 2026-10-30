import React, { useState } from 'react';
import { Hero } from '../components/Hero';
import { GameCard } from '../components/GameCard';
import { GAMES_METADATA } from '@shared/games';
import { GameCategory, GameMetadata } from '@shared/types';
import { usePageMeta, Link } from '../router/Router';
import { AdContainer } from '../components/AdContainer';
import {
  Sparkles,
  Shield,
  Zap,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Users,
  CheckCircle2,
  Lock,
  Crown,
  Dices,
  CircleDot,
  Boxes,
  Play,
  Share2,
  Gamepad2,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface HomePageProps {
  onCreateRoom: (gameId?: string) => void;
  onJoinRoom: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onCreateRoom, onJoinRoom }) => {
  usePageMeta(
    'Friends Arcade — Instant Real-Time Multiplayer Games',
    'Play instant multiplayer games with friends in real-time. Zero signup, private rooms, Chess, Ludo, 2048, and puzzle classics across any device.',
    '/'
  );

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const categories: ('All' | GameCategory)[] = [
    'All',
    'Board Games',
    'Puzzle Games',
    'Strategy Games',
    'Casual Games',
    'Party Games',
  ];

  const gamesList = Object.values(GAMES_METADATA);
  const filteredGames =
    selectedCategory === 'All'
      ? gamesList
      : gamesList.filter(g => g.category === selectedCategory);

  const featuredGames = [
    GAMES_METADATA['chess'],
    GAMES_METADATA['ludo'],
    GAMES_METADATA['connect-four'],
  ].filter(Boolean);

  const puzzleGames = [
    GAMES_METADATA['game-2048'],
    GAMES_METADATA['sudoku'],
    GAMES_METADATA['word-guess'],
    GAMES_METADATA['memory-match'],
  ].filter(Boolean);

  const handleSelectGame = (game: GameMetadata) => {
    onCreateRoom(game.id);
  };

  const handleScrollToGames = () => {
    document.getElementById('games-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index));
  };

  const faqs = [
    {
      q: 'Do my friends need to create an account or download an app?',
      a: 'No! Friends Arcade is completely friction-free. Simply create a room, share the unique 6-character room code or invite link, pick a friendly nickname, and start playing immediately on any desktop or mobile browser.',
    },
    {
      q: 'How does real-time multiplayer synchronization work?',
      a: 'Every game connects via high-speed WebSockets directly to our dedicated gaming server. Turns, dice rolls, piece moves, and score calculations are validated server-side to guarantee accurate and synchronized gameplay for all players.',
    },
    {
      q: 'Can I play on iPhone, Android, tablets, and laptops?',
      a: 'Yes! Friends Arcade is engineered with responsive layouts, fluid touch controls, and optimized screen scaling so you can play seamlessly across smartphones, tablets, and computers.',
    },
    {
      q: 'How many players can join a game room?',
      a: 'Player counts vary by game: Chess and Connect Four support 2-player duels; Ludo, Dots and Boxes, 2048, and Sudoku support up to 4 players; Reaction Challenge supports up to 6 players; and Quick Quiz supports up to 8 players in a single room!',
    },
    {
      q: 'What happens if a player disconnects temporarily?',
      a: 'Friends Arcade includes an automatic 30-second reconnection grace period. If your Wi-Fi flickers, simply reopen the browser tab to automatically reconnect with your room.',
    },
    {
      q: 'How do player departure notifications work?',
      a: 'When any player leaves or disconnects, all remaining participants immediately receive a clear in-room notification indicating who left and the exact count of remaining players (e.g. "Abhishek left the room. 3 players remaining"). If the host leaves, host permissions are automatically transferred to the next active player.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col transition-colors">
      {/* ---------------- 1. HERO SECTION ---------------- */}
      <Hero
        onPlayNow={handleScrollToGames}
        onCreateRoom={() => onCreateRoom()}
        onJoinRoom={onJoinRoom}
      />

      {/* Non-intrusive Ad slot below Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full my-6">
        <AdContainer format="horizontal" />
      </div>

      {/* ---------------- 2. PLAY NOW & CREATE ROOM CTA ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Instant Action
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white">
              Ready to Play With Your Friends?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Create a private room in seconds or enter an existing 6-character room code to join right away.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => onCreateRoom()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Create Room</span>
            </button>
            <button
              onClick={onJoinRoom}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-sm shadow-md transition-all transform active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-blue-500" />
              <span>Join With Code</span>
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- 3. FEATURED GAMES ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
              <Crown className="w-4 h-4" /> Flagship Titles
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 dark:text-white">
              Featured Multiplayer Games
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Our most popular games featuring server-authoritative logic, turn timers, and move synchronization.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredGames.map(game => (
            <GameCard key={game.id} game={game} onSelect={handleSelectGame} />
          ))}
        </div>
      </section>

      {/* ---------------- 4. POPULAR MULTIPLAYER GAMES (ALL CATEGORIES) ---------------- */}
      <section id="games-grid" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
              <Layers className="w-4 h-4" /> Full Library (12 Playable Games)
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 dark:text-white">
              Explore Game Categories
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map(game => (
            <GameCard key={game.id} game={game} onSelect={handleSelectGame} />
          ))}
        </div>
      </section>

      {/* ---------------- 5. PUZZLE & BRAIN GAMES SPOTLIGHT ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
              <Sparkles className="w-4 h-4" /> Brain Teasers & Mind Duels
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white">
              Puzzle & Strategy Spotlight
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Challenge your friends to high-speed number sliding, word deduction, and logic battles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {puzzleGames.map(game => (
              <GameCard key={game.id} game={game} onSelect={handleSelectGame} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- 6. HOW TO PLAY (3 SIMPLE STEPS) ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider mb-2">
            <Play className="w-3.5 h-3.5" /> Simple 3-Step Setup
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 dark:text-white">
            How to Play With Friends
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
            Get your game started in under 10 seconds. No downloads, no accounts, and no complex configurations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl font-black mb-5 shadow-sm">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Create a Room
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Pick your nickname, choose your favorite avatar, and select any game from our library. A unique 6-character room code is generated immediately.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-black mb-5 shadow-sm">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Share Room Code
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Send the room code or invite link to your friends via WhatsApp, Discord, or SMS. They join directly from their browser on any device.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl font-black mb-5 shadow-sm">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Play Instantly Together
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Toggle ready status, and the host clicks Start Game. Enjoy real-time dice rolls, moves, scores, and instant rematch voting!
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- 7. WHY PLAY FRIENDS ARCADE ---------------- */}
      <section className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white mb-3">
              Why Friends Play on Friends Arcade
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
              Built specifically for friendly competition, speed, and cross-device accessibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Real-Time Multiplayer
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Bi-directional WebSockets power sub-millisecond game synchronization, simultaneous reveals, and smooth moves.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Instant Room Creation
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Create a private room in one click. No signups, passwords, or emails required to jump in with your friends.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Authoritative Game Rules
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                All game moves, chess checks, ludo captures, and scores are verified on the server for 100% fair play.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 8. GAMING & STRATEGY GUIDES PREVIEW ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-indigo-900/20 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                Featured Strategy Guides
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white">
                Learn Winning Tactics & Game Rules
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Master opening principles in Chess, safe-zone positioning in Ludo, vertical traps in Connect Four, and tile merging tactics in 2048 with our original strategy guides.
              </p>
            </div>
            <Link
              to="/guides"
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Explore Strategy Guides</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- 9. FREQUENTLY ASKED QUESTIONS ---------------- */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            Common Questions
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;

            return (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Ad slot before Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mb-8">
        <AdContainer format="horizontal" />
      </div>
    </div>
  );
};
