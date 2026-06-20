import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Footer from "../components/Footer";
import Swal from "sweetalert2";
import {
  Calendar, Clock, ArrowLeft, HandHeart, MessageCircle,
  Send, Copy, Check, Twitter, ChevronRight, CornerDownRight,
} from "lucide-react";

const readingTime = (html) => {
  const words = html?.replace(/<[^>]+>/g, "").split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(words / 200));
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });

const swal = (opts) =>
  Swal.fire({ background: "#030014", color: "#ffffff", confirmButtonColor: "#6366f1", ...opts });

// ── Clap button ───────────────────────────────────────────────────────────────
const MAX_CLAPS = 50;

function ClapButton({ articleId, totalClaps }) {
  const key = `clap_${articleId}`;
  const [userClaps, setUserClaps] = useState(() => Number(localStorage.getItem(key) || 0));
  const [displayTotal, setDisplayTotal] = useState(totalClaps ?? 0);
  const [burst, setBurst] = useState(false);
  const [delta, setDelta] = useState(0);
  const pendingRef = useRef(0);
  const timerRef = useRef(null);
  const deltaTimerRef = useRef(null);

  const clap = useCallback(() => {
    if (userClaps >= MAX_CLAPS) return;
    const next = userClaps + 1;
    setUserClaps(next);
    setDisplayTotal((t) => t + 1);
    localStorage.setItem(key, String(next));
    setBurst(true);
    setTimeout(() => setBurst(false), 300);
    pendingRef.current += 1;
    setDelta((d) => d + 1);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const amount = pendingRef.current;
      pendingRef.current = 0;
      await supabase.rpc("increment_article_claps", {
        p_article_id: Number(articleId),
        p_amount: amount,
      });
    }, 1500);

    clearTimeout(deltaTimerRef.current);
    deltaTimerRef.current = setTimeout(() => setDelta(0), 1800);
  }, [articleId, key, userClaps]);

  const remaining = MAX_CLAPS - userClaps;

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div className="relative">
        {delta > 0 && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold text-pink-400 animate-bounce pointer-events-none">
            +{delta}
          </span>
        )}
        <button
          onClick={clap}
          disabled={remaining === 0}
          className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            burst
              ? "scale-125 border-pink-400 bg-pink-500/20"
              : "border-white/20 hover:border-pink-400/60 hover:bg-pink-500/10"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <HandHeart className={`w-6 h-6 transition-colors duration-200 ${userClaps > 0 ? "text-pink-400" : "text-gray-400"}`} />
        </button>
      </div>
      <span className="text-sm font-semibold text-white">{displayTotal}</span>
      {remaining > 0 && remaining < MAX_CLAPS && (
        <span className="text-[10px] text-gray-600">{remaining} left</span>
      )}
    </div>
  );
}

