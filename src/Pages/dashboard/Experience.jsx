import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { Briefcase, Plus, Trash2, Pencil, Upload, ImageIcon, X, Building2 } from "lucide-react";
import Swal from "sweetalert2";

const swal = (opts) => Swal.fire({ background: "#030014", color: "#ffffff", confirmButtonColor: "#6366f1", ...opts });

const Card = ({ children }) => (
  <div className="relative group">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500" />
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl h-full">{children}</div>
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative z-10 w-full max-w-2xl flex flex-col" style={{ maxHeight: "calc(100vh - 24px)" }}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-20 pointer-events-none" />
      <div className="relative bg-[#0a0a1a] border border-white/12 rounded-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, type = "text", required = false }) => (
  <div className="space-y-1.5">
    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">{label}</label>
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
      className="w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
    />
  </div>
);

const ExperienceForm = ({ initial, onSubmit, onCancel, submitLabel = "Save", uploading }) => {
  const [form, setForm] = useState({
    role: initial?.role || "",
    company: initial?.company || "",
    start_date: initial?.start_date || "",
    end_date: initial?.end_date || "",
    is_current: initial?.is_current || false,
    location: initial?.location || "",
    description: initial?.description || "",
    sort_order: initial?.sort_order ?? 0,
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial?.img || null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form, file); }} className="p-5 sm:p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Role / Position *" value={form.role} onChange={set("role")} placeholder="e.g. QA Engineer" required />
        <InputField label="Company *" value={form.company} onChange={set("company")} placeholder="e.g. PT Noxus Technology" required />
        <InputField label="Start Date" value={form.start_date} onChange={set("start_date")} placeholder="e.g. Aug 2023" />
        <InputField label="End Date" value={form.end_date} onChange={set("end_date")} placeholder="e.g. Dec 2024 (leave blank if current)" />

        <div className="flex items-center gap-3">
          <input
            type="checkbox" id="is_current" checked={form.is_current}
            onChange={(e) => setForm((f) => ({ ...f, is_current: e.target.checked }))}
            className="w-4 h-4 accent-indigo-500 cursor-pointer"
          />
          <label htmlFor="is_current" className="text-sm text-gray-300 cursor-pointer">Currently working here</label>
        </div>

        <InputField label="Location" value={form.location} onChange={set("location")} placeholder="e.g. Jakarta, Indonesia" />

        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">Description</label>
          <textarea
            value={form.description} onChange={set("description")} rows={3}
            placeholder="Describe your role, responsibilities, and achievements..."
            className="w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
          />
        </div>

        <InputField label="Sort Order" value={form.sort_order} onChange={set("sort_order")} type="number" placeholder="0" />

        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">Company Logo</label>
          <label className="flex items-center gap-4 w-full bg-[#0d0d22] border border-dashed border-white/15 rounded-xl px-4 py-4 cursor-pointer hover:border-indigo-500/40 transition-all">
            {preview ? (
              <img src={preview} className="h-14 w-14 object-cover rounded-xl border border-white/10" alt="preview" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <Building2 className="w-6 h-6 text-gray-600" />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-300">{preview ? "Change logo" : "Click to upload logo"}</p>
              <p className="text-xs text-gray-600 mt-0.5">PNG, JPG, WEBP supported</p>
            </div>
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (!f) return; setFile(f); setPreview(URL.createObjectURL(f)); }} className="hidden" />
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors">Cancel</button>
        <button type="submit" disabled={uploading} className="relative group/s">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-60 blur group-hover/s:opacity-100 transition duration-300" />
          <div className="relative flex items-center gap-2 px-5 py-2 bg-[#030014] rounded-xl border border-white/10">
            {uploading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Upload className="w-4 h-4 text-indigo-400" />}
            <span className="text-sm text-gray-200">{uploading ? "Saving..." : submitLabel}</span>
          </div>
        </button>
      </div>
    </form>
  );
};

