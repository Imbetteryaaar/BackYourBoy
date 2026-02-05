import React, { useState } from 'react';
import Avatar from 'react-nice-avatar';

export default function VotingBooth({ players, task, myTeam, votes, onVote, isHost, onReroll, onCustomTask }) {
  const teammates = players.filter(p => p.team === myTeam);
  const accent = myTeam === "A" ? "text-pop-pink" : "text-pop-blue";
  
  // Local state for writing a custom task
  const [isEditing, setIsEditing] = useState(false);
  const [customText, setCustomText] = useState("");

  const handleSave = () => {
    if (customText.trim()) {
      onCustomTask(customText);
      setIsEditing(false);
      setCustomText("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center mt-4">
      
      {/* TASK CARD */}
      <div className="fun-card p-8 mb-10 text-center w-full max-w-xl transform rotate-1 relative transition-all">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>
        <h2 className="text-gray-400 text-xs font-black uppercase tracking-[0.3em] mb-3">CURRENT MISSION</h2>
        
        {isEditing ? (
            /* EDIT MODE */
            <div className="animate-pop">
                <textarea 
                    autoFocus
                    value={customText} 
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Type your own task here..."
                    className="w-full bg-gray-100 border-4 border-black rounded-xl p-3 font-black text-xl text-center focus:outline-none focus:bg-white resize-none mb-4"
                    rows={2}
                />
                <div className="flex gap-2 justify-center">
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg font-bold border-2 border-black"
                    >
                        CANCEL
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={!customText.trim()}
                        className="bg-green-500 hover:bg-green-400 text-white px-6 py-2 rounded-lg font-bold border-2 border-black disabled:opacity-50"
                    >
                        SAVE
                    </button>
                </div>
            </div>
        ) : (
            /* VIEW MODE */
            <>
                <h1 className={`text-3xl md:text-4xl font-black ${accent} leading-tight mb-6`}>{task}</h1>
                
                {/* HOST CONTROLS */}
                {isHost && (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 pt-6 border-t-2 border-dashed border-gray-300">
                        <button 
                            onClick={onReroll}
                            className="bg-gray-100 hover:bg-white text-black px-4 py-2 rounded-xl font-black text-xs border-2 border-black flex items-center justify-center gap-2 transition-all hover:-translate-y-1 shadow-hard-sm active:translate-y-0 active:shadow-none"
                        >
                            🎲 REROLL RANDOM
                        </button>
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-pop-yellow hover:bg-yellow-300 text-black px-4 py-2 rounded-xl font-black text-xs border-2 border-black flex items-center justify-center gap-2 transition-all hover:-translate-y-1 shadow-hard-sm active:translate-y-0 active:shadow-none"
                        >
                            ✏️ WRITE CUSTOM
                        </button>
                    </div>
                )}
            </>
        )}
      </div>
      
      {!isEditing && (
          <p className="mb-8 font-bold animate-pulse uppercase tracking-widest text-sm text-gray-500">
            Tap a teammate to "Back" them
          </p>
      )}
      
      {/* AVATAR GRID */}
      <div className="flex justify-center gap-8 flex-wrap">
        {teammates.map(p => {
          const voteCount = Object.values(votes || {}).filter(targetId => targetId === p.id).length;

          return (
            <button 
              key={p.id}
              onClick={() => onVote(p.id)}
              disabled={isEditing} // Disable voting while host is typing
              className={`group relative transition hover:-translate-y-2 focus:outline-none ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {voteCount > 0 && (
                <div className="absolute -top-3 -right-3 bg-pop-yellow text-slate-900 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-xl z-10 animate-pop border-4 border-slate-900">
                  {voteCount}
                </div>
              )}

              <div className="w-28 h-28 rounded-full border-4 border-white/10 group-hover:border-yellow-400 bg-slate-800 overflow-hidden shadow-2xl transition-all duration-300">
                 <Avatar style={{ width: '100%', height: '100%' }} {...p.avatar} />
              </div>
              
              <div className="mt-4 bg-slate-900/80 px-4 py-1 rounded-full inline-block">
                <span className="font-bold text-white text-lg">{p.name}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}