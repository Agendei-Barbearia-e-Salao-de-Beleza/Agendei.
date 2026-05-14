import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Configuração do Firebase (Substitua pelos dados que você copiou do console)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "agendei-2026.firebaseapp.com",
  projectId: "agendei-2026",
  storageBucket: "agendei-2026.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
  measurementId: "SEU_MEASUREMENT_ID"
};

// Inicializa o Firebase apenas se não tiver sido inicializado e se estiver no navegador
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Exporta o analytics de forma segura para SSR
export const initAnalytics = async () => {
  if (typeof window !== "undefined") {
    const supported = await isSupported();
    if (supported) {
      return getAnalytics(app);
    }
  }
  return null;
};

export { app };
