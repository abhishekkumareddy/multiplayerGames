import React, { useState, useEffect, Suspense, lazy } from 'react';
import { RoomProvider, useRoom } from './hooks/useRoom';
import { RouterProvider, useRouter } from './router/Router';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { HomePage } from './pages/HomePage';
import { RoomPage } from './pages/RoomPage';
import { CreateRoomModal } from './components/CreateRoomModal';
import { JoinRoomModal } from './components/JoinRoomModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { ServerConfigModal } from './components/ServerConfigModal';
import { GameId } from '@shared/types';
import { api } from './api';
import { Loader2 } from 'lucide-react';

// Lazy-load informational and educational pages to optimize initial bundle size & performance
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage').then(m => ({ default: m.CookiePolicyPage })));
const GuidesPage = lazy(() => import('./pages/GuidesPage').then(m => ({ default: m.GuidesPage })));

const PageLoader: React.FC = () => (
  <div className="flex-1 flex items-center justify-center min-h-[50vh] text-slate-500">
    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
  </div>
);

const MainApp: React.FC = () => {
  const { room, isConnected } = useRoom();
  const { path } = useRouter();

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

  const handleOpenCookieSettings = () => {
    localStorage.removeItem('friends_arcade_cookie_consent');
    window.location.reload();
  };

  // Determine active view when not in an active room
  const renderPageContent = () => {
    if (room) {
      return <RoomPage />;
    }

    if (path === '/about') {
      return (
        <AboutPage
          onOpenCreate={() => handleOpenCreate()}
          onOpenJoin={() => handleOpenJoin()}
        />
      );
    }

    if (path === '/contact') {
      return <ContactPage />;
    }

    if (path === '/privacy-policy') {
      return <PrivacyPolicyPage />;
    }

    if (path === '/terms-and-conditions') {
      return <TermsPage />;
    }

    if (path === '/cookie-policy') {
      return <CookiePolicyPage onOpenCookieSettings={handleOpenCookieSettings} />;
    }

    if (path.startsWith('/guides')) {
      return (
        <GuidesPage
          onOpenCreate={handleOpenCreate}
          onOpenJoin={() => handleOpenJoin()}
        />
      );
    }

    // Default: Homepage with Games library
    return (
      <HomePage
        onCreateRoom={handleOpenCreate}
        onJoinRoom={() => handleOpenJoin()}
      />
    );
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

      {/* Main Content: Room Page vs Static / Educational Pages */}
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<PageLoader />}>
          {renderPageContent()}
        </Suspense>
      </main>

      {/* Persistent Footer on non-room pages */}
      {!room && (
        <Footer
          onOpenCreate={handleOpenCreate}
          onOpenJoin={() => handleOpenJoin()}
          onOpenCookieSettings={handleOpenCookieSettings}
        />
      )}

      {/* Cookie Consent Manager Banner */}
      <CookieBanner />

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
    <RouterProvider>
      <RoomProvider>
        <MainApp />
      </RoomProvider>
    </RouterProvider>
  );
};

export default App;
