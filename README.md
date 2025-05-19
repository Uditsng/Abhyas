This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

### Environment Variables (REQUIRED)

This project uses Firebase for authentication and database. You **MUST** set up environment variables for Firebase configuration to run the application. The app will not work without these variables.

1. Create a `.env.local` file in the root directory of the project
2. Add the following environment variables with your Firebase project values:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

3. Replace the placeholder values with your actual Firebase configuration from your Firebase project settings

> **IMPORTANT**: Never commit your `.env.local` file to version control. It contains sensitive API keys that should be kept private. The `.env.local` file is already added to `.gitignore`.

#### How to get Firebase configuration values:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click on the gear icon (⚙️) next to "Project Overview" and select "Project settings"
4. Scroll down to the "Your apps" section and select your web app (or create one)
5. Copy the configuration values from the Firebase SDK snippet

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

Open http://localhost:3000 with your browser to see the result.
You can start editing the page by modifying app/page.jsx. The page auto-updates as you edit the file.
API routes can be accessed on http://localhost:3000/api/hello. This endpoint can be edited in pages/api/hello.js.
The pages/api directory is mapped to /api/*. Files in this directory are treated as API routes instead of React pages.
This project uses next/font to automatically optimize and load Geist, a new font family for Vercel.
Learn More
To learn more about Next.js, take a look at the following resources:

Next.js Documentation - learn about Next.js features and API.
Learn Next.js - an interactive Next.js tutorial.

You can check out the Next.js GitHub repository - your feedback and contributions are welcome!
Deploy on Vercel
The easiest way to deploy your Next.js app is to use the Vercel Platform from the creators of Next.js.
Check out our Next.js deployment documentation for more details.