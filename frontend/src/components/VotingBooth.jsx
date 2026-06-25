import React, { useState } from 'react';
import Avatar from 'react-nice-avatar';
import { motion } from 'framer-motion';
import { play } from '../lib/sound';

export default function VotingBooth({ players, task, myTeam, votes, onVote, isHost, onReroll, onCustomTask, mode }) {
  const teammates = players.filter((p) => p.team === myTeam);
  const accent = myTeam === 'A' ? 'text-team-a-dk' : 'text-team-b-dk';
  const [isEditing, setIsEditing] = useState(false);
  const [customText, setCustomText] = useState('');

  const handleSave = () => {
    if (customText.trim()) { onCustomTask(customText); setIsEditing(false); setCustomText(''); play('pop'); }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center mt-2">
      <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="toon-card p-7 mb-8 text-center w-full max-w-xl relative">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-ink/40 text-xs font-bold uppercase tracking-[0.3em]">This Round</span>
          <span className={`pill ${mode === 'SPEAK' ? 'bg-grape/15 text-grape' : 'bg-team-b/15 text-team-b-dk'}`}>
            {mode === 'SPEAK' ? '🗣️ Speak It' : '⌨️ Type It'}
          </span>
        </div>

        {isEditing ? (
          <div className="animate-pop">
            <textarea autoFocus value={customText} onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type your own category…" rows={2}
              className="input-toon mb-3 resize-none" />
            <div className="flex gap-2 justify-center">
              <button onClick={() => setIsEditing(false)} className="btn-ghost px-5 py-2">Cancel</button>
              <button onClick={handleSave} disabled={!customText.trim()} className="btn-grape px-6 py-2 disabled:opacity-40">Save</button>
            </div>
          </div>
        ) : (
          <>
            <h1 className={`text-3xl md:text-4xl font-display font-bold ${accent} leading-tight mb-5`}>{task}</h1>
            {isHost && (
              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-4 border-t border-dashed border-ink/15">
                <button onClick={() => { onReroll(); play('whoosh'); }} className="btn-ghost py-2 px-4 text-sm">🎲 Reroll</button>
                <button onClick={() => setIsEditing(true)} className="btn-toon bg-sun text-ink py-2 px-4 text-sm">✏️ Custom</button>
              </div>
            )}
          </>
        )}
      </motion.div>

      {!isEditing && (
        <p className="mb-7 font-bold uppercase tracking-widest text-sm text-ink/50 animate-pulse">
          👇 Tap a teammate to back them
        </p>
      )}

      <div className="flex justify-center gap-6 sm:gap-10 flex-wrap">
        {teammates.map((p) => {
          const voteCount = Object.values(votes || {}).filter((t) => t === p.id).length;
          return (
            <motion.button key={p.id} whileHover={{ y: -8 }} whileTap={{ scale: 0.94 }}
              onClick={() => { if (!isEditing) { onVote(p.id); play('pop'); } }}
              disabled={isEditing}
              className={`relative no-tap ${isEditing ? 'opacity-50' : ''}`}>
              {voteCount > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-sun text-ink w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-lg shadow-pop z-10">
                  {voteCount}
                </motion.div>
              )}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-white shadow-toon overflow-hidden bg-white">
                <Avatar style={{ width: '100%', height: '100%' }} {...p.avatar} />
              </div>
              <div className="mt-3 bg-white/90 px-4 py-1 rounded-full inline-block shadow-toon-sm">
                <span className="font-bold text-ink">{p.name}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
