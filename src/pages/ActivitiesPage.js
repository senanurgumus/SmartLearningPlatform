// src/pages/ActivitiesPage.js
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './ActivitiesPage.css';

function ActivitiesPage() {
  const { moduleId } = useParams();

  const activityOptions = {
    math: [
      { name: '🧩 Puzzle', path: 'puzzle' },
      { name: '📐 Şekil Sürükle', path: 'shape-drag' },
      { name: '➕ Eşleştirme', path: 'match' }
    ],
    science: [
      { name: '🌋 Deney Simülasyonu', path: 'experiment' },
      { name: '🌱 Bitki Gelişimi Oyunu', path: 'plant-growth' },
      { name: '🔬 Mikroskop Kartları', path: 'microscope-cards' }
    ],
    english: [
      { name: '🔤 Harf Eşleştirme', path: 'letter-match' },
      { name: '🎧 Dinle ve Bul', path: 'listen-find' },
      { name: '📚 Kelime Kartları', path: 'word-cards' }
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

