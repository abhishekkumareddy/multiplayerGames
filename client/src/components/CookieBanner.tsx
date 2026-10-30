import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Shield, Check, X, Settings } from 'lucide-react';
import { Link } from '../router/Router';

export interface CookieConsent {
  essential: boolean; // Always true (WebSockets, room tokens, preferences)
  analytics: boolean; // Site telemetry
  advertising: boolean; // Google AdSense & personalized ads
  timestamp: string;
}

const STORAGE_KEY = 'friends_arcade_cookie_consent';

export function getStoredConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveConsent(consent: Partial<CookieConsent>): void {
  try {
    const finalConsent: CookieConsent = {
      essential: true,
      analytics: consent.analytics ?? false,
      advertising: consent.advertising ?? false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalConsent));
  } catch {}
}

export const CookieBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [advertisingEnabled, setAdvertisingEnabled] = useState(true);

  useEffect(() => {
    const existing = getStoredConsent();
    if (!existing) {
      // Delay display slightly so it doesn't jarringly block the initial render
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    saveConsent({ essential: true, analytics: true, advertising: true });
    setIsOpen(false);
  };

  const handleAcceptEssentialOnly = () => {
    saveConsent({ essential: true, analytics: false, advertising: false });
    setIsOpen(false);
  };

  const handleSavePreferences = () => {
    saveConsent({
      essential: true,
      analytics: analyticsEnabled,
      advertising: advertisingEnabled,
    });
    setIsOpen(false);
    setShowPreferences(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-xl z-50">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 md:p-6 shadow-2xl text-slate-100 ring-1 ring-white/10"
          role="dialog"
          aria-label="Cookie and Privacy Consent"
        >
          <div className="flex items-start gap-3.5 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                We Respect Your Privacy & Gaming Experience
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Friends Arcade uses essential local storage for in-room connectivity, nickname preferences, and zero-database game state. We and third-party partners (such as Google AdSense) also use cookies to deliver relevant content and analyze traffic.
              </p>
            </div>
          </div>

          {/* Preferences detail view if toggled */}
          {showPreferences && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 mb-4 space-y-2 border-t border-slate-800 pt-3 text-xs"
            >
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <div className="font-semibold text-white">Essential & Session Storage</div>
                  <div className="text-[11px] text-slate-400">Required for room codes, audio mute state, and real-time multiplayer sockets.</div>
                </div>
                <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">Always Active</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <div className="font-semibold text-white">Analytics Cookies</div>
                  <div className="text-[11px] text-slate-400">Helps us evaluate latency, server errors, and game balance.</div>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={e => setAnalyticsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <div className="font-semibold text-white">Advertising & Google Partner Cookies</div>
                  <div className="text-[11px] text-slate-400">Allows non-intrusive ads from Google AdSense and certified vendors.</div>
                </div>
                <input
                  type="checkbox"
                  checked={advertisingEnabled}
                  onChange={e => setAdvertisingEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
                />
              </div>
            </motion.div>
          )}

          <div className="flex items-center justify-between gap-2 mt-4 text-xs">
            <Link
              to="/cookie-policy"
              className="text-slate-400 hover:text-white underline decoration-slate-600 underline-offset-2 transition-colors"
            >
              Learn More
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreferences(prev => !prev)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{showPreferences ? 'Close' : 'Preferences'}</span>
              </button>

              {showPreferences ? (
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-500/20"
                >
                  Save Choices
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleAcceptEssentialOnly}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
                  >
                    Reject Non-Essential
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept All</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
