// This file is required to handle web push notifications in the background.
// It must be in the public directory.

// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js");


// Initialize the Firebase app in the service worker
// Be sure to replace the config values with your own
firebase.initializeApp({
  apiKey: "AIzaSyDhP0rNyGi2dODgIXwZFtC3QzIxPFs69ps",
  authDomain: "studio-7106436978-f5ba3.firebaseapp.com",
  projectId: "studio-7106436978-f5ba3",
  storageBucket: "studio-7106436978-f5ba3.appspot.com",
  messagingSenderId: "680211956159",
  appId: "1:680211956159:web:6ea06cc2d621a5b68d610a"
});


// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
    };

    self.registration.showNotification(notificationTitle,
        notificationOptions);
});
