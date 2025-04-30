// src/pages/ActivitiesPage.js
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './ActivitiesPage.css';

function ActivitiesPage() {
  const { moduleId } = useParams();

  const activityOptions = {
    math: [
      { name: '🧩 Puzzle', path: 'activities/puzzle' },
      { name: '📐 Shape Drag', path: 'activities/shape-drag' },
      { name: '➕ Matching', path: 'activities/match' }
    ],
    science: [
      { name: '🌱 Plant Growth Game', path: 'activities/plant-growth' },
      { name: '🎨 Color Mixing Lab', path: 'activities/color-mixing' },
      { name: '🧪 States of Matter Lab', path: 'activities/matter-lab' }
    ],
    english: [
      { name: '🔤 Word Puzzle', path: 'activities/word-puzzle' },
      { name: '🧊 Word Freeze', path: 'activities/word-freeze' },
      { name: '🎈 Phonic Pop!', path: 'activities/phonic-pop' }
    ]
  };

  const activities = activityOptions[moduleId] || [];

  return (
    <div className="activities-container">
      <h2>{moduleId.toUpperCase()} Activities</h2>
      <div className="activity-list">
        {activities.map((activity, index) => (
          <Link
            key={index}
            to={`/activities/${moduleId}/${activity.path}`}
            className="activity-card"
          >
            {activity.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ActivitiesPage;

