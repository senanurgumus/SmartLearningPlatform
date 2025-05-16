import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ColorMixingLab.css';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

const baseColors = ["red", "yellow", "blue"];
const level2Colors = [...baseColors, "orange", "green", "purple", "black", "white"];

const colorMixes = {
  "red+yellow": "orange",
  "yellow+red": "orange",
  "red+blue": "purple",
  "blue+red": "purple",
  "yellow+blue": "green",
  "blue+yellow": "green",
  "black+white": "gray",
  "white+black": "gray",
  "orange+white": "light orange",
  "orange+black": "dark orange",
  "green+white": "light green",
  "green+black": "dark green",
  "purple+white": "light purple",
  "purple+black": "dark purple",
  "red+white": "pink",
  "red+black": "dark red",
  "yellow+white": "light yellow",
  "yellow+black": "dark yellow",
  "blue+white": "light blue",
  "blue+black": "dark blue",
};

const colorHexMap = {
  orange: "#ffa500",
  green: "#008000",
  purple: "#800080",
  red: "#ff0000",
  yellow: "#ffff00",
  blue: "#0000ff",
  gray: "#808080",
  "light orange": "#ffcc99",
  "dark orange": "#ff8c00",
  "light green": "#90ee90",
  "dark green": "#006400",
  "light purple": "#dda0dd",
  "dark purple": "#4b0082",
  pink: "#ffc0cb",
  "dark red": "#8b0000",
  "light yellow": "#ffffe0",
  "dark yellow": "#9b870c",
  "light blue": "#add8e6",
  "dark blue": "#00008b",
};

const level1Targets = ["orange", "green", "purple"];
const level2Targets = [
  "gray", "pink", "dark red",
  "light yellow", "dark yellow",
  "light blue", "dark blue",
  "light orange", "dark orange",
  "light green", "dark green",
  "light purple", "dark purple"
];

function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function ColorMixingLab() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedColors, setSelectedColors] = useState([]);
  const [successfulMixes, setSuccessfulMixes] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [rewardType, setRewardType] = useState("");
  const [mixResultMessage, setMixResultMessage] = useState("");
  const [resultColor, setResultColor] = useState("");
  const [targetColor, setTargetColor] = useState("");
  const [remainingTargets, setRemainingTargets] = useState([]);

  const [width, height] = useWindowSize();
  const navigate = useNavigate();

  function startLevelTargets() {
    if (currentLevel === 1) {
      setRemainingTargets(shuffle([...level1Targets]));
    } else if (currentLevel === 2) {
      setRemainingTargets(shuffle([...level2Targets]));
    } else {
      setRemainingTargets([]);
    }
  }

  useEffect(() => {
    if (!showReward) {
      startLevelTargets();
    }
  }, [currentLevel, showReward]);

  function generateTargetColor() {
    if (remainingTargets.length > 0) {
      setTargetColor(remainingTargets[0]);
      setRemainingTargets(prev => prev.slice(1));
    } else {
      setTargetColor("");
    }
  }

  useEffect(() => {
    if (!showReward && targetColor === "") {
      generateTargetColor();
    }
  }, [remainingTargets, showReward, targetColor]);

  function handleColorClick(color) {
    if (selectedColors.length === 1) {
      const [firstColor] = selectedColors;
      const mixed = mixColors(firstColor, color);

      if (mixed === targetColor) {
        setSuccessfulMixes(prev => prev + 1);
        setMixResultMessage(`✅ Great! You created ${capitalize(mixed)}!`);
        setResultColor(mixed);

        setTimeout(() => {
          setMixResultMessage("");
          setResultColor("");
          if (remainingTargets.length > 0) {
            generateTargetColor();
          } else {
            triggerReward();
          }
        }, 3000);
      } else {
        setMixResultMessage(`❌ That's not ${capitalize(targetColor)}. Try again!`);
        setResultColor("");
        setTimeout(() => setMixResultMessage(""), 3000);
      }

      setSelectedColors([]);
    } else {
      setSelectedColors([color]);
    }
  }

  function mixColors(color1, color2) {
    return colorMixes[`${color1}+${color2}`] || colorMixes[`${color2}+${color1}`] || "";
  }

  function triggerReward() {
    setRewardType(currentLevel === 1 ? "rainbow" : "master");
    setShowReward(true);
  }

  function playAgain() {
    setCurrentLevel(1);
    setSuccessfulMixes(0);
    setShowReward(false);
  }

  useEffect(() => {
    if (showReward && rewardType === "rainbow") {
      const timeout = setTimeout(() => {
        setShowReward(false);
        setCurrentLevel(2);
        setSuccessfulMixes(0);
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [showReward, rewardType]);

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  return (
    <div className="cml-lab-container">
      {!showReward ? (
        <>
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
            {(currentLevel === 1 ? baseColors : level2Colors).map(color => (
              <div
                key={color}
                className="cml-color-circle"
                style={{ backgroundColor: color }}
                onClick={() => handleColorClick(color)}
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
                  style={{ backgroundColor: colorHexMap[resultColor] || resultColor }}
                />
              )}
            </div>
          )}
        </>
      ) : (
        <div className="cml-reward-screen">
          {rewardType === "rainbow" && (
            <>
              <img
                src="/rainbow.gif"
                alt="Rainbow Celebration"
                className="cml-reward-image"
              />
              <h2>Rainbow Celebration!</h2>
            </>
          )}
          {rewardType === "master" && (
            <>
              <div className="cml-confetti-container">
                <Confetti
                  width={width}
                  height={height}
                  recycle={false}
                />
              </div>
              <div className="cml-master-reward-box">
                <div className="cml-trophy-emoji">🏆</div>
                <h1>You are a Color Master!</h1>
                <h2>Congratulations!</h2>
                <p>You have mastered the art of mixing colors! 🎨</p>
                <div className="cml-button-group">
                  <button className="cml-action-button" onClick={playAgain}>
                    Play Again
                  </button>
                  <button
                    className="cml-action-button"
                    onClick={() => navigate('/module/science/activities')}
                  >
                    Go to Activities
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ColorMixingLab;



