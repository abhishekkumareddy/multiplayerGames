import React, { useState } from 'react';
import { useRoom } from '../hooks/useRoom';
import { useRouter, Link } from '../router/Router';
import { useTheme } from '../context/ThemeContext';
import { sounds } from '../utils/sound';
import {
  Gamepad2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  LogOut,
  HelpCircle,
  Wifi,
  WifiOff,
  Menu,
  X,
  BookOpen,
  Info,
  Mail,
  Home,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';

interface NavbarProps {
  onOpenCreate: () => void;
  onOpenJoin: () => void;
  onOpenHowToPlay: () => void;
  onOpenServerConfig?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreate,
  onOpenJoin,
  onOpenHowToPlay,
  onOpenServerConfig,
}) => {
  const { room, isConnected, leaveRoom } = useRoom();
  const { path, navigate } = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isMuted, setIsMuted] = useState(sounds.isMuted);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const copyRoomCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.roomId);
    setCopied(true);
    sounds.playPop();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNavClick = (targetPath: string) => {
    setMobileMenuOpen(false);
    if (room && targetPath !== '/') {
      if (!confirm('Leave current multiplayer room to navigate to another page?')) {
        return;
      }
      leaveRoom();
    }
    navigate(targetPath);
  };

  const handleGamesScroll = () => {
    setMobileMenuOpen(false);
    if (path !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById('games-grid')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('games-grid')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isLinkActive = (target: string) => {
    if (target === '/' && path === '/') return true;
    if (target !== '/' && path.startsWith(target)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 transition-colors shadow-soft-sm dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Logo & Desktop Navigation */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => {
              if (room) {
                if (confirm('Leave current room and return to homepage?')) {
                  leaveRoom();
                  navigate('/');
                }
              } else {
                navigate('/');
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-display font-black text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                Friends<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Arcade</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {!room && (
            <nav className="hidden lg:flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleNavClick('/')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isLinkActive('/') && path === '/'
                    ? 'text-blue-600 dark:text-white bg-blue-50 dark:bg-slate-800/90'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                Home
              </button>
              <button
                type="button"
                onClick={handleGamesScroll}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
              >
                Games
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('/guides')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isLinkActive('/guides')
                    ? 'text-blue-600 dark:text-white bg-blue-50 dark:bg-slate-800/90'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                Guides
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('/about')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isLinkActive('/about')
                    ? 'text-blue-600 dark:text-white bg-blue-50 dark:bg-slate-800/90'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                About Us
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('/contact')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isLinkActive('/contact')
                    ? 'text-blue-600 dark:text-white bg-blue-50 dark:bg-slate-800/90'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                Contact Us
              </button>
            </nav>
          )}
        </div>

        {/* Center Room Code Pill (if in a room) */}
        {room && (
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-full px-3 py-1.5 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">ROOM</span>
            <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm tracking-wider">{room.roomId}</span>
            <button
              onClick={copyRoomCode}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Copy Room Code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle visual theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Connection Status Pill / Server Button */}
          <button
            onClick={onOpenServerConfig}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer hover:opacity-90 transition-all ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}
            title="Click to check backend status or ping Render server"
          >
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden md:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-rose-500 animate-bounce" />
                <span className="hidden md:inline">Connecting...</span>
              </>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title={isMuted ? 'Unmute Audio SFX' : 'Mute Audio SFX'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          </button>

          {/* How to play modal trigger */}
          <button
            onClick={onOpenHowToPlay}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="How To Play & Rules"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* If In Room: Leave Room */}
          {room ? (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to leave this room?')) {
                  leaveRoom();
                  navigate('/');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs sm:text-sm transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave</span>
            </button>
          ) : (
            /* If Not In Room: Create / Join buttons */
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenJoin}
                className="hidden sm:flex items-center px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors"
              >
                Join Room
              </button>
              <button
                onClick={onOpenCreate}
                className="flex items-center px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all"
              >
                Create Room
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          {!room && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && !room && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 px-4 pt-3 pb-5 space-y-2 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => handleNavClick('/')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-left transition-all ${
              path === '/' ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button
            type="button"
            onClick={handleGamesScroll}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 text-left transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Games Library
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('/guides')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-left transition-all ${
              path.startsWith('/guides') ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Game Guides & Strategies
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('/about')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-left transition-all ${
              path === '/about' ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Info className="w-4 h-4" />
            About Us
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('/contact')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-left transition-all ${
              path === '/contact' ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            Contact Us
          </button>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenJoin();
              }}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold text-center"
            >
              Join Room
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCreate();
              }}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold text-center shadow-md"
            >
              Create Room
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
