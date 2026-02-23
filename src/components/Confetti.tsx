"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

/**
 * Pachinko-style extravagant confetti burst.
 * Fires multiple waves of confetti from different origins.
 */
export default function Confetti() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#DDA0DD", "#FF1493", "#00CED1"];

    // Wave 1: Big center burst
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6, x: 0.5 },
      colors,
      startVelocity: 55,
      gravity: 0.8,
      ticks: 300,
      scalar: 1.2,
    });

    // Wave 2: Left cannon
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        colors,
        startVelocity: 50,
        gravity: 0.9,
        ticks: 250,
      });
    }, 200);

    // Wave 3: Right cannon
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 },
        colors,
        startVelocity: 50,
        gravity: 0.9,
        ticks: 250,
      });
    }, 400);

    // Wave 4: Shower from top (pachinko ball drop feel)
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 180,
        origin: { y: 0, x: 0.5 },
        colors,
        startVelocity: 30,
        gravity: 1.2,
        ticks: 400,
        scalar: 0.9,
      });
    }, 700);

    // Wave 5: Final gold burst
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 120,
        origin: { y: 0.5, x: 0.5 },
        colors: ["#FFD700", "#FFA500", "#FF8C00", "#FFE4B5"],
        startVelocity: 45,
        gravity: 0.7,
        ticks: 350,
        scalar: 1.4,
      });
    }, 1200);

    // Wave 6: Stars (small delayed sparkle)
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 160,
        origin: { y: 0.4, x: 0.5 },
        colors: ["#FFD700", "#FFFFFF"],
        startVelocity: 20,
        gravity: 0.5,
        ticks: 200,
        shapes: ["circle"],
        scalar: 0.6,
      });
    }, 1600);
  }, []);

  return null;
}
