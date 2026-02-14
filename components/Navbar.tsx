
import React from 'react';
import { Page } from '../types';

interface NavbarProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  isAdmin?: boolean;
  isRegistered?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setPage, isAdmin, isRegistered }) => {
  const navItems = [
    { label: 'HOME', value: Page.Home },
    { label: 'READINGS', value: Page.ReadingPlan },
    { label: 'DASHBOARD', value: Page.Dashboard },
    { label: 'LEADERBOARD', value: Page.Leaderboard },
    { label: 'COMMUNITY', value: Page.Community },
    { label: 'JOURNAL', value: Page.Journal },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => setPage(Page.Home)}
          >
            <div className="relative mr-2">
                <div className="w-8 h-10 bg-[#FCE7D1] ribbon-shape absolute -top-1 left-0"></div>
                <span className="relative z-10 text-3xl font-black tracking-tight text-[#C41230]">
                    Readeem<span className="text-black">.</span>
                </span>
            </div>
          </div>

          <div className="hidden lg:flex space-x-6">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => setPage(item.value)}
                className={`text-[11px] tracking-[0.2em] font-extrabold transition-colors duration-200 ${
                  currentPage === item.value 
                  ? 'text-[#C41230]' 
                  : 'text-black hover:text-[#C41230]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {!isRegistered ? (
              <button
                onClick={() => setPage(Page.Join)}
                className="bg-[#C41230] text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all rounded-xl"
              >
                JOIN CLUB
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <button
                    onClick={() => setPage(Page.Admin)}
                    className={`text-[10px] px-4 py-1.5 rounded-full border-2 border-black font-black hover:bg-black hover:text-white transition-all uppercase tracking-widest ${currentPage === Page.Admin ? 'bg-black text-white' : 'text-black'}`}
                  >
                    Admin
                  </button>
                )}
                <div className="w-10 h-10 rounded-full border-2 border-[#C41230] flex items-center justify-center text-[#C41230] font-black text-sm">
                  SJ
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
