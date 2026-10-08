import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyByhXaQ7U2n8py7Cti9kR_pcheoo-ONZr8",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "ben-10-catalog.firebaseapp.com",
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || "https://ben-10-catalog-default-rtdb.firebaseio.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "ben-10-catalog",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "ben-10-catalog.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "581203634751",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:581203634751:web:9a4e2831a32d5b9c1d668a",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-4RRWFKRSSV",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getDatabase(app);