import React, { useState } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  Layers,
  Smartphone,
  Truck,
  Users,
  Wallet,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';

export const SetupView: React.FC = () => {
  const {
    brands,
    models,
    suppliers,
    customers,
    dsrs,
    expenseCategories,
    addBrand,
    deleteBrand,
    addModel,
    deleteModel,
    addSupplier,
    deleteSupplier,
    addCustomer,
    deleteCustomer,
    addDSR,
    deleteDSR,
    addExpenseCategory,
    deleteExpenseCategory,
    resetToBlank,
    loadDemoData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'brands' | 'models' | 'suppliers' | 'customers' | 'dsr' | 'expense_cats' | 'system'>('brands');

  // Input States
  const [brandName, setBrandName] = useState('');
  const [modelBrand, setModelBrand] = useState('');
  const [modelName, setModelName] = useState('');
  const [modelPurPrice, setModelPurPrice] = useState<number>(0);
  const [modelSalePrice, setModelSalePrice] = useState<number>(0);

  const [supName, setSupName] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supAddress, setSupAddress] = useState('বরগুনা');
  const [supDue, setSupDue] = useState<number>(0);

  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('বরগুনা');
  const [custDue, setCustDue] = useState<number>(0);

  const [dsrName, setDsrName] = useState('');
  const [dsrPhone, setDsrPhone] = useState('');
  const [dsrRoute, setDsrRoute] = useState('');

  const [catName, setCatName] = useState('');

  const [msg, setMsg] = useState('');

  const showSuccess = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  // Handlers
  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    addBrand(brandName.trim());
    setBrandName('');
    showSuccess('ব্র্যান্ড সফলভাবে যোগ করা হয়েছে!');
  };

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelBrand || !modelName.trim()) return;
    addModel({
      brand: modelBrand,
      name: modelName.trim(),
      defaultPurchasePrice: modelPurPrice || undefined,
      defaultSalePrice: modelSalePrice || undefined,
    });
    setModelName('');
    setModelPurPrice(0);
    setModelSalePrice(0);
    showSuccess('মডেল সফলভাবে যোগ করা হয়েছে!');
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;
    addSupplier({
      name: supName.trim(),
      phone: supPhone.trim() || 'N/A',
      address: supAddress.trim(),
      initialDue: supDue || 0,
    });
    setSupName('');
    setSupPhone('');
    setSupDue(0);
    showSuccess('সাপ্লায়ার যুক্ত হয়েছে!');
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;
    addCustomer({
      name: custName.trim(),
      phone: custPhone.trim() || 'N/A',
      address: custAddress.trim(),
      openingDue: custDue || 0,
    });
    setCustName('');
    setCustPhone('');
    setCustDue(0);
    showSuccess('কাস্টমার যুক্ত হয়েছে!');
  };

  const handleAddDSR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dsrName.trim()) return;
    addDSR({
      name: dsrName.trim(),
      phone: dsrPhone.trim(),
      route: dsrRoute.trim() || 'বরগুনা শহর',
    });
    setDsrName('');
    setDsrPhone('');
    setDsrRoute('');
    showSuccess('DSR প্রতিনিধি যুক্ত হয়েছে!');
  };

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    addExpenseCategory(catName.trim());
    setCatName('');
    showSuccess('খরচ ক্যাটাগরি যুক্ত হয়েছে!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-blue-100 text-[#0B5ED7]">
            <Settings className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              সিস্টেম সেটআপ ও কনফিগারেশন (Setup)
            </h2>
            <p className="text-xs text-slate-500">
              আফিফা টেলিকম এন্ড ইলেকট্রনিক্স • বরগুনা
            </p>
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('brands')}
          className={`px-3.5 py-2 rounded-lg transition ${
            activeTab === 'brands' ? 'bg-[#0B5ED7] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ব্র্যান্ড সেটআপ ({brands.length})
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={`px-3.5 py-2 rounded-lg transition ${
            activeTab === 'models' ? 'bg-[#0B5ED7] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          মডেল সেটআপ ({models.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-3.5 py-2 rounded-lg transition ${
            activeTab === 'suppliers' ? 'bg-[#0B5ED7] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          সাপ্লায়ার ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-3.5 py-2 rounded-lg transition ${
            activeTab === 'customers' ? 'bg-[#0B5ED7] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          কাস্টমার ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('dsr')}
          className={`px-3.5 py-2 rounded-lg transition ${
            activeTab === 'dsr' ? 'bg-[#0B5ED7] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          DSR প্রতিনিধি ({dsrs.length})
        </button>
        <button
          onClick={() => setActiveTab('expense_cats')}
          className={`px-3.5 py-2 rounded-lg transition ${
            activeTab === 'expense_cats' ? 'bg-[#0B5ED7] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          খরচ ক্যাটাগরি ({expenseCategories.length})
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-3.5 py-2 rounded-lg transition ${
            activeTab === 'system' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ডাটা ম্যানেজমেন্ট / রিসেট
        </button>
      </div>

      {/* 1. BRANDS SETUP */}
      {activeTab === 'brands' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <form onSubmit={handleAddBrand} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
              + নতুন ব্র্যান্ড যুক্ত করুন
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ব্র্যান্ডের নাম</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="যেমন: Honor, Motorola"
                className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#0B5ED7] text-white font-bold text-xs rounded-lg shadow-xs"
            >
              ব্র্যান্ড যুক্ত করুন
            </button>
          </form>

          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
              সকল সক্রিয় ব্র্যান্ড তালিকা ({brands.length} টি)
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {brands.map((b) => (
                <div key={b.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                  <span className="font-bold text-slate-800 text-sm">{b.name}</span>
                  <button
                    onClick={() => deleteBrand(b.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. MODELS SETUP */}
      {activeTab === 'models' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <form onSubmit={handleAddModel} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
              + নতুন মডেল যুক্ত করুন
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ব্র্যান্ড নির্বাচন</label>
              <select
                value={modelBrand}
                onChange={(e) => setModelBrand(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none"
                required
              >
                <option value="">-- ব্র্যান্ড --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">মডেলের নাম</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="যেমন: Galaxy A15, Y28, C65"
                className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ডিফল্ট ক্রয় মূল্য (৳)</label>
                <input
                  type="number"
                  value={modelPurPrice || ''}
                  onChange={(e) => setModelPurPrice(Number(e.target.value))}
                  placeholder="0"
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ডিফল্ট বিক্রয় মূল্য (৳)</label>
                <input
                  type="number"
                  value={modelSalePrice || ''}
                  onChange={(e) => setModelSalePrice(Number(e.target.value))}
                  placeholder="0"
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#0B5ED7] text-white font-bold text-xs rounded-lg shadow-xs"
            >
              মডেল যুক্ত করুন
            </button>
          </form>

          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
              সকল মডেল তালিকা ({models.length} টি)
            </div>
            {models.length === 0 ? (
              <p className="p-8 text-center text-slate-400 text-xs">কোনো মডেল সংরক্ষিত নেই। বামের ফর্ম থেকে মডেল যোগ করুন।</p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs max-h-96 overflow-y-auto">
                {models.map((m) => (
                  <div key={m.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-900">{m.brand} {m.name}</span>
                      <div className="text-[11px] text-slate-500">
                        ক্রয়: ৳{m.defaultPurchasePrice || 0} • বিক্রয়: ৳{m.defaultSalePrice || 0}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteModel(m.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <form onSubmit={handleAddSupplier} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
              + নতুন সাপ্লায়ার / ডিস্ট্রিবিউটর
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">নাম</label>
              <input
                type="text"
                value={supName}
                onChange={(e) => setSupName(e.target.value)}
                placeholder="যেমন: স্মার্ট ডিস্ট্রিবিউশন"
                className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ফোন</label>
              <input
                type="text"
                value={supPhone}
                onChange={(e) => setSupPhone(e.target.value)}
                placeholder="017xxxxxxxx"
                className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">প্রারম্ভিক বাকি (যদি থাকে ৳)</label>
              <input
                type="number"
                value={supDue || ''}
                onChange={(e) => setSupDue(Number(e.target.value))}
                placeholder="0"
                className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#0B5ED7] text-white font-bold text-xs rounded-lg shadow-xs"
            >
              সাপ্লায়ার যুক্ত করুন
            </button>
          </form>

          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
              সকল সাপ্লায়ার তালিকা ({suppliers.length} টি)
            </div>
            {suppliers.length === 0 ? (
              <p className="p-8 text-center text-slate-400 text-xs">কোনো সাপ্লায়ার নেই।</p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {suppliers.map((s) => (
                  <div key={s.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                      <p className="text-slate-500">ফোন: {s.phone}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-rose-700">বাকি: {formatCurrency(s.totalDue)}</span>
                      <button
                        onClick={() => deleteSupplier(s.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <form onSubmit={handleAddCustomer} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
              + নতুন কাস্টমার
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">কাস্টমারের নাম</label>
              <input
                type="text"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                placeholder="যেমন: মো: রফিকুল ইসলাম"
                className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">মোবাইল</label>
              <input
                type="text"
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                placeholder="017xxxxxxxx"
                className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ঠিকানা</label>
              <input
                type="text"
                value={custAddress}
                onChange={(e) => setCustAddress(e.target.value)}
                placeholder="বরগুনা"
                className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ওপেনিং বাকি (৳)</label>
              <input
                type="number"
                value={custDue || ''}
                onChange={(e) => setCustDue(Number(e.target.value))}
                placeholder="0"
                className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none font-bold"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#0B5ED7] text-white font-bold text-xs rounded-lg shadow-xs"
            >
              কাস্টমার সংরক্ষণ করুন
            </button>
          </form>

          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
              সকল কাস্টমার তালিকা ({customers.length} টি)
            </div>
            {customers.length === 0 ? (
              <p className="p-8 text-center text-slate-400 text-xs">কোনো কাস্টমার সংরক্ষিত নেই।</p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs max-h-96 overflow-y-auto">
                {customers.map((c) => (
                  <div key={c.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                      <p className="text-slate-500">ফোন: {c.phone} • {c.address || 'বরগুনা'}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`font-bold ${c.currentDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        বাকি: {formatCurrency(c.currentDue)}
                      </span>
                      <button
                        onClick={() => deleteCustomer(c.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. DSR */}
      {activeTab === 'dsr' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <form onSubmit={handleAddDSR} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
              + নতুন DSR প্রতিনিধি যুক্ত করুন
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">DSR এর নাম</label>
              <input
                type="text"
                value={dsrName}
                onChange={(e) => setDsrName(e.target.value)}
                placeholder="যেমন: তানভীর হাসান"
                className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">মোবাইল</label>
              <input
                type="text"
                value={dsrPhone}
                onChange={(e) => setDsrPhone(e.target.value)}
                placeholder="016xxxxxxxx"
                className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">রুট / এলাকা</label>
              <input
                type="text"
                value={dsrRoute}
                onChange={(e) => setDsrRoute(e.target.value)}
                placeholder="যেমন: বরগুনা টাউন ও বাজার রোড"
                className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#0B5ED7] text-white font-bold text-xs rounded-lg shadow-xs"
            >
              DSR প্রতিনিধি যুক্ত করুন
            </button>
          </form>

          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
              সকল DSR তালিকা ({dsrs.length} জন)
            </div>
            {dsrs.length === 0 ? (
              <p className="p-8 text-center text-slate-400 text-xs">কোনো DSR প্রতিনিধি যুক্ত নেই।</p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {dsrs.map((d) => (
                  <div key={d.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{d.name}</span>
                      <p className="text-slate-500">ফোন: {d.phone} • রুট: {d.route || 'বরগুনা'}</p>
                    </div>
                    <button
                      onClick={() => deleteDSR(d.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. EXPENSE CATEGORIES */}
      {activeTab === 'expense_cats' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <form onSubmit={handleAddCat} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
              + নতুন খরচ ক্যাটাগরি
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ক্যাটাগরির নাম</label>
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="যেমন: জেনারেটর তেল খরচ"
                className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#0B5ED7] text-white font-bold text-xs rounded-lg shadow-xs"
            >
              ক্যাটাগরি যুক্ত করুন
            </button>
          </form>

          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
              সকল খরচ ক্যাটাগরি ({expenseCategories.length} টি)
            </div>
            <div className="divide-y divide-slate-100 text-xs max-h-96 overflow-y-auto">
              {expenseCategories.map((c) => (
                <div key={c.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                  <span className="font-semibold text-slate-900">{c.name}</span>
                  <button
                    onClick={() => deleteExpenseCategory(c.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. SYSTEM / DATA MANAGEMENT */}
      {activeTab === 'system' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 max-w-2xl">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center">
              <Database className="w-5 h-5 mr-2 text-slate-700" />
              ডাটাবেজ ও সাইট স্টেট কন্ট্রোল
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              ব্যবহারকারীর অনুরোধ অনুযায়ী সম্পূর্ণ ব্ল্যাঙ্ক সাইট নিশ্চিত করা বা প্রয়োজনে ডেমো টেস্ট ডাটা লোড করার অপশন
            </p>
          </div>

          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
            <h4 className="font-bold text-sm text-rose-900">সম্পূর্ণ ব্ল্যাঙ্ক সাইটে রিসেট করুন (Reset to Blank)</h4>
            <p className="text-xs text-rose-700">
              সমস্ত ট্রানজেকশন, পারচেজ, সেলস, ক্যাশ বুক, ইনভেন্টরি ফোন ও কাস্টমার তালিকা মুছে দিয়ে দোকান ব্যবহারের জন্য একদম নতুন ব্ল্যাঙ্ক স্টেটে ফিরে যাবে।
            </p>
            <button
              onClick={() => {
                if (window.confirm('আপনি কি নিশ্চিত সমস্ত ডাটা মুছে সাইটটি একদম ফ্রেশ ব্ল্যাঙ্ক করতে চান?')) {
                  resetToBlank();
                  showSuccess('সাইট সম্পূর্ণ আপডেট ব্ল্যাঙ্ক করা হয়েছে!');
                }
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition"
            >
              সম্পূর্ণ ডাটা মুছে ব্ল্যাঙ্ক করুন
            </button>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
            <h4 className="font-bold text-sm text-blue-900">টেস্টিং ডেমো সেটআপ লোড করুন (Load Demo Entities)</h4>
            <p className="text-xs text-blue-700">
              টেস্ট করার সুবিধার্থে কয়েকটি স্ট্যান্ডার্ড সাপ্লায়ার, কাস্টমার, DSR ও মডেল নাম লোড হবে।
            </p>
            <button
              onClick={() => {
                loadDemoData();
                showSuccess('ডেমো সেটআপ ডাটা সফলভাবে যুক্ত করা হয়েছে!');
              }}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition"
            >
              ডেমো সেটআপ লোড করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
