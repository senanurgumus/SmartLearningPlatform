import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// 🔧 __dirname için çözüm (ESM içinde kullanılır)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ JSON dosyasının yolu
const filePath = path.join(__dirname, 'english_quiz.json');

// 🔥 Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDCLUOkkid0zWqfJtOUZRzpBVpPf1orreI",
    authDomain: "smart-learning-platform-eb7e5.firebaseapp.com",
    projectId: "smart-learning-platform-eb7e5",
    storageBucket: "smart-learning-platform-eb7e5.firebasestorage.app",
    messagingSenderId: "820032924849",
    appId: "1:820032924849:web:3ff13daee797013c794690",
    measurementId: "G-JB2L0CHZD4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadQuiz() {
  try {
    const jsonData = await fs.readFile(filePath, 'utf-8');
    const quizData = JSON.parse(jsonData);

    const quizCollectionRef = collection(db, 'modules', 'english', 'quiz');

    for (const question of quizData) {
      await addDoc(quizCollectionRef, question);
      console.log('✅ Eklendi:', question.question);
    }

    console.log('🎉 Tüm quiz soruları başarıyla yüklendi!');
  } catch (err) {
    console.error('❌ Hata:', err);
  }
}

uploadQuiz();
