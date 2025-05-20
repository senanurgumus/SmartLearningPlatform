// src/pages/ColorMixingLab.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ColorMixingLab.css';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

// Base primary colors and extended palette for level 2
const baseColors = ["red", "yellow", "blue"];
const level2Colors = [...baseColors, "orange", "green", "purple", "black", "white"];

// All possible mixes
const colorMixes = {
  "red+yellow": "orange", "yellow+red": "orange",
  "red+blue": "purple",  "blue+red": "purple",
  "yellow+blue": "green","blue+yellow": "green",
  "black+white": "gray", "white+black": "gray",
  "orange+white": "light orange","white+orange": "light orange",
  "orange+black": "dark orange","black+orange": "dark orange",
  "green+white": "light green","white+green": "light green",
  "green+black": "dark green","black+green": "dark green",
  "purple+white": "light purple","white+purple": "light purple",
  "purple+black": "dark purple","black+purple": "dark purple",
  "red+white": "pink",   "white+red": "pink",
  "red+black": "dark red","black+red": "dark red",
  "yellow+white": "light yellow","white+yellow": "light yellow",
  "yellow+black": "dark yellow","black+yellow": "dark yellow",
  "blue+white": "light blue","white+blue": "light blue",
  "blue+black": "dark blue","black+blue": "dark blue",
};

// Color-to-hex for result preview
const colorHexMap = {
  orange: "#ffa500", green: "#008000", purple: "#800080",
  red: "#ff0000", yellow: "#ffff00", blue: "#0000ff",
  gray: "#808080", "light orange": "#ffcc99", "dark orange": "#ff8c00",
  "light green": "#90ee90", "dark green": "#006400", "light purple": "#dda0dd",
  "dark purple": "#4b0082", pink: "#ffc0cb", "dark red": "#8b0000",
  "light yellow": "#ffffe0", "dark yellow": "#9b870c", "light blue": "#add8e6",
  "dark blue": "#00008b",
};

// Target lists
const level1Targets = ["orange", "green", "purple"];
const level2Targets = [
  "gray", "pink", "dark red", "light yellow", "dark yellow",
  "light blue", "dark blue", "light orange", "dark orange",
  "light green", "dark green", "light purple", "dark purple"
];

// Utility: shuffle array
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ColorMixingLab() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [targets, setTargets] = useState([]);           // full shuffled list
  const [targetIndex, setTargetIndex] = useState(0);    // current question index
  const [targetColor, setTargetColor] = useState(""); // current goal

  const [selectedColors, setSelectedColors] = useState([]);
  const [successfulMixes, setSuccessfulMixes] = useState(0);
  const [mixResultMessage, setMixResultMessage] = useState("");
  const [resultColor, setResultColor] = useState("");

  const [showReward, setShowReward] = useState(false);
  const [rewardType, setRewardType] = useState("");

  const [width, height] = useWindowSize();
  const navigate = useNavigate();

  // Preload sounds once
  const correctSound = useRef(new Audio('/sounds/correct.mp3')).current;
  const wrongSound   = useRef(new Audio('/sounds/wrong.mp3')).current;
  const successSound = useRef(new Audio('/sounds/success.mp3')).current;

  // When level or reward resets: shuffle appropriate targets and reset state
  useEffect(() => {
    if (showReward) return;
    const list = currentLevel === 1 ? shuffle(level1Targets) : shuffle(level2Targets);
    setTargets(list);
    setTargetIndex(0);
    setSuccessfulMixes(0);
    setMixResultMessage("");
    setResultColor("");
  }, [currentLevel, showReward]);

  // Update current goal whenever targets or index change
  useEffect(() => {
    if (!showReward && targets.length > 0 && targetIndex < targets.length) {
      setTargetColor(targets[targetIndex]);
    }
  }, [targets, targetIndex, showReward]);

  // Handle a color click
  function handleColorClick(color) {
    if (selectedColors.length === 1) {
      const [first] = selectedColors;
      const mixKey = `${first}+${color}`;
      const mix = colorMixes[mixKey] || colorMixes[`${color}+${first}`] || "";
      if (mix === targetColor) {
        correctSound.play();
        setSuccessfulMixes(s => s + 1);
        setMixResultMessage(`✅ Great! You created ${capitalize(mix)}!`);
        setResultColor(mix);
        // advance to next
        const next = targetIndex + 1;
        setTimeout(() => {
          setMixResultMessage("");
          setResultColor("");
          if (next < targets.length) {
            setTargetIndex(next);
          } else {
            triggerReward();
          }
        }, 1500);
      } else {
        wrongSound.play();
        setMixResultMessage(`❌ That's not ${capitalize(targetColor)}.`);
        setTimeout(() => setMixResultMessage(""), 1500);
      }
      setSelectedColors([]);
    } else {
      setSelectedColors([color]);
    }
  }

  function triggerReward() {
    setRewardType(currentLevel === 1 ? 'rainbow' : 'master');
    setShowReward(true);
  }

  function playAgain() {
    setShowReward(false);
    setCurrentLevel(1);
  }

  // After rainbow, auto-advance to level2
  useEffect(() => {
    if (showReward && rewardType === 'rainbow') {
      successSound.play();
      const t = setTimeout(() => {
        setShowReward(false);
        setCurrentLevel(2);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [showReward, rewardType]);

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <div className="cml-lab-container">
      {!showReward ? (
        <> {/* Main UI */}
          <header>
            <h1>Color Mixing Lab</h1>
            <div>Level: {currentLevel}/2</div>
            <div>Successful Mixes: {successfulMixes}</div>
          </header>

          {targetColor && (
            <div className="cml-target-color-box">
              🎯 Goal: Create <b>{capitalize(targetColor)}</b>
            </div>
          )}

          <div className="cml-colors-container">
            {(currentLevel === 1 ? baseColors : level2Colors).map(c => (
              <div
                key={c}
                className="cml-color-circle"
                style={{ backgroundColor: c }}
                onClick={() => handleColorClick(c)}
              />
            ))}
          </div>

          {selectedColors.length === 1 && (
            <div className="cml-selected-color-info">
              Selected: {capitalize(selectedColors[0])}
            </div>
          )}

          {mixResultMessage && (
            <div className="cml-mix-message">
              <p>{mixResultMessage}</p>
              {resultColor && (
                <div
                  className="cml-result-color-circle"
                  style={{ backgroundColor: colorHexMap[resultColor] }}
                />
              )}
            </div>
          )}
        </>
      ) : (
        <div className="cml-reward-screen">
          <Confetti
            width={width} height={height}
            recycle={false}
            style={{ position: 'fixed', top:0, left:0, zIndex:0 }}
          />

          {rewardType === 'rainbow' && (
            <>
              <img
                src="/rainbow.gif"
                alt="Rainbow Celebration"
                className="cml-reward-image"
              />
              <h2 style={{ color:'#fff', textShadow:'0 0 5px #000' }}>
                🌈 Rainbow Celebration!
              </h2>
            </>
          )}

          {rewardType === 'master' && (
            <div className="cml-master-reward-box">
              <div className="cml-trophy-emoji">🏆</div>
              <h1>You're a Color Master!</h1>
              <p>All mixes complete! 🎨</p>
              <div className="cml-button-group">
                <button className="cml-action-button" onClick={playAgain}>
                  Restart
                </button>
                <button
                  className="cml-action-button"
                  onClick={() => navigate('/module/science/activities')}
                >
                  Back to Activities
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
