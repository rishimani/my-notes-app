This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Setup

You can set up your environment in two ways:

### Option 1: Using the setup script

1. Copy the example script to create your own setup script:

```bash
cp setup-env.sh.example setup-env.sh
```

2. Edit the `setup-env.sh` file to include your actual credentials:

```bash
nano setup-env.sh  # or use your preferred editor
```

3. Run the script to generate your `.env.local` file:

```bash
chmod +x setup-env.sh
./setup-env.sh
```

This script will automatically generate a secure random string for NEXTAUTH_SECRET.

### Option 2: Manual Setup

1. Create a `.env.local` file in the root directory of the project with the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="your-nextauth-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"

# OpenWeather API
OPENWEATHER_API_KEY="your-openweather-api-key"
```

2. **Google API Setup:**

   - Create a project in the [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Gmail API for your project
   - Set up OAuth consent screen
   - Create OAuth credentials and get your Client ID and Client Secret
   - Configure the authorized redirect URIs (e.g., `http://localhost:3000/api/auth/callback/google`)

3. **NextAuth Secret:**

   - Generate a secure random string for NEXTAUTH_SECRET using a tool like `openssl rand -base64 32`

4. **Database URL:**

   - Set up your database and provide its connection string

5. **OpenWeather API:**
   - Sign up at [OpenWeather](https://openweathermap.org/api) to get an API key

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
