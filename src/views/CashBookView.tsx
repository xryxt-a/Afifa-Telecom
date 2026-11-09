import React, { useState } from 'react';
import { BookOpen, ArrowDownLeft, ArrowUpRight, Wallet, Calendar, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';

export const CashBookView: React.FC = () => {
  const { cashBook } = useApp();

  const [filterDate, setFilterDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMethod, setFilterMethod] = useState('');

  // Filter entries
  const filteredEntries = cashBook.filter((entry) => {
    if (filterDate && entry.date !== filterDate) return false;
    if (filterCategory && entry.category !== filterCategory) return false;
    if (filterMethod && entry.paymentMethod !== filterMethod) return false;
    return true;
  });

  // Calculate totals
  const totalCashIn = filteredEntries
    .filter((e) => e.type === 'cash_in')
    .reduce((acc, e) => acc + e.amount, 0);

  const totalCashOut = filteredEntries
    .filter((e) => e.type === 'cash_out')
    .reduce((acc, e) => acc + e.amount, 0);

  const netBalance = totalCashIn - totalCashOut;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-blue-100 text-[#0B5ED7]">
            <BookOpen className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              দৈনিক ক্যাশ বুক ও লেনদেন খতিয়ান
            </h2>
            <p className="text-xs text-slate-500">
              আফিফা টেলিকম এন্ড ইলেকট্রনিক্স • বরগুনা
            </p>
          </div>
        </div>
      </div>

      {/* Top 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Cash In */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">মোট ক্যাশ ইন (জমা)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700">
            {formatCurrency(totalCashIn)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">সেলস ও বাকি কালেকশন</p>
        </div>

        {/* Cash Out */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">মোট ক্যাশ আউট (খরচ ও প্রদান)</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-700">
            {formatCurrency(totalCashOut)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">পারচেজ, খরচ ও সাপ্লায়ার পেমেন্ট</p>
        </div>

        {/* Closing Balance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs ring-1 ring-blue-500/20">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">ক্লোজিং ব্যালেন্স / হাতে ক্যাশ</span>
            <Wallet className="w-4 h-4 text-[#0B5ED7]" />
          </div>
          <div className={`text-xl sm:text-2xl font-bold ${netBalance >= 0 ? 'text-[#0B5ED7]' : 'text-rose-700'}`}>
            {formatCurrency(netBalance)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">ক্যাশ ইন - ক্যাশ আউট</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-600 mb-1">তারিখ ফিল্টার</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-600 mb-1">ক্যাটাগরি</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none"
          >
            <option value="">-- সব ক্যাটাগরি --</option>
            <option value="সেলস">সেলস</option>
            <option value="পারচেজ">পারচেজ</option>
            <option value="সেলস রিটার্ন">সেলস রিটার্ন</option>
            <option value="বাকি কালেকশন">বাকি কালেকশন</option>
            <option value="সাপ্লায়ার পেমেন্ট">সাপ্লায়ার পেমেন্ট</option>
            <option value="দোকান খরচ">দোকান খরচ</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-600 mb-1">পেমেন্ট মেথড</label>
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none"
          >
            <option value="">-- সব মেথড --</option>
            <option value="cash">ক্যাশ (Cash)</option>
            <option value="bkash">বিকাশ (bKash)</option>
            <option value="nagad">নগদ (Nagad)</option>
            <option value="bank">ব্যাংক (Bank)</option>
          </select>
        </div>
      </div>

      {/* Cash Book Entries Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs sm:text-sm text-slate-800">
            লেনদেন হিস্ট্রি ({filteredEntries.length} টি রেকর্ড)
          </h3>
          {(filterDate || filterCategory || filterMethod) && (
            <button
              onClick={() => {
                setFilterDate('');
                setFilterCategory('');
                setFilterMethod('');
              }}
              className="text-xs text-blue-700 hover:underline font-semibold"
            >
              ফিল্টার মুছুন
            </button>
          )}
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
            কোনো লেনদেন পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-100/70 font-semibold text-slate-600">
                <tr>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3">বিবরণ</th>
                  <th className="p-3">ক্যাটাগরি</th>
                  <th className="p-3">মাধ্যম</th>
                  <th className="p-3 text-right">ক্যাশ ইন (জমা ৳)</th>
                  <th className="p-3 text-right">ক্যাশ আউট (খরচ ৳)</th>
                  <th className="p-3 text-center">এন্ট্রি কারী</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-600">{entry.date}</td>
                    <td className="p-3 font-semibold text-slate-900">{entry.description}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800">
                        {entry.category}
                      </span>
                    </td>
                    <td className="p-3 uppercase text-[11px] font-mono text-slate-600">
                      {entry.paymentMethod}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-700">
                      {entry.type === 'cash_in' ? formatCurrency(entry.amount) : '-'}
                    </td>
                    <td className="p-3 text-right font-bold text-rose-700">
                      {entry.type === 'cash_out' ? formatCurrency(entry.amount) : '-'}
                    </td>
                    <td className="p-3 text-center text-slate-500 text-[11px]">
                      {entry.createdBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
