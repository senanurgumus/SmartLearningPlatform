// src/pages/ActivitiesPage.js
import React from 'react';
import { useParams } from 'react-router-dom';
import './ActivitiesPage.css';

function ActivitiesPage() {
  const { moduleId } = useParams();

  const activityOptions = {
    math: ['🧩 Puzzle', '📐 Şekil Sürükle', '➕ Eşleştirme'],
    science: ['🌋 Deney Simülasyonu', '🌱 Bitki Gelişimi Oyunu', '🔬 Mikroskop Kartları'],
    english: ['🔤 Harf Eşleştirme', '🎧 Dinle ve Bul', '📚 Kelime Kartları']
  };

  const activities = activityOptions[moduleId] || [];

  return (
    <div className="activities-container">
      <h2>{moduleId.toUpperCase()} Activities</h2>
      <div className="activity-list">
        {activities.map((activity, index) => (
          <div key={index} className="activity-card">
            {activity}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivitiesPage;
