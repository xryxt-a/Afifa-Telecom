import React, { useState } from 'react';
import { ShieldAlert, Plus, Printer, CheckCircle, AlertCircle, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';
import { PriceProtection } from '../types';

export const PriceProtectionView: React.FC = () => {
  const { brands, models, suppliers, priceProtections, addPriceProtection, phones } = useApp();
  const todayStr = new Date().toISOString().split('T')[0];

  const [showForm, setShowForm] = useState(false);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [oldPrice, setOldPrice] = useState<number>(0);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [qtyClaimed, setQtyClaimed] = useState<number>(1);
  const [supplierName, setSupplierName] = useState('');
  const [notes, setNotes] = useState('');

  const [msg, setMsg] = useState('');

  // Drop per unit
  const dropPerUnit = Math.max(0, (oldPrice || 0) - (newPrice || 0));
  const totalProtectionAmount = dropPerUnit * (qtyClaimed || 0);

  // Auto detect in-stock qty for this model
  const inStockQty = (brand && model)
    ? phones.filter((p) => p.brand === brand && p.model === model && p.status === 'in_stock').length
    : 0;

  const handleModelChange = (mName: string) => {
    setModel(mName);
    const m = models.find((item) => item.brand === brand && item.name === mName);
    if (m && m.defaultPurchasePrice) {
      setOldPrice(m.defaultPurchasePrice);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model) return;
    if (dropPerUnit <= 0) {
      alert('নতুন মূল্য অবশ্যই আগের মূল্যের চেয়ে কম হতে হবে!');
      return;
    }

    addPriceProtection({
      date: todayStr,
      brand,
      model,
      oldPrice,
      newPrice,
      dropPerUnit,
      totalQtyClaimed: qtyClaimed,
      totalProtectionAmount,
      supplierName: supplierName || 'কোম্পানি ডিস্ট্রিবিউশন',
      status: 'claimed',
      notes,
    });

    setMsg('প্রাইস প্রটেকশন ক্লেইম সফলভাবে নথিভুক্ত হয়েছে!');
    setTimeout(() => setMsg(''), 3000);
    setShowForm(false);
    setModel('');
    setOldPrice(0);
    setNewPrice(0);
    setNotes('');
  };

  const totalClaimedAmount = priceProtections.reduce((acc, p) => acc + p.totalProtectionAmount, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-rose-100 text-rose-700">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              প্রাইস প্রটেকশন (Price Drop Compensation)
            </h2>
            <p className="text-xs text-slate-500">
              কোম্পানির মূল্য হ্রাসে স্টক ফোনের ক্ষতিপূরণ ক্লেইম • বরগুনা
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-[#0B5ED7] hover:bg-[#0A4AB0] text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ নতুন প্রটেকশন ক্লেইম</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <span className="text-xs text-slate-500 block">মোট ক্লেইম সংখ্যা:</span>
          <strong className="text-lg font-bold text-slate-900">{priceProtections.length} টি</strong>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 block">মোট ক্লেইম কৃত ক্ষতিপূরণ টাকা:</span>
          <strong className="text-xl font-bold text-rose-700">{formatCurrency(totalClaimedAmount)}</strong>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-5 rounded-xl border-2 border-blue-400 shadow-md space-y-4 animate-fadeIn"
        >
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
            + কোম্পানির প্রাইস ড্রপ ক্ষতিপূরণ ক্লেইম এন্ট্রি
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ব্র্যান্ড</label>
              <select
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  setModel('');
                }}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                required
              >
                <option value="">-- ব্র্যান্ড --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">মডেল</label>
              <select
                value={model}
                onChange={(e) => handleModelChange(e.target.value)}
                disabled={!brand}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                required
              >
                <option value="">-- মডেল --</option>
                {models.filter((m) => m.brand === brand).map((m) => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">সাপ্লায়ার / ডিস্ট্রিবিউটর</label>
              <select
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none"
              >
                <option value="">-- সাপ্লায়ার --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">আগের ক্রয় মূল্য (৳)</label>
              <input
                type="number"
                value={oldPrice || ''}
                onChange={(e) => setOldPrice(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">নতুন হ্রাসকৃত মূল্য (৳)</label>
              <input
                type="number"
                value={newPrice || ''}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none font-bold text-rose-700"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ক্লেইম কোয়ান্টিটি (স্টকে আছে: {inStockQty} টি)
              </label>
              <input
                type="number"
                value={qtyClaimed || ''}
                onChange={(e) => setQtyClaimed(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none font-bold text-blue-700"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">মোট দাবি টাকা</label>
              <div className="p-2 border border-slate-300 rounded-lg bg-slate-100 font-bold text-rose-700">
                {formatCurrency(totalProtectionAmount)}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0B5ED7] text-white font-bold text-xs sm:text-sm rounded-lg"
            >
              ক্লেইম সংরক্ষণ করুন
            </button>
          </div>
        </form>
      )}

      {/* List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs sm:text-sm text-slate-800">
          প্রাইস প্রটেকশন দাবি তালিকা ({priceProtections.length} টি)
        </div>

        {priceProtections.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
            কোনো প্রাইস প্রটেকশন ক্লেইম নেই।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3">ব্র্যান্ড ও মডেল</th>
                  <th className="p-3">সাপ্লায়ার</th>
                  <th className="p-3">পূর্বের মূল্য</th>
                  <th className="p-3">নতুন মূল্য</th>
                  <th className="p-3">ড্রপ / পিস</th>
                  <th className="p-3 text-center">পরিমাণ</th>
                  <th className="p-3 text-right">মোট দাবি টাকা</th>
                  <th className="p-3 text-center">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {priceProtections.map((pp) => (
                  <tr key={pp.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-600">{pp.date}</td>
                    <td className="p-3 font-semibold text-slate-900">{pp.brand} {pp.model}</td>
                    <td className="p-3 text-slate-700">{pp.supplierName}</td>
                    <td className="p-3">{formatCurrency(pp.oldPrice)}</td>
                    <td className="p-3 font-bold text-rose-700">{formatCurrency(pp.newPrice)}</td>
                    <td className="p-3 text-rose-600 font-semibold">{formatCurrency(pp.dropPerUnit)}</td>
                    <td className="p-3 text-center font-bold">{pp.totalQtyClaimed} টি</td>
                    <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(pp.totalProtectionAmount)}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {pp.status}
                      </span>
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
