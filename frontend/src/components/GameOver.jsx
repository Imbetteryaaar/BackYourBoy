import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Confetti from './Confetti';
import Mascot from './Mascot';
import { play } from '../lib/sound';

export default function GameOver({ gameState, isHost, onPlayAgain, onEndRoom }) {
  const { A, B } = gameState.scores;
  const winner = A > B ? 'A' : B > A ? 'B' : 'DRAW';
  const color = winner === 'A' ? '#FF7AA2' : winner === 'B' ? '#4FC0E8' : '#8B5CF6';

  useEffect(() => { play(winner === 'DRAW' ? 'doubt' : 'win'); }, []); // eslint-disable-line

  return (
    <div className="flex flex-col items-center justify-center min-h-[82vh] text-center relative">
      {winner !== 'DRAW' && <Confetti />}
      <motion.h1 initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 140 }}
        className="font-display font-bold text-5xl md:text-6xl text-ink -rotate-2 mb-6">
        GAME OVER
      </motion.h1>

      <Mascot mood={winner === 'DRAW' ? 'think' : 'win'} color={color} size={130} className="mb-2" />

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="relative w-full max-w-md p-8 rounded-5xl text-center my-6 shadow-toon-lg"
        style={{ background: color }}>
        <div className="text-sm uppercase font-bold text-white/70 mb-1 tracking-[0.25em]">Winner</div>
        {winner === 'DRAW'
          ? <div className="text-4xl font-display font-bold text-white">IT'S A DRAW!</div>
          : <div className="text-5xl font-display font-bold text-white">TEAM {winner === 'A' ? 'PINK' : 'BLUE'} 🏆</div>}
        <div className="mt-5 inline-block bg-white/90 px-6 py-2 rounded-full">
          <span className="text-2xl font-display font-bold text-ink">{A} — {B}</span>
        </div>
      </motion.div>

      {isHost ? (
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md px-4">
          <button onClick={() => { play('whoosh'); onPlayAgain(); }} className="btn-primary flex-1 text-xl">🔄 PLAY AGAIN</button>
          <button onClick={onEndRoom} className="btn-ghost flex-1 text-lg">END ROOM</button>
        </div>
      ) : (
        <div className="toon-card-flat px-7 py-3 rounded-full text-ink/50 font-bold animate-pulse">Waiting for Host…</div>
      )}
    </div>
  );
}
