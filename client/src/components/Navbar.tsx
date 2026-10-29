import React, { useState } from 'react';
import { useRoom } from '../hooks/useRoom';
import { sounds } from '../utils/sound';
import { Gamepad2, Volume2, VolumeX, Copy, Check, LogOut, HelpCircle, Wifi, WifiOff } from 'lucide-react';

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
  const [isMuted, setIsMuted] = useState(sounds.isMuted);
  const [copied, setCopied] = useState(false);

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

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => {
            if (room) {
              if (confirm('Leave current room and return to homepage?')) {
                leaveRoom();
              }
            }
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-display font-black text-lg tracking-tight text-white flex items-center gap-1.5">
              Friends<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Arcade</span>
            </span>
          </div>
        </div>

        {/* Center Room Code Pill (if in a room) */}
        {room && (
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-full px-3 py-1.5 shadow-sm">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">ROOM</span>
            <span className="font-mono font-black text-amber-400 text-sm tracking-wider">{room.roomId}</span>
            <button
              onClick={copyRoomCode}
              className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
              title="Copy Room Code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Connection Status Pill / Server Button */}
          <button
            onClick={onOpenServerConfig}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer hover:opacity-90 transition-all ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
            title="Click to check or configure backend server"
          >
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden md:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-rose-400 animate-bounce" />
                <span className="hidden md:inline">Connecting...</span>
              </>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title={isMuted ? 'Unmute Audio SFX' : 'Mute Audio SFX'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
          </button>

          {/* How to play */}
          <button
            onClick={onOpenHowToPlay}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
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
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs sm:text-sm transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave</span>
            </button>
          ) : (
            /* If Not In Room: Create / Join buttons */
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenJoin}
                className="hidden xs:flex items-center px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-colors"
              >
                Join Room
              </button>
              <button
                onClick={onOpenCreate}
                className="flex items-center px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all"
              >
                Create Room
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
