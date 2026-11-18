// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIZXCIHwzNR-ysu0ajIRd6ZRvEOG-Bi8o",
  authDomain: "sulsul-proposal.firebaseapp.com",
  projectId: "sulsul-proposal",
  storageBucket: "sulsul-proposal.firebasestorage.app",
  messagingSenderId: "128627034420",
  appId: "1:128627034420:web:ca35746be79173bfd57d61",
  measurementId: "G-PNDD117EWM"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);