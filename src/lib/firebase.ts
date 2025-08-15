// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Replace these with your actual Firebase config values
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBxf9FHcj04ttQM-oZj4ZfHAwC4bKOAYYY",
  authDomain: "electronic-log-book-56ec7.firebaseapp.com",
  projectId: "electronic-log-book-56ec7",
  storageBucket: "electronic-log-book-56ec7.firebasestorage.app",
  messagingSenderId: "217395597058",
  appId: "1:217395597058:web:4db1f7dfaf94a6f467bc1b",
  measurementId: "G-CKS6RWSBG6"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { auth };
