# Ambient Spaces API Server

A FastAPI backend server that provides the same API endpoints as the original Ambient API, using in-memory storage with seed data.

## Features

- **Sites API**: Get all available sites
- **Spaces API**: Get spaces for a specific site
- **Add Stream API**: Add new streams to spaces with optimistic updates
- **Delete Stream API**: Delete streams with optimistic updates
- **CORS Support**: Configured for frontend integration
- **Error Handling**: Proper HTTP status codes and error messages

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server will start on `http://localhost:8000`

## API Endpoints

### GET /sites/
Returns all available sites.

**Response:**
```json
[
  { "id": "1", "name": "San Jose" },
  { "id": "2", "name": "Toronto" },
  { "id": "3", "name": "Mars" }
]
```

### GET /spaces/?siteId={siteId}
Returns spaces for a specific site.

**Parameters:**
- `siteId` (required): The ID of the site

**Response:**
```json
{
  "spaces": [
    {
      "spaces": [
        {
          "id": 1,
          "name": "Space Name",
          "streams": [
            { "id": 1, "name": "Stream Name" }
          ],
          "parentSpaceId": null
        }
      ]
    }
  ]
}
```

### POST /spaces/{spaceId}/streams
Adds a new stream to a space.

**Parameters:**
- `spaceId` (path): The ID of the space

**Request Body:**
```json
{
  "name": "New Stream Name"
}
```

**Response:**
```json
{
  "id": 123,
  "name": "New Stream Name",
  "spaceId": 1
}
```

### DELETE /streams/{streamId}
Deletes a stream by ID.

**Parameters:**
- `streamId` (path): The ID of the stream to delete

**Response:**
```json
{
  "message": "Stream deleted successfully"
}
```

## Data Structure

The server uses the `seedData.json` file to initialize the data structure. The data includes:

- **San Jose Spaces**: Flat structure with root-level spaces
- **Toronto Spaces**: Complex nested space hierarchy
- **Available Sites**: List of all sites

## Error Handling

- **404 Not Found**: When site or space is not found
- **500 Internal Server Error**: For Mars site (error handling test case)
- **422 Validation Error**: For invalid request data

## CORS Configuration

The server is configured to allow requests from any origin (`*`) for development. In production, you should specify the exact frontend URL. 