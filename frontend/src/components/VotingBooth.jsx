import React from 'react';
import Avatar from 'react-nice-avatar';

export default function VotingBooth({ players, task, myTeam, votes, onVote }) {
  // Only show teammates
  const teammates = players.filter(p => p.team === myTeam);

  return (
    <div className="text-center mt-10">
      <h2 className="text-gray-400 text-lg uppercase tracking-widest mb-2">Current Task</h2>
      <div className="bg-slate-700 p-6 rounded-xl inline-block mb-10 max-w-2xl border border-slate-600">
        <h1 className="text-3xl font-bold text-yellow-300">{task}</h1>
      </div>
      
      <p className="mb-6 text-gray-300 animate-pulse">Tap the teammate you want to "Back":</p>
      
      <div className="flex justify-center gap-8 flex-wrap">
        {teammates.map(p => {
          // LOGIC: Count how many times this player's ID appears in the votes object
          const voteCount = Object.values(votes || {}).filter(targetId => targetId === p.id).length;

          return (
            <button 
              key={p.id}
              onClick={() => onVote(p.id)}
              className="group relative transition hover:scale-110 focus:outline-none"
            >
              {/* --- NEW: VOTE BADGE --- */}
              {voteCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg z-10 animate-bounce-short border-2 border-slate-900">
                  {voteCount}
                </div>
              )}

              <div className="w-24 h-24 rounded-full border-4 border-slate-600 group-hover:border-yellow-400 overflow-hidden shadow-xl transition-colors">
                 <Avatar style={{ width: '100%', height: '100%' }} {...p.avatar} />
              </div>
              <div className="mt-3 font-bold text-lg">{p.name}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}