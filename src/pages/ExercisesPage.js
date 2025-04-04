// src/pages/ExercisesPage.js
import React from 'react';
import { useParams } from 'react-router-dom';
import './ExercisesPage.css';

function ExercisesPage() {
  const { moduleId } = useParams();

  return (
    <div className="exercises-page">
      <h2>{moduleId.toUpperCase()} - Exercises</h2>
      <p>This is where you will see fun exercises for the {moduleId} module.</p>

      {/* Buraya ileride Firestore'dan alıştırmaları çekip listeleyeceğiz */}
    </div>
  );
}

export default ExercisesPage;

