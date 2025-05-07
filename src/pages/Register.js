import React, { useState, useEffect } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword
} from 'firebase/auth'; // ✅ sendEmailVerification kaldırıldı
import { app } from '../firebase.js';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const auth = getAuth(app);
const db = getFirestore(app);

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const title = document.querySelector('.typing-title');
    const subtitle = document.querySelector('.typing-subtitle');
    const benefitItems = document.querySelectorAll('.benefits-list li');

    const titleTimeout = setTimeout(() => title?.classList.add('done'), 3000);
    const subtitleTimeout = setTimeout(() => subtitle?.classList.add('done'), 4000);

    benefitItems.forEach((item, index) => {
      const delay = 4500 + index * 1200;
      setTimeout(() => {
        item.classList.add('show');
        item.classList.add('done');
      }, delay);
    });

    return () => {
      clearTimeout(titleTimeout);
      clearTimeout(subtitleTimeout);
    };
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.includes("@") || !email.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!guardianEmail.includes("@") || !guardianEmail.includes(".")) {
      setErrorMessage("Please enter a valid guardian email address.");
      return;
    }

    if (!username.trim()) {
      setErrorMessage("Username cannot be empty.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMessage("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email,
        username,
        guardianEmail,
        role: "child"
      });

      alert("Account created! You can now log in.");
      navigate("/login");
    } catch (error) {
      console.error("Registration Error:", error.code, error.message);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="illustration">
          <video
            src="/videos/school-graphic.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="intro-video"
          />
          <h1 className="typing-title">Join Smart Learning!</h1>
          <p className="typing-subtitle">Create your account to unlock your learning adventure.</p>
          <ul className="benefits-list">
            <li><span className="emoji-spin">🎯</span> Interactive math, science & English lessons</li>
            <li><span className="emoji-spin">🧩</span> Fun educational games and challenges</li>
            <li><span className="emoji-spin">🏆</span> Track your progress & earn achievements</li>
          </ul>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2 className="login-title">Become a member</h2>

          <form onSubmit={handleRegister} className="login-form">
            <p className="field-label">* indicates a required field.</p>

            <label className="form-label">
              Your email address *
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="your@email.com"
              />
            </label>

            <label className="form-label">
              Your guardian's email address *
              <small>We are excited to have you join us, but we need to notify your guardian since you are opening an account.</small>
              <input
                type="email"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                required
                className="input-field"
                placeholder="example@email.com"
              />
            </label>

            <label className="form-label">
              Choose a username *
              <small>Use only letters and numbers. For your safety, do not use your real name.</small>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input-field"
              />
            </label>

            <label className="form-label">
              Create a password *
              <small>Passwords must be at least 8 characters. It must contain 1 number, 1 uppercase letter and 1 lowercase letter.</small>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
            </label>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <button type="submit" className="login-submit-btn">Sign up</button>

            <div className="bottom-signup">
              <p>Already have an account?</p>
              <Link to="/login">Log in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
