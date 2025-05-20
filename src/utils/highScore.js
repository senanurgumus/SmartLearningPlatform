// src/utils/highScore.js
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { app } from '../firebase.js';

const db = getFirestore(app);

export async function fetchHighScore(activity) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return 0;  // oturum yoksa 0
  const ref = doc(db, 'users', user.uid, 'highScores', activity);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().score : 0;
}

export async function updateHighScore(activity, score) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return 0;
  const ref = doc(db, 'users', user.uid, 'highScores', activity);
  const snap = await getDoc(ref);

  // eğer yoksa ya da yeni score daha yüksekse yaz
  if (!snap.exists() || score > snap.data().score) {
    await setDoc(ref, { score }, { merge: true });
    return score;
  }
  return snap.data().score;
}
