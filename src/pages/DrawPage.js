import React, { useRef, useState, useEffect } from 'react';
import './DrawPage.css';

const images = [
  { id: 1, thumb: '/images/thumb-fish.png', title: 'Fish' },
  { id: 2, thumb: '/images/thumb-car.png', title: 'Car' },
  { id: 3, thumb: '/images/thumb-flower.png', title: 'Flower' },
  { id: 4, thumb: '/images/thumb-tree.png', title: 'Tree' },
  { id: 5, thumb: '/images/thumb-house.png', title: 'House' },
  { id: 6, thumb: '/images/thumb-star.png', title: 'Star' }
];

function DrawPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [drawShape, setDrawShape] = useState('');
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 600;
    contextRef.current = ctx;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [selectedImage]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    if (drawShape) {
      setStartPos({ x: offsetX, y: offsetY });
      setIsDrawing(true);
    } else {
      const ctx = contextRef.current;
      ctx.strokeStyle = isEraser ? '#ffffff' : currentColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing || drawShape) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = ({ nativeEvent }) => {
    if (drawShape && isDrawing) {
      const { offsetX, offsetY } = nativeEvent;
      const ctx = contextRef.current;
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = lineWidth;

      const width = offsetX - startPos.x;
      const height = offsetY - startPos.y;

      switch (drawShape) {
        case 'rectangle':
          ctx.strokeRect(startPos.x, startPos.y, width, height);
          break;
        case 'circle':
          ctx.beginPath();
          ctx.arc(startPos.x, startPos.y, Math.sqrt(width ** 2 + height ** 2), 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case 'line':
          ctx.beginPath();
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(offsetX, offsetY);
          ctx.stroke();
          break;
        default:
          break;
      }
    }
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const saveCanvas = () => {
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="draw-page">
      {!selectedImage ? (
        <div className="image-selection">
          <h2>🖌️ Choose what you'd like to draw:</h2>
          <div className="image-grid">
            {images.map((img) => (
              <div key={img.id} className="image-card" onClick={() => setSelectedImage(img)}>
                <img src={img.thumb} alt={`${img.title} thumbnail`} className="thumb-img" />
                <p>{img.title}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="draw-workspace">
          <div className="tools">
            <label>
              🎨 Color
              <input
                type="color"
                value={currentColor}
                onChange={(e) => {
                  setCurrentColor(e.target.value);
                  setIsEraser(false);
                }}
              />
            </label>

            <label>
              ✏️ Thickness
              <input
                type="range"
                min="1"
                max="20"
                value={lineWidth}
                onChange={(e) => setLineWidth(parseInt(e.target.value))}
              />
            </label>

            <label>
              📐 Shape
              <select value={drawShape} onChange={(e) => setDrawShape(e.target.value)}>
                <option value="">Freehand</option>
                <option value="line">Line</option>
                <option value="rectangle">Rectangle</option>
                <option value="circle">Circle</option>
              </select>
            </label>

            <button onClick={() => setIsEraser(!isEraser)}>
              {isEraser ? '✏️ Draw Mode' : '🧽 Eraser'}
            </button>

            <button className="clear-btn" onClick={clearCanvas}>🗑 Clear All</button>
            <button className="save-btn" onClick={saveCanvas}>💾 Save</button>

          </div>

          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          ></canvas>
        </div>
      )}
    </div>
  );
}

export default DrawPage;
