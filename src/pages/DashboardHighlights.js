import React from 'react';
import './DashboardHighlights.css';

const highlights = [
  {
    icon: '🧠',
    title: 'Personalized Learning',
    description: 'Track your progress with tailored missions and smart feedback.',
  },
  {
    icon: '🎮',
    title: 'Educational Games',
    description: 'Enjoy interactive challenges like Puzzles, Graphs, and Sink or Float!',
  },
  {
    icon: '📊',
    title: 'Live Progress Reports',
    description: 'Monitor your improvement across modules with instant insights.',
  },
  {
    icon: '📚',
    title: 'Lessons & Quizzes',
    description: 'Explore guided topic cards and test your knowledge with quizzes.',
  },
  {
    icon: '🚀',
    title: 'Daily Goals & Rewards',
    description: 'Complete daily missions to unlock points and special rewards!',
  }
];

function DashboardHighlights() {
  return (
    <div className="highlights-section">
      <h2 className="highlights-title">What’s Inside Smart Learning Platform?</h2>
      <div className="highlight-grid">
        {highlights.map((item, i) => (
          <div className="highlight-card" key={i}>
            <div className="highlight-icon">{item.icon}</div>
            <h4 className="highlight-title">{item.title}</h4>
            <p className="highlight-description">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardHighlights;
