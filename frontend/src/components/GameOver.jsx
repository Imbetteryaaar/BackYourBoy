import React from 'react';

export default function GameOver({ gameState, isHost, onPlayAgain, onEndRoom }) {
  const winner = gameState.scores.A > gameState.scores.B ? "A" : 
                 gameState.scores.B > gameState.scores.A ? "B" : "DRAW";

  const winnerColor = winner === "A" ? "bg-pop-pink" : winner === "B" ? "bg-pop-blue" : "bg-purple-500";

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-pop">
      <h1 className="text-5xl md:text-7xl font-black mb-8 text-black tracking-tighter drop-shadow-hard italic transform -rotate-2 text-stroke-white">
        GAME OVER
      </h1>
      
      <div className={`
          relative w-full max-w-md p-10 rounded-[3rem] text-center mb-12
          ${winnerColor} shadow-hard-xl border-4 border-black
      `}>
        <div className="text-xl uppercase font-black text-black/50 mb-2 tracking-[0.2em]">WINNER</div>
        
        {winner === "DRAW" ? (
            <div className="text-5xl font-black text-white text-stroke-black">IT'S A DRAW!</div>
        ) : (
            <div className="text-6xl font-black text-white text-stroke-black">TEAM {winner}</div>
        )}
        
        <div className="mt-6 inline-block bg-black px-6 py-2 rounded-full border-2 border-white">
           <span className="text-2xl font-mono font-bold text-white">
             {gameState.scores.A} - {gameState.scores.B}
           </span>
        </div>
      </div>

      {isHost ? (
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-md px-4">
          <button 
            onClick={onPlayAgain}
            className="flex-1 btn-primary py-4 text-xl">
            PLAY AGAIN
          </button>
          <button 
            onClick={onEndRoom}
            className="flex-1 bg-white border-4 border-black shadow-hard rounded-xl font-black text-xl hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all">
            END ROOM
          </button>
        </div>
      ) : (
        <div className="fun-card px-8 py-4 rounded-full text-gray-400 font-bold animate-pulse">
            Waiting for Host...
        </div>
      )}
    </div>
  );
}