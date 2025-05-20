import React, { useState, useEffect, useCallback } from 'react';
import './MathAdventure.css';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.js';

const correctSound = new Audio('/sounds/correct.mp3');
const wrongSound   = new Audio('/sounds/wrong.mp3');

// Generate 4‐step levels
const generateLevels = (numLevels = 4) => {
  const levels = [];
  const validDividers = [2,3,4,5,6,10];
  for (let i = 0; i < numLevels; i++) {
    const a = Math.floor(Math.random()*50) + 10;
    const b = Math.floor(Math.random()*40) + 10;
    const sum = a + b;
    const multiplier = Math.floor(Math.random()*4) + 2;
    const postMul = sum * multiplier;
    const possible = validDividers.filter(d => postMul % d === 0);
    const divider = possible.length
      ? possible[Math.floor(Math.random()*possible.length)]
      : 2;
    levels.push({
      level: i + 1,
      questions: [
        { question: `${a} + ${b} = ?`, answer: `${sum}` },
        { question: `Multiply the result by ${multiplier}`, operation:'multiply', value:multiplier },
        { question: `Divide the result by ${divider}`, operation:'divide', value:divider },
        { question: 'Is the result odd or even?', operation:'parity' }
      ]
    });
  }
  return levels;
};

const characterOptions = [
  { emoji:'🧭', theme:'theme-explorer' },
  { emoji:'🧙‍♂️', theme:'theme-wizard' },
  { emoji:'🕵️‍♂️', theme:'theme-detective' },
  { emoji:'🧝‍♀️', theme:'theme-elf' },
  { emoji:'🧑‍🚀', theme:'theme-space' },
  { emoji:'🧛‍♂️', theme:'theme-dark' }
];

// Badge definitions (no Daily Streak)
const badgeConditions = [
  {
    id:'newcomer',
    emoji:'👶',
    label:'Newcomer',
    description:"You've taken your first steps!",
    condition: totalSteps => totalSteps >= 1
  },
  {
    id:'mathMaster',
    emoji:'🧠',
    label:'Math Master',
    description:'Complete at least 12 steps.',
    condition: totalSteps => totalSteps >= 12
  },
  {
    id:'perfectStreak',
    emoji:'🏅',
    label:'Perfect Streak',
    description:'Complete a level without mistakes.',
    condition: (_, wrongs) => wrongs === 0
  },
  {
    id:'wiseOwl',
    emoji:'🦉',
    label:'Wise Owl',
    description:'Finish a level without using hints.',
    condition: (_, __, hints) => hints === 0
  },
  {
    id:'perseverance',
    emoji:'🔄',
    label:'Perseverance',
    description:'Make at least 3 wrong attempts and keep going.',
    condition: (_, wrongs) => wrongs >= 3
  },
  {
    id:'explorerHero',
    emoji:'🧭',
    label:'Explorer Hero',
    description:'Try at least 3 different characters and themes.',
    condition: (_, __, ___, charHistory, themeHistory) =>
      new Set(charHistory).size >= 3 &&
      new Set(themeHistory).size >= 3
  }
];

