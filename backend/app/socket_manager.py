from fastapi import WebSocket
import json
import random
import string
import asyncio
from typing import Dict, List

TASKS = [
    "Name brands of CARS", "Name types of CHEESE", "Name countries in AFRICA",
    "Name Harry Potter characters", "Name Programming Languages", "Name Marvel Movies"
]

def generate_room_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.game_states: Dict[str, dict] = {}

    # --- NEW: Explicitly create room via API only ---
    def create_room(self, room_code: str):
        self.game_states[room_code] = {
            "host_id": None, # Will be set when first player joins
            "status": "LOBBY",
            "settings": {"timer": 60, "max_rounds": 3},
            "current_round": 1,
            "players": [],
            "teams": {"A": [], "B": []},
            "scores": {"A": 0, "B": 0},
            "votes": {},
            "auction": {"current_bid": 0, "holding_team": None},
            "round_result": {},
            "boys": {"A": None, "B": None},
            "backers": {"A": None, "B": None},
            "last_message": None,
            "abort_reason": None # New field for disconnect alerts
        }
        self.active_connections[room_code] = []

    async def connect(self, websocket: WebSocket, room_code: str, player_id: str):
        # 1. ACCEPT FIRST (Crucial for sending error codes)
        await websocket.accept()
        
        # 2. THEN CHECK if room exists
        if room_code not in self.game_states:
            # Now the browser will actually receive this 4000 code
            await websocket.close(code=4000) 
            return False

        # 3. If room exists, add player
        self.active_connections[room_code].append(websocket)
        
        # If this is the first player, make them Host
        game = self.game_states[room_code]
        if game["host_id"] is None:
            game["host_id"] = player_id
            
        return True

    def disconnect(self, websocket: WebSocket, room_code: str, player_id: str):
        if room_code in self.active_connections:
            if websocket in self.active_connections[room_code]:
                self.active_connections[room_code].remove(websocket)
            
            game = self.game_states.get(room_code)
            if game:
                # Find who disconnected
                leaver = next((p for p in game["players"] if p["id"] == player_id), None)
                leaver_name = leaver["name"] if leaver else "Unknown"

                # Remove player data
                game["players"] = [p for p in game["players"] if p["id"] != player_id]
                game["teams"]["A"] = [p for p in game["teams"]["A"] if p["id"] != player_id]
                game["teams"]["B"] = [p for p in game["teams"]["B"] if p["id"] != player_id]

                # Assign new host if needed
                if game["host_id"] == player_id and game["players"]:
                    game["host_id"] = game["players"][0]["id"]

                # --- FIX: Abort Round Logic ---
                if game["status"] not in ["LOBBY", "GAME_OVER", "CLOSED"]:
                    game["status"] = "LOBBY"
                    game["abort_reason"] = f"Round Aborted! {leaver_name} disconnected."
                    game["current_round"] = 1 # Optional: Reset rounds? Or just replay round?
                
                # Cleanup if empty
                if not self.active_connections[room_code]:
                    del self.game_states[room_code]
                    del self.active_connections[room_code]

    async def broadcast(self, room_code: str):
        state = self.game_states.get(room_code)
        if state and room_code in self.active_connections:
            message = json.dumps({"type": "UPDATE_STATE", "state": state})
            active = []
            for conn in self.active_connections[room_code]:
                try:
                    await conn.send_text(message)
                    active.append(conn)
                except:
                    pass
            self.active_connections[room_code] = active

    async def handle_message(self, websocket: WebSocket, room_code: str, data: dict):
        game = self.game_states.get(room_code)
        if not game: return
        
        action = data.get("action")

        if action == "JOIN_GAME":
            # Assign team
            team_choice = "A" if len(game["teams"]["A"]) <= len(game["teams"]["B"]) else "B"
            new_player = {
                "id": data["id"], "name": data["name"], 
                "avatar": data["avatar"], "team": team_choice, "connected": True
            }
            if not any(p['id'] == data['id'] for p in game['players']):
                game["players"].append(new_player)
                game["teams"][team_choice].append(new_player)
            await self.broadcast(room_code)

        # ... (Keep all other game logic identical to previous version) ...
        # Just ensure you include the rest of the existing logic below here
        # For brevity, I am not pasting the logic for VOTING/AUCTION again 
        # as it didn't change, but make sure it is in your file!
        elif action == "START_GAME":
             # clear abort reason when starting
             game["abort_reason"] = None
             game["current_round"] = 1
             game["scores"] = {"A": 0, "B": 0}
             self.start_new_round(game)
             await self.broadcast(room_code)
        # ... (Include other handlers: UPDATE_SETTINGS, SWITCH_TEAM, CAST_VOTE, etc.)
        elif action == "UPDATE_SETTINGS":
            if game["status"] == "LOBBY" and data["player_id"] == game["host_id"]:
                game["settings"]["timer"] = int(data["timer"]) * 60
                game["settings"]["max_rounds"] = int(data["rounds"])
                await self.broadcast(room_code)

        elif action == "SWITCH_TEAM":
            if data["player_id"] == game["host_id"]:
                target_id = data["target_id"]
                target_team = data["new_team"]
                p_obj = next((p for p in game["players"] if p["id"] == target_id), None)
                if p_obj:
                    old_team = p_obj["team"]
                    game["teams"][old_team] = [x for x in game["teams"][old_team] if x["id"] != target_id]
                    p_obj["team"] = target_team
                    game["teams"][target_team].append(p_obj)
                    await self.broadcast(room_code)

        elif action == "CAST_VOTE":
            game["votes"][data["player_id"]] = data["target_id"]
            if len(game["votes"]) == len(game["players"]):
                self.resolve_votes(game)
                game["status"] = "AUCTION"
                game["auction"] = {"current_bid": 0, "holding_team": None, "turn": random.choice(["A", "B"])}
            await self.broadcast(room_code)

        elif action == "PLACE_BID":
            game["auction"]["current_bid"] = int(data["amount"])
            game["auction"]["holding_team"] = data["team"]
            game["auction"]["turn"] = "B" if data["team"] == "A" else "A"
            await self.broadcast(room_code)

        elif action == "CALL_BULLSHIT":
            if game["auction"]["holding_team"]:
                active = game["auction"]["holding_team"]
                game["round_result"]["active_team"] = active
                game["round_result"]["target"] = game["auction"]["current_bid"]
                game["status"] = "PERFORMANCE"
                await self.broadcast(room_code)

        elif action == "SUBMIT_ANSWERS":
            answers = data["answers"]
            game["round_result"]["answers"] = [{"word": w, "valid": True} for w in answers]
            game["status"] = "VALIDATION"
            await self.broadcast(room_code)

        elif action == "GIVE_UP":
            active = game["round_result"]["active_team"]
            challenger = "B" if active == "A" else "A"
            game["scores"][challenger] += 1
            game["last_message"] = f"Team {active} Gave Up!"
            self.check_next_round(game)
            await self.broadcast(room_code)

        elif action == "TOGGLE_VALIDITY":
            idx = data["index"]
            game["round_result"]["answers"][idx]["valid"] = not game["round_result"]["answers"][idx]["valid"]
            await self.broadcast(room_code)

        elif action == "FINALIZE_ROUND":
            valid = sum(1 for a in game["round_result"]["answers"] if a["valid"])
            target = game["round_result"]["target"]
            active = game["round_result"]["active_team"]
            challenger = "B" if active == "A" else "A"
            
            if valid >= target:
                game["scores"][active] += 1
                game["last_message"] = f"Team {active} Won the Round!"
            else:
                game["scores"][challenger] += 1
                game["last_message"] = f"Team {active} Failed! Point to {challenger}."
            
            self.check_next_round(game)
            await self.broadcast(room_code)

        elif action == "PLAY_AGAIN":
            if data["player_id"] == game["host_id"]:
                game["status"] = "LOBBY"
                game["scores"] = {"A": 0, "B": 0}
                game["current_round"] = 1
                await self.broadcast(room_code)

        elif action == "END_ROOM":
            if data["player_id"] == game["host_id"]:
                game["status"] = "CLOSED" 
                await self.broadcast(room_code)
                del self.game_states[room_code]
                del self.active_connections[room_code]

    def start_new_round(self, game):
        game["status"] = "NOMINATION"
        game["current_task"] = random.choice(TASKS)
        game["votes"] = {}
        game["boys"] = {"A": None, "B": None}
        game["auction"] = {"current_bid": 0, "holding_team": None}

    def check_next_round(self, game):
        if game["current_round"] >= game["settings"]["max_rounds"]:
            game["status"] = "GAME_OVER"
        else:
            game["current_round"] += 1
            self.start_new_round(game)

    def resolve_votes(self, game):
        for team_name in ["A", "B"]:
            team_votes = {}
            members = [p["id"] for p in game["teams"][team_name]]
            for v, t in game["votes"].items():
                if v in members: team_votes[t] = team_votes.get(t, 0) + 1
            if not team_votes: boy_id = random.choice(members)
            else: boy_id = random.choice([pid for pid, c in team_votes.items() if c == max(team_votes.values())])
            game["boys"][team_name] = boy_id
            rem = [p["id"] for p in game["teams"][team_name] if p["id"] != boy_id]
            game["backers"][team_name] = random.choice(rem)

manager = ConnectionManager()