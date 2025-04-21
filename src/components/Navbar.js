import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';  // Stilinizi burada tanımlayabilirsiniz

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          Smart Learning Platform
        </Link>
      </div>

      <div className="navbar-center">
        <ul className="navbar-menu">
          <li>
            <Link to="/" className="navbar-item">Home</Link>
          </li>
          <li>
            <Link to="/dashboard" className="navbar-item">Dashboard</Link>
          </li>
          <li>
            <Link to="/achievements" className="navbar-item">Achievements</Link>
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
