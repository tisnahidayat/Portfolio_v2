import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../supabase";
import TipTapEditor from "../../components/TipTapEditor";
import Swal from "sweetalert2";
import { toSlug } from "../../utils/slug";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, X, BookOpen, Calendar, HandHeart, Loader2, ImageIcon,
} from "lucide-react";

const swal = (opts) =>
  Swal.fire({ background: "#030014", color: "#ffffff", confirmButtonColor: "#6366f1", ...opts });

const notify = (title, icon = "success") =>
  Swal.fire({ title, icon, timer: 1500, showConfirmButton: false, background: "#030014", color: "#ffffff" });

// Must be outside ArticleForm — defining inside causes remount on every keystroke
const inputCls =
  "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all";

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      {children}
    </div>
  );
}

function ArticleForm({ initial, onSave, onCancel, onBusy }) {
  const [form, setForm] = useState({
    title:     initial?.title     ?? "",
    slug:      initial?.slug      ?? "",
    excerpt:   initial?.excerpt   ?? "",
    content:   initial?.content   ?? "",
    published: initial?.published ?? false,
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial?.cover_url || null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleTitle = (v) => {
    set("title", v);
    set("slug", toSlug(v));
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onBusy(true, initial ? "Updating article…" : "Saving article…");

    let coverUrl = initial?.cover_url ?? null;
    if (file) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("article-covers").upload(fileName, file);
      if (uploadError) {
        onBusy(false);
        swal({ title: "Upload failed", text: uploadError.message, icon: "error" });
        return;
      }
      const { data: urlData } = supabase.storage.from("article-covers").getPublicUrl(fileName);
      coverUrl = urlData.publicUrl;
    }

    const payload = {
      title:      form.title.trim(),
      slug:       form.slug.trim() || toSlug(form.title),
      excerpt:    form.excerpt.trim() || null,
      cover_url:  coverUrl,
      content:    form.content || "",
      published:  form.published,
      updated_at: new Date().toISOString(),
    };
    let error;
    if (initial) {
      ({ error } = await supabase.from("articles").update(payload).eq("id", initial.id));
    } else {
      ({ error } = await supabase.from("articles").insert({ ...payload, claps: 0 }));
    }
    onBusy(false);
    if (error) {
      swal({ title: "Error", text: error.message, icon: "error" });
    } else {
      onSave(initial ? "update" : "create");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Title *">
          <input
            className={inputCls}
            value={form.title}
            onChange={(e) => handleTitle(e.target.value)}
            placeholder="Article title"
            required
          />
        </Field>
        <Field label="Slug (auto)">
          <input
            className={`${inputCls} opacity-50 cursor-not-allowed`}
            value={form.slug}
            readOnly
            tabIndex={-1}
            placeholder="auto-generated from title"
          />
        </Field>
      </div>

      <Field label="Excerpt">
        <textarea
          className={`${inputCls} resize-none`}
          rows={2}
          value={form.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
          placeholder="Short summary of the article…"
        />
      </Field>

      <Field label="Cover Image">
        <label className="flex items-center gap-4 w-full bg-white/5 border border-dashed border-white/15 rounded-xl px-4 py-4 cursor-pointer hover:border-indigo-500/40 transition-all">
          {preview ? (
            <img src={preview} className="h-16 w-24 object-cover rounded-lg border border-white/10 shrink-0" alt="preview" />
          ) : (
            <div className="w-24 h-16 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
              <ImageIcon className="w-5 h-5 text-gray-600" />
            </div>
          )}
          <div>
            <p className="text-sm text-gray-300">{preview ? "Change image" : "Click to upload image"}</p>
            <p className="text-xs text-gray-600 mt-0.5">PNG, JPG, WEBP supported</p>
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      </Field>

      <Field label="Content *">
        <TipTapEditor content={form.content} onChange={(html) => set("content", html)} />
      </Field>

      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => set("published", !form.published)}
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
              form.published ? "bg-indigo-600" : "bg-white/10"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                form.published ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
          <span className="text-sm text-gray-300">
            {form.published ? "Published" : "Draft"}
          </span>
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            {initial ? "Update" : "Publish"}
          </button>
        </div>
      </div>
    </form>
  );
}

const formatDate = (d) =>
  new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("list"); // "list" | "create" | "edit"
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [busyMsg, setBusyMsg] = useState("Memproses…");

  const setBusyState = (active, msg = "Memproses…") => {
    setBusy(active);
    setBusyMsg(msg);
  };

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("articles")
      .select("id, title, slug, excerpt, cover_url, published, claps, created_at, updated_at")
      .order("created_at", { ascending: false });
    setArticles(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = (type) => {
    setMode("list");
    setEditing(null);
    load();
    notify(type === "update" ? "Article updated!" : "Article created!");
  };

  const handleCancel = () => {
    setMode("list");
    setEditing(null);
  };

  const handleEdit = async (article) => {
    setBusyState(true, "Loading article…");
    const { data } = await supabase.from("articles").select("*").eq("id", article.id).single();
    setBusyState(false);
    setEditing(data);
    setMode("edit");
  };

  const handleDelete = async (article) => {
    const { isConfirmed } = await swal({
      title: "Delete article?",
      text: `"${article.title}" will be permanently deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });
    if (!isConfirmed) return;
    setBusyState(true, "Deleting article…");
    await supabase.from("articles").delete().eq("id", article.id);
    await load();
    setBusyState(false);
    notify("Deleted!");
  };

  const togglePublish = async (article) => {
    const next = !article.published;
    setBusyState(true, next ? "Publishing…" : "Unpublishing…");
    await supabase.from("articles").update({ published: next }).eq("id", article.id);
    await load();
    setBusyState(false);
    notify(next ? "Article published!" : "Article unpublished!");
  };

  return (
    <>
      {/* Full-screen overlay during any operation */}
      {busy && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 px-10 py-8 bg-[#0d0d1f]/90 rounded-2xl border border-white/10 shadow-2xl">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
            <p className="text-sm text-gray-300">{busyMsg}</p>
          </div>
        </div>
      )}

      {mode !== "list" ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {mode === "create" ? "New Article" : "Edit Article"}
            </h2>
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ArticleForm
            initial={editing}
            onSave={handleSave}
            onCancel={handleCancel}
            onBusy={setBusyState}
          />
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Articles</h2>
              <p className="text-xs text-gray-500 mt-0.5">{articles.length} articles total</p>
            </div>
            <button
              onClick={() => setMode("create")}
              className="relative group shrink-0"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-50 blur group-hover:opacity-80 transition duration-300" />
              <div className="relative flex items-center gap-2 px-4 py-2.5 bg-[#030014] rounded-xl border border-white/10">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span className="text-sm text-gray-200">New Article</span>
              </div>
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <div className="relative mb-4">
                <div className="absolute -inset-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full blur opacity-20" />
                <div className="relative w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-indigo-400/50" />
                </div>
              </div>
              <p className="text-base font-medium text-gray-400 mb-1">No articles yet</p>
              <p className="text-sm text-gray-600">Click "New Article" to create your first article</p>
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/8 rounded-xl hover:border-white/15 transition-all"
                >
                  {/* Cover thumbnail */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-indigo-900/20 border border-white/5 flex-shrink-0 flex items-center justify-center">
                    {a.cover_url ? (
                      <img src={a.cover_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-5 h-5 text-indigo-500/40" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-white truncate">{a.title}</p>
                      <span
                        className={`shrink-0 px-1.5 py-0.5 text-[10px] rounded-full border font-medium ${
                          a.published
                            ? "bg-green-500/10 border-green-500/30 text-green-400"
                            : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                        }`}
                      >
                        {a.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(a.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <HandHeart className="w-3 h-3 text-pink-400/70" />
                        {a.claps ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => togglePublish(a)}
                      title={a.published ? "Unpublish" : "Publish"}
                      className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                    >
                      {a.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(a)}
                      title="Edit"
                      className="p-2 rounded-lg text-gray-500 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(a)}
                      title="Delete"
                      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
