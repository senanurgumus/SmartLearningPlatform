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
  const popSoundRef = useRef(null);

  // pop sesi preload edelim
  useEffect(() => {
    const audio = new Audio('/pop.mp3');
    audio.preload = 'auto';
    audio.load();
    popSoundRef.current = audio;
  }, []); // pop sesi için referans
  const [score, setScore] = useState(0);
  const [topHigh, setTopHigh] = useState(null);
  const [globalTop5, setGlobalTop5] = useState([]);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });

  // Yeni balon oluşturucu
  const createBalloon = canvas => {
    const r = 20;
    return {
      x: Math.random() * (canvas.width - 2 * r) + r,
      y: canvas.height + r,
      r,
      speed: Math.random() * 2 + 2,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    };
  };

  // Genel Top 5'i Firestore'dan çek
  useEffect(() => {
    (async () => {
      const q = query(
        collection(db, 'scores'),
        orderBy('score', 'desc'),
        limit(50)
      );
      const snap = await getDocs(q);
      const all = snap.docs.map(d => d.data());
      const byUser = all.reduce((map, e) => {
        if (!map[e.name] || e.score > map[e.name].score) {
          map[e.name] = e;
        }
        return map;
      }, {});
      const unique = Object.values(byUser)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      setGlobalTop5(unique);
    })();
  }, []);

  // Oyun bittiğinde kaydet ve güncelle
  const gameOver = async () => {
    setIsGameOver(true);
    const auth = getAuth();
    const email = auth.currentUser?.email || '';
    const localPart = email.split('@')[0] || 'Misafir';
    const name = localPart.charAt(0).toUpperCase() + localPart.slice(1);
    const finalScore = scoreRef.current;

    // Firestore'a ekle
    await addDoc(collection(db, 'scores'), { name, score: finalScore, createdAt: serverTimestamp() });
    // Global Top 5'i yeniden çek
    const q = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(50));
    const snap = await getDocs(q);
    const all = snap.docs.map(d => d.data());
    const byUser = all.reduce((map, e) => {
      if (!map[e.name] || e.score > map[e.name].score) map[e.name] = e;
      return map;
    }, {});
    const unique = Object.values(byUser).sort((a, b) => b.score - a.score).slice(0, 5);
    setGlobalTop5(unique);

    // Kullanıcıya özel localStorage
    const key = `balloonScores_${localPart}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = [...existing, { name, score: finalScore, date: Date.now() }]
      .sort((a, b) => b.score - a.score);
    localStorage.setItem(key, JSON.stringify(updated));
    const highest = updated[0] || null;
    setTopHigh(highest);
    if (highest && highest.score === finalScore) setIsNewRecord(true);
  };

  // Yeniden başlat
  const restart = () => window.location.reload();

  // Farenin pozisyonunu takip et
  const handleMouseMove = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  // Animasyon ve balon spawn
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 600;
    balloonsRef.current.push(createBalloon(canvas));
    const spawnInt = setInterval(() => balloonsRef.current.push(createBalloon(canvas)), 1000);
    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const next = [];
      for (let b of balloonsRef.current) {
        b.y -= b.speed;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.closePath();
        if (b.y - b.r <= 0) {
          clearInterval(spawnInt);
          cancelAnimationFrame(animId);
          gameOver();
          return;
        }
        next.push(b);
      }
      balloonsRef.current = next;
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      clearInterval(spawnInt);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Balon patlatma
  const handleClick = e => {
    if (isGameOver) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let popped = false;
    balloonsRef.current = balloonsRef.current.filter(b => {
      if (!popped && Math.hypot(b.x - x, b.y - y) < b.r) {
        // pop sesi çal
        popSoundRef.current.currentTime = 0;
        popSoundRef.current.play().catch(console.error);
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
      <div className="balloon-game-canvas-wrapper" onMouseMove={handleMouseMove}>
        <canvas ref={canvasRef} className="balloon-game__canvas" onClick={handleClick} />
        <img
          src="/needle.png"
          alt="needle cursor"
          style={{
            position: 'absolute',
            left: mousePos.x,
            top: mousePos.y,
            width: 32,
            height: 32,
            pointerEvents: 'none',
            transform: 'translate(-16px, -16px)',
            zIndex: 1000
          }}
        />
        <div className="balloon-game__live-score">
        Score: {score}
        </div>
        {isGameOver && topHigh && (
          <div className="balloon-game__game-over">
            <h2 className="balloon-game__title">Game Over!</h2>
            {isNewRecord && <p>🎉 New Record!</p>}
            <p>Highest Score: <strong>{topHigh.name}</strong> — {topHigh.score} score</p>
            <p>Your Score This Round: <strong>{score}</strong> score</p>
            <button className="balloon-game__button" onClick={restart}>
            Play Again
            </button>
          </div>
        )}
      </div>
      <aside className="global-highscores">
        <h3>Top 5</h3>
        <ol>
          {globalTop5.map(u => (
            <li key={u.name}>{u.name}: {u.score}</li>
          ))}
        </ol>
      </aside>
    </div>
  );
}