// src/pages/PuzzleGalleryPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import puzzles from '../data/puzzles.json';
import './PuzzleGalleryPage.css';

export default function PuzzleGalleryPage() {
  return (
    <div className="gallery-container">
      <h1>Puzzle Gallery</h1>
      <div className="gallery-list">
        {Object.entries(puzzles).map(([type, { thumbnail }]) => (
          <Link key={type} to={`/puzzle/${type}`} className="gallery-card">
            <img
              src={`/puzzles/${type}/${thumbnail}`}
              alt={`${type.replace('_',' ')} thumbnail`}
              className="thumbnail-image"
            />
            <div className="thumbnail-label">
              {type.replace('_',' ')}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

