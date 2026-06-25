import React, { useState } from 'react';
import Avatar from './Avatar';
import { motion } from 'framer-motion';
import { play } from '../lib/sound';

const TIME_OPTIONS = [30, 45, 60, 90, 120, 180, 240];
const MODES = [
  { key: 'TYPE', label: '⌨️ Type', desc: 'Type answers' },
  { key: 'SPEAK', label: '🗣️ Speak', desc: 'Say + tap' },
  { key: 'MIXED', label: '🎲 Mixed', desc: 'Random each round' },
];

export default function Lobby({ gameState, playerId, onStart, onSettingChange, onTogglePack, onSwitchTeam, onExit }) {
  const isHost = gameState.host_id === playerId;
  const s = gameState.settings;
  const [localTimer, setLocalTimer] = useState(s.timer);
  const [localRounds, setLocalRounds] = useState(s.max_rounds);
  const canStart = gameState.teams.A.length >= 2 && gameState.teams.B.length >= 2;
  const packMeta = gameState.pack_meta || {};
  const activePacks = s.packs || [];

  const TeamCard = ({ team, name, grad, players }) => (
    <div className="flex-1 rounded-4xl p-4 shadow-toon" style={{ background: grad }}>
      <h3 className="text-center font-display font-bold text-2xl mb-3 text-white drop-shadow">{name}</h3>
      <div className="space-y-2 min-h-[140px] bg-white/25 rounded-3xl p-2">
        {players.length === 0 && <div className="text-center text-white/80 italic mt-10 font-semibold">Empty…</div>}
        {players.map((p) => (
          <motion.div key={p.id} layout initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-2 rounded-2xl flex items-center gap-3 shadow-toon-sm">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white shrink-0 ring-2 ring-white">
              <Avatar style={{ width: '100%', height: '100%' }} {...p.avatar} />
            </div>
            <span className="font-bold truncate">{p.name}</span>
            {p.id === gameState.host_id && <span className="pill bg-sun text-ink ml-auto shrink-0">👑</span>}
            {isHost && p.id !== gameState.host_id && (
              <button onClick={() => { onSwitchTeam(p.id, team === 'A' ? 'B' : 'A'); play('click'); }}
                className="ml-auto pill bg-ink/10 text-ink shrink-0">Swap</button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-44">
      <div className="flex gap-3 sm:gap-4 mb-6 items-stretch">
        <TeamCard team="A" name="PINK" grad="linear-gradient(160deg,#FF9CBB,#E84F7E)" players={gameState.teams.A} />
        <div className="flex items-center justify-center font-display font-bold italic text-3xl text-ink/70">VS</div>
        <TeamCard team="B" name="BLUE" grad="linear-gradient(160deg,#7DD6F2,#2A9BD4)" players={gameState.teams.B} />
      </div>

      {isHost && (
        <div className="toon-card p-5 mb-4 space-y-5">
          <div className="flex gap-5">
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-wide text-ink/60 mb-1 block">⏱ Timer: {localTimer}s</label>
              <input type="range" min="0" max="6" value={TIME_OPTIONS.indexOf(localTimer)}
                onChange={(e) => { const t = TIME_OPTIONS[e.target.value]; setLocalTimer(t); onSettingChange({ timer: t, rounds: localRounds }); }}
                className="w-full" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-wide text-ink/60 mb-1 block">🏁 Rounds: {localRounds}</label>
              <input type="range" min="3" max="12" value={localRounds}
                onChange={(e) => { const r = +e.target.value; setLocalRounds(r); onSettingChange({ timer: localTimer, rounds: r }); }}
                className="w-full" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-ink/60 mb-2 block">Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map((m) => (
                <button key={m.key} onClick={() => { onSettingChange({ game_mode: m.key }); play('pop'); }}
                  className={`rounded-2xl py-2 px-1 text-center transition border-2 ${s.game_mode === m.key ? 'bg-grape text-white border-grape shadow-toon-sm' : 'bg-white text-ink border-ink/10'}`}>
                  <div className="font-bold text-sm">{m.label}</div>
                  <div className="text-[10px] opacity-70">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-ink/60 mb-2 block">
              Category Packs <span className="text-ink/40">({activePacks.length} on)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(packMeta).map(([key, meta]) => {
                const on = activePacks.includes(key);
                return (
                  <button key={key} onClick={() => { onTogglePack(key); play('click'); }}
                    className={`pill border-2 transition ${on ? 'bg-mint/20 border-mint text-emerald-700' : 'bg-white border-ink/10 text-ink/40'}`}>
                    {meta.emoji} {meta.name}{on ? ' ✓' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur border-t border-ink/10 z-10 md:static md:bg-transparent md:border-0 md:p-0">
        <div className="max-w-4xl mx-auto">
          {isHost ? (
            <div className="flex gap-3">
              <button onClick={onExit} className="btn-ghost flex-1 text-team-a-dk">EXIT</button>
              {canStart ? (
                <button onClick={() => { onStart(); play('whoosh'); }} className="btn-primary flex-[3] text-xl">🚀 START MATCH</button>
              ) : (
                <button disabled className="btn-toon flex-[3] bg-ink/10 text-ink/40 py-4 text-lg">WAITING FOR 4 PLAYERS…</button>
              )}
            </div>
          ) : (
            <div>
              <div className="text-center font-semibold text-ink/50 py-2 animate-pulse">
                {canStart ? 'Waiting for Host to start…' : 'Waiting for more players…'}
              </div>
              <button onClick={onExit} className="btn-ghost w-full text-team-a-dk mt-1">LEAVE ROOM</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
