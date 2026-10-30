import React from 'react';
import { usePageMeta, Link } from '../router/Router';
import { AdContainer } from '../components/AdContainer';
import { Shield, Lock, Eye, Server, Cookie, HelpCircle } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  usePageMeta(
    'Privacy Policy — Friends Arcade',
    'Transparent privacy policy detailing real-time multiplayer architecture, local storage usage, Google AdSense cookies, and user privacy rights.',
    '/privacy-policy'
  );

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full transition-colors">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link to="/" className="hover:text-blue-500 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-white font-medium">Privacy Policy</span>
      </nav>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider mb-3">
          <Shield className="w-3.5 h-3.5" />
          Data & Privacy Transparency
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Last Updated: October 30, 2026 • Effective Date: October 30, 2026
        </p>
      </div>

      <AdContainer format="horizontal" />

      <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-6">
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            1. Overview & Privacy-First Architecture
          </h2>
          <p>
            At <strong>Friends Arcade</strong> (accessible at <a href="https://friendsarcade.fun" className="text-blue-600 dark:text-blue-400 underline">https://friendsarcade.fun</a>), we prioritize user privacy. Friends Arcade requires no account registration, passwords, or credit card credentials to play.
          </p>
          <p className="mt-2">
            Multiplayer game rooms, chat messages, and player nicknames are utilized strictly during active gameplay sessions and are automatically cleaned up when players leave the room.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Information We Collect and Process</h2>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">A. Information Provided Voluntarily by You</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
            <li><strong>Player Name & Avatar:</strong> When creating or joining a room, you select a temporary screen name and emoji avatar. This is broadcast to peers in your private room only.</li>
            <li><strong>Room Messages & Moves:</strong> In-game chat messages and move actions are routed over real-time WebSockets to synchronized peers.</li>
            <li><strong>Support Inquiries:</strong> If you submit feedback via our Contact page or direct email, we process your name, email, and message content to respond.</li>
          </ul>

          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-4">B. Information Collected Automatically</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
            <li><strong>Socket Session Identifiers:</strong> Ephemeral alphanumeric IDs assigned by Socket.IO to manage connection state.</li>
            <li><strong>Technical Telemetry:</strong> IP addresses, browser types, and HTTP headers processed temporarily by our hosting infrastructure (Netlify, Render, Cloudflare) for network routing, security, and DDoS mitigation.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Cookies and Local Storage Technologies</h2>
          <p>
            We use your browser’s <strong>HTML5 Local Storage</strong> strictly to enhance your gameplay experience without tracking you across third-party websites:
          </p>
          <div className="overflow-x-auto my-3">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="p-3">Key Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950/40">
                <tr>
                  <td className="p-3 font-mono text-blue-600 dark:text-blue-300">friends_arcade_player_name</td>
                  <td className="p-3">Local Storage</td>
                  <td className="p-3">Remembers your preferred nickname across sessions.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-blue-600 dark:text-blue-300">friends_arcade_avatar</td>
                  <td className="p-3">Local Storage</td>
                  <td className="p-3">Saves your preferred emoji avatar.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-blue-600 dark:text-blue-300">friends_arcade_theme</td>
                  <td className="p-3">Local Storage</td>
                  <td className="p-3">Remembers your light / dark mode appearance preference.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-blue-600 dark:text-blue-300">friends_arcade_sound_muted</td>
                  <td className="p-3">Local Storage</td>
                  <td className="p-3">Remembers sound effects mute preference.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-blue-600 dark:text-blue-300">friends_arcade_cookie_consent</td>
                  <td className="p-3">Local Storage</td>
                  <td className="p-3">Stores your consent choices for privacy and advertising.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-500" />
            4. Google AdSense & Third-Party Advertising
          </h2>
          <p>
            Friends Arcade is designed to support non-intrusive advertising provided by Google AdSense and third-party advertising networks.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300 mt-2">
            <li>Google and other third-party vendors use cookies (such as the DoubleClick DART cookie) to serve advertisements based on prior visits to our website or other sites on the Internet.</li>
            <li>Users in the European Economic Area (EEA), UK, and Switzerland are presented with a consent banner allowing granular control over advertising cookies in accordance with the ePrivacy Directive and GDPR.</li>
            <li>You may opt out of personalized advertising at any time by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-medium">Google Ads Settings</a> or <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-medium">aboutads.info</a>.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Third-Party Hosting & Service Providers</h2>
          <p>Friends Arcade relies on reputable global cloud infrastructure providers:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
            <li><strong>Netlify, Inc.:</strong> Hosts static client distribution bundles at global edge locations.</li>
            <li><strong>Render Services, Inc.:</strong> Runs our authoritative Express & WebSocket Node.js backend server.</li>
            <li><strong>Cloudflare, Inc.:</strong> Provides SSL/TLS termination and DDoS mitigation.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">6. Data Retention & Deletion</h2>
          <p>
            Ephemeral Game Data Lifecycle:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
            <li>Room memory is purged 60 seconds after all players leave.</li>
            <li>Inactive idle rooms are garbage collected after 60 minutes.</li>
            <li>Local storage items can be cleared at any time directly through your web browser settings.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">7. User Rights (GDPR & CCPA/CPRA)</h2>
          <p>
            Under global privacy frameworks including GDPR (General Data Protection Regulation) and California Consumer Privacy Acts:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
            <li><strong>Right to Know & Access:</strong> You have the right to request information regarding any personal data we process.</li>
            <li><strong>Right to Erasure:</strong> You can request deletion of any support tickets or correspondence you sent us.</li>
            <li><strong>Right to Opt-Out:</strong> You can decline non-essential and advertising cookies using our Cookie Settings banner.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">8. Contact Information</h2>
          <p>
            If you have questions, feedback, or requests regarding this Privacy Policy or your data rights, please contact our team:
          </p>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <div><strong>Email:</strong> <a href="mailto:support@friendsarcade.fun" className="text-blue-600 dark:text-blue-400 underline">support@friendsarcade.fun</a></div>
            <div className="mt-1"><strong>Website:</strong> <a href="https://friendsarcade.fun" className="text-blue-600 dark:text-blue-400 underline">https://friendsarcade.fun</a></div>
          </div>
        </section>
      </div>
    </div>
  );
};
