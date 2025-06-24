
'use client';

import React, { useState, useEffect } from 'react';

interface Star {
  id: number;
  top: string;
  left: string;
  twinkleDuration: string;
  twinkleDelay: string;
  driftDuration: string;
  size: number;
}

const StarryBackground: React.FC = () => {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      const numClusters = 7;
      const starsPerCluster = 30;
      const clusterRadius = 15;

      for (let i = 0; i < numClusters; i++) {
        const clusterCenterX = Math.random() * 110 - 5; // Allow stars to start slightly off-screen
        const clusterCenterY = Math.random() * 110 - 5;

        for (let j = 0; j < starsPerCluster; j++) {
          const angle = Math.random() * 2 * Math.PI;
          const radius = Math.pow(Math.random(), 2) * clusterRadius;
          
          const left = clusterCenterX + radius * Math.cos(angle);
          const top = clusterCenterY + radius * Math.sin(angle);

          newStars.push({
            id: i * starsPerCluster + j,
            top: `${top}%`,
            left: `${left}%`,
            twinkleDuration: `${Math.random() * 3 + 2}s`, // 2s to 5s twinkle
            twinkleDelay: `${Math.random() * 5}s`,
            driftDuration: `${Math.random() * 60 + 40}s`, // 40s to 100s drift, very slow
            size: Math.random() * 2 + 1, // 1px to 3px size
          });
        }
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
          className="star-wrapper"
          style={{
            top: star.top,
            left: star.left,
            animation: `drift_animation ${star.driftDuration} ease-in-out infinite alternate`,
          }}
        >
          <div
            className="star"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              animation: `twinkle_animation ${star.twinkleDuration} ease-in-out infinite`,
              animationDelay: star.twinkleDelay,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default StarryBackground;
