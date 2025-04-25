import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ai-playground-ec36d.firebaseapp.com",
  projectId: "ai-playground-ec36d",
  storageBucket: "ai-playground-ec36d.firebasestorage.app",
  messagingSenderId: "1024013313103",
  appId: "1:1024013313103:web:14f1bae997cd2c43dbb63a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);