import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.socket_manager import manager, generate_room_code

app = FastAPI(title="Back Your Boy")

# CORS — frontend is hosted separately (e.g. Vercel), so allow it in.
# Set ALLOWED_ORIGINS env var (comma separated) in production to lock this down.
origins_env = os.environ.get("ALLOWED_ORIGINS", "*")
allow_origins = ["*"] if origins_env == "*" else [o.strip() for o in origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"name": "Back Your Boy", "status": "ok"}


@app.get("/health")
async def health():
    return {"status": "healthy", "rooms": len(manager.game_states)}


@app.get("/api/create-room")
async def create_room():
    code = generate_room_code()
    manager.create_room(code)
    return {"room_code": code}


@app.websocket("/ws/{room_code}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_code: str, client_id: str):
    success = await manager.connect(websocket, room_code, client_id)
    if not success:
        return  # room not found — manager already closed with code 4000

    try:
        while True:
            data = await websocket.receive_json()
            await manager.handle_message(websocket, room_code, data)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_code, client_id)
        await manager.broadcast(room_code)
