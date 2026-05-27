import React, { useState } from 'react';
import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend
} from 'recharts';
import { FiBarChart2, FiPieChart, FiTrendingUp } from 'react-icons/fi';

export default function AnalyticsCharts({ transactions = [] }) {
  const [chartType, setChartType] = useState('bar'); // State options: 'bar' | 'pie' | 'line'

  // Step A: Aggregate raw transactions data into structured categories
  const categoryMap = transactions.reduce((acc, current) => {
    // Standardize key values to lowercase labels
    const cat = current.category ? current.category.toLowerCase() : 'other';
    const amount = Math.abs(current.amount);
    acc[cat] = (acc[cat] || 0) + amount;
    return acc;
  }, {});

  // Step B: Convert mapped keys into readable chart-ready arrays
  const chartData = Object.keys(categoryMap).map(category => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: categoryMap[category]
  }));

  // Fallback state context checker if zero outflows are posted yet
  if (chartData.length === 0) {
    return (
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl text-center text-slate-500 text-xs py-12">
        No expense distribution patterns detected yet. Log a transaction metric to unlock data visualization modules.
      </div>
    );
  }

  // Premium accessible dark palettes
  const COLORS = ['#2563eb', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981'];

  // Custom Static Render Block to enforce fixed text markers over floating windows
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 22;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="#94a3b8" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-bold tracking-wide">
        {name}: ₹{value.toLocaleString('en-IN')}
      </text>
    );
  };

  return (
    <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl space-y-5">

      {/* HEADER CONTROLLER: Hot-swappable Matrix Selections */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/60 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">Category Spending Breakdown</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Aggregated outflow distribution matrix</p>
        </div>

        {/* Dynamic Nav Control Selection Bar pills */}
        <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-lg gap-1 w-full sm:w-auto">
          <button
            onClick={() => setChartType('bar')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer
              ${chartType === 'bar' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <FiBarChart2 className="w-3.5 h-3.5" />
            <span>Bar view</span>
          </button>

          <button
            onClick={() => setChartType('pie')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer
              ${chartType === 'pie' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <FiPieChart className="w-3.5 h-3.5" />
            <span>Pie view</span>
          </button>

          <button
            onClick={() => setChartType('line')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer
              ${chartType === 'line' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <FiTrendingUp className="w-3.5 h-3.5" />
            <span>Line view</span>
          </button>
        </div>
      </div>

      {/* CORE RENDER FRAMEWAY CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">

        {/* Dynamic Recharts View Layer */}
        <div className="lg:col-span-2 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' && (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} fontWeight="bold" />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={45}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}

            {chartType === 'pie' && (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={renderCustomizedLabel}
                  outerRadius={75}
                  innerRadius={45}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            )}

            {chartType === 'line' && (
              <LineChart data={chartData} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} fontWeight="bold" />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "#0b0f19" }} activeDot={{ r: 6 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* STATIC DATA MATRIX LEGEND: No floating tooltips, clean and readable permanent view */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-2.5 max-h-60 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-800 pb-1.5">
            Static Distribution Log
          </p>
          {chartData.map((item, index) => {
            const sumTotal = chartData.reduce((a, b) => a + b.value, 0);
            const percentageValue = ((item.value / sumTotal) * 100).toFixed(1);

            return (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-bold text-slate-300 truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 text-right shrink-0">
                  <span className="font-mono font-semibold text-slate-200">₹{item.value.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                    {percentageValue}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}