# Google OAuth2 Setup Guide

This guide explains how to set up Google OAuth2 authentication for the TutorFlow platform.

## Backend Setup

### 1. Environment Variables

Add the following environment variables to your backend `.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 2. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen
6. Set the authorized redirect URIs:
   - For development: `http://localhost:5173/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`

### 3. Backend API Endpoints

The backend provides the following OAuth2 endpoints:

- `GET /api/oauth2/google/auth-url/` - Get Google OAuth2 authorization URL
- `POST /api/oauth2/google/callback/` - Handle OAuth2 callback and create/update user

## Frontend Implementation

### 1. Login Flow

1. User clicks "Continue with Google" button on login page
2. Frontend calls backend to get Google OAuth2 URL
3. User is redirected to Google for authentication
4. Google redirects back to `/auth/callback` with authorization code
5. Frontend shows role selection modal (Student/Instructor)
6. User selects role and backend creates/updates user account
7. User is logged in and redirected to homepage

### 2. User Display

- The navbar displays the user's first name from Gmail
- Username is randomly generated for security
- Role (Student/Instructor) is stored and displayed

### 3. Components

- `Login.jsx` - Contains Google OAuth2 button
- `GoogleAuthCallback.jsx` - Handles OAuth2 callback flow
- `RoleSelectionModal.tsx` - Modal for role selection

## Features

### ✅ Implemented Features

1. **Google OAuth2 Authentication**
   - Secure OAuth2 flow with Google
   - Automatic user creation/update
   - JWT token generation

2. **Role Selection**
   - Users can choose between Student and Instructor roles
   - Role is stored in user profile
   - Role can be updated on subsequent logins

3. **User Display**
   - Shows Gmail first name in navbar
   - Random username generation for security
   - Proper user information storage

4. **Security**
   - Secure token exchange
   - User validation
   - Error handling

### 🔧 Configuration Required

1. Set up Google Cloud Console project
2. Configure environment variables
3. Set authorized redirect URIs
4. Test the OAuth2 flow

## Testing

1. Start the backend server
2. Start the frontend development server
3. Navigate to `/login`
4. Click "Continue with Google"
5. Complete Google authentication
6. Select role (Student/Instructor)
7. Verify user is logged in and name is displayed correctly

## Troubleshooting

### Common Issues

1. **"Google Client ID not configured"**
   - Check that `GOOGLE_CLIENT_ID` is set in environment variables

2. **"Invalid redirect URI"**
   - Verify redirect URI is added to Google Cloud Console
   - Check that the URI matches exactly (including protocol and port)

3. **"Authentication failed"**
   - Check Google Cloud Console credentials
   - Verify API is enabled
   - Check network connectivity

### Debug Steps

1. Check browser console for errors
2. Check backend logs for authentication errors
3. Verify environment variables are loaded
4. Test OAuth2 flow in Google Cloud Console
