import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ActivitiesPage.css';

// Fisher–Yates ile dizi karıştırma
function shuffleArray(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

  // 2) Her modül için geniş dekor havuzu (14 resim)
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
      '/decor/math/sample (1).png',
      '/decor/math/shape-toy.png',
      '/decor/math/shape.png',
      '/decor/math/shapes-and-symbols.png',
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
      '/decor/science/chemical.png',
      '/decor/science/color-palette (1).png',
      '/decor/science/science-book.png',
      '/decor/science/splash.png',
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
      '/decor/english/writing.png',
      '/decor/english/habitat.png',
      '/decor/english/exam-time.png',
      '/decor/english/book (6).png',
      '/decor/english/alphabet (2).png'
    ]
  };

  // 3) Tam 14 pozisyon
  const positions = [
    // Üst sıra (4)
    { top: '5%',  left: '5%' },
    { top: '5%',  left: '25%' },
  
    { top: '5%',  left: '70%' },
    { top: '5%',  right: '5%' },

    // Orta üst (3)
    { top: '45%',  left: '30%', transform: 'translateX(-50%)' },
    { top: '50%',  left: '48%', transform: 'translateX(-50%)' },
    { top: '45%',  left: '65%', transform: 'translateX(-50%)' },

    // Kenar ortalar (2)
    { top: '40%',  left: '5%' },
    { top: '40%',  right: '5%' },

    // Orta alt (2)
    { top: '75%',  left: '30%', transform: 'translateX(-50%)' },
    { top: '75%',  left: '70%', transform: 'translateX(-50%)' },

    // Alt sıra (3)
    { bottom: '22%', left: '5%' },
    { bottom: '22%', left: '48%', transform: 'translateX(-50%)' },
    { bottom: '22%', right: '5%' },
  ];

  const decorCount = positions.length; // 14

  // 4) Başlangıçta benzersiz resimleri seç
  const [decorImages, setDecorImages] = useState([]);
  useEffect(() => {
    const opts = allDecorOptions[moduleId] || [];
    setDecorImages(shuffleArray(opts).slice(0, decorCount));
  }, [moduleId]);

  // 5) Pozisyonları 10s’de bir karıştır
  const [decorPos, setDecorPos] = useState(positions);
  useEffect(() => {
    const iv = setInterval(() => {
      setDecorPos(shuffleArray(positions));
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  // 6) Başlık
  const titleText = `${moduleId.toUpperCase()} Activities`;

  return (
    <div className="activities-wrapper">
      {decorImages.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className="decor"
          style={decorPos[i]}
        />
      ))}

      <div className="activities-container">
        <h2 className="fadein-title">
          {titleText.split('').map((c, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.08}s` }}>
              {c === ' ' ? '\u00A0' : c}
            </span>
          ))}
        </h2>

        <div className="activity-list">
          {activities.map((activity, idx) => {
            // activity.name: "🧩 Puzzle" veya "📐 Shape Drag" vb.
            // split ile ilk boşluktan önceki emoji'yi alıyoruz:
            const [icon, ...rest] = activity.name.split(' ');
            const label = rest.join(' ');
            return (

            <Link
              key={idx}
              to={`/module/${moduleId}/${activity.path}`}
              className="activity-card card-lg"
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              <div className="card-icon">{icon}</div>
              <div className="card-label">{label}</div>

            </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ActivitiesPage;
