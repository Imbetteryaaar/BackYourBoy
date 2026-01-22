import React, { useState } from 'react';
import Avatar from 'react-nice-avatar';

export default function Lobby({ gameState, playerId, onStart, onSettingChange, onSwitchTeam }) {
  const isHost = gameState.host_id === playerId;
  const [localTimer, setLocalTimer] = useState(gameState.settings.timer / 60);
  const [localRounds, setLocalRounds] = useState(gameState.settings.max_rounds);

  const handleSettingsUpdate = () => {
    onSettingChange(localTimer, localRounds);
  };

  const TeamPanel = ({ team, name, color }) => (
    <div className={`flex-1 ${color} bg-opacity-10 border-2 border-${color.split('-')[1]}-500 rounded-xl p-4`}>
      <h3 className="text-center font-bold mb-4 uppercase">{name}</h3>
      <div className="grid grid-cols-2 gap-2">
        {gameState.teams[team].map(p => (
          <div key={p.id} className="bg-slate-800 p-2 rounded flex flex-col items-center relative group">
            <div className="w-10 h-10"><Avatar style={{width:'100%',height:'100%'}} {...p.avatar}/></div>
            <span className="text-xs mt-1">{p.name}</span>
            {/* Host can click to switch teams */}
            {isHost && (
              <button 
                onClick={() => onSwitchTeam(p.id, team === "A" ? "B" : "A")}
                className="absolute top-0 right-0 bg-white text-black rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100">
                ⇄
              </button>
            )}
            {!p.connected && <span className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center text-xs text-red-500 font-bold">OFFLINE</span>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto mt-8">
      {/* ALERT MESSAGE */}
      {gameState.last_message && (
        <div className="bg-yellow-500 text-slate-900 p-3 text-center font-bold rounded mb-6 animate-bounce">
          {gameState.last_message}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Room: <span className="text-yellow-400 font-mono tracking-widest">{gameState.roomCode}</span></h2> {/* Room Code not sent yet, need to pass it */}
        {isHost && <span className="bg-indigo-600 px-3 py-1 rounded text-xs">YOU ARE HOST</span>}
      </div>

      <div className="flex gap-4 mb-8">
        <TeamPanel team="A" name="Team A" color="bg-red-500" />
        <div className="flex items-center font-bold text-gray-600">VS</div>
        <TeamPanel team="B" name="Team B" color="bg-blue-500" />
      </div>

      {isHost ? (
        <div className="bg-slate-800 p-6 rounded-xl mb-6">
          <h3 className="text-gray-400 text-sm font-bold uppercase mb-4">Game Settings</h3>
          <div className="flex gap-8 mb-6">
            <div className="flex-1">
              <label className="block text-sm mb-2">Timer: {localTimer} min</label>
              <input type="range" min="1" max="5" value={localTimer} 
                onChange={e => setLocalTimer(e.target.value)} onMouseUp={handleSettingsUpdate}
                className="w-full accent-yellow-400" />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-2">Rounds: {localRounds}</label>
              <input type="range" min="3" max="10" value={localRounds} 
                 onChange={e => setLocalRounds(e.target.value)} onMouseUp={handleSettingsUpdate}
                 className="w-full accent-yellow-400" />
            </div>
          </div>
          <button onClick={onStart} className="w-full bg-yellow-400 text-slate-900 font-bold py-3 rounded-lg text-lg hover:scale-105 transition">START MATCH</button>
        </div>
      ) : (
        <div className="text-center text-gray-500 animate-pulse">Waiting for Host to start...</div>
      )}
    </div>
  );
}