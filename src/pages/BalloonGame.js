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
  const audioBufferRef = useRef(null);

  const [score, setScore] = useState(0);
  const [highestScoreRecord, setHighestScoreRecord] = useState(null);
  const [globalTop5, setGlobalTop5] = useState([]);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });

  // Preload and decode pop sound into AudioBuffer
  useEffect(() => {
    // Initialize AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    // Fetch and decode
    fetch('/pop.mp3')
      .then(res => res.arrayBuffer())
      .then(buf => ctx.decodeAudioData(buf))
      .then(decoded => {
        audioBufferRef.current = decoded;
      })
      .catch(console.error);
  }, []);

  // Create a new balloon
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

  // Fetch Global Top 5
  useEffect(() => {
    (async () => {
      const q = query(
        collection(db, 'scores'),
        orderBy('score', 'desc'),
        limit(50)
      );
      const snap = await getDocs(q);
      const all = snap.docs.map(d => d.data());
      const byUser = all.reduce((map, entry) => {
        if (!map[entry.name] || entry.score > map[entry.name].score) {
          map[entry.name] = entry;
        }
        return map;
      }, {});
      const unique = Object.values(byUser)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      setGlobalTop5(unique);
    })();
  }, []);

  // On game over
  const handleGameOver = async () => {
    setIsGameOver(true);
    const auth = getAuth();
    const email = auth.currentUser?.email || '';
    const username = email.split('@')[0] || 'Guest';
    const displayName = username.charAt(0).toUpperCase() + username.slice(1);
    const finalScore = scoreRef.current;

    // Save to Firestore
    await addDoc(collection(db, 'scores'), {
      name: displayName,
      score: finalScore,
      createdAt: serverTimestamp()
    });

    // Re-fetch Global Top 5
    const q = query(
      collection(db, 'scores'),
      orderBy('score', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    const all = snap.docs.map(d => d.data());
    const byUser = all.reduce((map, entry) => {
      if (!map[entry.name] || entry.score > map[entry.name].score) {
        map[entry.name] = entry;
      }
      return map;
    }, {});
    const unique = Object.values(byUser)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    setGlobalTop5(unique);

    // LocalStorage update
    const key = `balloonScores_${username}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = [...existing, { name: displayName, score: finalScore, date: Date.now() }]
      .sort((a, b) => b.score - a.score);
    localStorage.setItem(key, JSON.stringify(updated));

    // Highest local score
    const highestLocal = updated[0] || null;
    setHighestScoreRecord(highestLocal);
    if (highestLocal && highestLocal.score === finalScore) {
      setIsNewRecord(true);
    }
  };

  // Restart
  const restartGame = () => window.location.reload();

  // Track mouse
  const handleMouseMove = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  // Animation & spawn
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
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

  // Click handler
  const handleBalloonClick = e => {
    if (isGameOver) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let popped = false;
    balloonsRef.current = balloonsRef.current.filter(b => {
      if (!popped && Math.hypot(b.x - x, b.y - y) < b.r) {
        // Play using AudioContext if ready
        const buf = audioBufferRef.current;
        if (buf && audioCtxRef.current) {
          const source = audioCtxRef.current.createBufferSource();
          source.buffer = buf;
          source.connect(audioCtxRef.current.destination);
          source.start(0);
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
      <div className="balloon-game-canvas-wrapper" onMouseMove={handleMouseMove}>
        <canvas
          ref={canvasRef}
          className="balloon-game__canvas"
          onClick={handleBalloonClick}
        />
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
        <div className="balloon-game__live-score">Score: {score}</div>

        {isGameOver && highestScoreRecord && (
          <div className="balloon-game__game-over">
            <h2 className="balloon-game__title">Game Over!</h2>
            {isNewRecord && <p>🎉 New Record!</p>}
            <p>
              Highest Score: <strong>{highestScoreRecord.name}</strong> — {highestScoreRecord.score}
            </p>
            <p>Your Score This Round: <strong>{score}</strong></p>
            <button className="balloon-game__button" onClick={restartGame}>
              Play Again
            </button>
          </div>
        )}
      </div>

      <aside className="global-highscores">
        <h3>Global Top 5</h3>
        <ol>
          {globalTop5.map(u => (
            <li key={u.name}>{u.name}: {u.score}</li>
          ))}
        </ol>
      </aside>
    </div>
  );
}