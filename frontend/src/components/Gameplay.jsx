import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Mascot from './Mascot';
import { play } from '../lib/sound';

const HYPE = ['Nice!', 'Keep going!', 'On fire! 🔥', 'Unstoppable!', 'Legend! 🏆'];

export default function Gameplay({
  task, target, isActiveTeam, isBoy, timeLimit, mode, stakes,
  onSubmit, onGiveUp, onLiveUpdate, onLiveCount, liveBubbles, liveCount,
}) {
  const amPerformer = isActiveTeam && isBoy;
  const isSpeak = mode === 'SPEAK';
  const color = isActiveTeam ? (isActiveTeam ? '#FF7AA2' : '#4FC0E8') : '#FFD23F';

  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [bubbles, setBubbles] = useState([]);
  const [count, setCount] = useState(0);
  const [input, setInput] = useState('');
  const [flash, setFlash] = useState(0);
  const inputRef = useRef(null);
  const stateRef = useRef({ bubbles: [], count: 0 });
  stateRef.current = { bubbles, count };

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      if (amPerformer) onSubmit(isSpeak ? { count: stateRef.current.count } : { answers: stateRef.current.bubbles });
      return;
    }
    if (amPerformer && timeLeft <= 5) play(timeLeft <= 3 ? 'urgent' : 'tick');
    const t = setTimeout(() => setTimeLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const progress = Math.min(1, (isSpeak ? count : bubbles.length) / Math.max(1, target));

  // ---- TYPE mode helpers ----
  const addBubble = () => {
    const w = input.trim();
    if (!w) return;
    const next = [...bubbles, w];
    setBubbles(next); setInput(''); onLiveUpdate(next);
    setFlash(next.length); play('add');
    if (next.length >= target) { play('success'); onSubmit({ answers: next }); }
    setTimeout(() => inputRef.current?.focus(), 10);
  };
  const removeBubble = (i) => {
    const next = bubbles.filter((_, idx) => idx !== i);
    setBubbles(next); onLiveUpdate(next); play('remove'); inputRef.current?.focus();
  };

  // ---- SPEAK mode helpers ----
  const tap = () => {
    const next = count + 1;
    setCount(next); onLiveCount(next); setFlash(next); play('pop');
    if (next >= target) play('success');
  };
  const untap = () => { const next = Math.max(0, count - 1); setCount(next); onLiveCount(next); play('remove'); };

  const displayBubbles = amPerformer ? bubbles : liveBubbles;
  const displayCount = amPerformer ? count : liveCount;

  const ringColor = progress >= 1 ? '#34D399' : (isActiveTeam ? '#FF7AA2' : '#4FC0E8');

  return (
    <div className="max-w-2xl mx-auto min-h-[78vh] flex flex-col">
      {/* Header: timer + progress ring */}
      <div className="flex justify-between items-center mb-3 px-1">
        <div className={`font-display font-bold leading-none ${timeLeft < 10 ? 'text-team-a-dk animate-pulse' : 'text-ink'}`}
          style={{ fontSize: '3.2rem' }}>{timeLeft}</div>
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(59,46,74,0.1)" strokeWidth="4" />
            <motion.circle cx="18" cy="18" r="15.5" fill="none" stroke={ringColor} strokeWidth="4" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 15.5}
              animate={{ strokeDashoffset: 2 * Math.PI * 15.5 * (1 - progress) }} transition={{ type: 'spring', stiffness: 120 }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-xl">
            {displayCount}/{target}
          </div>
        </div>
      </div>

      {stakes > 1 && (
        <div className="mb-2 text-center pill bg-grape text-white font-bold mx-auto animate-pulse">🎲 DOUBLE OR NOTHING</div>
      )}

      <div className="toon-card-flat p-4 text-center mb-4 bg-sun">
        <h2 className="text-ink/50 text-[10px] font-bold tracking-widest mb-0.5">CATEGORY · {isSpeak ? 'SPEAK IT' : 'TYPE IT'}</h2>
        <div className="text-2xl font-display font-bold text-ink leading-tight">{task}</div>
      </div>

      {/* combo flash */}
      <AnimatePresence>
        {flash > 0 && (
          <motion.div key={flash} initial={{ scale: 0.5, opacity: 0, y: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}
            className="text-center font-display font-bold text-grape -mt-1 mb-1">
            {flash >= target ? 'TARGET HIT! 🎯' : `${flash}!  ${HYPE[Math.min(HYPE.length - 1, Math.floor((flash - 1) / 2))]}`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* BODY */}
      {isSpeak ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          {amPerformer ? (
            <>
              <motion.button onClick={tap} whileTap={{ scale: 0.9 }}
                className="w-56 h-56 rounded-full text-white font-display shadow-toon-lg flex flex-col items-center justify-center"
                style={{ background: progress >= 1 ? '#34D399' : 'linear-gradient(160deg,#A78BFA,#8B5CF6)' }}>
                <span className="text-7xl font-bold leading-none">{count}</span>
                <span className="text-sm font-bold tracking-widest mt-1 opacity-90">TAP PER ANSWER</span>
              </motion.button>
              <p className="text-ink/60 font-semibold mt-5 text-center px-6">Say each answer out loud, then tap. The room is judging you! 👀</p>
              <button onClick={untap} className="btn-ghost mt-3 py-2 px-5 text-sm">↩︎ Miscount</button>
            </>
          ) : (
            <div className="text-center">
              <Mascot mood="cheer" color={isActiveTeam ? color : '#FFD23F'} size={120} />
              <div className="text-7xl font-display font-bold text-ink mt-2">{displayCount}</div>
              <p className="font-bold text-ink/50 mt-1">{isActiveTeam ? '📣 Cheer for your Boy!' : '👀 Listening…'}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto content-start flex flex-wrap gap-2 p-1 pb-28">
          {displayBubbles.length === 0 && (
            <div className="w-full text-center text-ink/30 font-semibold mt-8">
              {amPerformer ? 'Start typing answers…' : 'Waiting for the first answer…'}
            </div>
          )}
          <AnimatePresence>
            {displayBubbles.map((word, idx) => (
              <motion.div key={`${word}-${idx}`} layout initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                onClick={() => amPerformer && removeBubble(idx)}
                className={`bg-white px-4 py-2 rounded-full font-bold text-lg shadow-toon-sm flex gap-2 items-center ${amPerformer ? 'cursor-pointer hover:bg-team-a/10' : ''}`}>
                {word}{amPerformer && <span className="text-team-a-dk text-xs">✕</span>}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* FOOTER */}
      {amPerformer ? (
        isSpeak ? (
          <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur border-t border-ink/10 z-20">
            <div className="max-w-2xl mx-auto flex gap-2">
              <button onClick={onGiveUp} className="btn-ghost flex-1 text-team-a-dk py-3">Give Up</button>
              <button onClick={() => { play('success'); onSubmit({ count }); }} disabled={count < target}
                className="btn-primary flex-[2] py-3 disabled:opacity-40">DONE ({count}/{target})</button>
            </div>
          </div>
        ) : (
          <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur border-t border-ink/10 z-20">
            <div className="max-w-2xl mx-auto flex gap-2">
              <input ref={inputRef} autoFocus value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBubble(); } }}
                placeholder="Type an answer…" enterKeyHint="done"
                className="flex-1 bg-ink/5 rounded-2xl px-4 py-3 font-bold text-lg outline-none focus:bg-white focus:ring-2 focus:ring-grape/30" />
              <button onClick={addBubble} className="btn-toon bg-mint text-white px-5 text-xl">⏎</button>
            </div>
            <div className="max-w-2xl mx-auto flex justify-between mt-2 px-1">
              <button onClick={onGiveUp} className="text-xs font-bold text-team-a-dk">GIVE UP</button>
              {bubbles.length > 0 && <button onClick={() => onSubmit({ answers: bubbles })} className="text-xs font-bold text-emerald-600">SUBMIT NOW</button>}
            </div>
          </div>
        )
      ) : (
        <div className="fixed bottom-8 left-0 w-full text-center px-4 pointer-events-none">
          <div className="toon-card-flat inline-block px-7 py-3 font-display font-bold text-ink animate-bob"
            style={{ background: isActiveTeam ? '#FFE3EC' : '#fff' }}>
            {isActiveTeam ? '📣 CHEER FOR YOUR BOY!' : '👀 WATCHING…'}
          </div>
        </div>
      )}
    </div>
  );
}
