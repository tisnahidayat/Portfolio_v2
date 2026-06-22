import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { SlidersHorizontal, Power, AlertTriangle, CheckCircle2, Globe } from "lucide-react";
import Swal from "sweetalert2";

export default function SettingsPage() {
  const [maintenance, setMaintenance] = useState(false);
  const [initial, setInitial] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("settings")
      .select("maintenance_mode")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data) {
          setMaintenance(data.maintenance_mode);
          setInitial(data.maintenance_mode);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("settings")
      .upsert({ id: 1, maintenance_mode: maintenance });

    setSaving(false);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to save",
        text: error.message,
        background: "#030014",
        color: "#fff",
        confirmButtonColor: "#6366f1",
      });
    } else {
      setInitial(maintenance);
      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: `Maintenance mode ${maintenance ? "enabled" : "disabled"}.`,
        background: "#030014",
        color: "#fff",
        confirmButtonColor: "#6366f1",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const changed = maintenance !== initial;

  return (
    <div className="max-w-2xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage site-wide configuration</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/8 overflow-hidden">

        {/* Card header */}
        <div className="px-6 py-4 border-b border-white/8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Site Settings</p>
            <p className="text-xs text-gray-500">Control public access to your portfolio</p>
          </div>
        </div>

        {/* Card body */}
        <div className="p-6 space-y-4">

          {loading ? (
            <div className="h-20 rounded-xl bg-white/5 animate-pulse" />
          ) : (
            <div className="flex items-center justify-between gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/8">
              <div className="flex items-start gap-4">
                <div
                  className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    maintenance
                      ? "bg-red-500/15 border border-red-500/25"
                      : "bg-green-500/10 border border-green-500/15"
                  }`}
                >
                  <Power
                    className={`w-4 h-4 transition-colors duration-300 ${
                      maintenance ? "text-red-400" : "text-green-400"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Maintenance Mode</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {maintenance
                      ? "Visitors are seeing the maintenance page"
                      : "Your portfolio is publicly accessible"}
                  </p>
                  <div
                    className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-300 ${
                      maintenance
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-green-500/10 text-green-400 border border-green-500/15"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        maintenance ? "bg-red-400 animate-pulse" : "bg-green-400"
                      }`}
                    />
                    {maintenance ? "Maintenance ON" : "Live"}
                  </div>
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => setMaintenance((v) => !v)}
                className={`relative w-12 h-6 rounded-full flex-shrink-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                  maintenance ? "bg-red-500/70" : "bg-white/10 hover:bg-white/15"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${
                    maintenance ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          )}

          {/* Warning when on */}
          {maintenance && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300/80 leading-relaxed">
                <strong className="text-amber-300">Maintenance mode is ON.</strong> All public pages are
                replaced with the maintenance screen. Dashboard and login remain accessible.
              </p>
            </div>
          )}

          {/* Info when off */}
          {!maintenance && !loading && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/8">
              <Globe className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-500 leading-relaxed">
                Your portfolio is live and accessible to all visitors. Enable maintenance mode to show a
                maintenance page while you make updates.
              </p>
            </div>
          )}
        </div>

        {/* Card footer */}
        <div className="px-6 py-4 border-t border-white/8 flex items-center justify-between">
          {changed ? (
            <p className="text-xs text-amber-400/70">Unsaved changes</p>
          ) : (
            <p className="text-xs text-gray-600">All changes saved</p>
          )}
          <button
            onClick={save}
            disabled={saving || !changed}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-medium transition-all duration-200 ${
              changed && !saving
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 shadow-lg shadow-indigo-500/20"
                : "bg-white/5 text-gray-600 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
