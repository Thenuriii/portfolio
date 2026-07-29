import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const sanitizeEnv = (val: string | undefined): string | undefined => {
  if (!val) return val;
  let clean = val;
  if (clean.startsWith('"') && clean.endsWith('"')) {
    clean = clean.slice(1, -1);
  }
  return clean.trim();
};

const firebaseConfig = {
  apiKey: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

// Debug logs to verify environment variables are populated on the client side
if (typeof window !== "undefined") {
  console.log("Firebase Client Init Diagnostics:", {
    hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    hasAppId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
}

let app: any;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.warn("Firebase App initialization error:", e);
}

let auth: any;
if (typeof window === "undefined") {
  auth = {} as any;
} else {
  try {
    auth = app ? getAuth(app) : ({} as any);
  } catch (e) {
    console.error("Firebase Auth initialization error in browser:", e);
    auth = {} as any;
  }
}

export { auth };
