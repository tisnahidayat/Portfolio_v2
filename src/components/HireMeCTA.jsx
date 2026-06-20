import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

export default function HireMeCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const scrollToContact = () => {
    const el = document.querySelector("#Contact");
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToContact}
      aria-label="Hire me"
      style={{
        position: "fixed",
        bottom: "2rem",
        left: "2rem",
        zIndex: 9994,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0) scale(1)" : "translateX(-30px) scale(0.85)",
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.35s ease, transform 0.35s ease",
      }}
      className="group flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white
        bg-gradient-to-r from-[#6366f1] to-[#a855f7]
        shadow-[0_0_20px_rgba(99,102,241,0.4)]
        hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]
        hover:scale-105 active:scale-95 transition-all duration-300"
    >
      <Zap className="w-4 h-4 group-hover:animate-bounce" />
      <span className="hidden xs:inline sm:inline">Hire Me</span>
    </button>
  );
}
