import motor.motor_asyncio
import os

# Render will provide the real URL via environment variables. 
# It falls back to localhost for your local testing.
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client.back_your_boy_db
game_history_collection = db.get_collection("game_history")