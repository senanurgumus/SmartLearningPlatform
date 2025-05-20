import React, { useState, useEffect } from 'react';
import './ScienceMagnetGamePage.css';

const allItems = [
  { name: 'Paperclip', emoji: '📎', magnetic: true },
  { name: 'Spoon', emoji: '🥄', magnetic: false },
  { name: 'Key', emoji: '🗝️', magnetic: true },
  { name: 'Plastic Toy', emoji: '🧸', magnetic: false },
  { name: 'Coin', emoji: '🪙', magnetic: true },
  { name: 'Book', emoji: '📘', magnetic: false },
  { name: 'Battery', emoji: '🔋', magnetic: true },
  { name: 'Wooden Stick', emoji: '🪵', magnetic: false },
  { name: 'Nail', emoji: '🧲', magnetic: true },
  { name: 'Feather', emoji: '🪶', magnetic: false }
];

function ScienceMagnetGamePage() {
  const [items, setItems] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [fridgeItems, setFridgeItems] = useState([]);
  const [basketItems, setBasketItems] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [popupVisible, setPopupVisible] = useState(true);
  const [fridgeOpen, setFridgeOpen] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const shuffled = [...allItems].sort(() => 0.5 - Math.random()).slice(0, 5);
    setItems(shuffled);
  }, []);

  useEffect(() => {
    if (
      items.length > 0 &&
      fridgeItems.length + basketItems.length === items.length
    ) {
      const allCorrect = [...fridgeItems, ...basketItems].every(i =>
        (i.magnetic && i.zone === 'fridge') || (!i.magnetic && i.zone === 'basket')
      );

      if (allCorrect) {
        setFridgeOpen(true);
      }

      setShowResult(true); // ✅ Her durumda sonucu göster
    }
  }, [fridgeItems, basketItems, items]);

  const handleDragStart = (item) => {
    setDraggedItem(item);
    setFeedback('');
  };

  const handleDrop = (zone) => {
    if (!draggedItem) return;

    const alreadyDropped = [...fridgeItems, ...basketItems].find(i => i.name === draggedItem.name);
    if (alreadyDropped) return;

    const isCorrect = (zone === 'fridge' && draggedItem.magnetic) || (zone === 'basket' && !draggedItem.magnetic);

    const message = isCorrect
      ? `✅ Correct! ${draggedItem.name} goes to the ${zone}.`
      : `❌ Oops! ${draggedItem.name} does not belong in the ${zone}.`;

    const newItem = { ...draggedItem, zone };

    if (zone === 'fridge') {
      setFridgeItems([...fridgeItems, newItem]);
    } else {
      setBasketItems([...basketItems, newItem]);
    }

    setFeedback(message);
    setDraggedItem(null);
  };

  return (
    <div className="magnet-game">
      <h2>🧲 Magnetic or Not?</h2>

      {popupVisible && (
        <div className="popup-modal">
          <div className="popup-content">
            <button className="popup-close" onClick={() => setPopupVisible(false)}>✖</button>
            <h3>Welcome!</h3>
            <p>Drag items to the fridge if you think they are <strong>magnetic</strong>, or to the basket if <strong>not magnetic</strong>.</p>
            <p>🎉 If you classify all correctly, the fridge will open!</p>
          </div>
        </div>
      )}

      <div className="popup-toggle-box" onClick={() => setPopupVisible(true)}>
        ℹ️ Info
      </div>

      <div className="items-area">
        {items.map((item) => {
          const used = [...fridgeItems, ...basketItems].find(i => i.name === item.name);
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

      <div className="drop-areas">
        <div
          className="drop-zone fridge-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('fridge')}
        >
          <img
            src={fridgeOpen ? '/images/fridge-open.png' : '/images/fridge-closed.png'}
            alt="Fridge"
            className="fridge-image"
          />
          <div className="attached-items">
            {fridgeItems.map((i, idx) => (
              <span key={idx} className="attached-object">{i.emoji}</span>
            ))}
          </div>
        </div>

        <div
          className="drop-zone basket-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('basket')}
        >
          <img src="/images/basket.png" alt="Basket" className="basket-image" />
          <div className="attached-items">
            {basketItems.map((i, idx) => (
              <span key={idx} className="attached-object">{i.emoji}</span>
            ))}
          </div>
        </div>
      </div>

      {feedback && <p className="feedback">{feedback}</p>}

      {/* ✅ Sonuç kutusu her durumda */}
      {showResult && (
        <div className="result-box">
          {fridgeOpen ? (
            <>
              <h3>🎉 Congratulations!</h3>
              <p>You correctly sorted all items!</p>
            </>
          ) : (
            <>
              <h3>🚧 Oops!</h3>
              <p>Some items were placed incorrectly. Try again!</p>
            </>
          )}

       

          <button onClick={() => window.location.reload()} className="try-again-btn">
            🔄 Try Again
          </button>
        </div>
      )}
    </div>
  );
}

export default ScienceMagnetGamePage;
