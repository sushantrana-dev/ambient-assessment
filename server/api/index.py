from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from typing import List, Optional

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load seed data
def load_seed_data():
    try:
        with open("seedData.json", "r") as f:
            data = json.load(f)
            # Transform the data structure to match the expected format
            return {
                "sites": data["availableSites"],
                "spaces": {
                    "1": data["sanJoseSpaces"],
                    "2": data["torontoSpaces"],
                    "3": []  # Mars site - empty spaces
                }
            }
    except FileNotFoundError:
        # Fallback data if file not found
        return {
            "sites": [
                {"id": "1", "name": "San Jose"},
                {"id": "2", "name": "Toronto"},
                {"id": "3", "name": "Mars"}
            ],
            "spaces": {
                "1": [
                    {
                        "spaces": [
                            {"id": 1, "name": "Main Building", "streams": [{"id": 1, "name": "Main Entrance"}, {"id": 2, "name": "Reception Desk"}], "parentSpaceId": None},
                            {"id": 2, "name": "Marketing", "streams": [{"id": 3, "name": "Marketing Camera 1"}, {"id": 4, "name": "Marketing Camera 2"}], "parentSpaceId": 1}
                        ]
                    }
                ],
                "2": [
                    {
                        "spaces": [
                            {"id": 3, "name": "Corporate Office", "streams": [{"id": 5, "name": "Executive Suite"}], "parentSpaceId": 8},
                            {"id": 4, "name": "Break Room", "streams": [{"id": 6, "name": "Cafeteria View"}], "parentSpaceId": 3},
                            {"id": 5, "name": "Conference Room A", "streams": [{"id": 7, "name": "Conference Room Front"}], "parentSpaceId": 3},
                            {"id": 6, "name": "Training Center", "streams": [{"id": 8, "name": "Training Room 1"}, {"id": 9, "name": "Training Room 2"}], "parentSpaceId": 3},
                            {"id": 7, "name": "Cafeteria", "streams": [{"id": 10, "name": "Dining Area"}], "parentSpaceId": 3},
                            {"id": 8, "name": "Corporate Office", "streams": [{"id": 11, "name": "Main Hallway"}, {"id": 12, "name": "Elevator Lobby"}, {"id": 13, "name": "Reception"}], "parentSpaceId": None},
                            {"id": 9, "name": "Storage Room", "streams": [], "parentSpaceId": 3},
                            {"id": 10, "name": "Research Wing", "streams": [{"id": 14, "name": "Lab Camera"}], "parentSpaceId": None}
                        ]
                    },
                    {
                        "spaces": [
                            {"id": 11, "name": "Warehouse", "streams": [{"id": 15, "name": "Loading Dock 1"}, {"id": 16, "name": "Loading Dock 2"}], "parentSpaceId": None}
                        ]
                    }
                ],
                "3": []
            }
        }

# In-memory storage (for Vercel serverless functions)
data_store = load_seed_data()

@app.get("/")
async def root():
    return {"message": "Space Navigator API"}

@app.get("/sites/")
async def get_sites():
    return {"sites": data_store["sites"]}

@app.get("/spaces/")
async def get_spaces(siteId: str):
    if siteId == "3":  # Mars site - return error
        return {"error": "Failed to load spaces for Mars site"}
    
    spaces = data_store["spaces"].get(siteId, [])
    return {"spaces": spaces}

@app.post("/spaces/{space_id}/streams")
async def add_stream_to_space(space_id: int, stream_request: dict):
    # Find the space and add the stream
    for site_spaces in data_store["spaces"].values():
        for group in site_spaces:
            for space in group["spaces"]:
                if space["id"] == space_id:
                    # Check for duplicate names
                    existing_names = [stream["name"].lower() for stream in space["streams"]]
                    if stream_request["name"].lower() in existing_names:
                        from fastapi import HTTPException
                        raise HTTPException(status_code=400, detail=f"Stream with name '{stream_request['name']}' already exists in this space")
                    
                    # Generate new ID
                    new_id = max([stream["id"] for stream in space["streams"]] + [0]) + 1
                    new_stream = {
                        "id": new_id,
                        "name": stream_request["name"]
                    }
                    space["streams"].append(new_stream)
                    return new_stream
    
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Space not found")

@app.delete("/streams/{stream_id}")
async def delete_stream(stream_id: int):
    # Find and delete the stream
    for site_spaces in data_store["spaces"].values():
        for group in site_spaces:
            for space in group["spaces"]:
                for i, stream in enumerate(space["streams"]):
                    if stream["id"] == stream_id:
                        deleted_stream = space["streams"].pop(i)
                        return {"message": f"Stream '{deleted_stream['name']}' deleted successfully"}
    
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Stream not found")

# Vercel serverless function handler
from mangum import Mangum
handler = Mangum(app) 