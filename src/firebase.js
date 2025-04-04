import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCLUOkkid0zWqfJtOUZRzpBVpPf1orreI",
  authDomain: "smart-learning-platform-eb7e5.firebaseapp.com",
  projectId: "smart-learning-platform-eb7e5",
  storageBucket: "smart-learning-platform-eb7e5.appspot.com", // düzeltildi
  messagingSenderId: "820032924849",
  appId: "1:820032924849:web:3ff13daee797013c794690",
  measurementId: "G-JB2L0CHZD4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Buraya dikkat!
export { db, app };
