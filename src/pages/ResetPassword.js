// src/pages/ResetPassword.js
import React, { useState } from 'react';
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
import { app } from '../firebase.js';
import './ResetPassword.css';

const auth = getAuth(app);

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email has been sent!');
    } catch (err) {
      setError('Failed to send reset email. Please check the address.');
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-box">
        <h2>Reset Password</h2>
        <form onSubmit={handleReset}>
          <label>
            Enter your email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="reset-input"
            />
          </label>
          <button type="submit" className="reset-button">Send Reset Link</button>
        </form>
        {message && <p className="reset-success">{message}</p>}
        {error && <p className="reset-error">{error}</p>}
      </div>
    </div>
  );
}
