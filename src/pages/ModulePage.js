import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';
import './ModulePage.css';
import { Link } from 'react-router-dom';


function ModulePage() {
  const { moduleId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const colRef = collection(db, 'modules', moduleId, 'lessons');
        const querySnapshot = await getDocs(colRef);
        const data = querySnapshot.docs.map(doc => doc.data());
  
        console.log("MODUL ID:", moduleId);
        console.log("FIRESTORE VERİLERİ:", data);  // <-- burada ne geldiğini göreceğiz
  
        setLessons(data);
        setLoading(false);
      } catch (error) {
        console.error('Veri alınırken hata oluştu:', error);
        setLoading(false);
      }
    };
  
    fetchLessons();
  }, [moduleId]);
  
  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="module-page-container">
      <h2 className="module-page-title">
        {moduleId ? `${moduleId.toUpperCase()} Lessons` : 'Module'}
      </h2>
      <ul className="lesson-list">
        {lessons.map((lesson, index) => (
          <li key={index} className="lesson-item">
            <h3>{lesson.title}</h3>
            <p>{lesson.content}</p>
          </li>
        ))}
      </ul>
  
      <div className="module-links">
        <Link to={`/module/${moduleId}/exercises`} className="lesson-link">Exercises</Link>
        <Link to={`/module/${moduleId}/quiz`} state={{ category: moduleId }} className="lesson-link">Quiz</Link>
        <Link to={`/module/${moduleId}/activities`} className="lesson-link">Activities</Link>
      </div>

    </div>
  );
}

export default ModulePage;
