import React, { useState } from 'react';
import { Hero } from '../components/Hero';
import { GameCard } from '../components/GameCard';
import { GAMES_METADATA } from '@shared/games';
import { GameMetadata } from '@shared/types';
import { Sparkles, Shield, Cpu, Zap, Heart } from 'lucide-react';

interface HomePageProps {
  onCreateRoom: (gameId?: string) => void;
  onJoinRoom: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onCreateRoom, onJoinRoom }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Classic', 'Action', 'Puzzle', 'Party'];

  const gamesList = Object.values(GAMES_METADATA);
  const filteredGames = selectedCategory === 'All'
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

      {/* Features / Architecture Highlights */}
      <section className="border-t border-slate-800/80 bg-slate-950/60 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-display font-black text-white mb-3">
              Built for Friends. Engineered for Speed.
            </h3>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              No bloated accounts, no cookies tracking you, and absolutely zero database latency.
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

      {/* Arcade Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-white">Friends Arcade</span>
            <span>—</span>
            <span>Instant Real-Time Multiplayer</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Pure WebSockets • Zero Database • Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </footer>
    </div>
  );
};
