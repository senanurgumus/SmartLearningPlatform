import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [showExercises, setShowExercises] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showActivities, setShowActivities] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
      <Link to="/" className="navbar-logo">
        <img src="/images/logo.png" alt="Logo" className="navbar-icon" />
        Smart Learning Platform
      </Link>
      </div>


      <div className="navbar-center">
        <ul className="navbar-menu">
          <li><Link to="/dashboard" className="navbar-item">Dashboard</Link></li>
          <li><Link to="/achievements" className="navbar-item">Achievements</Link></li>

          {/* Exercises */}
          <li
            className="navbar-item dropdown-parent"
            onMouseEnter={() => setShowExercises(true)}
            onMouseLeave={() => setShowExercises(false)}
          >
            <span className="navbar-item">Exercises</span>
            {showExercises && (
              <ul className="dropdown-menu">
                <li><Link to="/module/math/exercises">Math</Link></li>
                <li><Link to="/module/science/exercises">Science</Link></li>
                <li><Link to="/module/english/exercises">English</Link></li>
              </ul>
            )}
          </li>

          {/* Quiz */}
          <li
            className="navbar-item dropdown-parent"
            onMouseEnter={() => setShowQuiz(true)}
            onMouseLeave={() => setShowQuiz(false)}
          >
            <span className="navbar-item">Quizzes</span>
            {showQuiz && (
              <ul className="dropdown-menu">
                <li><Link to="/module/math/quiz">Math</Link></li>
                <li><Link to="/module/science/quiz">Science</Link></li>
                <li><Link to="/module/english/quiz">English</Link></li>
              </ul>
            )}
          </li>

          {/* Activities */}
          <li
            className="navbar-item dropdown-parent"
            onMouseEnter={() => setShowActivities(true)}
            onMouseLeave={() => setShowActivities(false)}
          >
            <span className="navbar-item">Activities</span>
            {showActivities && (
              <ul className="dropdown-menu">
                <li><Link to="/module/math/activities">Math</Link></li>
                <li><Link to="/module/science/activities">Science</Link></li>
                <li><Link to="/module/english/activities">English</Link></li>
              </ul>
            )}
          </li>
        </ul>
      </div>

      <div className="navbar-right">
        <Link to="/login" className="navbar-btn">Log Out</Link>
      </div>
    </nav>
  );
}

export default Navbar;
