import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "../../supabase";
import {
  MessageSquare, Pin, Trash2, PinOff, Calendar, Search, X,
  ChevronLeft, ChevronRight, BookOpen, CornerDownRight,
} from "lucide-react";
import Swal from "sweetalert2";

const swal = (opts) =>
  Swal.fire({ background: "#030014", color: "#ffffff", confirmButtonColor: "#6366f1", ...opts });

const notify = (title, icon = "success") =>
  Swal.fire({ title, icon, timer: 1500, showConfirmButton: false, background: "#030014", color: "#ffffff" });

const PAGE_SIZE = 10;

const Card = ({ children, className = "" }) => (
  <div className={`relative group ${className}`}>
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500 pointer-events-none" />
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl h-full">
      {children}
    </div>
  </div>
);

function highlightMatch(text, query) {
  if (!query.trim()) return text;
  const regex = new RegExp(
    `(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-indigo-500/30 text-indigo-200 rounded px-0.5">
        {part}
      </mark>
    ) : part
  );
}

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    month: "short", day: "numeric", year: "numeric",
  });
};

// ── Portfolio Comments tab ────────────────────────────────────────────────────
function PortfolioComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchComments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("portfolio_comments")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });
    setComments(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchComments(); }, []);
  useEffect(() => { setPage(1); }, [filter, search]);

  const pin = async (id, value) => {
    await supabase.from("portfolio_comments").update({ is_pinned: value }).eq("id", id);
    fetchComments();
    notify(value ? "Comment pinned!" : "Pin removed!");
  };

  const remove = async (id) => {
    const result = await swal({
      title: "Delete comment?", text: "This action cannot be undone.",
      icon: "warning", showCancelButton: true,
      confirmButtonText: "Yes, delete", cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });
    if (!result.isConfirmed) return;
    await supabase.from("portfolio_comments").delete().eq("id", id);
    fetchComments();
    notify("Deleted!");
  };

  const pinnedCount = comments.filter((c) => c.is_pinned).length;

  const filtered = useMemo(() => {
    let result = filter === "pinned" ? comments.filter((c) => c.is_pinned) : comments;
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (c) =>
          (c.user_name || "").toLowerCase().includes(q) ||
          (c.content || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [comments, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: comments.length, color: "text-indigo-400" },
          { label: "Pinned", value: pinnedCount, color: "text-purple-400" },
          { label: "Unpinned", value: comments.length - pinnedCount, color: "text-blue-400" },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="p-3 sm:p-4">
              <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
              <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {[
            { value: "all", label: "All", count: comments.length },
            { value: "pinned", label: "Pinned", count: pinnedCount },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 ${
                filter === tab.value
                  ? "bg-gradient-to-r from-indigo-500/25 to-purple-500/20 border border-indigo-500/35 text-white font-medium"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${filter === tab.value ? "bg-indigo-500/25 text-indigo-300" : "bg-white/8 text-gray-500"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or message…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/50 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : paginated.length === 0 ? (
        <Card>
          <div className="p-14 text-center">
            <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No comments yet.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {paginated.map((comment) => (
            <div key={comment.id} className="relative group">
              {comment.is_pinned && (
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-15 pointer-events-none" />
              )}
              <div
                className={`relative bg-white/5 border rounded-2xl px-4 py-4 transition-all duration-200 ${
                  comment.is_pinned ? "border-indigo-500/30" : "border-white/10 hover:border-white/18"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={comment.profile_image || "/default-avatar.jpg"}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-white">
                        {highlightMatch(comment.user_name || "Anonymous", search)}
                      </span>
                      {comment.is_pinned && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-xs">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-gray-600 text-xs ml-auto shrink-0">
                        <Calendar className="w-3 h-3" />
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {highlightMatch(comment.content || "", search)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => pin(comment.id, !comment.is_pinned)}
                      title={comment.is_pinned ? "Unpin" : "Pin"}
                      className={`p-2 rounded-lg border transition-all duration-200 ${
                        comment.is_pinned
                          ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                          : "border-white/10 text-gray-500 hover:text-indigo-400 hover:border-indigo-500/25"
                      }`}
                    >
                      {comment.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => remove(comment.id)}
                      className="p-2 rounded-lg border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all duration-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <p className="text-xs text-gray-500">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, i, arr) => { if (i > 0 && arr[i - 1] !== p - 1) acc.push("..."); acc.push(p); return acc; }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`d${i}`} className="px-2 text-gray-600 text-xs">…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-xs border transition-all ${
                      page === p ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300 font-medium" : "border-white/10 text-gray-400 hover:text-white"
                    }`}>
                    {p}
                  </button>
                )
              )}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Article Comments tab ──────────────────────────────────────────────────────
function ArticleComments() {
  const [threads, setThreads] = useState([]); // { ...comment, articleTitle, replies[] }
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState({}); // { [commentId]: bool }

  const load = useCallback(async () => {
    setLoading(true);
    const { data: comments } = await supabase
      .from("article_comments")
      .select("*, articles(title)")
      .order("created_at", { ascending: false });

    const all = comments || [];
    // Build threads: top-level + their replies
    const top = all.filter((c) => !c.parent_id);
    const replies = all.filter((c) => c.parent_id);
    setThreads(
      top.map((c) => ({
        ...c,
        articleTitle: c.articles?.title || "—",
        replies: replies.filter((r) => r.parent_id === c.id),
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search]);

  const remove = async (id, isReply = false) => {
    const result = await swal({
      title: `Delete ${isReply ? "reply" : "comment"}?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });
    if (!result.isConfirmed) return;
    await supabase.from("article_comments").delete().eq("id", id);
    load();
    notify("Deleted!");
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q) ||
        c.articleTitle.toLowerCase().includes(q)
    );
  }, [threads, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalReplies = threads.reduce((s, t) => s + t.replies.length, 0);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Comments", value: threads.length, color: "text-indigo-400" },
          { label: "Replies", value: totalReplies, color: "text-purple-400" },
          { label: "Total", value: threads.length + totalReplies, color: "text-blue-400" },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="p-3 sm:p-4">
              <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
              <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, message, or article title…"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/50 transition-all"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : paginated.length === 0 ? (
        <Card>
          <div className="p-14 text-center">
            <BookOpen className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No article comments yet.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {paginated.map((c) => (
            <div key={c.id} className="bg-white/[0.02] border border-white/8 rounded-2xl overflow-hidden">
              {/* Parent comment row */}
              <div className="flex items-start gap-3 px-4 py-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {c.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-medium text-white">{highlightMatch(c.name, search)}</span>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] text-indigo-300">
                      <BookOpen className="w-2.5 h-2.5" />
                      {highlightMatch(c.articleTitle, search)}
                    </span>
                    <span className="text-xs text-gray-600 ml-auto">{formatDate(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{highlightMatch(c.message, search)}</p>
                  {c.replies.length > 0 && (
                    <button
                      onClick={() => setExpanded((p) => ({ ...p, [c.id]: !p[c.id] }))}
                      className="mt-1.5 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                    >
                      <CornerDownRight className="w-3 h-3" />
                      {expanded[c.id] ? "Hide replies" : `${c.replies.length} ${c.replies.length === 1 ? "reply" : "replies"}`}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => remove(c.id, false)}
                  className="p-2 rounded-lg border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all shrink-0"
                  title="Delete comment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Replies (expandable) */}
              {expanded[c.id] && c.replies.length > 0 && (
                <div className="border-t border-white/6 bg-white/[0.015] divide-y divide-white/5">
                  {c.replies.map((r) => (
                    <div key={r.id} className="flex items-start gap-3 px-4 py-3 pl-10">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {r.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-medium text-white">{r.name}</span>
                          <span className="text-[11px] text-gray-600 ml-auto">{formatDate(r.created_at)}</span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{r.message}</p>
                      </div>
                      <button
                        onClick={() => remove(r.id, true)}
                        className="p-1.5 rounded-lg border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all shrink-0"
                        title="Delete reply"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <p className="text-xs text-gray-500">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, i, arr) => { if (i > 0 && arr[i - 1] !== p - 1) acc.push("..."); acc.push(p); return acc; }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`d${i}`} className="px-2 text-gray-600 text-xs">…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-xs border transition-all ${
                      page === p ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300 font-medium" : "border-white/10 text-gray-400 hover:text-white"
                    }`}>
                    {p}
                  </button>
                )
              )}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
export default function Comments() {
  const [tab, setTab] = useState("portfolio");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl blur opacity-50 pointer-events-none" />
          <div className="relative w-9 h-9 bg-[#030014] rounded-xl border border-white/15 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </div>
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Comments</h1>
          <p className="text-gray-500 text-xs">Manage portfolio &amp; article comments</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
        {[
          { value: "portfolio", label: "Portfolio", icon: MessageSquare },
          { value: "articles", label: "Articles", icon: BookOpen },
        ].map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
              tab === value
                ? "bg-gradient-to-r from-indigo-500/25 to-purple-500/20 border border-indigo-500/35 text-white font-medium"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "portfolio" ? <PortfolioComments /> : <ArticleComments />}
    </div>
  );
}
