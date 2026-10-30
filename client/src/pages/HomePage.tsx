import React, { useState } from 'react';
import { Hero } from '../components/Hero';
import { GameCard } from '../components/GameCard';
import { GAMES_METADATA } from '@shared/games';
import { GameMetadata } from '@shared/types';
import { usePageMeta, Link } from '../router/Router';
import { AdContainer } from '../components/AdContainer';
import {
  Sparkles,
  Shield,
  Cpu,
  Zap,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Users,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface HomePageProps {
  onCreateRoom: (gameId?: string) => void;
  onJoinRoom: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onCreateRoom, onJoinRoom }) => {
  usePageMeta(
    'Friends Arcade — Instant Real-Time Multiplayer Games',
    'Play instant multiplayer games with friends in real-time. Zero signup, zero lag, private rooms, and 100% in-memory fun.',
    '/'
  );

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Classic', 'Action', 'Puzzle', 'Party'];

  const gamesList = Object.values(GAMES_METADATA);
  const filteredGames =
    selectedCategory === 'All'
      ? gamesList
      : gamesList.filter(g => g.category === selectedCategory);

  const handleSelectGame = (game: GameMetadata) => {
    onCreateRoom(game.id);
  };

  const handleScrollToGames = () => {
    document.getElementById('games-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <Hero
        onPlayNow={handleScrollToGames}
        onCreateRoom={() => onCreateRoom()}
        onJoinRoom={onJoinRoom}
      />

      {/* Non-intrusive Ad slot below Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <AdContainer format="horizontal" />
      </div>

      {/* Mini-Games Grid Section */}
      <section id="games-grid" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
              <Sparkles className="w-4 h-4" /> Instant Multiplayer Library
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white">
              Choose a Mini-Game
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map(game => (
            <GameCard key={game.id} game={game} onSelect={handleSelectGame} />
          ))}
        </div>
      </section>

      {/* Strategy Guides Highlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-purple-950/50 border border-slate-800 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                Featured Strategy Guides
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-black text-white">
                Learn Game Rules & Winning Tactics
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Whether you're mastering Chess piece movements, planning token safe-zones in multiplayer Ludo, or calculating 4-in-a-row traps in Connect Four, our original strategy guides have you covered.
              </p>
            </div>
            <Link
              to="/guides"
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 shrink-0"
            >
              <span>Explore Strategy Guides</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features / Architecture Highlights */}
      <section className="border-t border-slate-800/80 bg-slate-950/60 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-display font-black text-white mb-3">
              Built for Friends. Engineered for Speed.
            </h3>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              No bloated accounts, no trackers following you around, and zero database latency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-base mb-1">100% In-Memory State</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rooms and games live directly in server RAM using high-speed JavaScript Maps. Data self-destructs when players leave.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-base mb-1">Sub-Millisecond Sockets</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bi-directional WebSockets ensure instantaneous turns, simultaneous move reveals, and synchronized countdowns.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-base mb-1">Authoritative Game Logic</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                All game moves, winner checks, and scores are verified on the Node.js server. Zero client tampering possible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (Valuable for SEO & AdSense Content Depth) */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            Common Questions
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-black text-white">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
            <h4 className="font-bold text-white mb-1.5 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400 shrink-0" />
              Do my friends need to create an account?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              No! Friends Arcade is 100% friction-free. Simply create a room, share the 6-character room code or link, choose a nickname, and start playing immediately.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
            <h4 className="font-bold text-white mb-1.5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              What is the Zero-Database model?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              All room data and active games exist solely in volatile server RAM. When players close their tabs, rooms are automatically purged from memory. No personal data is stored.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
            <h4 className="font-bold text-white mb-1.5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              Can I play on iPhone, Android, or tablet?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Yes. The web app is fully responsive and supports touch events, responsive grids, and low-latency audio across all modern mobile browsers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
            <h4 className="font-bold text-white mb-1.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              What happens if my connection drops?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              We provide a 30-second disconnection grace period. If your Wi-Fi flickers, simply reopen the link and you will automatically rejoin your existing match.
            </p>
          </div>
        </div>
      </section>

      {/* Ad slot before Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mb-8">
        <AdContainer format="horizontal" />
      </div>
    </div>
  );
};
