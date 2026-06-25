import React, { useState } from 'react';
import Avatar, { genConfig } from './Avatar';
import { motion } from 'framer-motion';
import Mascot from './Mascot';
import { API_URL } from '../lib/config';
import { play } from '../lib/sound';

export default function MainMenu({ onJoin }) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [avatar, setAvatar] = useState(genConfig());
  const [mode, setMode] = useState('HOME');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    play('whoosh');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/create-room`);
      const data = await res.json();
      onJoin(name.trim(), avatar, data.room_code);
    } catch (e) {
      setLoading(false);
      alert("Couldn't reach the server. Is the backend running?");
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 no-tap">
      <motion.div
        initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        className="w-full max-w-md text-center"
      >
        {/* Title + mascots */}
        <div className="flex items-end justify-center gap-1 mb-2">
          <Mascot mood="happy" color="#FF7AA2" size={70} />
          <h1 className="font-display font-bold text-5xl sm:text-6xl leading-[0.9] text-ink drop-shadow-sm">
            BACK<br />YOUR<br />BOY
          </h1>
          <Mascot mood="cheer" color="#4FC0E8" size={70} />
        </div>
        <p className="text-ink/60 font-semibold mb-6">Bluff. Bid. Back your boy. 🎉</p>

        <div className="toon-card p-6">
          <div className="flex flex-col items-center mb-5">
            <motion.div whileTap={{ scale: 0.92, rotate: -6 }}
              className="w-24 h-24 rounded-full border-4 border-white shadow-pop overflow-hidden bg-white">
              <Avatar style={{ width: '100%', height: '100%' }} {...avatar} />
            </motion.div>
            <button
              onClick={() => { setAvatar(genConfig()); play('pop'); }}
              className="mt-3 pill bg-grape/10 text-grape font-bold hover:bg-grape/20 transition">
              🎲 Randomize Look
            </button>
          </div>

          <input
            className="input-toon mb-5"
            placeholder="YOUR NAME"
            value={name}
            maxLength={14}
            onChange={(e) => setName(e.target.value)}
          />

          {mode === 'HOME' ? (
            <div className="flex flex-col gap-3">
              <button onClick={handleCreate} disabled={!name.trim() || loading}
                className="btn-primary text-xl disabled:opacity-40 disabled:translate-y-0">
                {loading ? 'CREATING…' : '🎈 HOST GAME'}
              </button>
              <button onClick={() => { setMode('JOIN'); play('click'); }} disabled={!name.trim()}
                className="btn-ghost disabled:opacity-40">
                🔑 JOIN ROOM
              </button>
            </div>
          ) : (
            <div>
              <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={4}
                placeholder="CODE"
                className="input-toon mb-4 font-mono text-3xl tracking-[0.4em]"
              />
              <div className="flex gap-3">
                <button onClick={() => { setMode('HOME'); play('click'); }}
                  className="btn-ghost flex-1">Back</button>
                <button onClick={() => onJoin(name.trim(), avatar, roomCode)}
                  disabled={roomCode.length !== 4}
                  className="btn-grape flex-[2] disabled:opacity-40">ENTER →</button>
              </div>
            </div>
          )}
        </div>
        <p className="text-ink/40 text-xs font-semibold mt-5">2 vs 2 minimum · plays on any phone or laptop</p>
      </motion.div>
    </div>
  );
}
