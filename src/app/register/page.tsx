"use client";

import React, { useState } from 'react';

const ALLOWED_EMAILS = [
  // Add your students' emails here
  'student1@example.com',
  'student2@example.com',
  'student3@example.com',
  'aerthea.branch@gmail.com',
];

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [animateIn, setAnimateIn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ALLOWED_EMAILS.includes(email.trim().toLowerCase())) {
      // Store email in localStorage/session (simple auth for demo)
      localStorage.setItem('ai_student_email', email.trim().toLowerCase());
      window.location.href = '/chat';
    } else {
      setError('Access denied. This AI is only for authorized students.');
    }
  };

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden tech-grid-bg${animateIn ? ' bounce-back-in' : ''}`}
      style={!animateIn ? { transform: 'perspective(900px) scale(1.18) translateZ(60px)' } : {}}
    >
      <div className="frosted-glass-bubble max-w-md w-full flex flex-col items-center p-10">
        <h2 className="text-3xl font-bold mb-6 font-mori text-white tracking-wide">Student Registration</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your student email"
            className="bg-white/10 backdrop-blur-md rounded-full px-5 py-3 text-white placeholder-white/60 focus:outline-none border border-white/20 font-mori text-lg"
            required
            autoFocus
          />
          <button
            type="submit"
            className="bg-white/10 text-white rounded-full px-5 py-3 font-bold font-mori text-lg hover:bg-white/20 transition-colors border border-white/20 shadow-md"
          >
            Register & Start Chatting
          </button>
        </form>
        {error && <div className="text-red-400 mt-6 text-center font-mori text-base">{error}</div>}
      </div>
      <style jsx global>{`
        @font-face {
          font-display: block;
          font-family: Mori;
          font-style: normal;
          font-weight: 400;
          src: url(https://assets.codepen.io/16327/PPMori-Regular.woff) format("woff");
        }
        .font-mori {
          font-family: 'Mori', 'Sora', 'Inter', system-ui, sans-serif;
          font-style: normal !important;
        }
        .frosted-glass-bubble {
          background: rgba(40, 44, 52, 0.72);
          border-radius: 2rem;
          box-shadow: 0 8px 40px 0 rgba(0,0,0,0.22);
          border: 1.5px solid rgba(255,255,255,0.13);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          margin: 0 1rem;
        }
      `}</style>
    </main>
  );
} 