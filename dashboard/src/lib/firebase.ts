import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "placeholder",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const isValidKey = firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith('AIza');

// Inicialização segura - Só inicializa se a chave parecer real
const app = (typeof window !== 'undefined' && isValidKey) 
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApp())
  : null;

export const analytics = (typeof window !== 'undefined' && app) ? 
  isSupported().then(yes => yes ? getAnalytics(app) : null).catch(() => null) : 
  null;

// Função restaurada para compatibilidade com o componente FirebaseAnalytics
export const initAnalytics = async () => {
  if (typeof window === 'undefined') return null;
  return await analytics;
};

export default app;
