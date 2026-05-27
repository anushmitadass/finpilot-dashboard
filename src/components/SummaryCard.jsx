import React from 'react';
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';

export default function SummaryCard({ 
  title, 
  value, 
  change, 
  isPositive, 
  sparklineData = [], 
  icon: Icon,
  description
}) {
  
  // Render minimal SVG Sparkline without any glow layers
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length === 0) return null;
    
    const width = 100;
    const height = 30;
    const padding = 2;
    
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min === 0 ? 1 : max - min;
    
    const points = sparklineData.map((val, index) => {
      const x = padding + (index * (width - 2 * padding)) / (sparklineData.length - 1);
      const y = height - padding - ((val - min) * (height - 2 * padding)) / range;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl flex flex-col justify-between shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          <h3 className="text-xl lg:text-2xl font-bold tracking-tight text-white mt-1">
            {value}
          </h3>
        </div>
        
        {/* Simple Icon */}
        {Icon && (
          <div className="text-slate-500">
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between mt-4">
        <div>
          <div className="flex items-center gap-1">
            <span className={`flex items-center text-xs font-bold
              ${isPositive ? 'text-emerald-450' : 'text-rose-450'}
            `}>
              {isPositive ? <FiArrowUpRight className="w-3.5 h-3.5" /> : <FiArrowDownRight className="w-3.5 h-3.5" />}
              {change}
            </span>
            <span className="text-[10px] text-slate-500 ml-1">vs last month</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {description}
          </p>
        </div>

        {/* Minimal Sparkline Graphic */}
        <div className="pl-3">
          {renderSparkline()}
        </div>
      </div>
    </div>
  );
}