const ExperienceCard = ({ item, onEdit, onDelete }) => (
  <Card>
    <div className="p-4 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center shrink-0 ${item.img ? "" : "border border-white/10 bg-white/5"}`}>
        {item.img ? <img src={item.img} alt={item.company} className="w-full h-full object-cover" /> : <Building2 className="w-5 h-5 text-indigo-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-white text-sm truncate">{item.role}</h3>
          {item.is_current && <span className="shrink-0 px-2 py-0.5 text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">Current</span>}
        </div>
        <p className="text-indigo-400 text-xs mb-1">{item.company}</p>
        <p className="text-gray-500 text-xs">{item.start_date} — {item.is_current ? "Present" : item.end_date} {item.location ? `· ${item.location}` : ""}</p>
        {item.description && <p className="text-gray-400 text-xs mt-2 line-clamp-2">{item.description}</p>}
      </div>
    </div>
    <div className="flex justify-end gap-2 px-4 pb-4">
      <button onClick={() => onEdit(item)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/10 text-xs transition-colors">
        <Pencil className="w-3 h-3" /> Edit
      </button>
      <button onClick={() => onDelete(item.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs transition-colors">
        <Trash2 className="w-3 h-3" /> Delete
      </button>
    </div>
  </Card>
);

export default function Experience() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("experience").select("*").order("sort_order", { ascending: true });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const uploadImage = async (f) => {
    const fileName = `${Date.now()}-${f.name.replace(/\s+/g, "-")}`;
    const { error: uploadError } = await supabase.storage.from("resume-images").upload(fileName, f);
    if (uploadError) return "";
    const { data } = supabase.storage.from("resume-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleCreate = async (form, file) => {
    setUploading(true);
    let imgUrl = "";
    if (file) imgUrl = await uploadImage(file);
    const { error } = await supabase.from("experience").insert({
      role: form.role, company: form.company, start_date: form.start_date,
      end_date: form.end_date || null, is_current: form.is_current,
      location: form.location, description: form.description,
      img: imgUrl || null, sort_order: Number(form.sort_order) || 0,
    });
    setShowCreate(false);
    setUploading(false);
    if (error) { swal({ title: "Error", text: error.message, icon: "error" }); return; }
    swal({ title: "Experience saved!", icon: "success", timer: 1500, showConfirmButton: false });
    fetch();
  };

  const handleEdit = async (form, file) => {
    setUploading(true);
    let imgUrl = editItem.img || "";
    if (file) imgUrl = await uploadImage(file);
    const { error } = await supabase.from("experience").update({
      role: form.role, company: form.company, start_date: form.start_date,
      end_date: form.end_date || null, is_current: form.is_current,
      location: form.location, description: form.description,
      img: imgUrl || null, sort_order: Number(form.sort_order) || 0,
    }).eq("id", editItem.id);
    setEditItem(null);
    setUploading(false);
    if (error) { swal({ title: "Error", text: error.message, icon: "error" }); return; }
    swal({ title: "Experience updated!", icon: "success", timer: 1500, showConfirmButton: false });
    fetch();
  };

  const handleDelete = async (id) => {
    const result = await swal({
      title: "Delete this experience?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonColor: "#374151",
    });
    if (!result.isConfirmed) return;
    await supabase.from("experience").delete().eq("id", id);
    swal({ title: "Deleted!", icon: "success", timer: 1200, showConfirmButton: false });
    fetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl blur opacity-50" />
            <div className="relative w-9 h-9 bg-[#030014] rounded-xl border border-white/15 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Experience</h1>
            <p className="text-gray-500 text-xs">{loading ? "Loading..." : `${items.length} entries`}</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} className="relative group shrink-0">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-50 blur group-hover:opacity-80 transition duration-300" />
          <div className="relative flex items-center gap-2 px-4 py-2.5 bg-[#030014] rounded-xl border border-white/10">
            <Plus className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-gray-200">Add Experience</span>
          </div>
        </button>
      </div>

      {showCreate && (
        <Modal title="Add Experience" onClose={() => setShowCreate(false)}>
          <ExperienceForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} submitLabel="Save Experience" uploading={uploading} />
        </Modal>
      )}
      {editItem && (
        <Modal title="Edit Experience" onClose={() => setEditItem(null)}>
          <ExperienceForm initial={editItem} onSubmit={handleEdit} onCancel={() => setEditItem(null)} submitLabel="Update Experience" uploading={uploading} />
        </Modal>
      )}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl border border-white/10" />)}</div>
      ) : items.length === 0 ? (
        <Card><div className="p-16 text-center"><Briefcase className="w-10 h-10 text-gray-700 mx-auto mb-3" /><p className="text-gray-500 text-sm">No experience yet.</p></div></Card>
      ) : (
        <div className="space-y-3">{items.map((item) => <ExperienceCard key={item.id} item={item} onEdit={setEditItem} onDelete={handleDelete} />)}</div>
      )}
    </div>
  );
}
