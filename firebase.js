import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyByhXaQ7U2n8py7Cti9kR_pcheoo-ONZr8",
  authDomain: "ben-10-catalog.firebaseapp.com",
  databaseURL: "https://ben-10-catalog-default-rtdb.firebaseio.com",
  projectId: "ben-10-catalog",
  storageBucket: "ben-10-catalog.appspot.com",
  messagingSenderId: "581203634751",
  appId: "1:581203634751:web:9a4e2831a3d5b9c1d668a",
  measurementId: "G-4RRWFKRSSV",
};

// ADD THIS LINE TO DEBUG:
console.log("Firebase API Key loaded:", firebaseConfig.apiKey);

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getDatabase(app);