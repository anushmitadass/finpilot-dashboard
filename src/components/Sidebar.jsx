import React from 'react';
import {
  FiPieChart, FiSettings, FiMoon, FiSun, FiLogOut,
  FiList, FiBarChart2, FiCpu, FiFilter
} from 'react-icons/fi';

export default function Sidebar({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  darkMode,
  setDarkMode,
  handleLogout
}) {

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard Overview', icon: FiPieChart },
    { id: 'transactions', name: 'Recent Transactions', icon: FiList },
    { id: 'charts', name: 'Analytics & Charts', icon: FiBarChart2 },
    { id: 'ai-analyst', name: 'AI Financial Analyst', icon: FiCpu },
    { id: 'filters', name: 'Activity Filters', icon: FiFilter },
    { id: 'settings', name: 'Settings', icon: FiSettings },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r-2 w-80 p-4 transition-all duration-300 
      ${darkMode ? 'bg-[#0f1422] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'} 
      ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      {/* Brand Branding Header - Enriched Premium Design Blocks */}
      <div className="p-4 mb-6 border-b-2 border-slate-800/60 flex items-center gap-4 bg-gradient-to-r from-blue-950/20 to-transparent rounded-2xl">
        <div className="p-3.5 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 ring-4 ring-blue-500/10">
          <FiPieChart className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-wider text-white uppercase leading-none">
            Fin<span className="text-blue-500">Pilot</span>
          </h1>
          <p className="text-[10px] text-slate-400 mt-1 font-bold tracking-widest uppercase">System Admin</p>
        </div>
      </div>

      {/* Navigation Routes List Stack - Giant Padding & Big Fonts */}
      <nav className="flex-1 space-y-2 px-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-black border-0 transition-all cursor-pointer text-left
                ${isActive
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-[1.02]'
                  : darkMode ? 'hover:bg-slate-900/80 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Settings Options Blocks Footer Layout */}
      <div className="p-2 border-t-2 border-slate-800/40 space-y-2 mt-auto">
        {/* Light/Dark Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-xs font-black border-0 cursor-pointer text-left transition-all
            ${darkMode ? 'text-amber-400 hover:bg-slate-900/60' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          <span>{darkMode ? 'Switch Light Mode' : 'Switch Dark Mode'}</span>
        </button>

        {/* Global Safety Signout button option */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-xs font-black border-0 cursor-pointer text-left text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <FiLogOut className="w-5 h-5" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </aside>
  );
}