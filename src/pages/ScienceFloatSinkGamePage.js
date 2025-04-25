import React, { useState, useEffect } from 'react';
import './ScienceFloatSinkGamePage.css';

const allItems = [
  { name: 'Wood', emoji: '🪵', floats: true },
  { name: 'Rock', emoji: '🪨', floats: false },
  { name: 'Sponge', emoji: '🧽', floats: true },
  { name: 'Metal', emoji: '⚙️', floats: false },
  { name: 'Plastic Bottle', emoji: '🧴', floats: true },
  { name: 'Glass Cup', emoji: '🥛', floats: false },
  { name: 'Ping Pong Ball', emoji: '🏓', floats: true },
  { name: 'Balloon', emoji: '🎈', floats: true },
  { name: 'Brick', emoji: '🧱', floats: false },
  { name: 'Rubber Duck', emoji: '🦆', floats: true },
  { name: 'Leaf', emoji: '🍃', floats: true },
  { name: 'Coin', emoji: '🪙', floats: false },
  { name: 'Feather', emoji: '🪶', floats: true },
  { name: 'Knife', emoji: '🔪', floats: false },
  { name: 'Cork', emoji: '🧩', floats: true },
  { name: 'Apple', emoji: '🍎', floats: true },
  { name: 'Pear', emoji: '🍐', floats: true },
  { name: 'Stone', emoji: '🪨', floats: false },
  { name: 'Coconut', emoji: '🥥', floats: true },
  { name: 'Orange', emoji: '🍊', floats: true },
  { name: 'Bottle Cap', emoji: '🥤', floats: true },
  { name: 'Wrench', emoji: '🔧', floats: false },
  { name: 'Chair', emoji: '🪑', floats: false },
  { name: 'Lettuce', emoji: '🥬', floats: true },
  { name: 'Plastic Bag', emoji: '🛍️', floats: true },
  { name: 'Toy Car', emoji: '🚗', floats: false },
  { name: 'Foam Piece', emoji: '📦', floats: true },
  { name: 'Watermelon', emoji: '🍉', floats: true },
  { name: 'Battery', emoji: '🔋', floats: false },
  { name: 'Shell', emoji: '🐚', floats: true }
];

function ScienceFloatSinkGamePage() {
  const [items, setItems] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [popupVisible, setPopupVisible] = useState(true);
  const [rewardTrigger, setRewardTrigger] = useState(false);

  const startNewGame = () => {
    const shuffled = [...allItems].sort(() => 0.5 - Math.random()).slice(0, 5);
    setItems(shuffled);
    setAnswers([]);
    setFeedback('');
    setRewardTrigger(false);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (answers.length === 5 && answers.every(a => a.correct)) {
      setRewardTrigger(true);
    }
  }, [answers]);

  const handleDragStart = (item) => {
    setDraggedItem(item);
    setFeedback('');
  };

  const handleDrop = (zone) => {
    if (!draggedItem) return;

    const alreadyAnswered = answers.find(a => a.name === draggedItem.name);
    if (alreadyAnswered) return;

    const isCorrect =
      (zone === 'surface' && draggedItem.floats) ||
      (zone === 'floor' && !draggedItem.floats);

    const message = isCorrect
      ? `✅ Correct! ${draggedItem.name} ${draggedItem.floats ? 'floats' : 'sinks'}.`
      : `❌ Oops! ${draggedItem.name} actually ${draggedItem.floats ? 'floats' : 'sinks'}.`;

    setAnswers([...answers, { ...draggedItem, zone, correct: isCorrect, id: Date.now() }]);
    setFeedback(message);
    setDraggedItem(null);
  };

  return (
    <div className="float-sink-game">
      <h2>🌊 Float or Sink?</h2>

      {popupVisible && (
        <div className="popup-modal">
          <div className="popup-content">
            <button className="popup-close" onClick={() => setPopupVisible(false)}>✖</button>
            <h3>Welcome!</h3>
            <p>Drag each item to <strong>Sea Surface</strong> or <strong>Sea Floor</strong>.</p>
            <p>If you answer all correctly, the floating items will start swimming! 🎉</p>
          </div>
        </div>
      )}

      <div className="popup-toggle-box" onClick={() => setPopupVisible(true)}>
        ℹ️ Info
      </div>

      <div className="items-area">
        {items.map((item) => {
          const used = answers.find(a => a.name === item.name);
          return (
            <div
              key={item.name}
              className={`drag-item ${used ? 'disabled' : ''}`}
              draggable={!used}
              onDragStart={() => handleDragStart(item)}
            >
              {item.emoji}
              <div className="item-name">{item.name}</div>
            </div>
          );
        })}
      </div>

      <div className="sea-area">
        <div
          className="sea-zone surface"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('surface')}
        >
          🌊 Sea Surface
          <div className="zone-content">
            {answers
              .filter((a) => a.zone === 'surface')
              .map((a) => (
                <span
                  key={a.id}
                  className={`dropped-object ${rewardTrigger && a.floats ? 'animate-float' : ''}`}
                >
                  {a.emoji}
                </span>
              ))}
          </div>
        </div>

        <div
          className="sea-zone floor"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('floor')}
        >
          🌊 Sea Floor
          <div className="zone-content">
            {answers
              .filter((a) => a.zone === 'floor')
              .map((a) => (
                <span key={a.id} className="dropped-object">
                  {a.emoji}
                </span>
              ))}
          </div>
        </div>
      </div>

      {feedback && <p className="feedback">{feedback}</p>}

      {/* ✅ Final Result Feedback */}
      {answers.length === 5 && (
        <div className="result-section">
          {answers.every(a => a.correct) ? (
            <h3 className="congrat-message">🎉 Congratulations! You got them all right!</h3>
          ) : (
            <button className="restart-btn" onClick={startNewGame}>
              🔁 Start Again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ScienceFloatSinkGamePage;
