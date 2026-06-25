import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Mascot from './Mascot';
import { play } from '../lib/sound';

// Shown right after BULLSHIT is called. The performing team's backer may gamble
// on Double or Nothing before their Boy starts.
export default function StakesScreen({ rr, myTeam, isBacker, isBoy, onStart }) {
  const isActive = rr.active_team === myTeam;
  const color = rr.active_team === 'A' ? '#FF7AA2' : '#4FC0E8';
  const [chosen, setChosen] = useState(null);

  const go = (dbl) => { setChosen(dbl); play(dbl ? 'doubt' : 'whoosh'); onStart(dbl); };

  return (
    <div className="max-w-md mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center">
      <Mascot mood="nervous" color={color} size={120} className="mb-4" />
      <h2 className="font-display font-bold text-3xl text-ink mb-1">It's showtime!</h2>
      <p className="text-ink/60 font-semibold mb-6">
        Team {rr.active_team === 'A' ? 'PINK' : 'BLUE'} must name <span className="font-bold text-ink">{rr.target}</span>.
      </p>

      {isActive && isBacker && chosen === null ? (
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full space-y-3">
          <p className="text-ink/50 font-bold text-sm uppercase tracking-widest">Backer's call</p>
          <button onClick={() => go(false)} className="btn-primary w-full text-lg">▶️ Play it safe (1 point)</button>
          <button onClick={() => go(true)} className="btn-grape w-full text-lg">🎲 DOUBLE OR NOTHING (2 points)</button>
          <p className="text-ink/40 text-xs font-semibold">Double the reward… and double the risk if you fail.</p>
        </motion.div>
      ) : isActive && isBoy ? (
        <div className="toon-card-flat p-6 font-bold text-ink/60">Get ready to perform… 💪</div>
      ) : (
        <div className="font-bold text-ink/40 animate-pulse py-6">
          {isActive ? 'Your backer is deciding the stakes…' : 'The other team is deciding their fate… 🍿'}
        </div>
      )}
    </div>
  );
}
