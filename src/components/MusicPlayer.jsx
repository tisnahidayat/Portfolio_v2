import { useEffect, useRef, useState } from "react";
import { Music, Pause, Volume2, VolumeX } from "lucide-react";

export default function MusicPlayer({ src = "/music.mp3" }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [bars] = useState(() => [0, 1, 2, 3]);

  // Show player after scroll (same pattern as BackToTop)
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = "none";
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [src]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "4.5rem",
        right: "1.25rem",
        zIndex: 9993,
        display: "flex",
        alignItems: "center",
        gap: "6px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(-12px) scale(0.85)",
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.35s ease, transform 0.35s ease",
      }}
    >
      {/* Equalizer bars */}
      {playing && !muted && (
        <div className="flex items-end gap-[3px] h-5 mr-1">
          {bars.map((i) => (
            <div
              key={i}
              style={{
                width: "3px",
                borderRadius: "2px",
                background: "linear-gradient(to top, #6366f1, #a855f7)",
                animationName: "eq-bar",
                animationDuration: `${0.5 + i * 0.15}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDirection: "alternate",
              }}
              className="animate-eq"
            />
          ))}
        </div>
      )}

      {/* Mute toggle */}
      {playing && (
        <button
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="p-2 rounded-full bg-black/40 border border-white/10 text-gray-400 hover:text-white hover:border-[#6366f1]/40 transition-all duration-200 backdrop-blur-md hover:scale-110"
          style={{ boxShadow: "0 0 12px rgba(99,102,241,0.15)" }}
        >
          {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Play / Pause */}
      <button
        onClick={toggle}
        aria-label={playing ? "Pause music" : "Play music"}
        className={`relative flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium backdrop-blur-md border transition-all duration-300 hover:scale-105 active:scale-95
          ${playing
            ? "bg-[#6366f1]/20 border-[#6366f1]/50 text-indigo-300 shadow-[0_0_16px_rgba(99,102,241,0.3)]"
            : "bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-[#6366f1]/30"
          }`}
      >
        {playing ? (
          <><Pause className="w-3.5 h-3.5" /><span>Music</span></>
        ) : (
          <><Music className="w-3.5 h-3.5" /><span>Music</span></>
        )}
        {playing && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-[#030014] animate-pulse" />
        )}
      </button>

      <style>{`
        @keyframes eq-bar { from { height: 4px; } to { height: 18px; } }
        .animate-eq { animation: eq-bar 0.6s ease-in-out infinite alternate; }
      `}</style>
    </div>
  );
}
