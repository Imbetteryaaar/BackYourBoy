import React, { useState } from 'react';

export default function AuctionHouse({ auctionState, myTeam, isBacker, isBoy, onBid, onBullshit }) {
  const isMyTurn = auctionState.turn === myTeam;
  const currentBid = auctionState.current_bid;
  
  // Local state for the input
  const [bidAmount, setBidAmount] = useState(currentBid + 1);

  return (
    <div className="max-w-2xl mx-auto mt-10 text-center">
      <h2 className="text-3xl font-black mb-2 text-yellow-400">THE AUCTION</h2>
      <p className="text-gray-400 mb-8">Backers are debating. Boys stay silent.</p>

      {/* STATUS BOARD */}
      <div className="bg-slate-800 p-8 rounded-2xl mb-8 border-4 border-indigo-900">
        <div className="text-gray-500 uppercase text-sm font-bold">Current Highest Bid</div>
        <div className="text-8xl font-black my-4 text-white">{currentBid}</div>
        {auctionState.holding_team && (
          <div className="text-xl text-indigo-400">
            Held by Team {auctionState.holding_team}
          </div>
        )}
      </div>

      {/* CONTROLS */}
      {isBoy ? (
        <div className="bg-black bg-opacity-30 p-4 rounded text-gray-400 italic">
          You are the "Boy". You must remain silent while your Backer negotiates your fate.
        </div>
      ) : isBacker ? (
        isMyTurn ? (
          <div className="bg-slate-700 p-6 rounded-xl animate-pulse-slow">
            <h3 className="text-xl font-bold mb-4 text-green-400">IT'S YOUR TURN!</h3>
            
            <div className="flex gap-4 justify-center items-end">
              <div>
                <label className="block text-sm mb-1 text-gray-400">Your Bid</label>
                <input 
                  type="number" 
                  min={currentBid + 1}
                  value={bidAmount}
                  onChange={e => setBidAmount(parseInt(e.target.value))}
                  className="p-3 rounded text-slate-900 font-bold text-2xl w-24 text-center"
                />
              </div>
              <button 
                onClick={() => onBid(bidAmount)}
                className="bg-green-500 hover:bg-green-600 text-slate-900 font-bold px-6 py-3 rounded-lg text-lg">
                BID {bidAmount}
              </button>
            </div>

            <div className="my-4 text-gray-500">- OR -</div>

            <button 
              onClick={onBullshit}
              disabled={currentBid === 0} // Can't call BS on 0
              className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-lg w-full disabled:opacity-50 disabled:cursor-not-allowed">
              CALL "BULLSHIT!"
            </button>
          </div>
        ) : (
          <div className="text-xl text-gray-400">Waiting for other team...</div>
        )
      ) : (
        <div className="text-gray-500">Watching the Backers fight...</div>
      )}
    </div>
  );
}