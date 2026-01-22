import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
# Import the generate_room_code function to use in the API
from app.socket_manager import manager, generate_room_code
from app.analytics import generate_efficiency_chart

app = FastAPI()

# --- SETUP: Create the static folder if it doesn't exist ---
if not os.path.exists("static"):
    os.makedirs("static")

# Mount the static folder so frontend can load charts
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ENDPOINT: Generate Room Code ---
@app.get("/api/create-room")
async def create_room():
    # 1. Generate the code
    code = generate_room_code()
    # 2. Tell the manager to create this room in memory immediately
    manager.create_room(code) 
    # 3. Return it to frontend so they can join
    return {"room_code": code}

# --- ENDPOINT: Analytics ---
@app.get("/api/analytics/refresh")
async def refresh_analytics():
    # Trigger the Pandas script to draw a new chart
    path = await generate_efficiency_chart()
    return {"chart_url": "http://localhost:8000/" + path if path else None}

# --- WEBSOCKET LOGIC ---
@app.websocket("/ws/{room_code}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_code: str, client_id: str):
    # 1. Attempt to connect. This now returns True (Success) or False (Room doesn't exist)
    success = await manager.connect(websocket, room_code, client_id)
    
    # 2. Reject connection if room code is wrong
    if not success:
        # The manager has already closed the socket with code 4000
        return 

    try:
        # 3. Listen for messages
        while True:
            data = await websocket.receive_json()
            await manager.handle_message(websocket, room_code, data)
    except WebSocketDisconnect:
        # 4. Handle strict disconnect logic
        manager.disconnect(websocket, room_code, client_id)
        # Broadcast immediately so other players know
        await manager.broadcast(room_code)