import React, { useState } from 'react';
import { usePageMeta, Link, useRouter } from '../router/Router';
import { GUIDES, GuideArticle } from '../data/guidesData';
import { AdContainer } from '../components/AdContainer';
import {
  BookOpen,
  Sparkles,
  Clock,
  ArrowRight,
  Gamepad2,
  ChevronRight,
  Search,
  CheckCircle2,
  Share2,
} from 'lucide-react';

interface GuidesPageProps {
  onOpenCreate?: (gameId?: string) => void;
  onOpenJoin?: () => void;
}

export const GuidesPage: React.FC<GuidesPageProps> = ({ onOpenCreate, onOpenJoin }) => {
  const { path } = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Check if we are viewing a specific guide article by matching /guides/:slug
  const activeSlug = path.startsWith('/guides/') ? path.replace('/guides/', '').trim() : null;
  const activeArticle = activeSlug ? GUIDES.find(g => g.slug === activeSlug) : null;

  // Set SEO metadata dynamically
  if (activeArticle) {
    usePageMeta(
      `${activeArticle.title} — Friends Arcade Guides`,
      activeArticle.summary,
      `/guides/${activeArticle.slug}`
    );
  } else {
    usePageMeta(
      'Multiplayer Game Guides & Strategies — Friends Arcade',
      'Original, comprehensive gaming guides and strategies for Chess, Ludo, Connect Four, Tic-Tac-Toe, and party mini-games.',
      '/guides'
    );
  }

  // If viewing a single article
  if (activeArticle) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link to="/" className="hover:text-blue-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/guides" className="hover:text-blue-400 transition-colors">
            Guides
          </Link>
          <span>/</span>
          <span className="text-white font-medium truncate max-w-xs">{activeArticle.title}</span>
        </nav>

        {/* Article Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
              {activeArticle.category} Strategy
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              {activeArticle.readTime}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400">{activeArticle.publishedDate}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight mb-4 leading-tight">
            {activeArticle.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed border-l-2 border-blue-500 pl-4 py-1 italic bg-slate-900/40 rounded-r-xl">
            {activeArticle.subtitle}
          </p>
        </div>

        {/* Ad container atop article */}
        <AdContainer format="horizontal" />

        {/* Article Body */}
        <div className="my-8 space-y-8">
          {activeArticle.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight">
                {section.heading}
              </h2>

              <div className="space-y-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                {section.content.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>

              {section.tips && section.tips.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/30 my-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                    <Sparkles className="w-4 h-4" />
                    Pro Tip & Strategy Note
                  </div>
                  {section.tips.map((tip, tIdx) => (
                    <div key={tIdx} className="flex items-start gap-2 text-xs sm:text-sm text-blue-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Playable Game Link Box if applicable */}
        {activeArticle.gameId && onOpenCreate && (
          <div className="my-8 p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
                <Gamepad2 className="w-5 h-5 text-blue-400" />
                Put Your Strategy to the Test!
              </h3>
              <p className="text-xs text-slate-400">
                Play {activeArticle.title.split(':')[0]} with friends in an instant private room.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenCreate(activeArticle.gameId)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 shrink-0"
            >
              <span>Play Game Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Ad container at end of article */}
        <AdContainer format="horizontal" />

        {/* Related Guides Footer */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4">Explore More Guides</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GUIDES.filter(g => g.slug !== activeArticle.slug)
              .slice(0, 4)
              .map(rel => (
                <Link
                  key={rel.slug}
                  to={`/guides/${rel.slug}`}
                  className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 transition-all group"
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-1">
                    {rel.category}
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {rel.subtitle}
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </div>
    );
  }

  // Guides Catalog View
  const categories = ['All', 'Chess', 'Ludo', 'Arcade', 'Strategy'];

  const filteredGuides = GUIDES.filter(guide => {
    const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
    const matchesQuery =
      searchQuery === '' ||
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link to="/" className="hover:text-blue-400 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-white font-medium">Game Guides & Strategies</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          Original Gaming Education
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight mb-4">
          Game Guides, Rules & Strategy
        </h1>
        <p className="text-base text-slate-300 max-w-3xl leading-relaxed">
          Level up your gaming knowledge. Master the piece movements and openings of Chess, learn probability and safe-zone rotations in multiplayer Ludo, and discover mathematical win conditions in classic arcade duels.
        </p>
      </div>

      <AdContainer format="horizontal" />

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 my-6">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guides & rules..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        {filteredGuides.map(guide => (
          <Link
            key={guide.slug}
            to={`/guides/${guide.slug}`}
            className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-bold uppercase tracking-wider">
                  {guide.category}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  {guide.readTime}
                </span>
              </div>

              <h2 className="text-xl font-display font-bold text-white group-hover:text-blue-300 transition-colors mb-2 leading-snug">
                {guide.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4 line-clamp-3">
                {guide.summary}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
              <span>Read Full Guide</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {filteredGuides.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400">
          No strategy guides matched your search criteria.
        </div>
      )}
    </div>
  );
};
