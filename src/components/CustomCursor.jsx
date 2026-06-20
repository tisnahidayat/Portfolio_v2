import { useEffect, useRef } from "react";

const COLORS = ["#6366f1", "#a855f7", "#ec4899", "#818cf8", "#c084fc", "#ffffff"];

export default function CustomCursor() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const container = containerRef.current;
    if (!container) return;

    let lastX = 0, lastY = 0;
    let throttle = false;

    const spawnSparkle = (x, y) => {
      const el = document.createElement("div");
      const size = Math.random() * 6 + 4;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const angle = Math.random() * 360;
      const distance = Math.random() * 30 + 15;
      const duration = Math.random() * 400 + 400;

      el.style.cssText = `
        position: fixed;
        top: ${y}px;
        left: ${x}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 99990;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 ${size * 2}px ${color};
        animation: sparkle-fly ${duration}ms ease-out forwards;
        --dx: ${Math.cos((angle * Math.PI) / 180) * distance}px;
        --dy: ${Math.sin((angle * Math.PI) / 180) * distance}px;
      `;

      container.appendChild(el);
      setTimeout(() => el.remove(), duration);
    };

    const onMove = (e) => {
      if (throttle) return;
      throttle = true;
      setTimeout(() => (throttle = false), 30);

      const dx = Math.abs(e.clientX - lastX);
      const dy = Math.abs(e.clientY - lastY);
      if (dx < 3 && dy < 3) return;

      lastX = e.clientX;
      lastY = e.clientY;

      const count = Math.min(Math.floor((dx + dy) / 8) + 1, 4);
      for (let i = 0; i < count; i++) {
        setTimeout(() => spawnSparkle(e.clientX, e.clientY), i * 30);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <div ref={containerRef} />
      <style>{`
        @keyframes sparkle-fly {
          0%   { opacity: 1; transform: translate(-50%, -50%) translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0); }
        }
      `}</style>
    </>
  );
}
