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
  const [storySteps, setStorySteps] = useState([]);
  const [revealedSteps, setRevealedSteps] = useState(1);

  const allStories = [
    [
      { emoji: '👧', text: 'Ayşe woke up early.' },
      { emoji: '☀️', text: 'She brushed her teeth.' },
      { emoji: '🍽️', text: 'She had breakfast.' },
      { emoji: '🏫', text: 'She went to school.' }
    ],
    [
      { emoji: '🦁', text: 'The lion roared loudly.' },
      { emoji: '🏞️', text: 'It ran through the jungle.' },
      { emoji: '🌳', text: 'Birds flew away.' },
      { emoji: '🌙', text: 'Then night fell.' }
    ],
    [
      { emoji: '👦', text: 'Ali packed his bag.' },
      { emoji: '🚌', text: 'He took the bus.' },
      { emoji: '🎒', text: 'He entered the classroom.' },
      { emoji: '📚', text: 'He started learning.' }
    ]
  ];

  useEffect(() => {
    const allGuides = moduleGuides[moduleId] || [];
    const shuffled = [...allGuides].sort(() => 0.5 - Math.random()).slice(0, 3);
    setGuides(shuffled);

    const randomStory = allStories[Math.floor(Math.random() * allStories.length)];
    setStorySteps(randomStory);
    setRevealedSteps(1);
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

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const handleStepClick = (index) => {
    if (index === revealedSteps - 1 && revealedSteps < storySteps.length) {
      setRevealedSteps(revealedSteps + 1);
    }
  };

  if (loading) return <h2>Loading...</h2>;

  const backgroundClass =
    moduleId === 'english' ? 'english-background' :
    moduleId === 'math' ? 'math-background' :
    moduleId === 'science' ? 'science-background' :
    '';

  return (
    <div className={`module-page-container ${backgroundClass}`}>
      <div className="module-layout">

        {/* Sol: Guide açıklamaları */}
        <div className="guide-column">
          <h3 className="section-title">📘 Topic Guides</h3>
          {guides.map((guide, i) => (
            <div key={i} className="guide-card">
              <div className="guide-header">
                <h4>{guide.title}</h4>
                <button className="speak-button" onClick={() => speak(`${guide.title}. ${guide.content}`)}>🔊</button>
              </div>
              <p>{guide.content}</p>
            </div>
          ))}
        </div>

        {/* Orta: Butonlar + Hikaye */}
        <div className="center-column">
          <h2 className="module-page-title">{moduleId.toUpperCase()} Mastery</h2>

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

          <div className="story-header">📖 Story Time</div>

          <div className="story-carousel">
            {storySteps.map((step, index) => (
              <div
                key={index}
                className={`story-step ${index < revealedSteps ? 'revealed' : ''}`}
                onClick={() => handleStepClick(index)}
              >
                <span className="story-emoji">{step.emoji}</span>
                <p className="story-text">{step.text}</p>
              </div>
            ))}
          </div>

          {/* Alt video ekleniyor */}
          
          <div className="module-video-wrapper">
            <video autoPlay muted loop className="module-video">
              <source src="/videos/module.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
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
