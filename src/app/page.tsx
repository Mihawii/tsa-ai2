"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import CircleTransition from '@/components/CircleTransition';

interface TxtRotateProps {
  toRotate: string[];
  period?: number;
    }

const TxtRotate: React.FC<TxtRotateProps> = ({ toRotate, period = 2000 }) => {
  const [loopNum, setLoopNum] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');
  const [delta, setDelta] = useState(300 - Math.random() * 100);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tick = () => {
    const i = loopNum % toRotate.length;
    const fullText = toRotate[i];
    const updatedText = isDeleting
      ? fullText.substring(0, text.length - 1)
      : fullText.substring(0, text.length + 1);

    setText(updatedText);

    if (isDeleting) {
      setDelta(prevDelta => prevDelta / 2);
    }

    if (!isDeleting && updatedText === fullText) {
      setIsDeleting(true);
      setDelta(period);
    } else if (isDeleting && updatedText === '') {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      setDelta(500);
    }
  };

  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
        }
    timeoutRef.current = setTimeout(tick, delta);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
  };
  }, [text, delta, isDeleting, loopNum, toRotate, period]);

  return (
    <span className="txt-rotate">
      <span className="wrap">{text}</span>
    </span>
  );
};

export default function Home() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  const handleStartChat = () => {
    router.push('/register');
  };

  const handleGoHome = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1500);
  };

  return (
    <main className={`min-h-screen relative overflow-hidden tech-grid-bg`}>
      <CircleTransition 
        isTransitioning={isTransitioning} 
        onTransitionComplete={() => setIsTransitioning(false)} 
      />
      <div className={`relative z-10 min-h-screen flex flex-col items-center justify-center transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <h1 className="text-6xl font-bold mb-4 text-white">
          TSa
          <TxtRotate
            toRotate={[
              ' is innovative',
              ' is powerful',
              ' is creative',
              ' is efficient',
              ' is modern',
              ' is beautiful',
            ]}
            period={2000}
              />
        </h1>
                <button
          onClick={handleStartChat}
          className={`shimmer-spark-btn mt-8 px-8 py-3 rounded-full text-white relative`}
        >
          <span className="spark__container">
            <span className="spark"></span>
          </span>
          <span className="backdrop"></span>
          <span className="text">Start Chatting</span>
        </button>
      </div>
      <Navigation onHomeClick={handleGoHome} />
    </main>
  );
}

// Add this to your global CSS if not present:
// .loader { border-width: 2px; border-style: solid; border-radius: 9999px; width: 1.25rem; height: 1.25rem; border-color: #60a5fa transparent transparent transparent; animation: spin 1s linear infinite; }
// @keyframes spin { 100% { transform: rotate(360deg); } }
// @keyframes bounce-in { 0% { transform: scale(1.2); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
