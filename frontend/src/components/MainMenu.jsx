import React, { useState } from 'react';
import Avatar, { genConfig } from 'react-nice-avatar';

export default function MainMenu({ onJoin }) {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [avatar, setAvatar] = useState(genConfig());
  const [mode, setMode] = useState("HOME"); 

  const handleCreate = async () => {
    const res = await fetch("http://localhost:8000/api/create-room");
    const data = await res.json();
    onJoin(name, avatar, data.room_code);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-cream">
      {/* Decorative Blobs */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-pop-pink rounded-full border-4 border-black opacity-20"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-pop-blue rounded-full border-4 border-black opacity-20"></div>

      <div className="relative z-10 w-full max-w-md text-center">
        <h1 className="text-6xl font-black text-white text-stroke-3 mb-6 tracking-tighter drop-shadow-[4px_4px_0_#000]" style={{ WebkitTextStroke: "3px black" }}>
          BACK<br/>YOUR<br/>BOY
        </h1>

        <div className="fun-card p-6 transform rotate-1 hover:rotate-0 transition duration-300">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-black mb-3 bg-white shadow-hard-sm">
               <Avatar style={{ width: '100%', height: '100%' }} {...avatar} />
            </div>
            <button onClick={() => setAvatar(genConfig())} className="text-xs font-bold underline hover:text-pop-blue">
              🎲 Randomize Look
            </button>
          </div>

          <input 
            className="w-full p-4 rounded-xl border-4 border-black text-center font-bold text-xl mb-6 focus:shadow-hard focus:outline-none placeholder-gray-400"
            placeholder="YOUR NAME"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          {mode === "HOME" ? (
            <div className="flex flex-col gap-3">
              <button onClick={handleCreate} disabled={!name} className="btn-primary py-4 text-xl disabled:opacity-50">
                HOST GAME
              </button>
              <button onClick={() => setMode("JOIN")} disabled={!name} className="bg-white border-4 border-black shadow-hard rounded-xl font-bold py-4 text-lg hover:bg-gray-50 disabled:opacity-50">
                JOIN ROOM
              </button>
            </div>
          ) : (
            <div>
              <input 
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                maxLength={4}
                placeholder="CODE"
                className="w-full p-4 rounded-xl border-4 border-black text-center font-mono font-black text-3xl mb-4 focus:shadow-hard focus:outline-none uppercase"
              />
              <div className="flex gap-3">
                <button onClick={() => setMode("HOME")} className="flex-1 font-bold border-4 border-transparent hover:underline">Back</button>
                <button onClick={() => onJoin(name, avatar, roomCode)} disabled={roomCode.length !== 4} className="flex-[2] btn-primary py-3 disabled:opacity-50">
                    ENTER
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}