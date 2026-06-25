import React, { useState, useEffect } from 'react';
import Mascot from './Mascot';

const TIPS = [
  "Tip: Vote to back the teammate who actually knows the category.",
  "Tip: Bidding high is risky — your Boy has to deliver!",
  "Tip: Call BULLSHIT when you smell a bluff.",
  "Tip: Double or Nothing can swing the whole game.",
  "Tip: In Speak It mode, say answers out loud and tap to count.",
  "Tip: The host can swap categories and pick spicy packs.",
];

export default function Loading({ label = 'CONNECTING' }) {
  const [tip, setTip] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTip((t) => (t + 1) % TIPS.length), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center">
      <div className="animate-bounce-soft mb-6">
        <Mascot mood="think" color="#FFD23F" size={130} float={false} />
      </div>
      <div className="flex items-center gap-2 font-display font-bold text-2xl tracking-widest text-ink">
        {label}
        <span className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-grape animate-bounce" style={{ animationDelay: '0s' }} />
          <span className="w-2 h-2 rounded-full bg-grape animate-bounce" style={{ animationDelay: '0.15s' }} />
          <span className="w-2 h-2 rounded-full bg-grape animate-bounce" style={{ animationDelay: '0.3s' }} />
        </span>
      </div>
      <p key={tip} className="mt-6 max-w-xs text-ink/60 font-semibold animate-pop">{TIPS[tip]}</p>
    </div>
  );
}
