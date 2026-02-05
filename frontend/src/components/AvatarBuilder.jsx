import React, { useState } from 'react';
import Avatar, { genConfig } from 'react-nice-avatar';

export default function AvatarBuilder({ onComplete }) {
  const [config, setConfig] = useState(genConfig());
  const [name, setName] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-cream">
      <div className="fun-card p-8 w-full max-w-sm text-center animate-pop">
        <h2 className="text-3xl font-black mb-6 text-black tracking-tight">WHO ARE YOU?</h2>
        
        <div className="w-32 h-32 mx-auto mb-6 bg-white rounded-full border-4 border-black shadow-hard-sm overflow-hidden">
          <Avatar style={{ width: '100%', height: '100%' }} {...config} />
        </div>
        
        <button 
          onClick={() => setConfig(genConfig())} 
          className="text-sm bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-full mb-6 transition font-bold">
          🎲 Randomize Look
        </button>
        
        <input 
          className="w-full p-4 rounded-xl border-4 border-black text-center font-bold text-xl mb-6 focus:shadow-hard focus:outline-none placeholder-gray-400"
          placeholder="ENTER NICKNAME"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        
        <button 
          onClick={() => onComplete({ id: crypto.randomUUID(), name, avatar: config })}
          disabled={!name.trim()}
          className="w-full btn-primary py-4 text-xl disabled:opacity-50 disabled:shadow-none">
          ENTER GAME
        </button>
      </div>
    </div>
  );
}