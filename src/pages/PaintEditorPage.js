import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './PaintEditorPage.css';

function PaintEditorPage() {
  const { state } = useLocation();
  const selectedImage = state?.img;
  const [currentColor, setCurrentColor] = useState('#ff0000');
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = selectedImage.src;
    image.onload = () => {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      imageRef.current = image; // resmi daha sonra clear için sakla
    };
  }, [selectedImage]);

  const hexToRgba = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    return [bigint >> 16 & 255, bigint >> 8 & 255, bigint & 255, 255];
  };

  const colorMatch = (data, pos, target, tolerance = 32) => {
    for (let i = 0; i < 3; i++) {
      if (Math.abs(data[pos + i] - target[i]) > tolerance) return false;
    }
    return true;
  };

  const floodFill = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const targetPos = (y * canvas.width + x) * 4;
    const targetColor = [data[targetPos], data[targetPos + 1], data[targetPos + 2], data[targetPos + 3]];
    const fillColor = hexToRgba(currentColor);

    if (colorMatch(data, targetPos, fillColor)) return;

    const queue = [[x, y]];

    while (queue.length > 0) {
      const [cx, cy] = queue.shift();
      const index = (cy * canvas.width + cx) * 4;
      if (!colorMatch(data, index, targetColor)) continue;

      data[index] = fillColor[0];
      data[index + 1] = fillColor[1];
      data[index + 2] = fillColor[2];
      data[index + 3] = 255;

      if (cx > 0) queue.push([cx - 1, cy]);
      if (cx < canvas.width - 1) queue.push([cx + 1, cy]);
      if (cy > 0) queue.push([cx, cy - 1]);
      if (cy < canvas.height - 1) queue.push([cx, cy + 1]);
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    floodFill(x, y);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (imageRef.current) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${selectedImage.title}_colored.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="paint-editor">
      <h2>🎨 Start Coloring: {selectedImage.title}</h2>
      <div className="toolbar">
        <label>
          <span>🎨 Pick Color:</span>
          <input type="color" value={currentColor} onChange={(e) => setCurrentColor(e.target.value)} />
        </label>
        <button className="btn clear" onClick={handleClear}>🗑️ Clear All</button>
        <button className="btn save" onClick={handleSave}>💾 Save</button>
      </div>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="paint-canvas"
      />
    </div>
  );
}

export default PaintEditorPage;
