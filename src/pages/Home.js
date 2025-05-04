import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      <div className="home-left">
          <h1 className="home-title">
        <span className="typed-text">
          Welcome to <span className="highlight-word">Smart Learning!</span>
        </span>
        <span className="emoji-rotate">✨</span>
      </h1>


        {/* Highlighted Motivation Section */}
        <div className="home-highlight">
              <h2>🎉 Want to Have Fun, Learn, and Grow?</h2>
              <p>You’re in the right place — start exploring now! 💫</p>
            </div>

        <div className="features">
          <div className="feature-card">
            <span className="feature-icon">📚</span>
            <h3>Learning Modules</h3>
            <p>Explore interactive modules for Math, English, and Science!</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎮</span>
            <h3>Fun Activities</h3>
            <p>Engage with fun activities to make learning exciting!</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🧑‍🏫</span>
            <h3>Personalized Learning</h3>
            <p>Tailored lessons and quizzes based on your learning progress.</p>
          </div>
        </div>

        <div className="home-buttons">
          <Link to="/login" className="home-btn">Login 🔐</Link>
          <Link to="/register" className="home-btn">Register ✍️</Link>
        </div>
      </div>

      <div className="home-right">
        <div className="home-video">
          <video className="video" autoPlay loop muted>
            <source src="/videos/home.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}

export default Home;
