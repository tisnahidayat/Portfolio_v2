import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const total = scrollHeight - clientHeight;
      setProgress(total > 0 ? (scrollTop / total) * 100 : 0);
      setVisible(scrollTop > 300);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const r = 20;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (progress / 100) * circ;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        width: "52px",
        height: "52px",
        zIndex: 9995,
        background: "rgba(3, 0, 20, 0.85)",
        border: "none",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        backdropFilter: "blur(12px)",
        boxShadow: "0 0 20px rgba(99, 102, 241, 0.25), inset 0 0 0 1px rgba(255,255,255,0.07)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.85)",
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}
    >
      {/* Progress ring */}
      <svg
        width="52"
        height="52"
        viewBox="0 0 52 52"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: "rotate(-90deg)",
          pointerEvents: "none",
        }}
      >
        <defs>
          <linearGradient id="btt-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="2.5" />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke="url(#btt-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />
      </svg>

      <ArrowUp style={{ width: "18px", height: "18px", color: "white", position: "relative", zIndex: 1 }} />
    </button>
  );
}
