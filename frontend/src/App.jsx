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
        console.log("Socket closed", event.code);
        ws.current = null;
        
        // --- FIX: HANDLE ERROR CODES EXPLICITLY ---
        if (event.code === 4000 || event.code === 4004) {
            setConnectionStatus("ERROR_ROOM_NOT_FOUND");
            // We DO NOT reset player/roomCode here, so we can show the error screen
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

  // --- RENDER VIEWS ---
  
  // 1. MAIN MENU
  if (!player || !roomCode) {
      return <MainMenu onJoin={handleJoin} />;
  }

  // 2. ERROR SCREEN (The Fix)
  if (connectionStatus === "ERROR_ROOM_NOT_FOUND") {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center border-2 border-red-500">
                <h2 className="text-3xl font-black text-red-500 mb-4">ROOM NOT FOUND</h2>
                <p className="text-gray-300 mb-2">Room Code <strong>{roomCode}</strong> does not exist.</p>
                <p className="text-gray-500 text-sm mb-8">Please check the code and try again.</p>
                
                <button 
                    onClick={resetToMenu}
                    className="w-full bg-white text-slate-900 font-bold py-3 rounded-lg hover:bg-gray-200 transition">
                    TRY AGAIN
                </button>
            </div>
        </div>
      );
  }

  // 3. LOADING SCREEN
  if (connectionStatus === "CONNECTING" || !gameState) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-6"></div>
            <div className="text-2xl font-bold tracking-widest">CONNECTING...</div>
        </div>
      );
  }

  // 4. DISCONNECTED SCREEN
  if (connectionStatus === "DISCONNECTED") {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
            <h2 className="text-3xl font-bold mb-4 text-red-500">Connection Lost</h2>
            <button 
                onClick={() => window.location.reload()}
                className="bg-yellow-400 text-slate-900 px-6 py-3 rounded-lg font-bold hover:scale-105 transition">
                Reconnect
            </button>
        </div>
    );
  }

  // 5. GAME UI
  const mySyncedPlayer = gameState.players.find(p => p.id === player.id);
  const myTeam = mySyncedPlayer ? mySyncedPlayer.team : "A"; 

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* HEADER */}
      {gameState.status !== "GAME_OVER" && (
          <div className="p-4 bg-slate-800 flex justify-between items-center shadow-lg border-b border-slate-700">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-black text-yellow-400 italic">BYB</h1>
                <span className="bg-slate-700 px-2 py-1 rounded text-xs font-mono">Room: {roomCode}</span>
                <span className="text-xs text-gray-400">Round {gameState.current_round}</span>
            </div>
            <div className="flex gap-4">
              <div className="bg-red-900 border border-red-500 px-3 py-1 rounded font-bold">Team A: {gameState.scores.A}</div>
              <div className="bg-blue-900 border border-blue-500 px-3 py-1 rounded font-bold">Team B: {gameState.scores.B}</div>
            </div>
          </div>
      )}

      {/* DISCONNECT ALERT */}
      {gameState.abort_reason && (
          <div className="bg-red-600 text-white p-4 text-center font-bold text-xl animate-bounce">
              ⚠️ {gameState.abort_reason} ⚠️ <br/>
              <span className="text-sm font-normal">Game reset to Lobby. Please wait for players to rejoin.</span>
          </div>
      )}

      <div className="container mx-auto p-4">
        {gameState.status === "LOBBY" && (
          <Lobby 
            gameState={gameState} 
            playerId={player.id}
            onStart={() => sendAction("START_GAME")}
            onSettingChange={(t, r) => sendAction("UPDATE_SETTINGS", {timer: t, rounds: r})}
            onSwitchTeam={(tid, nteam) => sendAction("SWITCH_TEAM", {target_id: tid, new_team: nteam})}
          />
        )}
        
        {gameState.status === "NOMINATION" && (
          <VotingBooth 
            players={gameState.players} 
            task={gameState.current_task}
            myTeam={myTeam}
            votes={gameState.votes} 
            onVote={(targetId) => sendAction("CAST_VOTE", { target_id: targetId, team: myTeam })} 
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
            onSubmit={(answers) => sendAction("SUBMIT_ANSWERS", { answers })}
            onGiveUp={() => sendAction("GIVE_UP")}
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