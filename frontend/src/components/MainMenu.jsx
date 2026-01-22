import React, { useState } from 'react';
import Avatar, { genConfig } from 'react-nice-avatar';

export default function MainMenu({ onJoin }) {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [avatar, setAvatar] = useState(genConfig());
  const [mode, setMode] = useState("MENU"); // MENU, JOIN, CUSTOMIZE

  const handleCreate = async () => {
    // Fetch a random code from backend
    const res = await fetch("http://localhost:8000/api/create-room");
    const data = await res.json();
    onJoin(name, avatar, data.room_code);
  };

  if (mode === "CUSTOMIZE") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center w-96">
          <h2 className="text-2xl font-bold mb-4">Customize</h2>
          <div className="w-32 h-32 mx-auto mb-4">
             <Avatar style={{ width: '100%', height: '100%' }} {...avatar} />
          </div>
          <button onClick={() => setAvatar(genConfig())} className="text-blue-400 text-sm mb-6 hover:underline">Randomize Look</button>
          <input 
            className="w-full p-3 rounded bg-slate-700 text-white mb-4 border border-slate-600 focus:border-yellow-400 outline-none"
            placeholder="Enter your nickname"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <button 
            disabled={!name}
            onClick={() => setMode("MENU")}
            className="w-full bg-green-500 py-3 rounded-lg font-bold hover:bg-green-600 disabled:opacity-50">
            Confirm Identity
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
      <h1 className="text-5xl font-black text-yellow-400 mb-10 tracking-tighter">BACK YOUR BOY</h1>
      
      <div className="bg-slate-800 p-8 rounded-2xl w-96 shadow-2xl">
        <div className="flex items-center gap-4 mb-8 bg-slate-700 p-4 rounded-lg cursor-pointer hover:bg-slate-600" onClick={() => setMode("CUSTOMIZE")}>
          <div className="w-12 h-12"><Avatar style={{ width: '100%', height: '100%' }} {...avatar} /></div>
          <div>
            <div className="text-xs text-gray-400">Playing as</div>
            <div className="font-bold text-lg">{name || "Guest (Click to Edit)"}</div>
          </div>
        </div>

        <button 
          onClick={handleCreate}
          disabled={!name}
          className="w-full bg-indigo-600 py-4 rounded-xl font-bold text-xl mb-4 hover:bg-indigo-700 transition disabled:opacity-50">
          HOST NEW GAME
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-600"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-slate-800 text-gray-400">OR</span></div>
        </div>

        <div className="flex gap-2">
          <input 
            value={roomCode}
            onChange={e => setRoomCode(e.target.value.toUpperCase())}
            maxLength={4}
            placeholder="CODE"
            className="w-24 p-3 text-center font-mono font-bold text-xl rounded-lg bg-slate-900 border border-slate-600 uppercase"
          />
          <button 
            onClick={() => onJoin(name, avatar, roomCode)}
            disabled={!name || roomCode.length !== 4}
            className="flex-1 bg-slate-700 py-3 rounded-lg font-bold hover:bg-slate-600 disabled:opacity-50">
            JOIN ROOM
          </button>
        </div>
      </div>
    </div>
  );
}