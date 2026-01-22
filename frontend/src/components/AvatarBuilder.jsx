import React, { useState } from 'react';
import Avatar, { genConfig } from 'react-nice-avatar';

export default function AvatarBuilder({ onComplete }) {
  const [config, setConfig] = useState(genConfig());
  const [name, setName] = useState("");

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900">
      <div className="bg-white p-6 rounded-2xl w-80 text-center">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Customize Look</h2>
        <div className="h-32 w-32 mx-auto mb-4">
          <Avatar style={{ width: '100%', height: '100%' }} {...config} />
        </div>
        <button onClick={() => setConfig(genConfig())} className="text-blue-500 text-sm mb-4">
          Randomize
        </button>
        <input 
          className="w-full p-2 border rounded mb-4 text-black"
          placeholder="Your Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button 
          onClick={() => onComplete({ id: crypto.randomUUID(), name, avatar: config })}
          className="w-full bg-yellow-400 py-2 rounded font-bold text-slate-900">
          ENTER GAME
        </button>
      </div>
    </div>
  );
}