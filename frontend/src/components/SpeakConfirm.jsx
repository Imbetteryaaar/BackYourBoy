import React from 'react';
import { motion } from 'framer-motion';
import Mascot from './Mascot';
import { play } from '../lib/sound';

// In Speak It mode the opponent is the judge: did the Boy really name enough?
export default function SpeakConfirm({ rr, task, isOpponent, onConfirm }) {
  const color = rr.active_team === 'A' ? '#FF7AA2' : '#4FC0E8';
  const teamName = rr.active_team === 'A' ? 'PINK' : 'BLUE';

  return (
    <div className="max-w-md mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center">
      <Mascot mood="happy" color={color} size={110} className="mb-3" />
      <p className="text-ink/50 font-bold uppercase tracking-widest text-xs mb-1">{task}</p>
      <h2 className="font-display font-bold text-2xl text-ink mb-1">
        Team {teamName} claims <span className="text-grape">{rr.claimed_count}</span> / {rr.target}
      </h2>

      {isOpponent ? (
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full mt-6 space-y-3">
          <p className="text-ink/60 font-semibold">You're the judge. Did they really do it?</p>
          <button onClick={() => { play('success'); onConfirm(true); }} className="btn-toon bg-mint text-white w-full text-lg py-4">✅ They nailed it</button>
          <button onClick={() => { play('bullshit'); onConfirm(false); }} className="btn-toon bg-team-a-dk text-white w-full text-lg py-4">❌ They cheated!</button>
        </motion.div>
      ) : (
        <div className="font-bold text-ink/40 animate-pulse py-8">Opponent is deciding your fate… 🤞</div>
      )}
    </div>
  );
}
