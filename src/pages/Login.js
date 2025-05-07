import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { app } from '../firebase.js';
import { useNavigate, Link } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './Login.css';

const auth = getAuth(app);
const db = getFirestore(app);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const title = document.querySelector('.typing-title');
    const subtitle = document.querySelector('.typing-subtitle');
    const benefitItems = document.querySelectorAll('.benefits-list li');

    const titleTimeout = setTimeout(() => {
      title?.classList.add('done');
    }, 3000);

    const subtitleTimeout = setTimeout(() => {
      subtitle?.classList.add('done');
    }, 4000);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        setErrorMessage("User data not found.");
        return;
      }

      const userData = userDoc.data();

      if (userData.role === "child") {
        navigate("/dashboard");
      } else {
        navigate("/parent-dashboard");
      }
    } catch (error) {
      setErrorMessage("Invalid email or password");
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
          <p className="typing-subtitle">To get started, log in to your Smart Learning account.</p>
          <ul className="benefits-list">
            <li><span className="emoji-spin">🎯</span> Interactive math, science & English lessons</li>
            <li><span className="emoji-spin">🧩</span> Fun educational games and challenges</li>
            <li><span className="emoji-spin">🏆</span> Track your progress & earn achievements</li>
          </ul>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2 className="login-title">Log in</h2>

          <form onSubmit={handleLogin} className="login-form">
            <p className="field-label">* indicates a required field.</p>

            <label className="form-label">
              Email *
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
            </label>

            <label className="form-label">
              Password *
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
            </label>

            <Link to="/reset-password" className="forgot-password">Forgot your password?</Link>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <button type="submit" className="login-submit-btn">Log in</button>

            <div className="bottom-signup">
              <span>Don’t have a Smart Learning account?</span>
              <Link to="/register">Create an account</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
