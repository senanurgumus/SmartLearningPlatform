import React, { useState } from 'react';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { app } from '../firebase.js';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Eksik olan importlar
import './Login.css';

const auth = getAuth(app);
const db = getFirestore(app); // Firestore'u alıyoruz

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Yönlendirme için

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Kullanıcıyı doğru sayfaya yönlendir
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, "users", user.uid)); // Kullanıcı bilgilerini Firestore'dan alıyoruz
      const userData = userDoc.data();

      if (userData.role === "child") {
        navigate("/dashboard"); // Çocuk Dashboard'a yönlendir
      } else {
        navigate("/parent-dashboard"); // Ebeveyn Dashboard'a yönlendir
      }

      alert('Giriş başarılı!');
    } catch (error) {
      setErrorMessage("Geçersiz email veya şifre");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Log In</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
            />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit" className="login-submit-btn">Log In</button>
        </form>
      </div>
    </div>
  );
}
