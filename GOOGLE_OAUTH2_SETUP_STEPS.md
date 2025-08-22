# 🔧 Google OAuth2 Setup Steps - Fix the 500 Error

## Current Issue
The backend is returning a 500 error because the Google OAuth2 credentials are not configured. Here's how to fix it:

## Step 1: Create Google Cloud Console Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Configure the OAuth consent screen:
   - User Type: External
   - App name: TutorFlow
   - User support email: your-email@gmail.com
   - Developer contact information: your-email@gmail.com

4. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: TutorFlow Web Client
   - Authorized redirect URIs:
     - `http://localhost:5173/auth/callback`
     - `http://127.0.0.1:5173/auth/callback`

5. **Copy the Client ID and Client Secret**

## Step 3: Configure Environment Variables

Create or update your backend `.env` file in `backend/Educational-platform/BackEnd/App/.env`:

```env
# Add these lines to your existing .env file:

# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
```

**Replace `your_actual_client_id_here` and `your_actual_client_secret_here` with the values from Step 2.**

## Step 4: Restart Backend Server

1. Stop the current backend server (Ctrl+C)
2. Start it again:
   ```bash
   cd backend/Educational-platform/BackEnd/App
   python manage.py runserver
   ```

## Step 5: Test the Setup

1. Make sure both frontend and backend are running
2. Go to `http://localhost:5173/login`
3. Click "Continue with Google"
4. You should now be redirected to Google's OAuth2 page

## Troubleshooting

### If you still get 500 errors:

1. **Check environment variables:**
   ```bash
   # In your backend directory, run:
   python -c "import os; print('GOOGLE_CLIENT_ID:', os.getenv('GOOGLE_CLIENT_ID'))"
   ```

2. **Check backend logs:**
   - Look for the debug output in your terminal where the backend is running
   - You should see lines like:
     ```
     DEBUG: GOOGLE_CLIENT_ID = your_client_id
     DEBUG: GOOGLE_CLIENT_SECRET = your_client_secret
     ```

3. **Test the endpoint directly:**
   ```bash
   curl "http://localhost:8000/api/oauth2/google/auth-url/?redirect_uri=http://localhost:5173/auth/callback"
   ```

### Common Issues:

1. **"Invalid redirect URI"**
   - Make sure the redirect URI in Google Cloud Console exactly matches: `http://localhost:5173/auth/callback`

2. **"Google Client ID not configured"**
   - Check that your `.env` file is in the correct location
   - Make sure the backend server was restarted after adding the environment variables

3. **CORS errors**
   - The backend should already be configured to allow `localhost:5173`

## Quick Test Credentials (For Development Only)

If you want to test the flow without setting up real Google credentials, you can temporarily modify the backend to return a mock response. However, this won't work for actual Google authentication.

## Next Steps

Once you have the Google OAuth2 credentials configured:

1. The "Continue with Google" button will work
2. Users will be redirected to Google for authentication
3. After Google authentication, they'll see the role selection modal
4. They can choose between Student and Instructor roles
5. The system will create their account with a random username and their Gmail first name

## Security Notes

- Never commit your `.env` file to version control
- Use different credentials for development and production
- In production, use environment variables or a secure configuration management system
