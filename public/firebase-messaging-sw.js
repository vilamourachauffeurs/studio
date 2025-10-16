
// This file must be in the public folder.

// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-7106436978-f5ba3",
  "appId": "1:680211956159:web:6ea06cc2d621a5b68d610a",
  "apiKey": "AIzaSyDhP0rNyGi2dODgIXwZFtC3QzIxPFs69ps",
  "authDomain": "studio-7106436978-f5ba3.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "680211956159"
};


// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

// Optional: To handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
