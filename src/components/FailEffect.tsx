"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Dramatic fail effect: red flash overlay + screen shake.
 * Plays once on mount.
 */
export default function FailEffect() {
  const [active, setActive] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    setActive(true);

    // Remove effect after animation completes
    const timer = setTimeout(() => setActive(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!active) return null;

  return (
    <>
      {/* Red flash overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          pointerEvents: "none",
          animation: "failFlash 1.2s ease-out forwards",
        }}
      />
      {/* Shake the whole page */}
      <style>{`
        @keyframes failFlash {
          0% { background: rgba(180, 0, 0, 0.5); }
          15% { background: rgba(180, 0, 0, 0.05); }
          30% { background: rgba(180, 0, 0, 0.35); }
          50% { background: rgba(180, 0, 0, 0.02); }
          65% { background: rgba(180, 0, 0, 0.15); }
          100% { background: rgba(180, 0, 0, 0); }
        }
        @keyframes failShake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-8px) rotate(-0.5deg); }
          20% { transform: translateX(8px) rotate(0.5deg); }
          30% { transform: translateX(-6px) rotate(-0.3deg); }
          40% { transform: translateX(6px) rotate(0.3deg); }
          50% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
          70% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
          90% { transform: translateX(-1px); }
        }
        body {
          animation: failShake 0.8s ease-out !important;
        }
      `}</style>
    </>
  );
}
