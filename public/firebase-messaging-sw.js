importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyD2kSU5t3czawb2C9OxPWdmwhhQJGqavXg',
  authDomain: 'prathmik-kumarshala-devla.firebaseapp.com',
  projectId: 'prathmik-kumarshala-devla',
  storageBucket: 'prathmik-kumarshala-devla.firebasestorage.app',
  messagingSenderId: '866107973346',
  appId: '1:866107973346:web:ce865c0df3c340c7d248bb',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.data;
  self.registration.showNotification(title || 'Prathmik Kumarshala', {
    body: body || '',
    icon: icon || '/logo.jpeg',
  });
});
