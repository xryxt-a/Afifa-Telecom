import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Info,
  Store,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, computeStockMatrix, StockSummaryRow } from '../utils/helpers';
import { PhoneItem, IMEIStatus } from '../types';

export const StockView: React.FC = () => {
  const { brands, phones, dsrs } = useApp();

  // Filters
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | IMEIStatus>('all');
  const [imeiSearch, setImeiSearch] = useState('');

  // Expanded Brand in Summary
  const [activeBrandTab, setActiveBrandTab] = useState<string | null>(null);

  // Selected phone for Full History Modal
  const [inspectedPhone, setInspectedPhone] = useState<PhoneItem | null>(null);

  // Active sub-tab in Stock page: 'hierarchy' | 'dsr_stock' | 'low_stock' | 'all_imei'
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'dsr_stock' | 'low_stock' | 'all_imei'>('hierarchy');

  // Compute stock matrix
  const matrix = computeStockMatrix(phones);

  // Unique brands present in stock
  const allBrands = Array.from(new Set(matrix.map((r) => r.brand)));

  // Available models based on selected brand
  const filteredModels = selectedBrand
    ? Array.from(new Set(matrix.filter((r) => r.brand === selectedBrand).map((r) => r.model)))
    : Array.from(new Set(matrix.map((r) => r.model)));

  // Filtered rows for model table
  const filteredMatrix = matrix.filter((row) => {
    if (selectedBrand && row.brand !== selectedBrand) return false;
    if (selectedModel && row.model !== selectedModel) return false;
    return true;
  });

  // Filtered individual IMEI phones
  const filteredPhones = phones.filter((p) => {
    if (selectedBrand && p.brand !== selectedBrand) return false;
    if (selectedModel && p.model !== selectedModel) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (imeiSearch.trim()) {
      const term = imeiSearch.trim().toLowerCase();
      if (!p.imei.toLowerCase().includes(term) && !p.model.toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });

  // Brand Summary calculation
  const brandSummaries = allBrands.map((brandName) => {
    const brandRows = matrix.filter((r) => r.brand === brandName);
    const totalModels = brandRows.length;
    const totalPurchased = brandRows.reduce((acc, r) => acc + r.purchasedQty, 0);
    const totalSold = brandRows.reduce((acc, r) => acc + r.soldQty, 0);
    const totalInStock = brandRows.reduce((acc, r) => acc + r.finalStockQty, 0);
    const totalWithDsr = brandRows.reduce((acc, r) => acc + r.dsrCurrentQty, 0);
    const totalValue = brandRows.reduce((acc, r) => acc + r.totalStockValue, 0);

    return {
      brandName,
      totalModels,
      totalPurchased,
      totalSold,
      totalInStock,
      totalWithDsr,
      totalValue,
    };
  });

  // Overall totals
  const totalStoreStock = matrix.reduce((acc, r) => acc + r.finalStockQty, 0);
  const totalDSRStock = matrix.reduce((acc, r) => acc + r.dsrCurrentQty, 0);
  const totalStockValue = matrix.reduce((acc, r) => acc + r.totalStockValue, 0);
  const lowStockRows = matrix.filter((r) => r.isLowStock);

  // Status Badge Helper
  const renderStatusBadge = (status: IMEIStatus, dsrName?: string) => {
    switch (status) {
      case 'in_stock':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">ইন স্টক (দোকান)</span>;
      case 'sold':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">বিক্রি হয়েছে</span>;
      case 'with_dsr':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
            DSR এর কাছে ({dsrName || 'অজ্ঞাত'})
          </span>
        );
      case 'in_warranty':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">ওয়ারেন্টি সার্ভিসে</span>;
      case 'sales_return':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">সেলস রিটার্ন</span>;
      case 'damage':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">ড্যামেজ</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-blue-100 text-[#0B5ED7]">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                মেইন স্টক (ব্র্যান্ড ওয়াইজ ও মডেল ওয়াইজ)
              </h2>
              <p className="text-xs text-slate-500">
                আফিফা টেলিকম এন্ড ইলেকট্রনিক্স • বরগুনা • সম্পূর্ণ লাইভ ইনভেন্টরি
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-slate-500">দোকান স্টক:</span>{' '}
            <strong className="text-blue-700 text-sm">{totalStoreStock} টি</strong>
          </div>
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-slate-500">DSR স্টক:</span>{' '}
            <strong className="text-amber-700 text-sm">{totalDSRStock} টি</strong>
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span className="text-slate-500">মোট স্টক ভ্যালু:</span>{' '}
            <strong className="text-emerald-700 text-sm">{formatCurrency(totalStockValue)}</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl text-xs sm:text-sm font-semibold max-w-xl">
        <button
          type="button"
          onClick={() => setActiveTab('hierarchy')}
          className={`flex-1 py-2 text-center rounded-lg transition ${
            activeTab === 'hierarchy' ? 'bg-[#0B5ED7] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ব্র্যান্ড ও মডেল স্টক
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('all_imei')}
          className={`flex-1 py-2 text-center rounded-lg transition ${
            activeTab === 'all_imei' ? 'bg-[#0B5ED7] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          IMEI ওয়াইজ তালিকা ({filteredPhones.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dsr_stock')}
          className={`flex-1 py-2 text-center rounded-lg transition ${
            activeTab === 'dsr_stock' ? 'bg-[#0B5ED7] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          DSR স্টক ({totalDSRStock})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('low_stock')}
          className={`flex-1 py-2 text-center rounded-lg transition ${
            activeTab === 'low_stock' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          লো স্টক অ্যালার্ট ({lowStockRows.length})
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-600 mb-1">ব্র্যান্ড ফিল্টার</label>
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setSelectedModel('');
            }}
            className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none"
          >
            <option value="">-- সব ব্র্যান্ড ({allBrands.length}) --</option>
            {allBrands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-600 mb-1">মডেল ফিল্টার</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none"
          >
            <option value="">-- সব মডেল ({filteredModels.length}) --</option>
            {filteredModels.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-600 mb-1">স্ট্যাটাস ফিল্টার</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none font-medium"
          >
            <option value="all">-- সব স্ট্যাটাস --</option>
            <option value="in_stock">ইন স্টক (দোকান)</option>
            <option value="with_dsr">DSR এর কাছে</option>
            <option value="sold">বিক্রি হয়েছে</option>
            <option value="in_warranty">ওয়ারেন্টি সার্ভিসে</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-600 mb-1">IMEI সার্চ (১৫ ডিজিট)</label>
          <div className="relative">
            <input
              type="text"
              value={imeiSearch}
              onChange={(e) => setImeiSearch(e.target.value)}
              placeholder="IMEI টাইপ করুন..."
              className="w-full p-2 pl-7 border border-slate-300 rounded-lg bg-slate-50 outline-none font-mono text-xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
          </div>
        </div>
      </div>

      {/* TAB 1: Brand & Model Hierarchy View */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-6">
          {/* ক) ব্র্যান্ড ওয়াইজ স্টক সামারি কার্ডস */}
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-700 uppercase tracking-wider mb-3 flex items-center">
              <Store className="w-4 h-4 mr-1 text-[#0B5ED7]" />
              ক) ব্র্যান্ড ওয়াইজ স্টক সামারি
            </h3>

            {brandSummaries.length === 0 ? (
              <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs sm:text-sm">
                এখনো কোনো স্টক এন্ট্রি করা হয়নি। নিউ পারচেজে গিয়ে ফোন যোগ করুন।
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {brandSummaries.map((b) => (
                  <div
                    key={b.brandName}
                    onClick={() => {
                      setSelectedBrand(selectedBrand === b.brandName ? '' : b.brandName);
                    }}
                    className={`cursor-pointer p-4 rounded-xl border transition shadow-xs ${
                      selectedBrand === b.brandName
                        ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/30'
                        : 'bg-white border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-base text-slate-900">{b.brandName}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-[#0B5ED7]">
                        {b.totalInStock} টি স্টকে
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>মোট মডেল:</span>
                        <strong>{b.totalModels} টি</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>মোট ক্রয়:</span>
                        <span>{b.totalPurchased} টি</span>
                      </div>
                      <div className="flex justify-between">
                        <span>মোট বিক্রয়:</span>
                        <span className="text-emerald-700 font-semibold">{b.totalSold} টি</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DSR এর কাছে:</span>
                        <span className="text-amber-700 font-semibold">{b.totalWithDsr} টি</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
                        <span>স্টক মূল্য:</span>
                        <span>{formatCurrency(b.totalValue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* খ) মডেল ওয়াইজ স্টক সামারি টেবিল */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-slate-800">
                খ) মডেল ওয়াইজ বিস্তারিত স্টক সামারি {selectedBrand ? `(${selectedBrand})` : ''}
              </h3>
              <span className="text-xs text-slate-500">
                মোট মডেল: <strong className="text-blue-700">{filteredMatrix.length} টি</strong>
              </span>
            </div>

            {filteredMatrix.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
                কোনো মডেল স্টক পাওয়া যায়নি।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-slate-200">
                  <thead className="bg-slate-100/80 font-bold text-slate-700">
                    <tr>
                      <th className="p-3">ব্র্যান্ড ও মডেল</th>
                      <th className="p-3 text-center">মোট ক্রয়</th>
                      <th className="p-3 text-center">মোট বিক্রয়</th>
                      <th className="p-3 text-center">DSR স্টক</th>
                      <th className="p-3 text-center bg-blue-50 text-blue-900">ফাইনাল স্টক</th>
                      <th className="p-3">গড় ক্রয় মূল্য</th>
                      <th className="p-3">ধার্যকৃত বিক্রয়</th>
                      <th className="p-3 text-right">স্টক ভ্যালু</th>
                      <th className="p-3 text-center">অ্যালার্ট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredMatrix.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">
                          <span className="text-blue-700">{row.brand}</span> {row.model}
                        </td>
                        <td className="p-3 text-center font-medium">{row.purchasedQty} টি</td>
                        <td className="p-3 text-center font-medium text-emerald-700">{row.soldQty} টি</td>
                        <td className="p-3 text-center font-medium text-amber-700">{row.dsrCurrentQty} টি</td>
                        <td className="p-3 text-center font-bold text-sm bg-blue-50/50 text-[#0B5ED7]">
                          {row.finalStockQty} টি
                        </td>
                        <td className="p-3">{formatCurrency(row.avgPurchasePrice)}</td>
                        <td className="p-3 font-semibold text-slate-700">{formatCurrency(row.avgSalePrice)}</td>
                        <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(row.totalStockValue)}</td>
                        <td className="p-3 text-center">
                          {row.isLowStock ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                              লো স্টক ({row.finalStockQty})
                            </span>
                          ) : (
                            <span className="text-emerald-600 text-[11px] font-medium">পর্যাপ্ত</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: All IMEI Wise Table (With Click for Full History) */}
      {activeTab === 'all_imei' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-xs sm:text-sm text-slate-800">
              গ) IMEI ওয়াইজ সম্পূর্ণ স্টক তালিকা ({filteredPhones.length} টি)
            </h3>
            <span className="text-xs text-slate-500">IMEI তে ক্লিক করলে ফুল হিস্ট্রি দেখা যাবে</span>
          </div>

          {filteredPhones.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
              মিল রাখা কোনো ফোন পাওয়া যায়নি।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-100/80 font-bold text-slate-700">
                  <tr>
                    <th className="p-3">IMEI (১৫ ডিজিট)</th>
                    <th className="p-3">ব্র্যান্ড ও মডেল</th>
                    <th className="p-3 text-center">স্ট্যাটাস</th>
                    <th className="p-3">ক্রয় মূল্য</th>
                    <th className="p-3">বিক্রয় মূল্য</th>
                    <th className="p-3">কেনার তারিখ</th>
                    <th className="p-3">সাপ্লায়ার / ক্রেতা / DSR</th>
                    <th className="p-3 text-right">হিস্ট্রি</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredPhones.map((phone) => (
                    <tr
                      key={phone.imei}
                      className="hover:bg-blue-50/50 cursor-pointer"
                      onClick={() => setInspectedPhone(phone)}
                    >
                      <td className="p-3 font-mono font-bold text-blue-700">
                        {phone.imei}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        {phone.brand} {phone.model}
                      </td>
                      <td className="p-3 text-center">
                        {renderStatusBadge(phone.status, phone.dsrName)}
                      </td>
                      <td className="p-3 font-medium">{formatCurrency(phone.purchasePrice)}</td>
                      <td className="p-3 font-medium text-slate-700">{formatCurrency(phone.salePrice)}</td>
                      <td className="p-3 text-slate-500">{phone.purchaseDate}</td>
                      <td className="p-3 text-slate-600">
                        {phone.status === 'sold' && phone.customerName && (
                          <span>ক্রেতা: <strong>{phone.customerName}</strong></span>
                        )}
                        {phone.status === 'with_dsr' && phone.dsrName && (
                          <span>DSR: <strong>{phone.dsrName}</strong></span>
                        )}
                        {phone.status === 'in_stock' && phone.supplierName && (
                          <span>উৎস: {phone.supplierName}</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-[#0B5ED7] hover:underline font-semibold text-[11px] flex items-center justify-end">
                          ডিটেইলস <ChevronRight className="w-3 h-3 ml-0.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DSR Wise Stock */}
      {activeTab === 'dsr_stock' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
          <h3 className="font-bold text-sm sm:text-base text-slate-800 border-b border-slate-100 pb-2 flex items-center">
            <Users className="w-4 h-4 mr-1.5 text-amber-600" />
            ঘ) DSR ওয়াইজ স্টক তালিকা (ব্র্যান্ড ও মডেল সহ)
          </h3>

          {dsrs.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">কোনো DSR প্রতিনিধি যুক্ত করা হয়নি। সেটআপ মেনু থেকে DSR যোগ করুন।</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dsrs.map((d) => {
                const heldPhones = phones.filter((p) => p.status === 'with_dsr' && p.dsrId === d.id);
                return (
                  <div key={d.id} className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-900">{d.name}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white">
                        {heldPhones.length} টি ফোন
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">ফোন: {d.phone} {d.route && `• রুট: ${d.route}`}</p>

                    <div className="pt-2 border-t border-amber-200">
                      <span className="text-xs font-bold text-slate-700 block mb-1">ফোনের বিবরণ:</span>
                      {heldPhones.length === 0 ? (
                        <p className="text-xs text-slate-400">বর্তমানে কোনো ফোন ইস্যু করা নেই</p>
                      ) : (
                        <div className="space-y-1 text-xs">
                          {heldPhones.map((p) => (
                            <div key={p.imei} className="flex justify-between items-center py-0.5 font-mono text-[11px] text-slate-800">
                              <span>{p.brand} {p.model}</span>
                              <span className="text-amber-800 font-bold">{p.imei}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Low Stock Alert */}
      {activeTab === 'low_stock' && (
        <div className="bg-white rounded-xl border border-rose-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-sm text-rose-900">
                ঙ) লো স্টক অ্যালার্ট (যে মডেলের দোকানে স্টক ২ বা তার কম)
              </h3>
            </div>
          </div>

          {lowStockRows.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs sm:text-sm">
              আলহামদুলিল্লাহ! সব মডেলের স্টক পর্যাপ্ত আছে (২ এর বেশি)।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-rose-100/60 font-bold text-rose-900">
                  <tr>
                    <th className="p-3">ব্র্যান্ড ও মডেল</th>
                    <th className="p-3 text-center">বর্তমান ইন স্টক</th>
                    <th className="p-3 text-center">DSR এর কাছে</th>
                    <th className="p-3">গড় ক্রয় মূল্য</th>
                    <th className="p-3">বিক্রয় মূল্য</th>
                    <th className="p-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {lowStockRows.map((r, i) => (
                    <tr key={i} className="hover:bg-rose-50/40">
                      <td className="p-3 font-bold text-slate-900">{r.brand} {r.model}</td>
                      <td className="p-3 text-center font-bold text-rose-600 text-sm">{r.finalStockQty} টি</td>
                      <td className="p-3 text-center font-medium text-amber-700">{r.dsrCurrentQty} টি</td>
                      <td className="p-3">{formatCurrency(r.avgPurchasePrice)}</td>
                      <td className="p-3 font-semibold">{formatCurrency(r.avgSalePrice)}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold">
                          রি-অর্ডার প্রয়োজন
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Full IMEI History Modal */}
      {inspectedPhone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-[#0B5ED7] text-white flex justify-between items-center">
              <div>
                <h4 className="font-bold text-base">IMEI পূর্ণাঙ্গ ইতিহাস ও ট্র্যাকিং</h4>
                <p className="text-xs text-blue-100 font-mono">IMEI: {inspectedPhone.imei}</p>
              </div>
              <button
                onClick={() => setInspectedPhone(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-800 text-base">{inspectedPhone.brand} {inspectedPhone.model}</span>
                {renderStatusBadge(inspectedPhone.status, inspectedPhone.dsrName)}
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div>
                  <span className="text-xs text-slate-500 block">ক্রয় মূল্য:</span>
                  <strong className="text-slate-900">{formatCurrency(inspectedPhone.purchasePrice)}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">ধার্যকৃত বিক্রয় মূল্য:</span>
                  <strong className="text-slate-900">{formatCurrency(inspectedPhone.salePrice)}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">ক্রয়ের চালান:</span>
                  <strong>{inspectedPhone.purchaseInvoiceNo || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">কেনার তারিখ:</span>
                  <strong>{inspectedPhone.purchaseDate}</strong>
                </div>
                {inspectedPhone.supplierName && (
                  <div>
                    <span className="text-xs text-slate-500 block">সাপ্লায়ার:</span>
                    <strong>{inspectedPhone.supplierName}</strong>
                  </div>
                )}
                {inspectedPhone.soldInvoiceNo && (
                  <div>
                    <span className="text-xs text-slate-500 block">বিক্রয় মেমো নং:</span>
                    <strong className="text-blue-700">{inspectedPhone.soldInvoiceNo}</strong>
                  </div>
                )}
                {inspectedPhone.customerName && (
                  <div>
                    <span className="text-xs text-slate-500 block">ক্রেতার নাম:</span>
                    <strong className="text-emerald-700">{inspectedPhone.customerName}</strong>
                  </div>
                )}
                {inspectedPhone.dsrName && (
                  <div>
                    <span className="text-xs text-slate-500 block">বর্তমান DSR:</span>
                    <strong className="text-amber-700">{inspectedPhone.dsrName}</strong>
                  </div>
                )}
              </div>

              {inspectedPhone.notes && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600 block mb-0.5">মন্তব্য / ট্র্যাকিং নোট:</span>
                  <span>{inspectedPhone.notes}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 text-slate-400 text-[11px] flex justify-between">
                <span>এন্ট্রি কারী: {inspectedPhone.createdBy}</span>
                <span>অবস্থান: বরগুনা</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
