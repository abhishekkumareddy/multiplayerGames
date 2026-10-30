import React, { useState, useEffect } from 'react';
import { RoomProvider, useRoom } from './hooks/useRoom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { RoomPage } from './pages/RoomPage';
import { CreateRoomModal } from './components/CreateRoomModal';
import { JoinRoomModal } from './components/JoinRoomModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { ServerConfigModal } from './components/ServerConfigModal';
import { GameId } from '@shared/types';
import { api } from './api';

const MainApp: React.FC = () => {
  const { room, isConnected } = useRoom();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isServerConfigOpen, setIsServerConfigOpen] = useState(false);
  const [selectedGameForCreate, setSelectedGameForCreate] = useState<GameId | undefined>();
  const [prefilledJoinCode, setPrefilledJoinCode] = useState<string>('');

  // Check backend health & wake sleeping Render free-tier instance on page load
  useEffect(() => {
    api.checkHealth().catch(() => {
      // Background health check; Socket.IO autoConnect will connect when ready
    });
  }, []);

  // Check URL parameters for invitation links, e.g. /?room=AB12CD or /room/AB12CD
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const roomFromQuery = searchParams.get('room');

    let codeToUse = roomFromQuery;
    if (!codeToUse && window.location.pathname.startsWith('/room/')) {
      codeToUse = window.location.pathname.replace('/room/', '');
    }

    if (codeToUse && codeToUse.length === 6 && !room) {
      setPrefilledJoinCode(codeToUse.toUpperCase());
      setIsJoinOpen(true);
    }
  }, [room]);

  const handleOpenCreate = (gameId?: string) => {
    setSelectedGameForCreate(gameId as GameId | undefined);
    setIsCreateOpen(true);
  };

  const handleOpenJoin = (code?: string) => {
    if (code) setPrefilledJoinCode(code);
    setIsJoinOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenCreate={() => handleOpenCreate()}
        onOpenJoin={() => handleOpenJoin()}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onOpenServerConfig={() => setIsServerConfigOpen(true)}
      />

      {/* Main Content: Room Lobby/Game vs HomePage */}
      <main className="flex-1 flex flex-col">
        {room ? (
          <RoomPage />
        ) : (
          <HomePage
            onCreateRoom={handleOpenCreate}
            onJoinRoom={() => handleOpenJoin()}
          />
        )}
      </main>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        initialGameId={selectedGameForCreate}
      />

      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        defaultRoomCode={prefilledJoinCode}
      />

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      <ServerConfigModal
        isOpen={isServerConfigOpen}
        onClose={() => setIsServerConfigOpen(false)}
        isConnected={isConnected}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <RoomProvider>
      <MainApp />
    </RoomProvider>
  );
};

export default App;
