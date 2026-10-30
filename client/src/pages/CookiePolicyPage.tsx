import React from 'react';
import { usePageMeta, Link } from '../router/Router';
import { AdContainer } from '../components/AdContainer';
import { Cookie, CheckCircle2, Shield, Settings, Info } from 'lucide-react';
import { saveConsent } from '../components/CookieBanner';

interface CookiePolicyPageProps {
  onOpenCookieSettings?: () => void;
}

export const CookiePolicyPage: React.FC<CookiePolicyPageProps> = ({ onOpenCookieSettings }) => {
  usePageMeta(
    'Cookie Policy — Friends Arcade',
    'Comprehensive explanation of cookies, local storage items, Google advertising cookies, and how to manage your privacy consent.',
    '/cookie-policy'
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link to="/" className="hover:text-blue-400 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-white font-medium">Cookie Policy</span>
      </nav>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider mb-3">
          <Cookie className="w-3.5 h-3.5" />
          Consent & Cookie Disclosures
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight mb-2">
          Cookie Policy
        </h1>
        <p className="text-xs text-slate-400">
          Last Updated: October 30, 2026 • Effective Date: October 30, 2026
        </p>
      </div>

      <AdContainer format="horizontal" />

      <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-6">
        <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            1. What Are Cookies and Local Storage?
          </h2>
          <p>
            Cookies are small text files placed on your device by websites you visit. Similar technologies include HTML5 Local Storage, which allows client-side applications to store key-value data directly in your browser without transmitting it with every HTTP header.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Technologies We Use on Friends Arcade</h2>
          <p>
            We classify our web storage and cookies into three transparent categories:
          </p>

          <div className="space-y-4 my-4">
            {/* Category 1 */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white">Category 1: Essential & Functional Storage</span>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/20 font-bold">
                  Strictly Necessary
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Required for the website to function. Without these, real-time multiplayer connections, room codes, and sound controls cannot operate. These do not store personal tracking data.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-slate-300">
                <li><code className="text-blue-300">friends_arcade_player_name</code>: Saves your entered nickname so you don’t have to retype it in new rooms.</li>
                <li><code className="text-blue-300">friends_arcade_avatar</code>: Remembers your selected game emoji avatar.</li>
                <li><code className="text-blue-300">friends_arcade_sound_muted</code>: Remembers whether arcade audio synthesizer sound effects are muted.</li>
                <li><code className="text-blue-300">friends_arcade_cookie_consent</code>: Stores your cookie preferences and compliance choices.</li>
              </ul>
            </div>

            {/* Category 2 */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white">Category 2: Performance & Analytics</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  Optional
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Helps us analyze site traffic, identify WebSocket latency spikes, and monitor server disconnections. No personally identifiable information is collected.
              </p>
            </div>

            {/* Category 3 */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white">Category 3: Advertising & Google AdSense Cookies</span>
                <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2.5 py-0.5 rounded-full border border-purple-500/20 font-bold">
                  Consent Managed
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Google and certified third-party vendors use cookies to serve ads based on prior visits to our site and other destinations across the web. These cookies allow Google and its partners to serve ads that are relevant to users.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3 p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-400" />
            3. How to Manage and Revoke Your Consent
          </h2>
          <p>
            You have full control over non-essential cookies. You can update your choices at any time:
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {onOpenCookieSettings ? (
              <button
                type="button"
                onClick={onOpenCookieSettings}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md shadow-blue-500/20"
              >
                <Settings className="w-4 h-4" />
                <span>Open Cookie Preferences Panel</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('friends_arcade_cookie_consent');
                  window.location.reload();
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span>Reset Cookie Consent Settings</span>
              </button>
            )}
            <a
              href="https://www.aboutads.info/choices/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              Digital Advertising Alliance Opt-Out
            </a>
          </div>
        </section>

        <section className="space-y-3 border-t border-slate-800 pt-6">
          <h2 className="text-lg font-bold text-white">4. Browser-Level Controls</h2>
          <p>
            Most modern web browsers allow you to manage or block cookies through browser settings. For guidance:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
            <li><strong>Google Chrome:</strong> Settings → Privacy and Security → Cookies and other site data.</li>
            <li><strong>Mozilla Firefox:</strong> Settings → Privacy & Security → Enhanced Tracking Protection.</li>
            <li><strong>Apple Safari:</strong> Preferences → Privacy → Block all cookies.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};