export default function MathAdventure() {
  // Core game state
  const [levelsData,     setLevelsData]     = useState([]);
  const [level,          setLevel]          = useState(0);
  const [step,           setStep]           = useState(0);
  const [userAnswer,     setUserAnswer]     = useState('');
  const [previousResult, setPreviousResult] = useState(null);
  const [showResult,     setShowResult]     = useState(false);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  const [showHint,       setShowHint]       = useState(false);

  // track only current level's correct answers (for hints)
  const [levelSteps,     setLevelSteps]     = useState([]);
  // track total correct answers across all levels (for Math Master)
  const [totalSteps,     setTotalSteps]     = useState(0);

  // Performance tracking
  const [wrongCount,     setWrongCount]     = useState(0);
  const [hintCount,      setHintCount]      = useState(0);
  const [charHistory,    setCharHistory]    = useState([ localStorage.getItem('adventureCharacter') ]);
  const [themeHistory,   setThemeHistory]   = useState([ localStorage.getItem('adventureTheme') ]);

  // Badge storage
  const [earnedBadges,   setEarnedBadges]   = useState([]);
  const [newBadges,      setNewBadges]      = useState([]);

  // Auth & Firestore
  const [userId,    setUserId]    = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Character/Theme picker
  const [selectedCharacter,    setSelectedCharacter]    = useState(localStorage.getItem('adventureCharacter') || '🧭');
  const [selectedTheme,        setSelectedTheme]        = useState(localStorage.getItem('adventureTheme')   || 'theme-explorer');
  const [isSelectingCharacter, setIsSelectingCharacter] = useState(!localStorage.getItem('adventureCharacter'));

  // Confetti helper
  const [width, height] = useWindowSize();
  const isClose = (a,b) => Math.abs(a - b) < 0.01;

  // Award badges at end‐of‐level
  const checkBadges = useCallback(() => {
    const newly = [];

    badgeConditions.forEach(b => {
      if (
        b.condition(
          totalSteps,
          wrongCount,
          hintCount,
          charHistory,
          themeHistory
        ) &&
        !earnedBadges.includes(b.id)
      ) {
        newly.push(b.id);
      }
    });

    if (newly.length) {
      setEarnedBadges(prev => [...prev, ...newly]);
      setNewBadges(newly);
      if (userId) {
        setDoc(doc(db,'mathProgress',userId), {
          earnedBadges: [...earnedBadges, ...newly],
          totalSteps
        }, { merge:true });
      }
    }
  }, [
    earnedBadges,
    totalSteps,
    wrongCount,
    hintCount,
    charHistory,
    themeHistory,
    userId
  ]);

  // Load from Firestore on auth change
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (user) {
        setUserId(user.uid);
        const ref  = doc(db,'mathProgress',user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const d = snap.data();
          setLevel(d.level        || 0);
          setStep(0); // always restart at first step
          setTotalSteps(d.totalSteps || 0);
          setLevelSteps([]); 
          setWrongCount(d.wrongCount   || 0);
          setHintCount(d.hintCount     || 0);
          setCharHistory(d.charHistory || [localStorage.getItem('adventureCharacter')]);
          setThemeHistory(d.themeHistory || [localStorage.getItem('adventureTheme')]);
          setEarnedBadges(d.earnedBadges || []);

          if (d.levelsData) setLevelsData(d.levelsData);
          else {
            const fresh = generateLevels(4);
            setLevelsData(fresh);
            await setDoc(ref, { ...d, levelsData: fresh });
          }
        } else {
          const fresh = generateLevels(4);
          setLevelsData(fresh);
          await setDoc(ref, {
            level:0, step:0,
            totalSteps:0,
            wrongCount:0, hintCount:0,
            charHistory:[localStorage.getItem('adventureCharacter')],
            themeHistory:[localStorage.getItem('adventureTheme')],
            levelsData:fresh,
            earnedBadges:[]
          });
        }
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // Persist key state to Firestore
  useEffect(() => {
    if (!userId || !levelsData.length) return;
    setDoc(doc(db,'mathProgress',userId), {
      level,
      step,
      totalSteps,
      wrongCount,
      hintCount,
      charHistory,
      themeHistory,
      levelsData,
      earnedBadges
    }, { merge:true });
  }, [
    userId,
    level,
    step,
    totalSteps,
    wrongCount,
    hintCount,
    charHistory,
    themeHistory,
    levelsData,
    earnedBadges
  ]);

  // Treasure sound
  useEffect(() => {
    if (showResult && !hasPlayedSound) {
      new Audio('/sounds/treasure-sound.mp3').play();
      setHasPlayedSound(true);
    }
  }, [showResult, hasPlayedSound]);

  const currentLevel = levelsData[level] || { questions: [] };
  const questions    = currentLevel.questions;
  const currentQ     = questions[step] || {};

  // Handle answer
  const handleSubmit = () => {
    setShowHint(false);
    const uv = Number(userAnswer.trim());

    // parity
    if (currentQ.operation==='parity' && previousResult!==null) {
      const corr = (previousResult % 2===0) ? 'even':'odd';
      if (userAnswer.trim().toLowerCase()===corr) {
        correctSound.play();
        setLevelSteps(h => [...h, { step, question: currentQ.question, result: userAnswer }]);
        setTotalSteps(t => t + 1);
        proceed();
      } else {
        wrongSound.play();
        setWrongCount(w => w + 1);
        setHintCount(h => h + 1);
        setShowHint(true);
      }
      return;
    }

    // multiply/divide
    if (currentQ.operation && previousResult!==null) {
      let calc = previousResult;
      if (currentQ.operation==='multiply') calc *= currentQ.value;
      if (currentQ.operation==='divide')   calc /= currentQ.value;
      if (isClose(uv, calc)) {
        correctSound.play();
        setLevelSteps(h => [...h, { step, question: currentQ.question, result: userAnswer }]);
        setTotalSteps(t => t + 1);
        setPreviousResult(calc);
        proceed();
      } else {
        wrongSound.play();
        setWrongCount(w => w + 1);
        setHintCount(h => h + 1);
        setShowHint(true);
      }
      return;
    }

    // addition
    const ans = Number(currentQ.answer || currentQ.expectedAnswer);
    if (isClose(uv, ans)) {
      correctSound.play();
      setLevelSteps(h => [...h, { step, question: currentQ.question, result: userAnswer }]);
      setTotalSteps(t => t + 1);
      setPreviousResult(uv);
      proceed();
    } else {
      wrongSound.play();
      setWrongCount(w => w + 1);
      setHintCount(h => h + 1);
      setShowHint(true);
    }
  };

  // Next step or finish
  const proceed = () => {
    if (step + 1 < questions.length) {
      setStep(s => s + 1);
      setUserAnswer('');
    } else {
      setShowResult(true);
      setHasPlayedSound(false);
      checkBadges();
    }
  };

  // Advance to next level
  const goToNextLevel = () => {
    setLevel(l => l + 1);
    setStep(0);
    setShowResult(false);
    setPreviousResult(null);
    setUserAnswer('');
    setHasPlayedSound(false);
    setWrongCount(0);
    setHintCount(0);
    setLevelSteps([]);     // clear just this level’s history
    setNewBadges([]);
  };

  // Restart whole adventure
  const restartAdventure = async () => {
    const fresh = generateLevels(4);
    setLevelsData(fresh);
    setLevel(0);
    setStep(0);
    setPreviousResult(null);
    setShowResult(false);
    setUserAnswer('');
    setHasPlayedSound(false);
    setWrongCount(0);
    setHintCount(0);
    setLevelSteps([]);
    setNewBadges([]);
    if (userId) {
      await setDoc(doc(db,'mathProgress',userId), {
        level:0, step:0,
        totalSteps,
        wrongCount:0, hintCount:0,
        charHistory, themeHistory,
        levelsData:fresh,
        earnedBadges
      });
    }
  };

  if (isLoading || !questions.length) {
    return <div className="ma-container">Loading...</div>;
  }

  // Character select
  if (isSelectingCharacter) {
    return (
      <div className="ma-container">
        <h2>Select Your Character</h2>
        <div className="character-options">
          {characterOptions.map(({emoji,theme}) => (
            <button key={emoji} className="ma-character-button"
              onClick={() => {
                setSelectedCharacter(emoji);
                setSelectedTheme(theme);
                localStorage.setItem('adventureCharacter', emoji);
                localStorage.setItem('adventureTheme', theme);
                setCharHistory(c => [...c, emoji]);
                setThemeHistory(t => [...t, theme]);
                setIsSelectingCharacter(false);
              }}
            >
              <span style={{fontSize:'2rem'}}>{emoji}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className={`ma-container ${selectedTheme}`}>
      <h1 className="ma-title">Math Adventure</h1>
      <button
        className="ma-change-character-btn"
        onClick={()=>setIsSelectingCharacter(true)}
      >
        Change Character
      </button>

      <div className="ma-map">
        {questions.map((_, i) => (
          <div key={i}
               className={`ma-map-step ${step===i?'active':step>i?'passed':''}`}>
            {i===0 ? selectedCharacter
              : i===questions.length-1 ? '🏆'
              : '🪙'}
          </div>
        ))}
      </div>

      <h3 className="ma-level-title">Level {level+1}</h3>

      {!showResult ? (
        <div className="ma-box">
          <h2>Step {step+1} / {questions.length}</h2>
          <p>{currentQ.question}</p>
          <input
            type="text"
            className="ma-input"
            value={userAnswer}
            onChange={e=>setUserAnswer(e.target.value)}
            placeholder="Type your answer"
          />
          <button className="ma-button" onClick={handleSubmit}>
            Submit Answer
          </button>

          {showHint && (
            <div className="ma-hint-box">
              <p>❗ Incorrect answer. {step>0?'Want to review previous steps?':'Please try again.'}</p>
              {step>0 && (
                <>
                  <ul>
                    {levelSteps.map((it,i) => (
                      <li key={i}>
                        <strong>Step {it.step+1}:</strong> {it.question} → <em>{it.result}</em>
                      </li>
                    ))}
                  </ul>
                  <button className="ma-button" onClick={()=>setShowHint(false)}>
                    Hide Hint
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <Confetti
            width={width} height={height}
            style={{position:'fixed',top:0,left:0,zIndex:1,pointerEvents:'none',backgroundColor:'transparent'}}
          />
          <div className="ma-box ma-treasure-box">
            <h2>🎉 Congratulations!</h2>
            <p>You reached the treasure! 🏆</p>
            <img src="/treasure.gif" alt="Treasure" />
            {newBadges.length>0 && (
              <div className="badge-earned-popup">
                <h3>🏅 New Badges Earned:</h3>
                <ul>
                  {newBadges.map((id,i) => {
                    const bc = badgeConditions.find(b => b.id===id);
                    return <li key={i}>{bc.emoji} {bc.label}</li>;
                  })}
                </ul>
              </div>
            )}
            {level+1 < levelsData.length ? (
              <button className="ma-button" onClick={goToNextLevel}>
                Next Treasure 🎯
              </button>
            ) : (
              <>
                <p>🎊 You've discovered all the treasures!</p>
                <button className="ma-button" onClick={restartAdventure}>
                  Restart the Adventure 🔁
                </button>
              </>
            )}
          </div>
        </>
      )}

      <h4 className="ma-badge-list-title">🎖 Badge Collection</h4>
      <div className="ma-badge-list">
        {badgeConditions.map(badge => (
          <div key={badge.id}
              className={`ma-badge-item ${earnedBadges.includes(badge.id)?'earned':'locked'}`}>
            <div className="ma-badge-icon">{badge.emoji}</div>
            <div className="ma-badge-text">
              <div className="ma-badge-title">{badge.label}</div>
              <div className="ma-badge-desc">{badge.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
