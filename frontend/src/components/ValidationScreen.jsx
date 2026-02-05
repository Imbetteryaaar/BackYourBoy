import React from 'react';

export default function ValidationScreen({ answers, target, isOpponent, onToggle, onFinalize }) {
  const validCount = answers.filter(a => a.valid).length;
  const isSuccess = validCount >= target;

  return (
    <div className="max-w-2xl mx-auto mt-4 pb-24">
      <div className="fun-card p-6 mb-8 flex justify-between items-center bg-white">
        <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Target</div>
            <div className="text-3xl font-black text-black">{target}</div>
        </div>
        <div className="text-right">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Valid</div>
            <div className={`text-4xl font-black ${isSuccess ? "text-green-500" : "text-red-500"}`}>
                {validCount}
            </div>
        </div>
      </div>

      {isOpponent ? (
        <div className="bg-pop-yellow border-4 border-black text-black px-6 py-3 rounded-xl mb-6 font-black text-center animate-pulse shadow-hard transform -rotate-1">
           👆 TAP WRONG ANSWERS TO DELETE THEM!
        </div>
      ) : (
        <div className="text-center text-gray-400 italic mb-6 font-bold">Waiting for opponent to validate...</div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {answers.map((item, idx) => (
          <button
            key={idx}
            disabled={!isOpponent} 
            onClick={() => onToggle(idx)}
            className={`
              px-5 py-3 rounded-xl font-bold text-lg transition-all duration-200 shadow-md border-b-4 border-r-4 border-black
              ${item.valid 
                ? "bg-white text-black hover:translate-y-[2px] hover:shadow-none" 
                : "bg-red-200 text-red-500 line-through opacity-60 scale-95 border-transparent shadow-none"}
              ${!isOpponent && "cursor-default hover:translate-y-0"}
            `}
          >
            {item.word}
          </button>
        ))}
      </div>

      <div className="fixed bottom-6 left-0 w-full px-4 text-center">
          <button 
            onClick={onFinalize}
            className="bg-black text-white px-10 py-4 rounded-xl font-black text-xl shadow-hard border-4 border-transparent hover:bg-gray-800 active:translate-y-1 active:shadow-none transition-all">
            FINALIZE ROUND
          </button>
      </div>
    </div>
  );
}