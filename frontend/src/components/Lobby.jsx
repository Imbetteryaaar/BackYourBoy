import React, { useState } from 'react';
import Avatar from 'react-nice-avatar';

// Added 'onExit' to props
export default function Lobby({ gameState, playerId, onStart, onSettingChange, onSwitchTeam, onExit }) {
  const isHost = gameState.host_id === playerId;
  const [localTimer, setLocalTimer] = useState(gameState.settings.timer); // seconds
  const [localRounds, setLocalRounds] = useState(gameState.settings.max_rounds);

  // Time options: 30s to 4 mins
  const timeOptions = [30, 45, 60, 90, 120, 180, 240];

  const canStart = gameState.teams.A.length >= 2 && gameState.teams.B.length >= 2;

  const TeamCard = ({ team, name, colorClass, players }) => (
    <div className={`flex-1 rounded-3xl p-4 border-4 border-black shadow-hard flex flex-col ${colorClass}`}>
      <h3 className="text-center font-black text-2xl mb-4 text-white drop-shadow-[2px_2px_0_#000]">{name}</h3>
      <div className="flex-1 space-y-2 min-h-[150px] bg-white/30 rounded-xl p-2">
        {players.length === 0 && <div className="text-center text-white/70 italic mt-10 font-bold">Empty...</div>}
        {players.map(p => (
          <div key={p.id} className="bg-white border-2 border-black p-2 rounded-xl flex items-center gap-3 relative shadow-hard-sm">
             <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-white">
                <Avatar style={{width:'100%',height:'100%'}} {...p.avatar}/>
             </div>
             <span className="font-bold truncate">{p.name}</span>
             {isHost && (
                <button onClick={() => onSwitchTeam(p.id, team === "A" ? "B" : "A")} className="ml-auto text-xs font-bold underline">Swap</button>
             )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-40"> {/* Increased padding bottom to fit new buttons */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <TeamCard team="A" name="TEAM PINK" colorClass="bg-pop-pink" players={gameState.teams.A} />
        <div className="hidden md:flex items-center justify-center">
            <div className="text-4xl font-black italic text-black">VS</div>
        </div>
        <TeamCard team="B" name="TEAM BLUE" colorClass="bg-pop-blue" players={gameState.teams.B} />
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t-4 border-black z-10 md:static md:rounded-3xl md:border-4 md:shadow-hard">
        {isHost ? (
            <div className="max-w-4xl mx-auto">
                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <label className="text-xs font-black uppercase mb-2 block">Time: {localTimer}s</label>
                        <input 
                            type="range" 
                            min="0" max="6" 
                            value={timeOptions.indexOf(localTimer)} 
                            onChange={e => {
                                const newTime = timeOptions[e.target.value];
                                setLocalTimer(newTime);
                                onSettingChange(newTime, localRounds);
                            }} 
                            className="w-full accent-black h-4 bg-gray-200 rounded-full border-2 border-black appearance-none cursor-pointer"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-black uppercase mb-2 block">Rounds: {localRounds}</label>
                        <input 
                            type="range" min="3" max="10" 
                            value={localRounds} 
                            onChange={e => {
                                const newRounds = e.target.value;
                                setLocalRounds(newRounds);
                                onSettingChange(localTimer, newRounds);
                            }} 
                            className="w-full accent-black h-4 bg-gray-200 rounded-full border-2 border-black appearance-none cursor-pointer"
                        />
                    </div>
                </div>
                
                {/* HOST ACTIONS ROW */}
                <div className="flex gap-3">
                    <button 
                        onClick={onExit}
                        className="flex-1 bg-white border-4 border-black shadow-hard rounded-xl font-black text-lg py-4 text-red-500 hover:bg-red-50 active:translate-y-1 active:shadow-none transition-all"
                    >
                        EXIT
                    </button>
                    
                    {canStart ? (
                        <button onClick={onStart} className="flex-[3] btn-primary py-4 text-xl">START MATCH</button>
                    ) : (
                        <button disabled className="flex-[3] bg-gray-300 border-4 border-gray-400 text-gray-500 py-4 rounded-xl font-black text-xl cursor-not-allowed">
                            WAITING FOR 4 PLAYERS
                        </button>
                    )}
                </div>
            </div>
        ) : (
            <div className="max-w-4xl mx-auto">
                <div className="text-center font-bold text-gray-400 animate-pulse py-2">
                    {canStart ? "Waiting for Host to start..." : "Waiting for more players..."}
                </div>
                {/* GUEST EXIT BUTTON */}
                <button 
                    onClick={onExit}
                    className="w-full mt-2 bg-white border-4 border-black shadow-hard rounded-xl font-black text-lg py-4 text-red-500 hover:bg-red-50 active:translate-y-1 active:shadow-none transition-all"
                >
                    LEAVE ROOM
                </button>
            </div>
        )}
      </div>
    </div>
  );
}