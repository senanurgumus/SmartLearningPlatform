import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ActivitiesPage.css';

function ActivitiesPage() {
  const { moduleId } = useParams();

  // 1) Modüle özel aktiviteler
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

  // 2) Her modül için geniş liste
  const allDecorOptions = {
    math: [
      '/decor/math/abacus.png',
      '/decor/math/blackboard.png',
      '/decor/math/calculator.png',
      '/decor/math/math-book.png',
      '/decor/math/mathematics.png',
      '/decor/math/maths.png',
      '/decor/math/shapes.png',
      '/decor/math/think.png',
      '/decor/math/tools.png',
      '/decor/math/treasure-chest.png'
    ],
    science: [
      '/decor/science/atom.png',
      '/decor/science/climate-change.png',
      '/decor/science/earth.png',
      '/decor/science/earth1.png',
      '/decor/science/earth2.png',
      '/decor/science/lab.png',
      '/decor/science/science.png',
      '/decor/science/scientist.png',
      '/decor/science/scientist1.png',
      '/decor/science/seedling.png'
    ],
    english: [
      '/decor/english/blocks.png',
      '/decor/english/book-stack.png',
      '/decor/english/book.png',
      '/decor/english/book1.png',
      '/decor/english/english-language.png',
      '/decor/english/english.png',
      '/decor/english/letter.png',
      '/decor/english/reading-book.png',
      '/decor/english/storytelling.png',
      '/decor/english/writing.png'
    ]
  };

  // 3) Pozisyonlar (3 adet)
  const decorPositions = [
       // Üstte 5 resim
      { top: '28%',  left: '5%' },
      { top: '8%',  left: '25%' },
      { top: '48%',  left: '50%', transform: 'translateX(-50%)' },
      { top: '8%',  left: '75%' },
      { top: '28%',  right: '5%' },
    
       // Altta 5 resim
      { bottom: '5%', left: '5%' },
      { bottom: '18%', left: '25%' },
      { bottom: '0%', left: '50%', transform: 'translateX(-50%)' },
      { bottom: '18%', left: '75%' },
      { bottom: '5%', right: '5%' }
    ];

  // 4) State: o anki 3 resim
  const [decorImages, setDecorImages] = useState([]);

  // 5) Rastgele seçme fonksiyonu
  const pickRandom = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // 6) Her mount ve moduleId değişiminde, + 10s'de bir yenile
  useEffect(() => {
    const updateDecor = () => {
      const options = allDecorOptions[moduleId] || [];
      setDecorImages(pickRandom(options, decorPositions.length));
    };
    updateDecor();
    const interval = setInterval(updateDecor, 10_000);
    return () => clearInterval(interval);
  }, [moduleId]);

  // 7) Başlık metni
  const titleText = `${moduleId.toUpperCase()} Activities`;

  return (
    <div className="activities-wrapper">
      {/* 8) Dinamik dekorlar */}
      {decorImages.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className="decor"
          style={decorPositions[i]}
        />
      ))}

      <div className="activities-container">
        <h2 className="fadein-title">
          {titleText.split('').map((char, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.08}s` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h2>

        <div className="activity-list">
          {activities.map((activity, idx) => (
            <Link
              key={idx}
              to={`/module/${moduleId}/${activity.path}`}
              className="activity-card"
            >
              {activity.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ActivitiesPage;
