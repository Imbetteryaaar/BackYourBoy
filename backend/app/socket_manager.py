from fastapi import WebSocket
import json
import random
import string
import asyncio
from typing import Dict, List

# --- EXPANDED TASK LIST (Add as many as you want here) ---
TASKS = [
    # BRANDS
    "Name brands of CARS", "Name types of CHEESE", "Name Luxury Fashion Brands", "Name Fast Food Chains",
    "Name Soda Brands", "Name Smartphone Manufacturers", "Name Shoe Brands", "Name Cereal Brands",
    "Name Car Rental Companies", "Name Airline Companies", "Name Makeup Brands", "Name Video Game Consoles",
    
    # GEOGRAPHY
    "Name countries in AFRICA", "Name Capital Cities in Europe", "Name US States", "Name Rivers in the World",
    "Name Mountains", "Name Islands in the Caribbean", "Name Countries starting with S", "Name Cities in Japan",
    "Name Oceans and Seas", "Name Deserts", "Name Australian Cities", "Name Countries in South America",

    # POP CULTURE
    "Name Harry Potter characters", "Name Marvel Movies", "Name Star Wars Characters", "Name Pokémon",
    "Name Pixar Movies", "Name Game of Thrones Houses", "Name Friends Characters", "Name Taylor Swift Songs",
    "Name James Bond Actors", "Name Netflix Original Series", "Name Disney Princesses", "Name Rappers",
    "Name Rock Bands from the 70s", "Name Oscar Winning Movies", "Name Anime Series", "Name Superheroes",

    # KNOWLEDGE
    "Name Programming Languages", "Name Elements on the Periodic Table", "Name Bones in the Human Body",
    "Name Planets in the Solar System", "Name Breeds of Dogs", "Name Types of Pasta", "Name Fruits that are Red",
    "Name Vegetables that grow underground", "Name Currency names", "Name Mathematical Shapes",
    "Name Chess Pieces", "Name Musical Instruments", "Name Languages spoken in India", "Name Nobel Prize Winners",

    # MISC
    "Name Things you find in a Bathroom", "Name Things that are Sticky", "Name Things that are Yellow",
    "Name Things you bring Camping", "Name Jobs that require a Uniform", "Name Sports played with a Ball",
    "Name Board Games", "Name Card Games", "Name Pizza Toppings", "Name Ice Cream Flavors"
]

def generate_room_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.game_states: Dict[str, dict] = {}

    def create_room(self, room_code: str):
        self.game_states[room_code] = {
            "host_id": None,
            "status": "LOBBY",
            "settings": {"timer": 60, "max_rounds": 3},
            "current_round": 1,
            "players": [],
            "teams": {"A": [], "B": []},
            "scores": {"A": 0, "B": 0},
            "votes": {},
            "auction": {"current_bid": 0, "holding_team": None},
            "round_result": {"answers": [], "target": 0, "active_team": None, "live_bubbles": []},
            "boys": {"A": None, "B": None},
            "backers": {"A": None, "B": None},
            "last_message": None,
            "abort_reason": None
        }
        self.active_connections[room_code] = []

    async def connect(self, websocket: WebSocket, room_code: str, player_id: str):
        await websocket.accept()
        
        if room_code not in self.game_states:
            await websocket.close(code=4000) 
            return False

        self.active_connections[room_code].append(websocket)
        
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
                leaver = next((p for p in game["players"] if p["id"] == player_id), None)
                leaver_name = leaver["name"] if leaver else "Unknown"

                game["players"] = [p for p in game["players"] if p["id"] != player_id]
                game["teams"]["A"] = [p for p in game["teams"]["A"] if p["id"] != player_id]
                game["teams"]["B"] = [p for p in game["teams"]["B"] if p["id"] != player_id]

                if game["host_id"] == player_id and game["players"]:
                    game["host_id"] = game["players"][0]["id"]

                if game["status"] not in ["LOBBY", "GAME_OVER", "CLOSED"]:
                    game["status"] = "LOBBY"
                    game["abort_reason"] = f"Round Aborted! {leaver_name} disconnected."
                    game["current_round"] = 1
                
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
            team_choice = "A" if len(game["teams"]["A"]) <= len(game["teams"]["B"]) else "B"
            new_player = {
                "id": data["id"], "name": data["name"], 
                "avatar": data["avatar"], "team": team_choice, "connected": True
            }
            if not any(p['id'] == data['id'] for p in game['players']):
                game["players"].append(new_player)
                game["teams"][team_choice].append(new_player)
            await self.broadcast(room_code)

        elif action == "START_GAME":
            if len(game["teams"]["A"]) < 2 or len(game["teams"]["B"]) < 2:
                game["last_message"] = "Cannot Start! Each team needs at least 2 players."
                await self.broadcast(room_code)
                return

            game["abort_reason"] = None
            game["current_round"] = 1
            game["scores"] = {"A": 0, "B": 0}
            self.start_new_round(game)
            await self.broadcast(room_code)

        elif action == "UPDATE_SETTINGS":
            if game["status"] == "LOBBY" and data["player_id"] == game["host_id"]:
                game["settings"]["timer"] = int(data["timer"]) 
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

        # --- NEW: REROLL TASK LOGIC ---
        elif action == "CHANGE_TASK":
            # Only Host can change task, and only during Nomination phase
            if data["player_id"] == game["host_id"] and game["status"] == "NOMINATION":
                # Pick a new random task that isn't the current one (if possible)
                new_task = random.choice(TASKS)
                while new_task == game["current_task"] and len(TASKS) > 1:
                    new_task = random.choice(TASKS)
                
                game["current_task"] = new_task
                # Clear votes because task changed
                game["votes"] = {} 
                await self.broadcast(room_code)

        elif action == "SET_CUSTOM_TASK":
            # Only Host can do this during Nomination
            if data["player_id"] == game["host_id"] and game["status"] == "NOMINATION":
                task_text = data["task"].strip()
                if task_text: # Ensure not empty
                    game["current_task"] = task_text
                    game["votes"] = {} # Reset votes so people read the new task
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
                game["round_result"]["live_bubbles"] = [] 
                game["status"] = "PERFORMANCE"
                await self.broadcast(room_code)

        elif action == "LIVE_TYPING":
            game["round_result"]["live_bubbles"] = data["bubbles"]
            await self.broadcast(room_code)

        elif action == "SUBMIT_ANSWERS":
            answers = data["answers"]
            target = game["round_result"]["target"]
            active = game["round_result"]["active_team"]
            challenger = "B" if active == "A" else "A"

            if len(answers) < target:
                game["scores"][challenger] += 1
                game["last_message"] = f"Team {active} Failed! Only submitted {len(answers)}/{target}."
                self.check_next_round(game)
            else:
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
        game["round_result"]["live_bubbles"] = []

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
            if rem:
                game["backers"][team_name] = random.choice(rem)
            else:
                game["backers"][team_name] = boy_id

manager = ConnectionManager()