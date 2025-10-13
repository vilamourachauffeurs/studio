'use client';

import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useFirebase, useUser } from '@/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

// This is the public VAPID key for web push notifications.
// It's safe to be public.
const VAPID_KEY =
  'YOUR_VAPID_KEY_HERE'; // In a real app, this would be generated in the Firebase Console

export default function NotificationManager() {
  const { firebaseApp, firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined' || !firebaseApp || !user) {
      return;
    }

    const messaging = getMessaging(firebaseApp);

    // --- 1. Request Permission ---
    Notification.requestPermission()
      .then((permission) => {
        if (permission !== 'granted') {
          console.log('Notification permission not granted.');
          return;
        }

        // --- 2. Get Device Token ---
        console.log('Notification permission granted. Getting token...');
        return getToken(messaging, { vapidKey: VAPID_KEY });
      })
      .then((currentToken) => {
        if (!currentToken) {
          console.log(
            'No registration token available. Request permission to generate one.'
          );
          return;
        }

        console.log('FCM Token:', currentToken);

        // --- 3. Save Token to Firestore ---
        const userDocRef = doc(firestore, 'users', user.uid);
        // We use arrayUnion to add the token only if it's not already there.
        // This prevents duplicate tokens for the same device.
        updateDoc(userDocRef, {
          fcmTokens: arrayUnion(currentToken),
        });
      })
      .catch((err) => {
        console.error('An error occurred while retrieving token. ', err);
        // This can happen if the VAPID key is missing or incorrect,
        // or if there's an issue with the service worker.
      });

    // --- Handle Foreground Messages ---
    // This function will be called when a notification is received while the app is in the foreground.
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received. ', payload);
      toast({
        title: payload.notification?.title || 'New Notification',
        description: payload.notification?.body || '',
      });
    });

    return () => {
      unsubscribe();
    };
  }, [firebaseApp, user, firestore, toast]);

  return null; // This component doesn't render anything.
}
