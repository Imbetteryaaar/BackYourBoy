import React, { useMemo } from 'react';

// Soft floating blobs behind everything. Pure decoration, pointer-events off.
export default function Background() {
  const blobs = useMemo(() => ([
    { c: '#FF7AA2', s: 220, top: '-6%', left: '-8%', d: '0s' },
    { c: '#4FC0E8', s: 260, top: '55%', left: '78%', d: '1.5s' },
    { c: '#FFD23F', s: 160, top: '72%', left: '-6%', d: '0.8s' },
    { c: '#8B5CF6', s: 140, top: '8%', left: '82%', d: '2.2s' },
    { c: '#34D399', s: 120, top: '40%', left: '45%', d: '1.1s' },
  ]), []);
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {blobs.map((b, i) => (
        <div key={i}
          className="absolute animate-blob animate-float-slow"
          style={{
            width: b.s, height: b.s, top: b.top, left: b.left,
            background: b.c, opacity: 0.18, filter: 'blur(6px)', animationDelay: b.d,
          }}
        />
      ))}
    </div>
  );
}
