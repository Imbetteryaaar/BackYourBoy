import React, { useState, useRef, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import Lobby from './components/Lobby';
import VotingBooth from './components/VotingBooth';
import AuctionHouse from './components/AuctionHouse';
import Gameplay from './components/Gameplay';
import ValidationScreen from './components/ValidationScreen';
import GameOver from './components/GameOver';

const WS_URL = "ws://localhost:8000/ws";

function App() {
  const [player, setPlayer] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("IDLE"); 
  const ws = useRef(null);

  useEffect(() => {
    if (player && roomCode && !ws.current) {
      setConnectionStatus("CONNECTING"); 
      
      ws.current = new WebSocket(`${WS_URL}/${roomCode}/${player.id}`);
      
      ws.current.onopen = () => {
        setConnectionStatus("CONNECTED");
        ws.current.send(JSON.stringify({
          action: "JOIN_GAME",
          id: player.id, name: player.name, avatar: player.avatar
        }));
      };

      ws.current.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "UPDATE_STATE") {
            if (msg.state.status === "CLOSED") {
                alert("Room closed by Host.");
                window.location.reload();
            } else {
                setGameState(msg.state);
            }
        }
      };

      ws.current.onclose = (event) => {
        ws.current = null;
        if (event.code === 4000) {
            setConnectionStatus("ERROR_ROOM_NOT_FOUND");
        } else {
            setConnectionStatus("DISCONNECTED");
        }
      };
    }
  }, [player, roomCode]);

  const handleJoin = (name, avatar, code) => {
    const id = crypto.randomUUID();
    setPlayer({ id, name, avatar });
    setRoomCode(code);
  };

  const resetToMenu = () => {
      setPlayer(null);
      setRoomCode(null);
      setConnectionStatus("IDLE");
      setGameState(null);
  };

  const sendAction = (action, payload = {}) => {
    if(ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ action, ...payload, player_id: player.id }));
    }
  };

  // --- VIEWS ---

  if (!player || !roomCode) return <MainMenu onJoin={handleJoin} />;

  if (connectionStatus === "ERROR_ROOM_NOT_FOUND") {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-cream p-6 text-center">
            <div className="fun-card p-8 max-w-sm w-full animate-pop">
                <div className="text-6xl mb-4">🏠❓</div>
                <h2 className="text-2xl font-black text-red-500 mb-2">Room Not Found</h2>
                <p className="text-gray-500 mb-6">We couldn't find room <strong>{roomCode}</strong>.</p>
                <button onClick={resetToMenu} className="w-full btn-primary py-4">Try Another Code</button>
            </div>
        </div>
      );
  }

  if (connectionStatus === "CONNECTING" || !gameState) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-cream">
            <div className="w-20 h-20 border-8 border-black border-t-transparent rounded-full animate-spin mb-6"></div>
            <div className="text-xl font-black tracking-widest animate-pulse">CONNECTING...</div>
        </div>
      );
  }

  if (connectionStatus === "DISCONNECTED") {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-cream p-6 text-center">
             <div className="fun-card p-8 max-w-sm w-full animate-pop border-red-500">
                <div className="text-6xl mb-4">🔌</div>
                <h2 className="text-2xl font-black text-red-500 mb-4">Connection Lost</h2>
                <button onClick={() => window.location.reload()} className="w-full btn-primary py-4">Reconnect</button>
            </div>
        </div>
    );
  }

  const mySyncedPlayer = gameState.players.find(p => p.id === player.id);
  const myTeam = mySyncedPlayer ? mySyncedPlayer.team : "A"; 

  return (
    <div className="min-h-screen font-sans pb-10">
      {gameState.status !== "GAME_OVER" && (
          <div className="pt-4 px-4 pb-2 flex justify-center sticky top-0 z-50">
            <div className="bg-white border-4 border-black shadow-hard px-6 py-2 rounded-full flex items-center gap-6">
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black tracking-widest text-pop-pink">TEAM A</span>
                    <span className="text-2xl font-black leading-none">{gameState.scores.A}</span>
                </div>
                <div className="h-8 w-[2px] bg-black/10"></div>
                <div className="flex flex-col items-center">
                    <div className="text-black font-black italic tracking-tighter text-xl">BYB</div>
                    <span className="text-[10px] bg-black text-white px-2 rounded-md font-bold">{roomCode}</span>
                </div>
                <div className="h-8 w-[2px] bg-black/10"></div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black tracking-widest text-pop-blue">TEAM B</span>
                    <span className="text-2xl font-black leading-none">{gameState.scores.B}</span>
                </div>
            </div>
          </div>
      )}

      {gameState.abort_reason && (
          <div className="mx-4 mt-4 bg-red-100 border-4 border-red-500 text-red-600 p-4 rounded-2xl text-center font-bold animate-bounce shadow-hard">
              🚨 {gameState.abort_reason}
          </div>
      )}

      <div className="container mx-auto px-4 mt-6">
        {gameState.status === "LOBBY" && (
          <Lobby 
            gameState={gameState} 
            playerId={player.id}
            onStart={() => sendAction("START_GAME")}
            onSettingChange={(t, r) => sendAction("UPDATE_SETTINGS", {timer: t, rounds: r})}
            onSwitchTeam={(tid, nteam) => sendAction("SWITCH_TEAM", {target_id: tid, new_team: nteam})}
            onExit={resetToMenu}
            />
        )}
        
        {gameState.status === "NOMINATION" && (
          <VotingBooth 
            players={gameState.players} 
            task={gameState.current_task}
            myTeam={myTeam}
            votes={gameState.votes} 
            onVote={(targetId) => sendAction("CAST_VOTE", { target_id: targetId, team: myTeam })} 
            isHost={player.id === gameState.host_id}
            onReroll={() => sendAction("CHANGE_TASK")}
            // --- NEW PROP HERE ---
            onCustomTask={(text) => sendAction("SET_CUSTOM_TASK", { task: text })}
          />
        )}
        
        {gameState.status === "AUCTION" && (
          <AuctionHouse 
            auctionState={gameState.auction}
            myTeam={myTeam}
            isBacker={gameState.backers[myTeam] === player.id}
            isBoy={gameState.boys[myTeam] === player.id}
            onBid={(amount) => sendAction("PLACE_BID", { amount, team: myTeam })}
            onBullshit={() => sendAction("CALL_BULLSHIT", { team: myTeam })}
          />
        )}

        {gameState.status === "PERFORMANCE" && (
          <Gameplay 
            task={gameState.current_task}
            target={gameState.round_result.target}
            isActiveTeam={gameState.round_result.active_team === myTeam}
            isBoy={gameState.boys[myTeam] === player.id}
            timeLimit={gameState.settings.timer}
            // LIVE TYPING PROPS
            onLiveUpdate={(bubbles) => sendAction("LIVE_TYPING", { bubbles })} 
            onSubmit={(answers) => sendAction("SUBMIT_ANSWERS", { answers })}
            onGiveUp={() => sendAction("GIVE_UP")}
            liveBubbles={gameState.round_result.live_bubbles || []}
          />
        )}


        {gameState.status === "VALIDATION" && (
          <ValidationScreen 
            answers={gameState.round_result.answers}
            target={gameState.round_result.target}
            isOpponent={gameState.round_result.active_team !== myTeam}
            onToggle={(idx) => sendAction("TOGGLE_VALIDITY", { index: idx })}
            onFinalize={() => sendAction("FINALIZE_ROUND")}
          />
        )}

        {gameState.status === "GAME_OVER" && (
            <GameOver 
                gameState={gameState}
                isHost={gameState.host_id === player.id}
                onPlayAgain={() => sendAction("PLAY_AGAIN")}
                onEndRoom={() => sendAction("END_ROOM")}
            />
        )}
      </div>
    </div>
  );
}

export default App;