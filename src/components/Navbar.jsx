import React from 'react';
import { FiMenu, FiBell } from 'react-icons/fi';

export default function Navbar({ activeTab, setMobileOpen, darkMode }) {
  const userObj = JSON.parse(localStorage.getItem('finpilot_user')) || { username: 'User' };
  const initialLetter = userObj.username ? userObj.username.charAt(0).toUpperCase() : 'U';

  return (
    <header className={`h-16 border-b flex items-center justify-between px-4 sticky top-0 z-40 transition-colors duration-200
      ${darkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'}`}>

      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Burger icon trigger */}
        <button
          onClick={() => setMobileOpen(true)}
          className={`lg:hidden p-2 rounded-lg transition-colors cursor-pointer
            ${darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
        >
          <FiMenu className="w-5 h-5" />
        </button>
        <h1 className={`text-sm font-bold capitalize tracking-wide ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {activeTab} Overview
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button className={`p-2 rounded-lg relative ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
          <FiBell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
        </button>

        <div className={`flex items-center gap-2 pl-2 border-l ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {initialLetter}
          </div>
          <span className={`text-xs font-semibold hidden sm:inline-block ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            {userObj.username}
          </span>
        </div>
      </div>
    </header>
  );
}