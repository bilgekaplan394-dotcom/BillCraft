// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 🔹 YENİ

const firebaseConfig = {
  apiKey: "AIzaSyCrCNMHjjZnA54EhIrXw9o9BfnKO6qpHoc",
  authDomain: "billcraft-2462a.firebaseapp.com",
  projectId: "billcraft-2462a",
  storageBucket: "billcraft-2462a.firebasestorage.app",
  messagingSenderId: "154259848714",
  appId: "1:154259848714:web:fd763513667fca513f29f3",
  measurementId: "G-97RX92SFME"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 🔹 Firestore instance
export const db = getFirestore(app);

export default app;
