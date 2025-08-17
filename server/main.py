from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime

app = FastAPI(title="Ambient Spaces API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load seed data
def load_seed_data():
    with open("seedData.json", "r") as f:
        return json.load(f)

# Global variable to store data (in-memory storage)
data = load_seed_data()

# Pydantic models
class Stream(BaseModel):
    id: int
    name: str

class Space(BaseModel):
    id: int
    name: str
    streams: List[Stream]
    parentSpaceId: Optional[int] = None

class SpacesGroup(BaseModel):
    spaces: List[Space]

class FlattenedSpacesData(BaseModel):
    spaces: List[SpacesGroup]

class Site(BaseModel):
    id: str
    name: str

class AddStreamRequest(BaseModel):
    name: str

class AddStreamResponse(BaseModel):
    id: int
    name: str
    spaceId: int

# Helper function to get next available stream ID
def get_next_stream_id():
    max_id = 0
    for site_data in [data["sanJoseSpaces"], data["torontoSpaces"]]:
        for group in site_data:
            for space in group["spaces"]:
                for stream in space["streams"]:
                    max_id = max(max_id, stream["id"])
    return max_id + 1

# Helper function to find space by ID
def find_space_by_id(space_id: int):
    for site_data in [data["sanJoseSpaces"], data["torontoSpaces"]]:
        for group in site_data:
            for space in group["spaces"]:
                if space["id"] == space_id:
                    return space, group
    return None, None

@app.get("/")
async def root():
    return {"message": "Ambient Spaces API"}

@app.get("/sites/", response_model=List[Site])
async def get_sites():
    """Get all available sites"""
    return data["availableSites"]

@app.get("/spaces/", response_model=FlattenedSpacesData)
async def get_spaces(siteId: str = Query(..., description="The ID of the site to retrieve spaces for")):
    """Get spaces for a specific site"""
    if siteId == "1":  # San Jose
        return {"spaces": data["sanJoseSpaces"]}
    elif siteId == "2":  # Toronto
        return {"spaces": data["torontoSpaces"]}
    elif siteId == "3":  # Mars - Error handling test case
        raise HTTPException(status_code=500, detail="Internal server error")
    else:
        raise HTTPException(status_code=404, detail="Site not found")

@app.post("/spaces/{space_id}/streams", response_model=AddStreamResponse)
async def add_stream_to_space(space_id: int, stream_request: AddStreamRequest):
    """Add a new stream to a space"""
    space, group = find_space_by_id(space_id)
    
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    
    # Check if stream name already exists in this space
    existing_stream_names = [stream["name"].lower() for stream in space["streams"]]
    if stream_request.name.lower() in existing_stream_names:
        raise HTTPException(
            status_code=400, 
            detail=f"Stream with name '{stream_request.name}' already exists in this space"
        )
    
    # Generate new stream ID
    new_stream_id = get_next_stream_id()
    
    # Create new stream
    new_stream = {
        "id": new_stream_id,
        "name": stream_request.name
    }
    
    # Add stream to the space
    space["streams"].append(new_stream)
    
    return AddStreamResponse(
        id=new_stream_id,
        name=stream_request.name,
        spaceId=space_id
    )

@app.delete("/streams/{stream_id}")
async def delete_stream(stream_id: int):
    """Delete a stream by ID"""
    stream_found = False
    
    for site_data in [data["sanJoseSpaces"], data["torontoSpaces"]]:
        for group in site_data:
            for space in group["spaces"]:
                for i, stream in enumerate(space["streams"]):
                    if stream["id"] == stream_id:
                        space["streams"].pop(i)
                        stream_found = True
                        break
                if stream_found:
                    break
            if stream_found:
                break
        if stream_found:
            break
    
    if not stream_found:
        raise HTTPException(status_code=404, detail="Stream not found")
    
    return {"message": "Stream deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 