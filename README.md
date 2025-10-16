# Firebase Studio

A comprehensive transportation and booking management system built with Next.js, Firebase, and AI-powered features.

## Features

- 🚗 **Booking Management** - Create, edit, and manage transportation bookings
- 👥 **Multi-Role Dashboard** - Admin, Operator, Partner, and Driver views
- 📊 **Analytics & Reports** - Track performance and earnings
- 🔔 **Push Notifications** - Real-time job assignments and updates
- 🤖 **AI Integration** - Driver suggestions and note summarization
- 📱 **Mobile-Ready** - Architecture supports future iOS/Android apps

## Getting Started

### Prerequisites

- Node.js 20+ installed
- Firebase project set up
- npm or yarn package manager

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and fill in your Firebase credentials:

```bash
cp .env.example .env.local
```

Get your Firebase credentials:
1. Go to [Firebase Console](https://console.firebase.google.com) → Your Project
2. Navigate to **Project Settings → Service Accounts**
3. Click **"Generate new private key"**
4. Open the downloaded JSON file and copy these values to `.env.local`:
   - `FIREBASE_PROJECT_ID` (from `project_id`)
   - `FIREBASE_CLIENT_EMAIL` (from `client_email`)
   - `FIREBASE_PRIVATE_KEY` (from `private_key`)

### 3. Firebase Configuration

#### Firestore Rules
Deploy the security rules to your Firebase project:
```bash
# Via Firebase Console (easiest)
1. Go to Firestore Database → Rules
2. Copy content from firestore.rules
3. Click Publish
```

#### Cloud Messaging (Push Notifications)
1. Go to **Project Settings → Cloud Messaging**
2. Under **"Web Push certificates"**, click **"Generate key pair"**
3. Copy the key and update `VAPID_KEY` in `src/components/NotificationManager.tsx`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. AI Features (Optional)

To use AI-powered features:
```bash
npm run genkit:dev
```

## Deployment

### Firebase Hosting

1. Install Firebase CLI (if not already installed):
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase Hosting (if not already done):
```bash
firebase init hosting
```

4. Build and deploy:
```bash
npm run build
firebase deploy
```

**Note:** In production on Firebase Hosting, the Admin SDK credentials are automatically provided - no need to set environment variables.

### Other Platforms (Vercel, Netlify, etc.)

Set these environment variables in your deployment platform:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## Project Structure

```
src/
├── app/              # Next.js app directory
│   └── dashboard/    # Dashboard pages (bookings, drivers, users, etc.)
├── components/       # React components
│   ├── dashboard/    # Dashboard-specific components
│   └── ui/          # shadcn/ui components
├── firebase/         # Firebase configuration and hooks
├── ai/              # AI flows and Genkit integration
└── lib/             # Utilities, types, and actions
```

## User Roles

- **Admin** - Full access to all features
- **Operator** - Create and manage bookings for their company
- **Partner** - Create and view bookings for their organization
- **Driver** - View assigned jobs and update status

## Future Development

### Mobile Apps
This project is architected to support future mobile applications:
- Same Firebase project for web and mobile
- Same authentication and database
- Same push notification system (FCM)
- Consider React Native for code reuse or native development

### Technology Options
- **React Native** - Reuse React components and logic
- **Flutter** - Cross-platform with native performance
- **Native iOS/Android** - Maximum control and performance

## Technologies Used

- **Next.js 15** - React framework with App Router
- **Firebase** - Backend, authentication, and database
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **Genkit AI** - AI-powered features
- **Firestore** - Real-time database
- **Firebase Cloud Messaging** - Push notifications

## License

Private - All rights reserved
