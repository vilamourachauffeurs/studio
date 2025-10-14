
import { config } from 'dotenv';
config();

import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin SDK for the local development server.
// This ensures that the server-side flows (like sending notifications)
// have the necessary permissions to access Firestore.
initializeApp();

import '@/ai/flows/summarize-client-notes.ts';
import '@/ai/flows/suggest-driver-for-booking.ts';
import '@/ai/flows/handle-notification-flow.ts';
