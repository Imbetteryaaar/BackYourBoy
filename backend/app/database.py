import motor.motor_asyncio
import os

# For local development, this URL is fine. 
# In production, you would read this from .env
MONGO_URL = "mongodb://localhost:27017"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client.back_your_boy_db
game_history_collection = db.get_collection("game_history")