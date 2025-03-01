// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDJ0fAeEp3sGK_ruYWg3cbt6GlpoUfLdRk",
  authDomain: "tiktokhotel-5dd80.firebaseapp.com",
  projectId: "tiktokhotel-5dd80",
  storageBucket: "tiktokhotel-5dd80.firebasestorage.app",
  messagingSenderId: "506654284082",
  appId: "1:506654284082:web:70030a4abb37167167df2b",
  measurementId: "G-GS0J3X8EBP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };



