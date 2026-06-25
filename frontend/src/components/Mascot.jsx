import React from 'react';
import { motion } from 'framer-motion';

/**
 * A bouncy 2D blob character with expressions.
 * props: mood (idle|happy|win|lose|nervous|think|cheer), color, size, className
 */
export default function Mascot({ mood = 'idle', color = '#FFD23F', size = 120, className = '', float = true }) {
  const ink = '#3B2E4A';

  const mouths = {
    idle:    <path d="M40 62 Q50 70 60 62" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />,
    happy:   <path d="M38 60 Q50 76 62 60 Z" fill={ink} />,
    win:     <path d="M37 58 Q50 80 63 58 Q50 70 37 58 Z" fill={ink} />,
    cheer:   <ellipse cx="50" cy="64" rx="9" ry="11" fill={ink} />,
    nervous: <path d="M40 64 q5 -6 10 0 q5 6 10 0" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />,
    lose:    <path d="M40 68 Q50 58 60 68" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />,
    think:   <circle cx="56" cy="64" r="4" fill={ink} />,
  };

  const eyeShape = (cx) => {
    if (mood === 'happy' || mood === 'cheer')
      return <path d={`M${cx - 6} 46 Q${cx} 40 ${cx + 6} 46`} stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />;
    if (mood === 'win')
      return <text x={cx} y="50" fontSize="16" textAnchor="middle" fill={ink}>★</text>;
    if (mood === 'lose')
      return <g><line x1={cx-5} y1={43} x2={cx+5} y2={51} stroke={ink} strokeWidth="3.5" strokeLinecap="round"/><line x1={cx+5} y1={43} x2={cx-5} y2={51} stroke={ink} strokeWidth="3.5" strokeLinecap="round"/></g>;
    // idle / nervous / think — round eyes (wider when nervous)
    const r = mood === 'nervous' ? 6 : 4.5;
    return <g><circle cx={cx} cy="46" r={r} fill="#fff" stroke={ink} strokeWidth="1.5"/><circle cx={cx} cy={mood==='think'?44:46} r="2.6" fill={ink}/></g>;
  };

  const anim = float
    ? { animate: mood === 'nervous'
        ? { x: [0, -2, 2, -2, 0] }
        : { y: [0, -7, 0] },
        transition: { duration: mood === 'nervous' ? 0.5 : 2.4, repeat: Infinity, ease: 'easeInOut' } }
    : {};

  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 100 100"
      className={className} {...anim} style={{ overflow: 'visible' }}
    >
      {/* shadow */}
      <ellipse cx="50" cy="92" rx="26" ry="5" fill="rgba(59,46,74,0.15)" />
      {/* feet */}
      <ellipse cx="40" cy="86" rx="7" ry="5" fill={ink} />
      <ellipse cx="60" cy="86" rx="7" ry="5" fill={ink} />
      {/* body (blobby) */}
      <path
        d="M50 12 C72 12 84 28 84 48 C84 72 70 84 50 84 C30 84 16 72 16 48 C16 28 28 12 50 12 Z"
        fill={color} stroke={ink} strokeWidth="3"
      />
      {/* cheeks */}
      <circle cx="30" cy="58" r="6" fill="#FF7AA2" opacity="0.55" />
      <circle cx="70" cy="58" r="6" fill="#FF7AA2" opacity="0.55" />
      {/* eyes */}
      {eyeShape(38)}
      {eyeShape(62)}
      {/* mouth */}
      {mouths[mood] || mouths.idle}
      {/* sweat drop when nervous */}
      {mood === 'nervous' && (
        <motion.path
          d="M78 38 q-4 8 0 11 a4 4 0 0 0 8 -3 q-2 -5 -8 -8 Z" fill="#4FC0E8" stroke={ink} strokeWidth="1"
          animate={{ y: [0, 4, 0], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1, repeat: Infinity }}
        />
      )}
      {/* arms up when cheering/winning */}
      {(mood === 'cheer' || mood === 'win') && (
        <g stroke={ink} strokeWidth="4" strokeLinecap="round">
          <motion.line x1="18" y1="50" x2="6" y2="34" animate={{ rotate: [0,-10,0] }} style={{ transformOrigin: '18px 50px' }} transition={{ duration: 0.6, repeat: Infinity }} />
          <motion.line x1="82" y1="50" x2="94" y2="34" animate={{ rotate: [0,10,0] }} style={{ transformOrigin: '82px 50px' }} transition={{ duration: 0.6, repeat: Infinity }} />
        </g>
      )}
    </motion.svg>
  );
}
