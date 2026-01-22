import pandas as pd
import matplotlib.pyplot as plt
import io
from .database import game_history_collection

async def generate_efficiency_chart():
    # 1. Fetch data from MongoDB
    cursor = game_history_collection.find()
    data = await cursor.to_list(length=1000)
    
    if not data:
        return None

    # 2. Business Decision Modeling (Pandas)
    df = pd.DataFrame(data)
    
    # Analysis: Average Score based on how fast the "Boy" was chosen
    # Does hesitating to vote hurt performance?
    if 'vote_duration' in df.columns and 'round_score' in df.columns:
        plt.figure(figsize=(8, 5))
        plt.scatter(df['vote_duration'], df['round_score'], color='purple')
        plt.title('Impact of Decision Speed on Team Performance')
        plt.xlabel('Seconds taken to Vote')
        plt.ylabel('Score Achieved')
        plt.grid(True)
        
        # Save to static folder
        output_path = "static/analytics_chart.png"
        plt.savefig(output_path)
        plt.close()
        return output_path
        
    return None