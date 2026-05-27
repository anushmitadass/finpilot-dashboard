import React, { useState } from 'react';
import { 
  FiSearch, 
  FiCheckCircle, 
  FiClock, 
  FiAlertTriangle, 
  FiCoffee, 
  FiShoppingBag, 
  FiHome, 
  FiSliders, 
  FiArrowUpRight, 
  FiArrowDownRight,
  FiTv,
  FiPhone,
  FiMapPin
} from 'react-icons/fi';

export default function TransactionsList({ transactions = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const getStatusText = (status) => {
    const colors = {
      completed: 'text-emerald-550',
      pending: 'text-amber-550',
      failed: 'text-rose-550'
    };

    return (
      <span className={`text-xs font-bold ${colors[status] || 'text-slate-400'}`}>
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    const styles = {
      salary: 'bg-emerald-500/10 text-emerald-400',
      rent: 'bg-indigo-500/10 text-indigo-400',
      food: 'bg-cyan-500/10 text-cyan-400',
      recharge: 'bg-amber-500/10 text-amber-400',
      entertainment: 'bg-purple-500/10 text-purple-400',
      travel: 'bg-orange-500/10 text-orange-400',
      bills: 'bg-rose-500/10 text-rose-455'
    };

    const icons = {
      salary: <FiShoppingBag className="w-3.5 h-3.5" />,
      rent: <FiHome className="w-3.5 h-3.5" />,
      food: <FiCoffee className="w-3.5 h-3.5" />,
      recharge: <FiPhone className="w-3.5 h-3.5" />,
      entertainment: <FiTv className="w-3.5 h-3.5" />,
      travel: <FiMapPin className="w-3.5 h-3.5" />,
      bills: <FiSliders className="w-3.5 h-3.5" />
    };

    const currentStyle = styles[category] || 'bg-slate-800 text-slate-400';
    const currentIcon = icons[category] || <FiSliders className="w-3.5 h-3.5" />;

    return (
      <div className={`w-8 h-8 rounded flex items-center justify-center ${currentStyle}`}>
        {currentIcon}
      </div>
    );
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#111827] border border-slate-800 p-5 rounded-xl shadow-sm flex flex-col">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200">Recent Transactions</h3>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <div className="relative flex-1 sm:w-48">
            <FiSearch className="absolute left-3 top-2.5 text-slate-500 w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8.5 pl-8.5 pr-3 text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded focus:border-blue-500"
            />
          </div>
          
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8.5 px-3 pr-7 text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded focus:border-blue-550 cursor-pointer appearance-none"
            >
              <option value="all">All Categories</option>
              <option value="salary">Salary</option>
              <option value="rent">Rent</option>
              <option value="food">Food</option>
              <option value="recharge">Recharge</option>
              <option value="entertainment">Entertainment</option>
              <option value="travel">Travel</option>
              <option value="bills">Bills</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
              <th className="py-2.5 px-3">Transaction</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-xs">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-6 text-center text-slate-500 font-semibold">
                  No records found.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="py-2.5 px-3 flex items-center gap-2.5">
                    {getCategoryIcon(tx.category)}
                    <div>
                      <span className="font-bold text-slate-200 block truncate max-w-[150px] sm:max-w-xs">{tx.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono uppercase tracking-tight block mt-0.5">{tx.id}</span>
                    </div>
                  </td>
                  
                  <td className="py-2.5 px-3 text-slate-400 font-semibold text-xs">
                    {tx.date}
                  </td>
                  
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-bold text-slate-400 capitalize bg-slate-900/60 border border-slate-800/40 px-1.5 py-0.5 rounded">
                      {tx.category}
                    </span>
                  </td>
                  
                  <td className="py-2.5 px-3">
                    {getStatusText(tx.status)}
                  </td>
                  
                  <td className={`py-2.5 px-3 text-right font-bold text-xs
                    ${tx.isCredit ? 'text-emerald-450' : 'text-slate-200'}
                  `}>
                    <span className="flex items-center justify-end gap-0.5 font-mono">
                      {tx.isCredit ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
