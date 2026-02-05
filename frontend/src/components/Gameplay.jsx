import React, { useState, useEffect, useRef } from 'react';

export default function Gameplay({ 
  task, target, isActiveTeam, isBoy, timeLimit, 
  onSubmit, onGiveUp, onLiveUpdate, liveBubbles 
}) {
  const [timeLeft, setTimeLeft] = useState(timeLimit); 
  const [localBubbles, setLocalBubbles] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isActiveTeam && isBoy) {
      onSubmit(localBubbles);
    }
  }, [timeLeft]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addBubble(); }
  };

  const addBubble = () => {
    if (currentInput.trim()) {
        const newBubbles = [...localBubbles, currentInput.trim()];
        setLocalBubbles(newBubbles);
        setCurrentInput("");
        onLiveUpdate(newBubbles); // Broadcast to spectators
        
        if (newBubbles.length >= target) onSubmit(newBubbles);
        setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  const removeBubble = (index) => {
    const newBubbles = localBubbles.filter((_, i) => i !== index);
    setLocalBubbles(newBubbles);
    onLiveUpdate(newBubbles); 
    inputRef.current?.focus();
  };

  // Switch between local state (for the active Boy) and server state (for everyone else)
  const displayBubbles = (isActiveTeam && isBoy) ? localBubbles : liveBubbles;

  return (
    <div className="max-w-2xl mx-auto h-[80vh] flex flex-col relative">
      <div className="flex justify-between items-end mb-4 px-2">
        <div className={`text-6xl font-black leading-none ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-black"}`}>{timeLeft}</div>
        <div className="text-right">
            <div className="text-xs font-bold text-gray-400 uppercase">Target</div>
            <div className="text-4xl font-black text-pop-blue leading-none">{displayBubbles.length}/{target}</div>
        </div>
      </div>

      <div className="fun-card p-4 text-center mb-4 bg-pop-yellow transform -rotate-1">
        <h2 className="text-black/50 text-[10px] font-black tracking-widest mb-1">CATEGORY</h2>
        <div className="text-2xl font-black text-black leading-tight">{task}</div>
      </div>

      <div className="flex-1 overflow-y-auto content-start flex flex-wrap gap-2 p-2 mb-24 transition-all">
        {displayBubbles.map((word, idx) => (
            <div key={idx} 
                 onClick={() => (isActiveTeam && isBoy) ? removeBubble(idx) : null}
                 className={`
                    bg-white border-2 border-black px-4 py-2 rounded-full font-bold text-lg shadow-hard-sm flex gap-2 animate-pop
                    ${(isActiveTeam && isBoy) ? "cursor-pointer hover:bg-red-100" : ""}
                 `}>
                {word} 
                {(isActiveTeam && isBoy) && <span className="text-red-500 text-xs">✕</span>}
            </div>
        ))}
      </div>

      {isActiveTeam && isBoy ? (
            <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t-4 border-black z-20">
                <div className="max-w-2xl mx-auto flex gap-2">
                    <input 
                        ref={inputRef} autoFocus value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)} onKeyDown={handleKeyDown}
                        placeholder="Type here..."
                        className="flex-1 bg-gray-100 border-2 border-black rounded-xl px-4 py-3 font-bold text-lg focus:outline-none focus:bg-white"
                    />
                    <button onClick={addBubble} className="bg-green-500 border-2 border-black text-white p-3 rounded-xl font-black shadow-hard-sm active:translate-y-1 active:shadow-none transition-all">⏎</button>
                </div>
                <div className="max-w-2xl mx-auto flex justify-between mt-2">
                    <button onClick={onGiveUp} className="text-xs font-bold text-red-500 hover:underline">GIVE UP</button>
                    {displayBubbles.length > 0 && <button onClick={() => onSubmit(localBubbles)} className="text-xs font-bold text-green-600 hover:underline">SUBMIT NOW</button>}
                </div>
            </div>
      ) : (
             <div className="fixed bottom-10 left-0 w-full text-center px-4 pointer-events-none">
                <div className="fun-card inline-block px-8 py-4 bg-pop-pink text-white font-black animate-bounce shadow-hard">
                    {isActiveTeam ? "📣 CHEER FOR YOUR BOY!" : "👀 WATCHING..."}
                </div>
             </div>
      )}
    </div>
  );
}