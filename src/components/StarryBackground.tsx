
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
      const numClusters = 10;
      const starsPerCluster = 30; // Increased density
      const clusterRadius = 20; // Slightly larger clusters

      for (let i = 0; i < numClusters; i++) {
        const clusterCenterX = Math.random() * 110 - 5;
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
            twinkleDuration: `${Math.random() * 4 + 3}s`, // 3s to 7s twinkle
            twinkleDelay: `${Math.random() * 7}s`,
            driftDuration: `${Math.random() * 70 + 50}s`, // 50s to 120s drift
            size: Math.random() * 2 + 0.5, // 0.5px to 2.5px size for more variation
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
