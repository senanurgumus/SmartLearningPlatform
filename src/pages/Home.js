import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to Smart Learning!</h1>
      <p className="home-subtitle">
        Learn, play and grow with fun lessons and activities!
      </p>
      <div className="home-buttons">
        <Link to="/login" className="home-btn">Login</Link>
        <Link to="/register" className="home-btn">Register</Link>
      </div>
    </div>
  );
}

export default Home;
