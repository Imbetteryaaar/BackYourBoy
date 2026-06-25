import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Mascot from './Mascot';
import { play } from '../lib/sound';

export default function AuctionHouse({ auctionState, myTeam, isBacker, isBoy, onBid, onBullshit, task, mode }) {
  const isMyTurn = auctionState.turn === myTeam;
  const currentBid = auctionState.current_bid;
  const [bidAmount, setBidAmount] = useState(currentBid + 1);
  useEffect(() => { setBidAmount((b) => Math.max(currentBid + 1, b)); }, [currentBid]);

  const inc = () => { setBidAmount((b) => b + 1); play('tick'); };
  const dec = () => { setBidAmount((b) => Math.max(currentBid + 1, b - 1)); play('tick'); };

  return (
    <div className="max-w-md mx-auto min-h-[70vh] flex flex-col">
      <div className="text-center mb-2">
        <h2 className="font-display font-bold text-3xl text-ink -rotate-1">💰 BIDDING WAR</h2>
        <p className="text-ink/50 font-semibold text-sm mt-1 truncate px-4">{task}</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center toon-card my-5 p-8 relative">
        <Mascot mood={currentBid > 6 ? 'nervous' : 'idle'} color={myTeam === 'A' ? '#FF7AA2' : '#4FC0E8'} size={84} className="mb-2" />
        <div className="text-ink/40 text-xs font-bold uppercase tracking-widest">How many can your Boy name?</div>
        <motion.div key={currentBid} initial={{ scale: 0.6 }} animate={{ scale: 1 }}
          className="text-8xl font-display font-bold text-ink leading-none my-1">{currentBid}</motion.div>
        {auctionState.holding_team && (
          <div className={`pill text-white font-bold ${auctionState.holding_team === 'A' ? 'bg-team-a' : 'bg-team-b'}`}>
            HELD BY TEAM {auctionState.holding_team === 'A' ? 'PINK' : 'BLUE'}
          </div>
        )}
      </div>

      <div className="min-h-[180px]">
        {isBoy ? (
          <div className="toon-card-flat p-6 text-center flex items-center justify-center gap-3">
            <span className="text-3xl">🤐</span>
            <p className="text-ink/50 font-bold">Shh! Let your backer do the talking.</p>
          </div>
        ) : isBacker ? (
          isMyTurn ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="toon-card p-4 ring-2 ring-mint">
              <div className="flex items-center justify-between mb-3 bg-ink/5 rounded-2xl p-2">
                <button onClick={dec} className="w-12 h-12 bg-white rounded-xl font-display font-bold text-2xl shadow-toon-sm active:translate-y-0.5">−</button>
                <div className="text-3xl font-display font-bold">{bidAmount}</div>
                <button onClick={inc} className="w-12 h-12 bg-white rounded-xl font-display font-bold text-2xl shadow-toon-sm active:translate-y-0.5">+</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { onBid(bidAmount); play('bid'); }} className="btn-primary py-3">BID 🚀</button>
                <button onClick={() => { onBullshit(); play('bullshit'); }} disabled={currentBid === 0}
                  className="btn-toon bg-team-a-dk text-white py-3 disabled:opacity-30">BULLSHIT! 🐂</button>
              </div>
              <p className="text-center text-ink/40 text-xs mt-2 font-semibold">Bid higher, or call their bluff.</p>
            </motion.div>
          ) : (
            <div className="text-center py-10 font-bold text-ink/40 animate-pulse">Waiting for the other backer… 🤔</div>
          )
        ) : (
          <div className="text-center text-ink/40 font-bold py-10">Grab the popcorn — just watching 🍿</div>
        )}
      </div>
    </div>
  );
}
