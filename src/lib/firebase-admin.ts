import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

function initAdmin() {
  if (app) return;

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } else if (getApps().length > 0) {
    app = getApps()[0];
  } else {
    app = initializeApp({ projectId });
  }

  db = getFirestore(app);
  auth = getAuth(app);
}

initAdmin();

export function getAdminDb() {
  if (!db) throw new Error('Firestore not initialized');
  return db;
}

export function getAdminAuth() {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return auth;
}

export { app };
