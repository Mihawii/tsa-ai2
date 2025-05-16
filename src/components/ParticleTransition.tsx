import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ParticleTransitionProps {
  isTransitioning: boolean;
  onTransitionComplete: () => void;
}

const ParticleTransition: React.FC<ParticleTransitionProps> = ({ isTransitioning, onTransitionComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create particles
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      colors[i * 3] = Math.random();
      colors[i * 3 + 1] = Math.random();
      colors[i * 3 + 2] = Math.random();

      sizes[i] = Math.random() * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (particlesRef.current) {
        particlesRef.current.rotation.x += 0.001;
        particlesRef.current.rotation.y += 0.001;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (isTransitioning && particlesRef.current) {
      // Animate particles outward
      const positions = particlesRef.current.geometry.attributes.position;
      const originalPositions = positions.array.slice();

      const animateOut = () => {
        for (let i = 0; i < positions.count; i++) {
          positions.setXYZ(
            i,
            originalPositions[i * 3] * 2,
            originalPositions[i * 3 + 1] * 2,
            originalPositions[i * 3 + 2] * 2
          );
        }
        positions.needsUpdate = true;

        if (particlesRef.current) {
          const material = particlesRef.current.material;
          if (material instanceof THREE.PointsMaterial) {
            material.opacity -= 0.02;
            if (material.opacity > 0) {
              requestAnimationFrame(animateOut);
            } else {
              onTransitionComplete();
            }
            return;
          }
        }
        // If not PointsMaterial, just call onTransitionComplete
        onTransitionComplete();
      };

      animateOut();
    }
  }, [isTransitioning, onTransitionComplete]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 pointer-events-none ${
        isTransitioning ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-500`}
    />
  );
};

export default ParticleTransition; 