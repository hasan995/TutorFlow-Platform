#!/usr/bin/env python3
"""
Google OAuth2 Environment Setup Script
This script helps you set up the Google OAuth2 environment variables for TutorFlow.
"""

import os
import sys

def main():
    print("🔧 Google OAuth2 Environment Setup for TutorFlow")
    print("=" * 50)
    
    # Check if .env file exists
    env_file_path = "../backend/Educational-platform/BackEnd/App/.env"
    
    if not os.path.exists(env_file_path):
        print(f"❌ .env file not found at: {env_file_path}")
        print("Please create the .env file first.")
        return
    
    print(f"✅ Found .env file at: {env_file_path}")
    
    # Read current .env file
    with open(env_file_path, 'r') as f:
        content = f.read()
    
    # Check if Google OAuth2 variables already exist
    if 'GOOGLE_CLIENT_ID' in content:
        print("⚠️  Google OAuth2 variables already exist in .env file")
        print("Current values:")
        for line in content.split('\n'):
            if line.startswith('GOOGLE_CLIENT_ID') or line.startswith('GOOGLE_CLIENT_SECRET'):
                print(f"  {line}")
        return
    
    print("\n📝 Please enter your Google OAuth2 credentials:")
    print("(You can get these from Google Cloud Console)")
    print()
    
    client_id = input("Enter your Google Client ID: ").strip()
    client_secret = input("Enter your Google Client Secret: ").strip()
    
    if not client_id or not client_secret:
        print("❌ Both Client ID and Client Secret are required!")
        return
    
    # Add Google OAuth2 variables to .env file
    google_oauth_config = f"""
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID={client_id}
GOOGLE_CLIENT_SECRET={client_secret}
"""
    
    # Append to .env file
    with open(env_file_path, 'a') as f:
        f.write(google_oauth_config)
    
    print("\n✅ Google OAuth2 environment variables added successfully!")
    print(f"📁 Updated file: {env_file_path}")
    print("\n🔄 Please restart your backend server for changes to take effect.")
    print("   Run: cd ../backend/Educational-platform/BackEnd/App && python manage.py runserver")

if __name__ == "__main__":
    main()
