
'use client';

import React, { useState, useEffect } from 'react';

interface Star {
  id: number;
  top: string;
  left: string;
  animationDuration: string;
  animationDelay: string;
  size: number;
}

const StarryBackground: React.FC = () => {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      const numStars = 150;
      for (let i = 0; i < numStars; i++) {
        newStars.push({
          id: i,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 2 + 2}s`, // Slower twinkle: 2s to 4s
          animationDelay: `${Math.random() * 4}s`,
          size: Math.random() * 2 + 1,
        });
      }
      setStars(newStars);
    };
    generateStars();
  }, []);

  return (
    <div className="starry-container">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDuration: star.animationDuration,
            animationDelay: star.animationDelay,
          }}
        />
      ))}
    </div>
  );
};

export default StarryBackground;
