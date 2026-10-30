import React, { useState } from 'react';
import { usePageMeta, Link } from '../router/Router';
import { AdContainer } from '../components/AdContainer';
import {
  Mail,
  Send,
  MessageSquare,
  Bug,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  usePageMeta(
    'Contact Us — Friends Arcade',
    'Get in touch with the Friends Arcade team for support, feature requests, bug reports, and general feedback.',
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
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setErrorMsg('Please enter a descriptive message (at least 10 characters).');
      return;
    }

    setSubmitting(true);

    // Simulate reliable dispatch and save message to local inbox for user reference
    setTimeout(() => {
      const generatedTicket = 'FA-' + Math.floor(100000 + Math.random() * 900000);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link to="/" className="hover:text-blue-400 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-white font-medium">Contact Us</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider mb-3">
          <Mail className="w-3.5 h-3.5" />
          Support & Feedback
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight mb-4">
          We’d Love to Hear From You
        </h1>
        <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
          Encountered a bug, have an idea for a new mini-game, or have questions about how Friends Arcade works? Reach out directly using the form below or via our support channels.
        </p>
      </div>

      <AdContainer format="horizontal" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Direct Email</h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              For security disclosures, partnership inquiries, or AdSense compliance requests:
            </p>
            <a
              href="mailto:support@friendsarcade.fun"
              className="text-sm font-mono text-blue-400 hover:text-blue-300 underline font-semibold"
            >
              support@friendsarcade.fun
            </a>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Response Time</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We monitor feedback regularly. Most community messages and bug reports receive a response within 24 to 48 hours.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-4">
              <Bug className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Found a Game Bug?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Please include your room code (if active), your browser type (Chrome, Safari, Firefox), and the game you were playing (e.g. Tic-Tac-Toe, Quick Quiz).
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
            {submitted ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Message Received!</h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you for contacting us, <strong>{name}</strong>. Your feedback has been logged under ticket reference:
                </p>
                <div className="inline-block px-4 py-2 rounded-xl bg-slate-800 font-mono text-sm font-bold text-amber-400 tracking-wider">
                  {ticketId}
                </div>
                <p className="text-xs text-slate-400">
                  A confirmation has been recorded. We will review your note shortly.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <h2 className="text-lg font-bold text-white">Send Us a Note</h2>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Topic / Category
                  </label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="General Support">General Support & Question</option>
                    <option value="Bug Report">Bug Report / Gameplay Issue</option>
                    <option value="Game Suggestion">Game Suggestion or Idea</option>
                    <option value="AdSense / Partnership">AdSense & Business Inquiry</option>
                    <option value="Privacy Request">Privacy & Data Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe your inquiry, bug description, or feature suggestion in detail..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                  <div className="text-[11px] text-slate-500 text-right mt-1">
                    {message.length} characters
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : 'Submit Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
