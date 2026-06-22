import { Wrench, Clock, ArrowRight } from "lucide-react";

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center relative overflow-hidden px-6">

      {/* Background blobs */}
      <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-indigo-500/4 rounded-full blur-3xl" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 text-center max-w-md w-full mx-auto flex flex-col items-center">

        {/* Icon */}
        <div className="mb-8 relative">
          <div className="absolute -inset-6 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 rounded-full blur-2xl animate-pulse" />
          <div
            className="relative w-24 h-24 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm flex items-center justify-center"
            style={{
              boxShadow:
                "0 0 60px rgba(99,102,241,0.12), 0 0 120px rgba(168,85,247,0.06), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <Wrench
              className="w-10 h-10 text-indigo-400"
              style={{ animation: "m-wrench 4s ease-in-out infinite" }}
            />
          </div>
        </div>

        {/* Status chip */}
        <div className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/8 border border-amber-500/20 text-amber-400/80 text-xs font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Scheduled Maintenance
        </div>

        {/* Heading */}
        <h1
          className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #e0e7ff 0%, #a78bfa 40%, #c084fc 70%, #818cf8 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          We'll Be Right Back
        </h1>

        <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-10">
          Our portfolio is currently undergoing scheduled maintenance.
          <br />
          We're working hard to improve your experience.
        </p>

        {/* Animated dots */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="rounded-full bg-indigo-500/50"
              style={{
                width: i === 2 || i === 3 ? "9px" : "5px",
                height: i === 2 || i === 3 ? "9px" : "5px",
                animation: `m-dot 2s ease-in-out ${i * 0.18}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Info chips */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-xs text-gray-400">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center">
              <Wrench className="w-3 h-3 text-indigo-400" />
            </div>
            System Upgrade in Progress
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-xs text-gray-400">
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/15 flex items-center justify-center">
              <Clock className="w-3 h-3 text-purple-400" />
            </div>
            Back Online Very Soon
          </div>
        </div>

        {/* Divider */}
        <div
          className="w-full h-px mb-8"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(99,102,241,0.25), transparent)",
          }}
        />

        {/* Admin link */}
        <a
          href="/login"
          className="group inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-indigo-400 transition-colors duration-200"
        >
          Admin access
          <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
      </div>

      <style>{`
        @keyframes m-wrench {
          0%, 100% { transform: rotate(-20deg); }
          50% { transform: rotate(20deg); }
        }
        @keyframes m-dot {
          0%, 100% { opacity: 0.2; transform: scale(0.7); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
