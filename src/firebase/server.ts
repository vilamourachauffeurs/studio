
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

if (!getApps().length) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (serviceAccount.clientEmail && serviceAccount.privateKey) {
      // Running in a local/dev environment with service account credentials
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized with service account credentials.');
    } else {
      // Running in a deployed environment (e.g., Firebase Hosting, Google Cloud)
      // where credentials should be auto-discovered.
      initializeApp({
        projectId: firebaseConfig.projectId,
      });
      console.log('Firebase Admin SDK initialized for a production environment.');
    }
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
    // As a fallback, initialize with what we have.
    initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
}

const adminDb = getFirestore();

export { adminDb as firestore };
