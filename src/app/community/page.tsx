"use client";

import React, { useMemo } from 'react';

function generateStars(count: number) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 2000);
    const y = Math.floor(Math.random() * 2000);
    stars.push(`${x}px ${y}px #FFF`);
  }
  return stars.join(', ');
}

function Starfield() {
  // Memoize so stars don't change on every render
  const small = useMemo(() => generateStars(700), []);
  const medium = useMemo(() => generateStars(200), []);
  const big = useMemo(() => generateStars(100), []);
  return (
    <>
      <div id="stars" style={{ boxShadow: small }} />
      <div id="stars2" style={{ boxShadow: medium }} />
      <div id="stars3" style={{ boxShadow: big }} />
      <style jsx>{`
        #stars, #stars2, #stars3 {
          position: absolute;
          top: 0; left: 0; width: 100vw; height: 2000px; pointer-events: none;
        }
        #stars { width: 1px; height: 1px; animation: animStar 50s linear infinite; }
        #stars2 { width: 2px; height: 2px; animation: animStar 100s linear infinite; }
        #stars3 { width: 3px; height: 3px; animation: animStar 150s linear infinite; }
        @keyframes animStar {
          from { transform: translateY(0px); }
          to { transform: translateY(-2000px); }
        }
        body, main {
          background: #536972 !important;
        }
      `}</style>
    </>
  );
}

function AnimatedDescription() {
  const text = "If you ever wished to have everything on the palm of your hand, give this a look";
  return (
    <div className="container">
      <div className="community-desc-text">
        {text.split(' ').map((word, i) => (
          <span key={i} className="desc-word">{word} </span>
        ))}
      </div>
      <style jsx>{`
        @font-face {
          font-display: block;
          font-family: Mori;
          font-style: normal;
          font-weight: 400;
          src: url(https://assets.codepen.io/16327/PPMori-Regular.woff) format("woff");
        }
        .container {
          position: relative;
          width: 90vw;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-evenly;
          border-radius: 9px;
          margin-bottom: 2.5rem;
        }
        .community-desc-text {
          color: #fff;
          font-family: 'Mori', sans-serif;
          font-size: clamp(1.5rem, 3vw, 2.5rem);
          line-height: 1.5;
          box-sizing: border-box;
          padding: 6% 8%;
          width: 100%;
          text-align: center;
          perspective: 500px;
          font-weight: 400;
          letter-spacing: 0.08em;
          word-spacing: 0.22em;
          white-space: normal;
        }
        .desc-word {
          display: inline-block;
          opacity: 0;
          margin: 0 0.18em;
        }
      `}</style>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-transparent relative overflow-hidden">
      <Starfield />
      <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
        <h1 className="text-5xl font-bold text-white mb-10 mt-8 tracking-wide drop-shadow-lg">TSa</h1>
        <AnimatedDescription />
        <ExpandingLinesAnimation />
        <a
          href="https://discord.gg/X2jmjqm6aK"
          target="_blank"
          rel="noopener noreferrer"
          className="glass-btn-glow-white mt-12 px-10 py-4 rounded-full text-xl font-bold text-white shadow-lg transition-all duration-300"
        >
          Join Our Discord Community
        </a>
      </div>
      <style jsx>{`
        .expanding-lines-container {
          position: relative;
          width: 340px;
          height: 340px;
          margin: 0 auto;
        }
        @media (max-width: 500px) {
          .expanding-lines-container {
            width: 90vw;
            height: 90vw;
            min-width: 220px;
            min-height: 220px;
          }
        }
        .center-dot {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 16px;
          height: 16px;
          background: rgba(255,255,255,0.9);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
        }
        .expanding-line {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 0;
          height: 2px;
          background: rgba(255,255,255,0.5);
          transform-origin: left center;
          border-radius: 2px;
          animation: expandLine 2.5s cubic-bezier(.4,2,.6,1) infinite;
        }
        .expanding-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          background: rgba(255,255,255,0.8);
          border-radius: 50%;
          left: calc(100% - 4px);
          top: 50%;
          transform: translateY(-50%);
        }
        @keyframes expandLine {
          0% { width: 0; opacity: 0.5; }
          40% { width: 140px; opacity: 0.8; }
          80% { width: 140px; opacity: 0.8; }
          100% { width: 0; opacity: 0.5; }
        }
        .glass-btn-glow-white {
          background: rgba(255,255,255,0.10);
          backdrop-filter: blur(18px) saturate(160%);
          border: 1.5px solid rgba(255,255,255,0.18);
          box-shadow: 0 2px 16px 0 rgba(0,0,0,0.10);
          transition: box-shadow 0.3s, background 0.3s;
          position: relative;
        }
        .glass-btn-glow-white:hover, .glass-btn-glow-white:focus {
          background: rgba(255,255,255,0.18);
          box-shadow: 0 0 32px 8px #fff, 0 2px 16px 0 rgba(0,0,0,0.10);
        }
      `}</style>
    </main>
  );
}

function ExpandingLinesAnimation() {
  const lines = Array.from({ length: 12 });
  return (
    <div className="expanding-lines-container">
      <div className="center-dot" />
      {lines.map((_, i) => (
        <div
          key={i}
          className="expanding-line"
          style={{
            transform: `rotate(${i * 30}deg)`,
            animationDelay: `${(i * 0.18).toFixed(2)}s`,
          }}
        >
          <div className="expanding-dot" />
        </div>
      ))}
    </div>
  );
} 