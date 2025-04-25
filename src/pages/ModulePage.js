import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';
import './ModulePage.css';
import { moduleGuides } from '../data/moduleGuides.js';

function ModulePage() {
  const { moduleId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guides, setGuides] = useState([]);

  useEffect(() => {
    const allGuides = moduleGuides[moduleId] || [];
    const shuffled = [...allGuides].sort(() => 0.5 - Math.random()).slice(0, 3); // sadece 3 tanesi
    setGuides(shuffled);
  }, [moduleId]);
  
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const colRef = collection(db, 'modules', moduleId, 'lessons');
        const querySnapshot = await getDocs(colRef);
        const data = querySnapshot.docs.map(doc => doc.data());
        setLessons(data);
        setLoading(false);
      } catch (error) {
        console.error('Veri alınırken hata oluştu:', error);
        setLoading(false);
      }
    };
    fetchLessons();
  }, [moduleId]);

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="module-page-container">

      <div className="module-layout">

        {/* Sol: Guide açıklamaları */}
        <div className="guide-column">
          <h3 className="section-title">📘 Topic Guides</h3>
          {guides.map((guide, i) => (
            <div key={i} className="guide-card">
              <h4>{guide.title}</h4>
              <p>{guide.content}</p>
            </div>
          ))}
        </div>

        {/* Orta: Butonlar */}
        <div className="center-column">
        <h2 className="module-page-title">{moduleId.toUpperCase()} Lessons</h2>

          <div className="module-card-links">
            <Link to={`/module/${moduleId}/exercises`} className="module-card">
              <span role="img" aria-label="exercise">📝</span>
              <h4>Exercises</h4>
              <p>Practice and reinforce what you've learned.</p>
            </Link>
            <Link to={`/module/${moduleId}/quiz`} className="module-card">
              <span role="img" aria-label="quiz">❓</span>
              <h4>Quiz</h4>
              <p>Test your knowledge with a quick quiz.</p>
            </Link>
            <Link to={`/module/${moduleId}/activities`} className="module-card">
              <span role="img" aria-label="activities">🎮</span>
              <h4>Activities</h4>
              <p>Explore fun learning games and tasks.</p>
            </Link>
          </div>
        </div>

        {/* Sağ: Resimler */}
        <div className="image-column">
          {guides.map((guide, i) => (
            <div key={i} className="guide-image">
              <img src={`/images/${guide.title.toLowerCase().replace(/\s+/g, '-')}.png`} alt={guide.title} />
            </div>
          ))}
        </div>

      </div>

      {/* Alt: Firebase'den gelen lesson kartları */}
      <div className="lesson-grid">
        {lessons.map((lesson, index) => (
          <div key={index} className="lesson-card">
            <h3>{lesson.title}</h3>
            <p>{lesson.content}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

export default ModulePage;
