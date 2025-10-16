
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

if (!getApps().length) {
  try {
    // Check if environment variables are set (local development)
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      // Replace escaped newlines in private key
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log('Firebase Admin SDK initialized with environment variables');
    } else {
      // Production environment - credentials auto-discovered
      initializeApp({
        projectId: firebaseConfig.projectId,
      });
      console.log('Firebase Admin SDK initialized for production environment');
    }
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
    // Initialize with minimal config as fallback
    initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
}

const adminApp = getApps()[0] || getApp();
const adminDb = getFirestore();

export { adminDb as firestore, adminApp };
