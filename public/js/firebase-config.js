// public/js/firebase-config.js

// Firebase-Konfiguration - Ersetze diese durch deine eigenen Werte
const firebaseConfig = {
  apiKey: "AIzaSyAeP-mvD5dW9Q_aU_lm6EmXGPYzAFNQHLY",
  authDomain: "login-183.firebaseapp.com",
  projectId: "login-183",
  storageBucket: "login-183.firebasestorage.app",
  messagingSenderId: "449021965144",
  appId: "1:449021965144:web:7106fa2e8f3df85976eb2d"
};
  // Firebase initialisieren
  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth(app);