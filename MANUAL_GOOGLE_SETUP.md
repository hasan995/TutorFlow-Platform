# 🔧 Manual Google OAuth2 Setup

## Current Issue
The debug output shows:
```
DEBUG: GOOGLE_CLIENT_ID = None
DEBUG: GOOGLE_CLIENT_SECRET = None
```

This means the environment variables are not set. Here's how to fix it manually:

## Step 1: Create/Edit .env File

1. Navigate to: `backend/Educational-platform/BackEnd/App/`
2. Create or edit the `.env` file
3. Add these lines at the end of the file:

```env
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
```

## Step 2: Get Google OAuth2 Credentials

If you don't have Google OAuth2 credentials yet:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: Web application
   - Name: TutorFlow Web Client
   - Authorized redirect URIs: `http://localhost:5173/auth/callback`
5. Copy the Client ID and Client Secret

## Step 3: Update .env File

Replace `your_actual_client_id_here` and `your_actual_client_secret_here` with your real credentials.

## Step 4: Restart Backend Server

1. Stop the current backend server (Ctrl+C)
2. Start it again:
   ```bash
   cd backend/Educational-platform/BackEnd/App
   python manage.py runserver
   ```

## Step 5: Test

1. Go to `http://localhost:5173/login`
2. Click "Continue with Google"
3. You should now see the Google OAuth2 page instead of a 500 error

## Quick Test

After setting up, you can test if the environment variables are loaded:

```bash
cd backend/Educational-platform/BackEnd/App
python -c "import os; print('GOOGLE_CLIENT_ID:', os.getenv('GOOGLE_CLIENT_ID'))"
```

This should print your actual Client ID instead of `None`.

## Troubleshooting

- Make sure there are no spaces around the `=` sign in the .env file
- Make sure the .env file is in the correct location
- Make sure you restarted the backend server after adding the variables
- Check that the redirect URI in Google Cloud Console matches exactly: `http://localhost:5173/auth/callback`
