import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import { Calendar, Clock, HandHeart, MessageCircle, Search, BookOpen } from "lucide-react";
import { getCache, setCache } from "../utils/cache";

const readingTime = (html) => {
  const words = html?.replace(/<[^>]+>/g, "").split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(words / 200));
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });

function ArticleCard({ article, index }) {
  return (
    <Link
      to={`/blog/${article.slug}`}
      data-aos="fade-up"
      data-aos-delay={index * 100}
      data-aos-duration="800"
      className="group flex flex-col bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/40 hover:bg-white/[0.05] transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.08)]"
    >
      {/* Cover */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-indigo-900/40 to-purple-900/30">
        {article.cover_url ? (
          <img
            src={article.cover_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-indigo-500/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030014]/70 to-transparent" />
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 mb-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-xs text-gray-400 line-clamp-3 mb-4 flex-1 leading-relaxed">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-auto pt-3 border-t border-white/5">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(article.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {readingTime(article.content)} min
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <HandHeart className="w-3 h-3 text-pink-400" />
            {article.claps ?? 0}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Blog() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const cached = getCache("blog_articles");
    if (cached) {
      setArticles(cached);
      setLoading(false);
      // Silently refresh in background
      supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_url, claps, created_at, content")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          if (data) { setArticles(data); setCache("blog_articles", data); }
        });
      return;
    }
    supabase
      .from("articles")
      .select("id, title, slug, excerpt, cover_url, claps, created_at, content")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const articles = data || [];
        setArticles(articles);
        setCache("blog_articles", articles);
        setLoading(false);
      });
  }, []);

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section id="Blog" className="px-[5%] lg:px-[10%] py-10 md:py-[5%]">
      {/* Header */}
      <div className="text-center mb-10">
        <h2
          data-aos="fade-down"
          data-aos-duration="1000"
          className="inline-block text-3xl md:text-5xl font-bold text-transparent bg-clip-text"
          style={{
            backgroundImage: "linear-gradient(45deg, #6366f1 10%, #a855f7 93%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Blog & Articles
        </h2>
        <p
          data-aos="fade-up"
          data-aos-duration="1100"
          className="text-slate-400 max-w-xl mx-auto text-sm md:text-base mt-2"
        >
          Writings about QA, testing, tech, and other interesting things.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto mb-8" data-aos="fade-up" data-aos-duration="900">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search articles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{search ? "No articles found." : "No articles published yet."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article, i) => (
            <ArticleCard key={article.id} article={article} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
