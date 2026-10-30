import React from 'react';
import { usePageMeta, Link } from '../router/Router';
import { AdContainer } from '../components/AdContainer';
import { FileText, CheckCircle2, AlertTriangle, ShieldCheck, Scale } from 'lucide-react';

export const TermsPage: React.FC = () => {
  usePageMeta(
    'Terms and Conditions — Friends Arcade',
    'Terms of service, fair play rules, acceptable use policy, and multiplayer conduct guidelines for Friends Arcade.',
    '/terms-and-conditions'
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link to="/" className="hover:text-blue-400 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-white font-medium">Terms and Conditions</span>
      </nav>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider mb-3">
          <Scale className="w-3.5 h-3.5" />
          Legal Terms of Service
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight mb-2">
          Terms and Conditions
        </h1>
        <p className="text-xs text-slate-400">
          Last Updated: October 30, 2026 • Effective Date: October 30, 2026
        </p>
      </div>

      <AdContainer format="horizontal" />

      <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-6">
        <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or playing on <strong>Friends Arcade</strong> (<a href="https://friendsarcade.fun" className="text-blue-400 underline">https://friendsarcade.fun</a>), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please discontinue using the website immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Acceptable Use and Multiplayer Code of Conduct</h2>
          <p>
            Friends Arcade is intended for friendly, social multiplayer gaming. Users agree to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>Choose respectful player nicknames that do not contain hate speech, harassment, vulgarity, or impersonation.</li>
            <li>Maintain good sportsmanship during matches (refrain from rage-quitting to disrupt active games or griefing chat).</li>
            <li>Use the in-game chat strictly for friendly banter and game coordination.</li>
          </ul>
        </section>

        <section className="space-y-3 p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            3. Prohibited Activities
          </h2>
          <p>When using Friends Arcade, you must not:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>Attempt to reverse-engineer, decompile, or tamper with WebSocket packet protocols.</li>
            <li>Inject automated bots or scripts to gain an unfair advantage in speed or knowledge games.</li>
            <li>Execute denial-of-service (DoS) attacks, flood socket handshakes, or exploit memory allocations on our Node.js runtime.</li>
            <li>Attempt to bypass, manipulate, or artificially inflate advertisement impressions or clicks.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Intellectual Property Rights</h2>
          <p>
            All website software, game engines, UI code, graphics, branding, and original guide articles are the intellectual property of Friends Arcade and its contributors. You may not reproduce, redistribute, or mirror our content without prior written permission.
          </p>
          <p>
            Classic games (such as Chess, Tic-Tac-Toe, Rock Paper Scissors, and Connect Four) are traditional public domain game concepts, while our specific implementations, server-authoritative engine code, and visual layouts are proprietary.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">5. Service Availability & Zero-Database Disclaimer</h2>
          <p>
            Friends Arcade operates in real-time server RAM. While we strive for high uptime and smooth gameplay:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>We do not guarantee uninterrupted, bug-free, or zero-latency service.</li>
            <li>Server updates or cold-starts on our hosting platform may occasionally reset active rooms.</li>
            <li>We reserve the right to modify, suspend, or discontinue any game mode or feature at any time without liability.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, Friends Arcade and its operators shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your access to or inability to use the service.
          </p>
        </section>

        <section className="space-y-3 border-t border-slate-800 pt-6">
          <h2 className="text-lg font-bold text-white">7. Governing Law & Updates to Terms</h2>
          <p>
            We may revise these Terms and Conditions periodically to reflect feature additions or legal obligations. The revised terms take effect immediately upon being posted on this page.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Questions regarding our Terms? Contact us at <a href="mailto:support@friendsarcade.fun" className="text-blue-400 underline">support@friendsarcade.fun</a>.
          </p>
        </section>
      </div>
    </div>
  );
};