// ── Share panel ───────────────────────────────────────────────────────────────
function SharePanel({ title }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tweet = () =>
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 mr-1">Share:</span>
      <button
        onClick={tweet}
        title="Share to Twitter/X"
        className="p-2 rounded-full border border-white/10 text-gray-400 hover:text-sky-400 hover:border-sky-400/30 transition-all"
      >
        <Twitter className="w-4 h-4" />
      </button>
      <button
        onClick={copy}
        title="Copy link"
        className="p-2 rounded-full border border-white/10 text-gray-400 hover:text-indigo-300 hover:border-indigo-500/30 transition-all"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ── Comments with reply support ───────────────────────────────────────────────
function Comments({ articleId }) {
  const [threads, setThreads] = useState([]); // [{ ...comment, replies: [] }]
  const [form, setForm] = useState({ name: "", message: "" });
  const [replyState, setReplyState] = useState({}); // { [parentId]: { name, message } }
  const [openReply, setOpenReply] = useState(null); // parentId with open reply box
  const [submitting, setSubmitting] = useState(false);
  const [replySubmitting, setReplySubmitting] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("article_comments")
      .select("*")
      .eq("article_id", articleId)
      .order("created_at", { ascending: true });

    const all = data || [];
    const top = all.filter((c) => !c.parent_id);
    const replies = all.filter((c) => c.parent_id);
    setThreads(
      top.map((c) => ({
        ...c,
        replies: replies.filter((r) => r.parent_id === c.id),
      }))
    );
  }, [articleId]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("article_comments").insert({
      article_id: articleId,
      name: form.name.trim(),
      message: form.message.trim(),
    });
    setSubmitting(false);
    if (!error) {
      setForm({ name: "", message: "" });
      load();
    } else {
      swal({ title: "Failed", text: "Failed to send comment.", icon: "error" });
    }
  };

  const submitReply = async (e, parentId) => {
    e.preventDefault();
    const r = replyState[parentId] || {};
    if (!r.name?.trim() || !r.message?.trim()) return;
    setReplySubmitting(parentId);
    const { error } = await supabase.from("article_comments").insert({
      article_id: articleId,
      parent_id: parentId,
      name: r.name.trim(),
      message: r.message.trim(),
    });
    setReplySubmitting(null);
    if (!error) {
      setReplyState((prev) => ({ ...prev, [parentId]: { name: "", message: "" } }));
      setOpenReply(null);
      load();
    } else {
      swal({ title: "Failed", text: "Failed to send reply.", icon: "error" });
    }
  };

  const setReply = (parentId, key, val) =>
    setReplyState((prev) => ({
      ...prev,
      [parentId]: { ...(prev[parentId] || {}), [key]: val },
    }));

  const totalCount = threads.reduce((s, t) => s + 1 + t.replies.length, 0);

  return (
    <div className="mt-14">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-indigo-400" />
        Comments ({totalCount})
      </h3>

      {/* Comment threads */}
      <div className="space-y-5 mb-10">
        {threads.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet. Be the first!</p>
        ) : (
          threads.map((c) => (
            <div key={c.id}>
              {/* Parent comment */}
              <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {c.name[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-white">{c.name}</span>
                  <span className="text-xs text-gray-600 ml-auto">{formatDate(c.created_at)}</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed pl-9">{c.message}</p>
                <div className="pl-9 mt-2">
                  <button
                    onClick={() => setOpenReply(openReply === c.id ? null : c.id)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                  >
                    <CornerDownRight className="w-3 h-3" />
                    {openReply === c.id ? "Cancel" : "Reply"}
                  </button>
                </div>
              </div>

              {/* Replies */}
              {c.replies.length > 0 && (
                <div className="ml-6 mt-2 space-y-2 border-l border-white/8 pl-4">
                  {c.replies.map((r) => (
                    <div key={r.id} className="bg-white/[0.02] border border-white/6 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {r.name[0].toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-white">{r.name}</span>
                        <span className="text-[11px] text-gray-600 ml-auto">{formatDate(r.created_at)}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed pl-8">{r.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply form */}
              {openReply === c.id && (
                <form
                  onSubmit={(e) => submitReply(e, c.id)}
                  className="ml-6 mt-2 border-l border-indigo-500/30 pl-4 space-y-2"
                >
                  <input
                    value={replyState[c.id]?.name || ""}
                    onChange={(e) => setReply(c.id, "name", e.target.value)}
                    placeholder="Your name"
                    maxLength={60}
                    required
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                  <textarea
                    value={replyState[c.id]?.message || ""}
                    onChange={(e) => setReply(c.id, "message", e.target.value)}
                    placeholder="Write a reply…"
                    rows={2}
                    maxLength={500}
                    required
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={replySubmitting === c.id}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-xs font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      {replySubmitting === c.id ? "Sending…" : "Send Reply"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))
        )}
      </div>

      {/* New top-level comment form */}
      <form onSubmit={submit} className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 space-y-3">
        <h4 className="text-sm font-medium text-gray-300 mb-1">Leave a comment</h4>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Your name"
          maxLength={60}
          required
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all"
        />
        <textarea
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Write a comment…"
          rows={3}
          maxLength={500}
          required
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? "Sending…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single()
      .then(({ data }) => {
        setArticle(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#030014] text-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Article not found.</p>
        <button onClick={() => navigate(-1)} className="text-indigo-400 hover:underline text-sm">
          ← Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -inset-[10px] opacity-15">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
          <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-[5%] pt-10 pb-20">
        {/* Back + breadcrumb */}
        <div className="flex items-center gap-3 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-xl text-white/90 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 text-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-1.5 text-sm text-white/50">
            <span>Blog</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/80 truncate max-w-[240px]">{article.title}</span>
          </div>
        </div>

        {/* Cover */}
        {article.cover_url && (
          <div className="w-full h-72 md:h-96 rounded-2xl overflow-hidden mb-8 border border-white/10">
            <img
              src={article.cover_url}
              alt={article.title}
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
          {article.title}
        </h1>

        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 mb-8 pb-6 border-b border-white/8">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(article.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {readingTime(article.content)} min read
          </span>
          <span className="ml-auto">
            <SharePanel title={article.title} />
          </span>
        </div>

        {/* Content */}
        <div className="tiptap-render" dangerouslySetInnerHTML={{ __html: article.content }} />

        {/* Clap + Share footer */}
        <div className="mt-14 pt-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs text-gray-500 mb-2">Found this helpful? Give it a clap!</p>
            <ClapButton articleId={article.id} totalClaps={article.claps ?? 0} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs text-gray-500 mb-2">Share this article</p>
            <SharePanel title={article.title} />
          </div>
        </div>

        {/* Comments */}
        <Comments articleId={article.id} />
      </div>

      <Footer />
    </div>
  );
}
