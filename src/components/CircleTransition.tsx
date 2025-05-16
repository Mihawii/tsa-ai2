import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface CircleTransitionProps {
  isTransitioning: boolean;
  onTransitionComplete: () => void;
}

const CircleTransition: React.FC<CircleTransitionProps> = ({ isTransitioning, onTransitionComplete }) => {
  const circleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!circleRef.current) return;

    if (isTransitioning) {
      // Reset circle size
      gsap.set(circleRef.current, {
        scale: 0,
        opacity: 0,
      });

      // Animate circle expanding
      gsap.to(circleRef.current, {
        scale: 2.5,
        opacity: 1,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          // Hold the expanded state briefly
          setTimeout(() => {
            // Fade out
            gsap.to(circleRef.current, {
              opacity: 0,
              duration: 0.5,
              ease: "power2.inOut",
              onComplete: onTransitionComplete,
            });
          }, 200);
        },
      });
    }
  }, [isTransitioning, onTransitionComplete]);

  return (
    <div
      ref={circleRef}
      className="fixed inset-0 z-50 pointer-events-none"
      style={{
        display: isTransitioning ? 'block' : 'none',
      }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-[#e93e1e] to-[#ff6b4a] opacity-0" />
    </div>
  );
};

export default CircleTransition; 