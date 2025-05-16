import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const BlackHole: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Create black hole material
    const blackHoleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv * 2.0 - 1.0;
          float dist = length(uv);
          
          // Create the black hole effect
          float blackHole = smoothstep(0.5, 0.0, dist);
          
          // Create the accretion disk
          float disk = smoothstep(0.5, 0.48, dist) * smoothstep(0.45, 0.5, dist);
          
          // Add some color to the disk
          vec3 diskColor = vec3(1.0, 0.5, 0.2) * disk;
          
          // Add some glow
          float glow = smoothstep(0.5, 0.0, dist) * 0.5;
          
          // Combine everything
          vec3 finalColor = diskColor + vec3(0.2, 0.1, 0.3) * glow;
          
          gl_FragColor = vec4(finalColor, blackHole);
        }
      `,
      transparent: true
    });

    // Create the black hole mesh
    const geometry = new THREE.PlaneGeometry(2, 2);
    const blackHole = new THREE.Mesh(geometry, blackHoleMaterial);
    scene.add(blackHole);

    // Position camera
    camera.position.z = 1;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (blackHoleMaterial.uniforms) {
        blackHoleMaterial.uniforms.time.value += 0.01;
      }
      
      renderer.render(scene, camera);
    };

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (blackHoleMaterial.uniforms) {
        blackHoleMaterial.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      scene.remove(blackHole);
      geometry.dispose();
      blackHoleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        background: '#000'
      }}
    />
  );
};

export default BlackHole; 