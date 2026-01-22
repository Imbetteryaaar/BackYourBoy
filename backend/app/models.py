from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class Player(BaseModel):
    id: str
    name: str
    avatar_config: Dict[str, Any]  # Stores the react-nice-avatar settings
    team: str  # "A" or "B"

class GameState(BaseModel):
    room_code: str
    status: str  # LOBBY, VOTING, PLAYING, SCORING
    players: List[Player]
    teams: Dict[str, List[Player]]
    current_task: Optional[str] = None
    current_boy: Optional[Dict[str, str]] = None  # { "A": "player_id", "B": "player_id" }
    scores: Dict[str, int] = {"A": 0, "B": 0}