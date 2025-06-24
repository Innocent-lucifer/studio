
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
      const numClusters = 7; // Define how many star clusters to generate
      const starsPerCluster = 30; // Stars per cluster
      const clusterRadius = 15; // Max radius of a cluster in viewport %

      for (let i = 0; i < numClusters; i++) {
        // Define a random center for each cluster
        const clusterCenterX = Math.random() * 100;
        const clusterCenterY = Math.random() * 100;

        for (let j = 0; j < starsPerCluster; j++) {
          // Position stars around the cluster center using a non-uniform distribution
          // for a more natural look. A power function helps concentrate stars near the center.
          const angle = Math.random() * 2 * Math.PI;
          const radius = Math.pow(Math.random(), 2) * clusterRadius;
          
          const left = clusterCenterX + radius * Math.cos(angle);
          const top = clusterCenterY + radius * Math.sin(angle);

          // Ensure stars stay within the viewport
          if (left < 0 || left > 100 || top < 0 || top > 100) continue;

          newStars.push({
            id: i * starsPerCluster + j,
            top: `${top}%`,
            left: `${left}%`,
            animationDuration: `${Math.random() * 2 + 2}s`, // 2s to 4s twinkle
            animationDelay: `${Math.random() * 4}s`,
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
