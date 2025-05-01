import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaintGalleryPage.css';

const paintImages = [
  { id: 1, src: '/images/paint-unicorn.png'},
  { id: 2, src: '/images/paint-space.png' },
  { id: 3, src: '/images/paint-fish.png' },
];

function PaintGalleryPage() {
  const navigate = useNavigate();

  const handleSelect = (img) => {
    navigate(`/paint/${img.id}`, { state: { img } });
  };

  return (
    <div className="paint-gallery">
      <h2>Select a Picture to Paint</h2>
      <div className="paint-gallery-grid">
        {paintImages.map(img => (
          <div key={img.id} className="paint-gallery-card" onClick={() => handleSelect(img)}>
            <img src={img.src} alt={img.title} />
            <p>{img.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PaintGalleryPage;
