import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ✅ Bu API key VE config tamamen doğru (Firebase Console'daki değerlerle aynı)
const firebaseConfig = {
  apiKey: "AIzaSyALrgO3uTED9eP1_L9P86izuLxuquZvzNQ",
  authDomain: "smart-learning-platform-eb7e5.firebaseapp.com",
  projectId: "smart-learning-platform-eb7e5",
  storageBucket: "smart-learning-platform-eb7e5.firebasestorage.app",
  messagingSenderId: "820032924849",
  appId: "1:820032924849:web:3ff13daee797013c794690",
  measurementId: "G-JB2L0CHZD4"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
