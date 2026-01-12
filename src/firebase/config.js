// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAL13dN6XjGq87X-LFeCxerDZpNBOcKxcQ",
  authDomain: "control-panel-c11b7.firebaseapp.com",
  projectId: "control-panel-c11b7",
  storageBucket: "control-panel-c11b7.appspot.com",
  messagingSenderId: "384690286387",
  appId: "1:384690286387:web:946fb6fa5e8abacadbd846",
  measurementId: "G-TBX32PH6RQ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Cloud Functions
export const functions = getFunctions(app);
