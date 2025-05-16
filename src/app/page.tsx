"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TxtRotateProps {
  toRotate: string[];
  period?: number;
    }

const TxtRotate: React.FC<TxtRotateProps> = ({ toRotate, period = 2000 }) => {
  const [loopNum, setLoopNum] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');
  const [delta, setDelta] = useState(300 - Math.random() * 100);

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
    const timeoutRef = setTimeout(tick, delta);
    return () => {
      clearTimeout(timeoutRef);
    };
  }, [text, delta, isDeleting, loopNum, toRotate, period]);

  return (
    <span className="txt-rotate">
      <span className="wrap">{text}</span>
    </span>
  );
};

export default function Home() {
  const router = useRouter();

  const handleStartChat = () => {
    router.push('/register');
  };

  return (
    <main className="min-h-screen relative overflow-hidden tech-grid-bg">
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center transition-opacity duration-500">
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
          className="shimmer-spark-btn mt-8 px-8 py-3 rounded-full text-white relative"
        >
          <span className="spark__container">
            <span className="spark"></span>
          </span>
          <span className="backdrop"></span>
          <span className="text">Start Chatting</span>
        </button>
      </div>
    </main>
  );
}
