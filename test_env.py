#!/usr/bin/env python3
"""
Test script to check Google OAuth2 environment variables
"""

import os
import sys

def test_env_variables():
    print("🔍 Testing Google OAuth2 Environment Variables")
    print("=" * 50)
    
    # Check if we're in the right directory
    current_dir = os.getcwd()
    print(f"Current directory: {current_dir}")
    
    # Try to load environment variables
    client_id = os.getenv('GOOGLE_CLIENT_ID')
    client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
    
    print(f"\n📋 Environment Variables Status:")
    print(f"GOOGLE_CLIENT_ID: {'✅ Set' if client_id else '❌ Not Set'}")
    print(f"GOOGLE_CLIENT_SECRET: {'✅ Set' if client_secret else '❌ Not Set'}")
    
    if client_id:
        print(f"Client ID: {client_id[:10]}...{client_id[-10:] if len(client_id) > 20 else ''}")
    if client_secret:
        print(f"Client Secret: {client_secret[:10]}...{client_secret[-10:] if len(client_secret) > 20 else ''}")
    
    # Check .env file
    env_file_path = "../backend/Educational-platform/BackEnd/App/.env"
    if os.path.exists(env_file_path):
        print(f"\n📁 .env file found at: {env_file_path}")
        with open(env_file_path, 'r') as f:
            content = f.read()
            if 'GOOGLE_CLIENT_ID' in content:
                print("✅ Google OAuth2 variables found in .env file")
            else:
                print("❌ Google OAuth2 variables NOT found in .env file")
    else:
        print(f"\n❌ .env file NOT found at: {env_file_path}")
    
    print("\n💡 If variables are not set, follow the setup guide in MANUAL_GOOGLE_SETUP.md")

if __name__ == "__main__":
    test_env_variables()
