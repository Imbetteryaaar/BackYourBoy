import React from 'react';
import Avatar from 'react-nice-avatar';

export default function GameOver({ gameState, isHost, onPlayAgain, onEndRoom }) {
  const winner = gameState.scores.A > gameState.scores.B ? "A" : 
                 gameState.scores.B > gameState.scores.A ? "B" : "DRAW";

  const color = winner === "A" ? "bg-red-600" : winner === "B" ? "bg-blue-600" : "bg-purple-600";

  return (
    <div className="flex flex-col items-center justify-center h-screen animate-fade-in">
      <h1 className="text-6xl font-black mb-4 text-yellow-400">GAME OVER</h1>
      
      <div className={`${color} p-10 rounded-3xl shadow-2xl text-center mb-10 transform scale-110`}>
        <div className="text-2xl uppercase font-bold text-white opacity-80 mb-2">Winner</div>
        {winner === "DRAW" ? (
            <div className="text-6xl font-black text-white">IT'S A DRAW!</div>
        ) : (
            <div className="text-6xl font-black text-white">TEAM {winner}</div>
        )}
        <div className="mt-4 text-xl font-mono">
            Final Score: {gameState.scores.A} - {gameState.scores.B}
        </div>
      </div>

      {isHost ? (
        <div className="flex gap-4">
          <button 
            onClick={onPlayAgain}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-lg transition">
            PLAY AGAIN (Lobby)
          </button>
          <button 
            onClick={onEndRoom}
            className="bg-gray-700 hover:bg-gray-800 text-gray-300 font-bold py-4 px-8 rounded-xl text-xl transition">
            END ROOM
          </button>
        </div>
      ) : (
        <div className="text-gray-400 animate-pulse text-lg">
            Waiting for Host to decide next move...
        </div>
      )}
    </div>
  );
}