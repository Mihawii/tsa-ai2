import React from 'react';

const KoiFish: React.FC = () => {
  return (
    <div className="koi-container">
      <div className="koi">
        <div className="koi-links">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="koi-link" style={{ '--i': i + 1 } as React.CSSProperties}></div>
          ))}
        </div>
        <div className="koi-fins">
          <div className="koi-fin"></div>
          <div className="koi-fin"></div>
        </div>
        <div className="koi-tails">
          <div className="koi-tail"></div>
          <div className="koi-tail"></div>
        </div>
      </div>

      <div className="koi">
        <div className="koi-links">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="koi-link" style={{ '--i': i + 1 } as React.CSSProperties}></div>
          ))}
        </div>
        <div className="koi-fins">
          <div className="koi-fin"></div>
          <div className="koi-fin"></div>
        </div>
        <div className="koi-tails">
          <div className="koi-tail"></div>
          <div className="koi-tail"></div>
        </div>
      </div>

      <style jsx>{`
        .koi-container {
          position: fixed;
          inset: 0;
          z-index: 0;
          background-color: #aaa;
          background-image: radial-gradient(circle, #e93e1e 5em, transparent 0);
          overflow: hidden;
        }

        .koi {
          position: absolute;
          inset: -25em;
          filter: blur(0.5em) contrast(15);
          animation: koiRotate 24s var(--rotateDelay, 0s) infinite linear;
        }

        .koi:nth-child(1) {
          --linkColor: white;
          --duration: 3s;
          background-color: black;
          mix-blend-mode: lighten;
        }

        .koi:nth-child(2) {
          --linkColor: black;
          --duration: 3.5s;
          --rotateDelay: -12s;
          background-color: white;
          mix-blend-mode: darken;
        }

        @keyframes koiRotate {
          to { rotate: 1turn; }
        }

        .koi-links {
          position: absolute;
          left: 50%;
          top: 50%;
        }

        .koi-link {
          --w: calc(pow(var(--i) / 12, 2) * -2em - 0.25em);
          --delay: calc(var(--i) * var(--duration) * -0.15 - 20s);
          
          position: absolute;
          inset: var(--w) -3em;
          background-color: var(--linkColor);
          border-radius: 50%;
          animation: link var(--duration) var(--delay) infinite ease-in-out alternate;
        }

        @keyframes link {
          from { transform: rotate(calc(var(--i) * 10deg)) translateY(-8.5em); }
          to { transform: rotate(calc(var(--i) * 10deg)) translateY(-11.5em); }
        }

        .koi-fins {
          --i: 10;
          --delay: calc(var(--i) * var(--duration) * -0.15 - 20s);
          
          position: absolute;
          left: 50%;
          top: 50%;
          animation: link var(--duration) var(--delay) infinite ease-in-out alternate;
        }

        .koi-fin {
          position: absolute;
          inset: -3em -1.5em;
          background-color: var(--linkColor);
          border-radius: 50%;
          transform-origin: bottom;
          animation: fin var(--duration) infinite ease-in-out;
        }

        .koi-fin:nth-child(2) {
          --rz: 180deg;
        }

        @keyframes fin {
          0%, 100% { transform: translateY(-3em) rotateX(var(--rz, 0deg)) rotate(10deg); }
          40% { transform: translateY(-3em) rotateX(var(--rz, 0deg)) rotate(-30deg); }
        }

        .koi-tails {
          --i: 1;
          --delay: calc(var(--i) * var(--duration) * -0.15 - 20s);
          
          position: absolute;
          left: 50%;
          top: 50%;
          animation: link var(--duration) var(--delay) infinite ease-in-out alternate;
        }

        .koi-tail {
          position: absolute;
          inset: -2em -1em;
          background-color: var(--linkColor);
          border-radius: 50%;
          transform-origin: bottom;
          animation: tail var(--duration) infinite ease-in-out;
        }

        .koi-tail:nth-child(2) {
          --rz: 180deg;
        }

        @keyframes tail {
          0%, 100% { transform: translateY(-2em) rotateX(var(--rz, 0deg)) rotate(-60deg); }
          50% { transform: translateY(-2em) rotateX(var(--rz, 0deg)) rotate(-40deg); }
        }
      `}</style>
    </div>
  );
};

export default KoiFish; 