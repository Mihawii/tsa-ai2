import React from 'react';
import { FiHome, FiUsers, FiCode } from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationProps {
  onHomeClick: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onHomeClick }) => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-2 py-1">
        <div className="flex items-center gap-2">
          <button 
            onClick={onHomeClick}
            className={`nav-item group ${pathname === '/' ? 'active' : ''}`} 
            data-tooltip="Home"
          >
            <FiHome className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
          </button>
          <Link href="/community" className={`nav-item group ${pathname === '/community' ? 'active' : ''}`} data-tooltip="Community">
            <FiUsers className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
          </Link>
          <Link href="/program" className={`nav-item group ${pathname === '/program' ? 'active' : ''}`} data-tooltip="Program">
            <FiCode className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
          </Link>
        </div>
      </div>

      <style jsx>{`
        .nav-item {
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .nav-item:hover {
          transform: scale(1.1);
          background: rgba(255, 255, 255, 0.1);
        }

        .nav-item.active {
          background: rgba(255, 255, 255, 0.15);
        }

        .nav-item::before {
          content: attr(data-tooltip);
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          color: white;
          background: rgba(0, 0, 0, 0.8);
          padding: 3px 6px;
          border-radius: 4px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          white-space: nowrap;
        }

        .nav-item:hover::before {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default Navigation; 