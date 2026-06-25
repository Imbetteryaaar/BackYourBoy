import React from 'react';

// Self-contained SVG avatar — replaces the old react-nice-avatar dependency.
// Config is a tiny serializable object {hue, mouth, happy} so it can travel
// to the backend and back and render identically on every client.

const MOUTHS = [
  'M35 63 Q50 77 65 63',   // big smile
  'M37 64 Q50 71 63 64',   // soft smile
  'M38 66 Q50 60 62 66',   // smirk
  'M40 65 h20',            // flat
  'M44 64 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0', // o-mouth
];

export function genConfig() {
  return {
    hue: Math.floor(Math.random() * 360),
    mouth: Math.floor(Math.random() * MOUTHS.length),
    happy: Math.random() > 0.4,
  };
}

export default function Avatar({ hue = 210, mouth = 0, happy = true, style, className = '' }) {
  const skin = `hsl(${hue}, 70%, 67%)`;
  const ink = `hsl(${hue}, 55%, 28%)`;
  const cheek = `hsl(${hue}, 88%, 79%)`;
  const idx = ((mouth % MOUTHS.length) + MOUTHS.length) % MOUTHS.length;
  return (
    <svg viewBox="0 0 100 100" style={style} className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill={skin} />
      <circle cx="50" cy="50" r="46" fill="none" stroke={ink} strokeOpacity="0.15" strokeWidth="3" />
      <circle cx="31" cy="59" r="7" fill={cheek} opacity="0.7" />
      <circle cx="69" cy="59" r="7" fill={cheek} opacity="0.7" />
      {happy ? (
        <>
          <path d="M29 45 q6 -8 12 0" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
          <path d="M59 45 q6 -8 12 0" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="36" cy="46" r="5" fill={ink} />
          <circle cx="64" cy="46" r="5" fill={ink} />
        </>
      )}
      <path d={MOUTHS[idx]} fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
