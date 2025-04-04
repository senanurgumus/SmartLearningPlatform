// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [modules, setModules] = useState([]);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const fetchModules = async () => {
      const querySnapshot = await getDocs(collection(db, 'modules'));
      const modulesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setModules(modulesData);
    };

    fetchModules();

    // İçeriği gecikmeli göster (örneğin 1.5 saniye sonra)
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Welcome to Smart Learning!</h1>

      {showContent && (
        <>
          <div className="module-grid">
            {modules.map((mod) => (
              <Link
                to={`/module/${mod.id}`}
                key={mod.id}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="module-card"
                  style={{ backgroundColor: mod.color }}
                >
                  {mod.name}
                </div>
              </Link>
            ))}
          </div>

          <div className="achievements-button-container">
            <Link to="/achievements" className="achievements-button">
              My Achievements
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
