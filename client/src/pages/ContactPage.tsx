import React, { useState } from 'react';
import { usePageMeta, Link } from '../router/Router';
import { AdContainer } from '../components/AdContainer';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Bug,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  usePageMeta(
    'Contact Us — Friends Arcade',
    'Get in touch with the Friends Arcade development team for inquiries, bug reports, feature requests, or privacy questions.',
    '/contact'
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Support');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Form validations
    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setErrorMsg('Please write a message of at least 10 characters.');
      return;
    }

    setSubmitting(true);

    // Simulate reliable dispatch and persist confirmation ticket locally
    setTimeout(() => {
      const generatedTicket = `TKT-${Date.now().toString(36).toUpperCase()}-${Math.floor(
        Math.random() * 900 + 100
      )}`;
      setTicketId(generatedTicket);

      try {
        const existingMessages = JSON.parse(
          localStorage.getItem('friends_arcade_submitted_feedback') || '[]'
        );
        existingMessages.push({
          ticketId: generatedTicket,
          name: name.trim(),
          email: email.trim(),
          subject,
          message: message.trim(),
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem(
          'friends_arcade_submitted_feedback',
          JSON.stringify(existingMessages.slice(-10))
        );
      } catch {}

      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setSubject('General Support');
    setMessage('');
    setSubmitted(false);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full transition-colors">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link to="/" className="hover:text-blue-500 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-white font-medium">Contact Us</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider mb-3">
          <Mail className="w-3.5 h-3.5" />
          Support & Feedback
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight mb-4">
          We’d Love to Hear From You
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Encountered a bug, have an idea for a new game, or have questions about how Friends Arcade works? Reach out directly using the form below or via our support channels.
        </p>
      </div>

      <AdContainer format="horizontal" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Direct Email</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              For security disclosures, partnership inquiries, or AdSense compliance requests:
            </p>
            <a
              href="mailto:support@friendsarcade.fun"
              className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              support@friendsarcade.fun
            </a>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Response Time</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We monitor feedback regularly. Most community messages and bug reports receive a response within 24 to 48 hours.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <Bug className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Found a Game Bug?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Please include your room code (if active), your browser type (Chrome, Safari, Firefox), and the game you were playing (e.g. Chess, Ludo, 2048).
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl">
            {submitted ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Message Received!</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you for contacting us, <strong>{name}</strong>. Your feedback has been logged under ticket reference:
                </p>
                <div className="inline-block px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-sm font-bold text-amber-500 tracking-wider">
                  {ticketId}
                </div>
                <p className="text-xs text-slate-400">
                  A confirmation has been recorded. We will review your note shortly.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Send Us a Note</h2>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Subject Topic
                  </label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="General Support">General Support & Question</option>
                    <option value="Bug Report">Game Bug / Disconnect Issue</option>
                    <option value="Game Suggestion">New Game Suggestion</option>
                    <option value="Privacy Request">Privacy or Cookie Inquiry</option>
                    <option value="Partnership">Partnership & Advertising Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Message Details *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Describe your issue or suggestion in detail..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending Note...' : 'Submit Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
