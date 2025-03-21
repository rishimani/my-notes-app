#!/bin/bash

cat > .env.local << 'EOL'
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="***REMOVED***"
GOOGLE_CLIENT_ID="***REMOVED***"
GOOGLE_CLIENT_SECRET="***REMOVED***"

# Database
DATABASE_URL="postgresql://postgres:***REMOVED***@localhost:5432/notesdb"

# OpenWeather API
OPENWEATHER_API_KEY="d65beebfeb5d13de4fdb938ec77946d4"
# The key should not be exposed to the client side anymore
# NEXT_PUBLIC_OPENWEATHER_API_KEY="d65beebfeb5d13de4fdb938ec77946d4"
EOL

echo "Environment file updated successfully!" 