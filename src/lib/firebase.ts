import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Authentication
export const auth = getAuth(app);

const databaseId = (firebaseConfig as Record<string, any>).firestoreDatabaseId;

// Initialize Firestore with specific databaseId if provided
export const db = databaseId
  ? getFirestore(app, databaseId)
  : getFirestore(app);

export default app;
