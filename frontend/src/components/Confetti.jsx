import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#FF7AA2', '#4FC0E8', '#FFD23F', '#8B5CF6', '#34D399'];

// One-shot confetti burst raining from the top. Render it conditionally.
export default function Confetti({ count = 70 }) {
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: COLORS[i % COLORS.length],
    delay: Math.random() * 0.6,
    duration: 2 + Math.random() * 1.8,
    rotate: Math.random() * 360,
    size: 8 + Math.random() * 8,
    drift: (Math.random() - 0.5) * 120,
  })), [count]);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -40, x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', x: p.drift, rotate: p.rotate, opacity: [1, 1, 0.9] }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute', top: 0, left: `${p.left}%`,
            width: p.size, height: p.size * 0.6, background: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}
