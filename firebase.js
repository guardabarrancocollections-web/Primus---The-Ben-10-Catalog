import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCdY2eGebI0CjUPHxUeF24Agi1dofhq1i8",
  authDomain: "primus-ben10catalog.firebaseapp.com",
  databaseURL: "https://primus-ben10catalog.firebaseio.com",
  projectId: "primus-ben10catalog",
  storageBucket: "primus-ben10catalog.firebasestorage.app",
  messagingSenderId: "31572725772",
  appId: "1:31572725772:web:34d3ba150c328e87355e29",
  measurementId: "G-ND794J5BHZ"
};

// ADD THIS LINE TO DEBUG:
console.log("Firebase API Key loaded:", firebaseConfig.apiKey);

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getDatabase(app);