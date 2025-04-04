// src/pages/ActivitiesPage.js
import React from 'react';
import { useParams } from 'react-router-dom';
import './ActivitiesPage.css';

function ActivitiesPage() {
  const { moduleId } = useParams();

  return (
    <div className="activities-page">
      <h2>{moduleId.toUpperCase()} - Activities</h2>
      <p>This is where fun activities will appear for the {moduleId} module.</p>

      {/* Aktiviteler burada listelenecek */}
    </div>
  );
}

export default ActivitiesPage;
