import React, { useState } from 'react';

export default function AuctionHouse({ auctionState, myTeam, isBacker, isBoy, onBid, onBullshit }) {
  const isMyTurn = auctionState.turn === myTeam;
  const currentBid = auctionState.current_bid;
  const [bidAmount, setBidAmount] = useState(currentBid + 1);

  const increment = () => setBidAmount(b => b + 1);
  const decrement = () => setBidAmount(b => Math.max(currentBid + 1, b - 1));

  return (
    <div className="max-w-md mx-auto min-h-[70vh] flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black text-black tracking-tighter uppercase transform -rotate-2">BIDDING WAR</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center fun-card mb-6 relative p-8">
        <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Current Bid</div>
        <div className="text-9xl font-black text-black z-10">{currentBid}</div>
        {auctionState.holding_team && (
             <div className={`mt-2 px-4 py-2 rounded-full text-sm font-black border-2 border-black ${auctionState.holding_team === 'A' ? 'bg-pop-pink text-white' : 'bg-pop-blue text-white'}`}>
                HELD BY TEAM {auctionState.holding_team === 'A' ? 'PINK' : 'BLUE'}
             </div>
        )}
      </div>

      <div className="min-h-[180px]">
        {isBoy ? (
            <div className="h-full flex items-center justify-center bg-gray-100 border-4 border-gray-300 rounded-3xl p-6 text-center border-dashed">
                <span className="text-4xl mr-4">🤐</span>
                <p className="text-gray-400 font-bold">Shh! Let the backer talk.</p>
            </div>
        ) : isBacker ? (
            isMyTurn ? (
                <div className="fun-card p-4 animate-pop border-4 border-green-500">
                    <div className="flex items-center justify-between mb-4 bg-gray-100 rounded-xl p-2 border-2 border-gray-200">
                        <button onClick={decrement} className="w-12 h-12 bg-white border-2 border-black rounded-lg font-black text-xl active:bg-gray-200">-</button>
                        <div className="text-3xl font-black">{bidAmount}</div>
                        <button onClick={increment} className="w-12 h-12 bg-white border-2 border-black rounded-lg font-black text-xl active:bg-gray-200">+</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => onBid(bidAmount)} className="btn-primary py-3">BID</button>
                        <button onClick={onBullshit} disabled={currentBid === 0} className="bg-red-500 text-white border-4 border-black shadow-hard rounded-xl font-black hover:bg-red-600 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:grayscale">
                            BULLSHIT!
                        </button>
                    </div>
                </div>
            ) : (
                <div className="h-full flex items-center justify-center bg-white/50 border-4 border-transparent rounded-3xl p-6 text-center">
                    <div className="animate-pulse font-bold text-gray-400">Waiting for opponent...</div>
                </div>
            )
        ) : (
             <div className="text-center text-gray-400 font-bold py-10">Watching the show... 🍿</div>
        )}
      </div>
    </div>
  );
}