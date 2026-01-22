import React from 'react';

export default function ValidationScreen({ answers, target, isOpponent, onToggle, onFinalize }) {
  const validCount = answers.filter(a => a.valid).length;
  const isSuccess = validCount >= target;

  return (
    <div className="max-w-3xl mx-auto mt-8 text-center">
      <h2 className="text-3xl font-bold mb-2">Validation Phase</h2>
      <p className="mb-6 text-gray-400">
        Target: <span className="text-white font-bold">{target}</span> | 
        Current Valid: <span className={`font-bold ${isSuccess ? "text-green-400" : "text-red-400"}`}>{validCount}</span>
      </p>

      {/* INSTRUCTIONS */}
      {isOpponent && (
        <div className="bg-yellow-500 text-slate-900 p-2 rounded mb-6 font-bold animate-pulse">
          Click on WRONG answers to strike them out!
        </div>
      )}

      {/* WORD LIST */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {answers.map((item, idx) => (
          <button
            key={idx}
            disabled={!isOpponent} // Only opponents can invalidate
            onClick={() => onToggle(idx)}
            className={`
              p-3 rounded-lg font-bold text-lg transition-all
              ${item.valid 
                ? "bg-slate-700 hover:bg-red-900 hover:text-red-200" 
                : "bg-red-900 text-red-400 line-through opacity-50"}
            `}
          >
            {item.word}
          </button>
        ))}
      </div>

      <button 
        onClick={onFinalize}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-full font-bold text-xl shadow-lg">
        FINALIZE ROUND
      </button>
    </div>
  );
}