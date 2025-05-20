import React, { useRef, useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase.js';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import './BalloonGame.css';

export default function BalloonGame() {
  const canvasRef = useRef(null);
  const balloonsRef = useRef([]);
  const scoreRef = useRef(0);
  const audioCtxRef = useRef(null);
  const popBufferRef = useRef(null);
  const wrongBufferRef = useRef(null);
  const successBufferRef = useRef(null);

  const [score, setScore] = useState(0);
  const [highestScoreRecord, setHighestScoreRecord] = useState(null);
  const [globalTop5, setGlobalTop5] = useState([]);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });

  // Sesleri preload et
  useEffect(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const loadSound = url =>
      fetch(url)
        .then(r => r.arrayBuffer())
        .then(buf => ctx.decodeAudioData(buf))
        .catch(console.error);

    loadSound('/pop.mp3').then(decoded => (popBufferRef.current = decoded));
    loadSound('/sounds/wrong.mp3').then(decoded => (wrongBufferRef.current = decoded));
    loadSound('/audios/success.mp3').then(decoded => (successBufferRef.current = decoded));
  }, []);

  // Yeni balon oluştur
  const createBalloon = canvas => {
    const r = 20;
    const baseX = Math.random() * (canvas.width - 2 * r) + r;
    return {
      baseX,
      x: baseX,
      y: canvas.height + r,
      r,
      speed: Math.random() * 2 + 2,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      angle: Math.random() * Math.PI * 2,
      amp: 30 + Math.random() * 20,       // 30–50px genlik
      freq: 0.02 + Math.random() * 0.02,  // 0.02–0.04 rad/adım frekans
    };
  };
  // Global Top5 çek
  useEffect(() => {
    (async () => {
      const q = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(50));
      const snap = await getDocs(q);
      const all = snap.docs.map(d => d.data());
      const byUser = all.reduce((m, e) => {
        if (!m[e.name] || e.score > m[e.name].score) m[e.name] = e;
        return m;
      }, {});
      setGlobalTop5(
        Object.values(byUser)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
      );
    })();
  }, []);

  // Oyun bittiğinde
  const handleGameOver = async () => {
    setIsGameOver(true);

    if (wrongBufferRef.current && audioCtxRef.current) {
      const s = audioCtxRef.current.createBufferSource();
      s.buffer = wrongBufferRef.current;
      s.connect(audioCtxRef.current.destination);
      s.start(0);
    }

    const auth = getAuth();
    const email = auth.currentUser?.email || '';
    const username = email.split('@')[0] || 'Guest';
    const displayName = username[0].toUpperCase() + username.slice(1);
    const finalScore = scoreRef.current;

    await addDoc(collection(db, 'scores'), {
      name: displayName,
      score: finalScore,
      createdAt: serverTimestamp()
    });

    const q = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(50));
    const snap = await getDocs(q);
    const all = snap.docs.map(d => d.data());
    const byUser = all.reduce((m, e) => {
      if (!m[e.name] || e.score > m[e.name].score) m[e.name] = e;
      return m;
    }, {});
    setGlobalTop5(
      Object.values(byUser)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
    );

    const key = `balloonScores_${username}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = [...existing, { name: displayName, score: finalScore, date: Date.now() }]
      .sort((a, b) => b.score - a.score);
    localStorage.setItem(key, JSON.stringify(updated));

    const highestLocal = updated[0] || null;
    setHighestScoreRecord(highestLocal);

    if (highestLocal && highestLocal.score === finalScore) {
      setIsNewRecord(true);
      if (successBufferRef.current && audioCtxRef.current) {
        const s2 = audioCtxRef.current.createBufferSource();
        s2.buffer = successBufferRef.current;
        s2.connect(audioCtxRef.current.destination);
        s2.start(0);
      }
    }
  };

  // Yeniden başlat
  const restartGame = () => window.location.reload();

  // Fare pozisyonu
  const handleMouseMove = e => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Animasyon & spawn
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 600;

    balloonsRef.current.push(createBalloon(canvas));
    const spawnInterval = setInterval(
      () => balloonsRef.current.push(createBalloon(canvas)),
      1000
    );

    let animId;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const next = [];
    for (let b of balloonsRef.current) {
      b.y -= b.speed;
      b.angle += b.freq;
      // hesaplanan yeni x
      const newX = b.baseX + Math.sin(b.angle) * b.amp;
      // clamp: en az r, en fazla (canvas.width - r)
      b.x = Math.min(
        Math.max(newX, b.r),
        canvas.width - b.r
      );

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.closePath();

      if (b.y - b.r <= 0) {
        clearInterval(spawnInterval);
        cancelAnimationFrame(animId);
        handleGameOver();
        return;
      }
      next.push(b);
    }
    balloonsRef.current = next;
    animId = requestAnimationFrame(animate);
  };

  animate();


    return () => {
      clearInterval(spawnInterval);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Balon tıklama
  const handleBalloonClick = e => {
    if (isGameOver) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let popped = false;
    balloonsRef.current = balloonsRef.current.filter(b => {
      if (!popped && Math.hypot(b.x - x, b.y - y) < b.r) {
        if (popBufferRef.current && audioCtxRef.current) {
          const s = audioCtxRef.current.createBufferSource();
          s.buffer = popBufferRef.current;
          s.connect(audioCtxRef.current.destination);
          s.start(0);
        }
        scoreRef.current++;
        setScore(scoreRef.current);
        popped = true;
        return false;
      }
      return true;
    });
  };

  return (
    <div className="balloon-game-container">
      {/* Header */}
      <header className="balloon-game__header">
        <h1>🎈 Balloon Pop Challenge</h1>
        <p>Move your cursor, pop the balloons, and beat your high score!</p>
      </header>

      {/* Content Row: Oyun + Skor Listesi */}
      <div className="balloon-game-content" onMouseMove={handleMouseMove}>
        {/* Oyun Alanı */}
        <div
          className="balloon-game-canvas-wrapper"
          onClick={handleBalloonClick}
        >
          <canvas
            ref={canvasRef}
            className="balloon-game__canvas"
          />
          <img
            src="/needle.png"
            alt="needle cursor"
            className="balloon-game__cursor"
            style={{
              left: mousePos.x + 'px',
              top: mousePos.y + 'px'
            }}
          />
          <div className="balloon-game__live-score">Score: {score}</div>

          {isGameOver && highestScoreRecord && (
            <div className="balloon-game__game-over">
              <h2 className="balloon-game__title">Game Over!</h2>
              {isNewRecord && <p>🎉 New Record!</p>}
              <p>
                Highest Score: <strong>{highestScoreRecord.name}</strong> —{' '}
                {highestScoreRecord.score}
              </p>
              <p>Your Score This Round: <strong>{score}</strong></p>
              <button className="balloon-game__button" onClick={restartGame}>
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* Sağdaki Global Top 5 */}
        <aside className="global-highscores">
          <h3>Global Top 5</h3>
          <ol>
            {globalTop5.map((u) => (
              <li key={u.name}>
                {u.name}: {u.score}
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
