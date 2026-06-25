import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MainMenu from './components/MainMenu';
import Lobby from './components/Lobby';
import VotingBooth from './components/VotingBooth';
import AuctionHouse from './components/AuctionHouse';
import StakesScreen from './components/StakesScreen';
import Gameplay from './components/Gameplay';
import SpeakConfirm from './components/SpeakConfirm';
import ValidationScreen from './components/ValidationScreen';
import GameOver from './components/GameOver';
import Background from './components/Background';
import Loading from './components/Loading';
import { WS_URL } from './lib/config';
import { play, toggleMute, isMuted } from './lib/sound';

function SoundButton() {
  const [muted, setMuted] = useState(isMuted());
  return (
    <button
      onClick={() => { setMuted(toggleMute()); }}
      className="fixed top-3 right-3 z-[60] w-11 h-11 rounded-full bg-white/90 shadow-toon-sm
                 flex items-center justify-center text-xl active:translate-y-0.5"
      aria-label="Toggle sound"
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}

function App() {
  const [player, setPlayer] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('IDLE');
  const ws = useRef(null);

  useEffect(() => {
    let reconnectTimer;
    const connectWebSocket = () => {
      if (!player || !roomCode || ws.current) return;
      setConnectionStatus('CONNECTING');
      ws.current = new WebSocket(`${WS_URL}/${roomCode}/${player.id}`);

      ws.current.onopen = () => {
        setConnectionStatus('CONNECTED');
        ws.current.send(JSON.stringify({
          action: 'JOIN_GAME', id: player.id, name: player.name, avatar: player.avatar,
        }));
      };
      ws.current.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'UPDATE_STATE') {
          if (msg.state.status === 'CLOSED') {
            alert('Room closed by Host.');
            window.location.reload();
          } else {
            setGameState(msg.state);
          }
        }
      };
      ws.current.onclose = (event) => {
        ws.current = null;
        if (event.code === 4000) {
          setConnectionStatus('ERROR_ROOM_NOT_FOUND');
        } else {
          setConnectionStatus('DISCONNECTED');
          reconnectTimer = setTimeout(connectWebSocket, 2000);
        }
      };
    };
    connectWebSocket();
    return () => {
      if (ws.current) { ws.current.close(); ws.current = null; }
      clearTimeout(reconnectTimer);
    };
  }, [player, roomCode]);

  const handleJoin = (name, avatar, code) => {
    const id = crypto.randomUUID();
    setPlayer({ id, name, avatar });
    setRoomCode(code);
  };
  const resetToMenu = () => {
    setPlayer(null); setRoomCode(null); setConnectionStatus('IDLE'); setGameState(null);
  };
  const sendAction = (action, payload = {}) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action, ...payload, player_id: player.id }));
    }
  };

  // ---- pre-game screens ----
  if (!player || !roomCode) return (<><Background /><SoundButton /><MainMenu onJoin={handleJoin} /></>);

  if (connectionStatus === 'ERROR_ROOM_NOT_FOUND') {
    return (
      <><Background /><SoundButton />
        <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="toon-card p-8 max-w-sm w-full">
            <div className="text-6xl mb-4">🏚️</div>
            <h2 className="text-2xl font-display font-bold text-team-a-dk mb-2">Room Not Found</h2>
            <p className="text-ink/50 mb-6">We couldn't find room <strong>{roomCode}</strong>.</p>
            <button onClick={resetToMenu} className="btn-primary w-full">Try Another Code</button>
          </motion.div>
        </div></>
    );
  }
  if (connectionStatus === 'CONNECTING' || !gameState) {
    return (<><Background /><SoundButton /><Loading label="CONNECTING" /></>);
  }
  if (connectionStatus === 'DISCONNECTED') {
    return (<><Background /><SoundButton /><Loading label="RECONNECTING" /></>);
  }

  const mySyncedPlayer = gameState.players.find((p) => p.id === player.id);
  const myTeam = mySyncedPlayer ? mySyncedPlayer.team : 'A';
  const isHost = player.id === gameState.host_id;

  const screenProps = { key: gameState.status };
  const transition = {
    initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }, transition: { duration: 0.25 },
  };

  return (
    <div className="min-h-[100dvh] pb-10">
      <Background />
      <SoundButton />

      {/* Scoreboard */}
      {gameState.status !== 'GAME_OVER' && (
        <div className="pt-3 px-4 flex justify-center sticky top-0 z-50">
          <div className="bg-white/95 backdrop-blur shadow-toon-sm px-5 py-2 rounded-full flex items-center gap-5">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold tracking-widest text-team-a">PINK</span>
              <span className="text-2xl font-display font-bold leading-none">{gameState.scores.A}</span>
            </div>
            <div className="flex flex-col items-center px-1">
              <div className="font-display font-bold text-ink text-lg leading-none">BYB</div>
              <span className="text-[10px] bg-grape text-white px-2 rounded-full font-bold tracking-widest mt-0.5">{roomCode}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold tracking-widest text-team-b">BLUE</span>
              <span className="text-2xl font-display font-bold leading-none">{gameState.scores.B}</span>
            </div>
          </div>
        </div>
      )}

      {gameState.abort_reason && (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
          className="mx-4 mt-4 bg-team-a/15 border-2 border-team-a text-team-a-dk p-3 rounded-3xl text-center font-bold shadow-toon-sm">
          🚨 {gameState.abort_reason}
        </motion.div>
      )}

      <div className="container mx-auto px-4 mt-5">
        <AnimatePresence mode="wait">
          <motion.div {...screenProps} {...transition}>
            {gameState.status === 'LOBBY' && (
              <Lobby gameState={gameState} playerId={player.id}
                onStart={() => sendAction('START_GAME')}
                onSettingChange={(payload) => sendAction('UPDATE_SETTINGS', payload)}
                onTogglePack={(pack) => sendAction('TOGGLE_PACK', { pack })}
                onSwitchTeam={(tid, nteam) => sendAction('SWITCH_TEAM', { target_id: tid, new_team: nteam })}
                onExit={resetToMenu} />
            )}
            {gameState.status === 'NOMINATION' && (
              <VotingBooth players={gameState.players} task={gameState.current_task}
                myTeam={myTeam} votes={gameState.votes} mode={gameState.round_result.mode}
                onVote={(targetId) => sendAction('CAST_VOTE', { target_id: targetId, team: myTeam })}
                isHost={isHost}
                onReroll={() => sendAction('CHANGE_TASK')}
                onCustomTask={(text) => sendAction('SET_CUSTOM_TASK', { task: text })} />
            )}
            {gameState.status === 'AUCTION' && (
              <AuctionHouse auctionState={gameState.auction} myTeam={myTeam}
                isBacker={gameState.backers[myTeam] === player.id}
                isBoy={gameState.boys[myTeam] === player.id}
                task={gameState.current_task} mode={gameState.round_result.mode}
                onBid={(amount) => sendAction('PLACE_BID', { amount, team: myTeam })}
                onBullshit={() => sendAction('CALL_BULLSHIT', { team: myTeam })} />
            )}
            {gameState.status === 'STAKES' && (
              <StakesScreen rr={gameState.round_result} myTeam={myTeam}
                isBacker={gameState.backers[myTeam] === player.id}
                isBoy={gameState.boys[myTeam] === player.id}
                onStart={(double) => sendAction('START_PERFORMANCE', { double })} />
            )}
            {gameState.status === 'PERFORMANCE' && (
              <Gameplay task={gameState.current_task} target={gameState.round_result.target}
                isActiveTeam={gameState.round_result.active_team === myTeam}
                isBoy={gameState.boys[myTeam] === player.id}
                timeLimit={gameState.settings.timer}
                mode={gameState.round_result.mode}
                stakes={gameState.round_result.stakes}
                liveBubbles={gameState.round_result.live_bubbles || []}
                liveCount={gameState.round_result.live_count || 0}
                onLiveUpdate={(bubbles) => sendAction('LIVE_TYPING', { bubbles })}
                onLiveCount={(count) => sendAction('LIVE_COUNT', { count })}
                onSubmit={(payload) => sendAction('SUBMIT_ANSWERS', payload)}
                onGiveUp={() => sendAction('GIVE_UP')} />
            )}
            {gameState.status === 'SPEAK_CONFIRM' && (
              <SpeakConfirm rr={gameState.round_result} task={gameState.current_task}
                isOpponent={gameState.round_result.active_team !== myTeam}
                onConfirm={(accepted) => sendAction('CONFIRM_SPEAK', { accepted })} />
            )}
            {gameState.status === 'VALIDATION' && (
              <ValidationScreen answers={gameState.round_result.answers}
                target={gameState.round_result.target}
                isOpponent={gameState.round_result.active_team !== myTeam}
                onToggle={(idx) => sendAction('TOGGLE_VALIDITY', { index: idx })}
                onFinalize={() => sendAction('FINALIZE_ROUND')} />
            )}
            {gameState.status === 'GAME_OVER' && (
              <GameOver gameState={gameState} isHost={isHost}
                onPlayAgain={() => sendAction('PLAY_AGAIN')}
                onEndRoom={() => sendAction('END_ROOM')} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
