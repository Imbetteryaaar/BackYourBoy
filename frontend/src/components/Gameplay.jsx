import React, { useState, useEffect } from 'react';

export default function Gameplay({ task, target, isActiveTeam, isBoy, timeLimit, onSubmit, onGiveUp }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit); 
  const [bubbles, setBubbles] = useState([]);
  const [currentInput, setCurrentInput] = useState("");

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isActiveTeam && isBoy) {
      // Time is up! Submit what we have.
      onSubmit(bubbles);
    }
  }, [timeLeft, bubbles]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentInput.trim()) {
        const newBubbles = [...bubbles, currentInput.trim()];
        setBubbles(newBubbles);
        setCurrentInput("");
        
        // AUTO-WIN LOGIC: If we hit the target
        if (newBubbles.length >= target) {
          onSubmit(newBubbles);
        }
      }
    }
  };

  const removeBubble = (index) => {
    // Optional: Clicking a bubble removes it and puts text back in input to edit
    const word = bubbles[index];
    setBubbles(bubbles.filter((_, i) => i !== index));
    setCurrentInput(word); // Put it back to edit
  };

  return (
    <div className="flex flex-col items-center mt-6 w-full max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between w-full items-center mb-6">
        <div className={`text-5xl font-mono font-black ${timeLeft < 10 ? "text-red-500" : "text-white"}`}>
          00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">TARGET</div>
          <div className="text-3xl font-bold text-yellow-400">{bubbles.length} / {target}</div>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl w-full text-center mb-8 border border-slate-700">
        <h2 className="text-gray-400 uppercase text-xs tracking-widest mb-2">TASK</h2>
        <div className="text-2xl font-bold text-white">{task}</div>
      </div>

      {isActiveTeam ? (
        isBoy ? (
          <div className="w-full">
            {/* BUBBLE CONTAINER */}
            <div className="bg-white p-4 rounded-xl min-h-[200px] flex flex-wrap content-start gap-2 mb-4 cursor-text" onClick={() => document.getElementById('game-input').focus()}>
              {bubbles.map((word, idx) => (
                <div key={idx} 
                  onClick={(e) => { e.stopPropagation(); removeBubble(idx); }}
                  className="bg-indigo-600 text-white px-3 py-1 rounded-full font-bold flex items-center gap-2 cursor-pointer hover:bg-red-500 transition animate-bounce-short">
                  {word}
                  <span className="text-xs opacity-70">✕</span>
                </div>
              ))}
              <input 
                id="game-input"
                autoFocus
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={bubbles.length === 0 ? "Type answer & hit Enter..." : ""}
                className="bg-transparent text-slate-900 font-bold outline-none flex-1 min-w-[150px]"
              />
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={onGiveUp}
                className="flex-1 bg-red-900 text-red-200 py-3 rounded-lg font-bold hover:bg-red-800 transition">
                GIVE UP (Point to Opponent)
              </button>
              {bubbles.length > 0 && (
                 <button 
                   onClick={() => onSubmit(bubbles)}
                   className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition">
                   SUBMIT EARLY
                 </button>
              )}
            </div>
            <p className="text-center text-gray-500 text-sm mt-2">Click a bubble to edit/delete it.</p>
          </div>
        ) : (
          <div className="text-center animate-pulse text-2xl font-bold text-green-400 mt-10">
            Wait for your Boy... <br/>
            <span className="text-white text-lg font-normal">They have named {bubbles.length} items.</span>
          </div>
        )
      ) : (
        <div className="text-center opacity-50 mt-10">
          <p className="text-xl">Opponent is typing...</p>
        </div>
      )}
    </div>
  );
}