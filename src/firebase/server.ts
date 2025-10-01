
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

if (!getApps().length) {
  // In a managed environment, initializeApp() can often be called without arguments
  // to automatically discover service account credentials.
  initializeApp();
}

const adminDb = getFirestore();

export { adminDb as firestore };
