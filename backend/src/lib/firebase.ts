import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let adminAuth: ReturnType<typeof getAuth> | null = null;

function initializeFirebase() {
  if (getApps().length > 0) {
    return getAuth();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    const missing = [];
    if (!projectId) missing.push('FIREBASE_PROJECT_ID');
    if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
    if (!privateKey) missing.push('FIREBASE_PRIVATE_KEY');
    throw new Error(`Missing Firebase environment variables: ${missing.join(', ')}`);
  }

  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });

  return getAuth();
}

export function getAdminAuth() {
  if (!adminAuth) {
    adminAuth = initializeFirebase();
  }
  return adminAuth;
}

