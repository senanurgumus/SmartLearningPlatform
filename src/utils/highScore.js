import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { getAuth } from "firebase/auth";

// Skoru güncelle (kullanıcı altı + global koleksiyon)
export async function updateHighScore(gameId, score) {
  const user = getAuth().currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid, "highScores", gameId);
  const globalRef = doc(db, `${gameId}Scores`, user.uid);

  const snapshot = await getDoc(userRef);
  const prevScore = snapshot.exists() ? snapshot.data().score : 0;

  if (score > prevScore) {
    // Kullanıcının kendi koleksiyonu altına yaz
    await setDoc(userRef, { score });

    // Global skor koleksiyonuna da yaz (sıralama için)
    await setDoc(globalRef, {
      score,
      email: user.email,
      updatedAt: new Date()
    });
  }
}

// Mevcut kullanıcıya ait skorları getir
export async function fetchHighScore(gameId) {
  const user = getAuth().currentUser;
  if (!user) return 0;

  const ref = doc(db, "users", user.uid, "highScores", gameId);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? snapshot.data().score : 0;
}

