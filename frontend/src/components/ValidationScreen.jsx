import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { play } from '../lib/sound';

export default function ValidationScreen({ answers, target, isOpponent, onToggle, onFinalize }) {
  const validCount = answers.filter((a) => a.valid).length;
  const isSuccess = validCount >= target;

  return (
    <div className="max-w-2xl mx-auto mt-2 pb-28">
      <div className="toon-card p-5 mb-6 flex justify-between items-center">
        <div>
          <div className="text-xs font-bold text-ink/40 uppercase tracking-widest">Target</div>
          <div className="text-3xl font-display font-bold">{target}</div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-ink/40 uppercase tracking-widest">Still Valid</div>
          <div className={`text-4xl font-display font-bold ${isSuccess ? 'text-mint' : 'text-team-a-dk'}`}>{validCount}</div>
        </div>
      </div>

      {isOpponent ? (
        <div className="bg-sun text-ink px-5 py-3 rounded-3xl mb-5 font-bold text-center shadow-toon-sm -rotate-1">
          👆 Tap any wrong / repeated answers to strike them out
        </div>
      ) : (
        <div className="text-center text-ink/40 italic mb-5 font-semibold">Opponent is checking your answers…</div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {answers.map((item, idx) => (
          <motion.button key={idx} layout disabled={!isOpponent}
            whileTap={isOpponent ? { scale: 0.9 } : {}}
            onClick={() => { onToggle(idx); play(item.valid ? 'remove' : 'pop'); }}
            className={`px-5 py-3 rounded-2xl font-bold text-lg transition shadow-toon-sm ${item.valid ? 'bg-white text-ink' : 'bg-team-a/20 text-team-a-dk line-through opacity-60 scale-95 shadow-none'} ${!isOpponent ? 'cursor-default' : ''}`}>
            {item.word}
          </motion.button>
        ))}
      </div>

      {isOpponent && (
        <div className="fixed bottom-6 left-0 w-full px-4 text-center">
          <button onClick={() => { play(isSuccess ? 'fail' : 'success'); onFinalize(); }}
            className="btn-grape px-10 py-4 text-xl">FINALIZE ROUND →</button>
        </div>
      )}
    </div>
  );
}
