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

## Vercel Deployment

### Prerequisites
- Vercel account
- Vercel CLI installed (`npm i -g vercel`)

### Deployment Steps

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy from the server directory**:
```bash
cd server
vercel
```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Set project name
   - Confirm deployment settings

5. **Set environment variables** (if needed):
```bash
vercel env add
```

### Alternative: Deploy via GitHub

1. **Push your code to GitHub**

2. **Connect your repository to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `server` directory as the root
   - Deploy

### API Endpoints

- `GET /` - Health check
- `GET /sites/` - Get all sites
- `GET /spaces/?siteId={id}` - Get spaces for a site
- `POST /spaces/{space_id}/streams` - Add stream to space
- `DELETE /streams/{stream_id}` - Delete stream

### Configuration Files

- `vercel.json` - Vercel deployment configuration
- `api/index.py` - Serverless function entry point
- `requirements.txt` - Python dependencies

### Notes

- The API uses in-memory storage for Vercel serverless functions
- CORS is configured to allow all origins (update for production)
- The `seedData.json` file is included as fallback data 