import React from 'react';
import './AboutPage.css';

function AboutPage() {
  return (
    <div className="about-page">
      <h2>🧠 About Smart Learning</h2>
      <p className="about-intro">
        Hi there! We're two computer engineering students who believe that learning should be both smart and fun 🎉
      </p>

      <div className="about-section">
        <h3>💡 Why We Built This</h3>
        <p>
          While preparing for our graduation project, we noticed how kids often lose interest in traditional learning.
          So we asked ourselves: “What if school exercises felt more like games?”
        </p>
      </div>

      <div className="about-section">
        <h3>🚀 Our Journey</h3>
        <p>
          We started with a few basic exercises in Math and English. Then we added Science experiments, drag & drop games,
          even drawing and coloring features! We coded late nights, fixed bugs, and tested with friends — all to create
          something meaningful.
        </p>
      </div>

      <div className="about-section">
        <h3>🌟 What Makes Us Different</h3>
        <p>
          Smart Learning is not just an educational app. It's a space where every child can play, think, create,
          and grow. From tracking progress to unlocking rewards, it's built with care and joy.
        </p>
      </div>

      <div className="about-footer">
        <p>Made with 💙 by two passionate students who wanted to make a difference.</p> 
        <h4>Senanur Gümüş & Begüm Emir</h4>
      </div>
    </div>
  );
}

export default AboutPage;

