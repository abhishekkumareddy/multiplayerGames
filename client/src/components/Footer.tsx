import React from 'react';
import { Link } from '../router/Router';
import { Gamepad2, Shield, Heart, Sparkles, BookOpen, Mail, Cookie, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface FooterProps {
  onOpenCreate?: (gameId?: string) => void;
  onOpenJoin?: () => void;
  onOpenCookieSettings?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCreate,
  onOpenJoin,
  onOpenCookieSettings,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 text-slate-600 dark:text-slate-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Col 1: Brand & Features */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group inline-block">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-black text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Friends<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Arcade</span>
              </span>
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Modern, browser-based multiplayer games designed for playing with friends. Instant room creation, multiple games, real-time WebSockets, and no complicated setup.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Multiplayer</span>
            </div>
          </div>

          {/* Col 2: Playable Games */}
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Popular Games
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenCreate?.('chess')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                >
                  Chess (Multiplayer 1v1)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenCreate?.('ludo')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                >
                  Ludo (2-4 Players)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenCreate?.('tic-tac-toe')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                >
                  Tic-Tac-Toe (Duel)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenCreate?.('connect-four')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                >
                  Connect Four (Grid Battle)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenCreate?.('memory-match')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                >
                  Memory Match (Party)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenCreate?.('quick-quiz')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                >
                  Quick Quiz (Trivia Mania)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Strategy Guides */}
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Strategy Guides
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/guides/chess-rules-and-pieces" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  How to Play Chess & Rules
                </Link>
              </li>
              <li>
                <Link to="/guides/chess-strategies-for-beginners" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Chess Strategies for Beginners
                </Link>
              </li>
              <li>
                <Link to="/guides/how-to-play-ludo" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  How to Play Multiplayer Ludo
                </Link>
              </li>
              <li>
                <Link to="/guides/ludo-winning-strategies" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Ludo Winning Tactics & Tips
                </Link>
              </li>
              <li>
                <Link to="/guides/connect-four-tactics" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Connect Four Tactics
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-blue-600 dark:text-blue-400 font-semibold inline-flex items-center gap-1">
                  View All Guides →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Controls */}
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-500" />
              Company & Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  About Friends Arcade
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              {onOpenCookieSettings && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenCookieSettings}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 text-left"
                  >
                    <Cookie className="w-3.5 h-3.5" />
                    <span>Cookie Preferences</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom copyright & Theme Toggle */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} Friends Arcade. All rights reserved.</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium border border-slate-200 dark:border-slate-700"
              title="Toggle Light / Dark mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span>React • Node.js • WebSockets • Render</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for multiplayer friends
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
