import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from '../firebase.js'; // ✅ DOĞRU
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // Yönlendirme için ekleniyor
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("child");
  const [errorMessage, setErrorMessage] = useState("");
  
  
  const auth = getAuth(app);
  const db = getFirestore(app);
  const navigate = useNavigate(); // Yönlendirme için

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    try {
      // Kullanıcı kaydı işlemi
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Firestore'a kullanıcı verisi ekleniyor
      await setDoc(doc(db, "users", uid), {
        email,
        role: userType,
        createdAt: new Date(),
      });

      // Kullanıcıyı login ediyoruz
      await signInWithEmailAndPassword(auth, email, password);

      // Kullanıcı kaydı başarılı, yönlendirme yapıyoruz
      alert("Kayıt başarılı, giriş yapılıyor...");

      // Kayıttan sonra, kullanıcı tipine göre yönlendirme yapıyoruz
      if (userType === "child") {
        navigate("/login"); // Çocuk Dashboard'a yönlendir
      } else {
        navigate("/login"); // Ebeveyn Dashboard'a yönlendir
      }
    } catch (error) {
      setErrorMessage("Hata: " + error.message);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <div className="input-group">
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className="input-field"
        />
      </div>
      <div className="input-group">
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          className="input-field"
        />
      </div>
      <div className="input-group">
        <input
          type="password"
          placeholder="Confirm Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          value={confirmPassword}
          className="input-field"
        />
      </div>
      <div className="input-group">
        <select
          onChange={(e) => setUserType(e.target.value)}
          value={userType}
          className="input-field"
        >
          <option value="child">Child</option>
          <option value="parent">Parent</option>
        </select>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <button className="submit-btn" onClick={handleRegister}>Register</button>
    </div>
  );
};

export default Register;
