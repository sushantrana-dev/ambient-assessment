# Space Navigator API

A FastAPI backend for the Space Navigator application.

## Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
uvicorn main:app --reload
```

The server will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Health check
- `GET /sites/` - Get all sites
- `GET /spaces/?siteId={id}` - Get spaces for a site
- `POST /spaces/{space_id}/streams` - Add stream to space
- `DELETE /streams/{stream_id}` - Delete stream

## Configuration Files

- `main.py` - FastAPI application entry point
- `requirements.txt` - Python dependencies
- `seedData.json` - Sample data for the application

## Notes

- The API uses in-memory storage
- CORS is configured to allow all origins (update for production)
- The `seedData.json` file contains sample data for testing 