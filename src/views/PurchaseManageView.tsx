import React, { useState } from 'react';
import {
  Truck,
  Search,
  Printer,
  Eye,
  XCircle,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';
import { PurchaseInvoice } from '../types';

interface PurchaseManageViewProps {
  onOpenPrint: (data: any) => void;
  onNavigate: (view: string) => void;
}

export const PurchaseManageView: React.FC<PurchaseManageViewProps> = ({ onOpenPrint, onNavigate }) => {
  const { purchases, cancelPurchase, suppliers, brands } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [inspectedPurchase, setInspectedPurchase] = useState<PurchaseInvoice | null>(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const filteredPurchases = purchases.filter((p) => {
    if (startDate && p.date < startDate) return false;
    if (endDate && p.date > endDate) return false;
    if (filterSupplier && p.supplierId !== filterSupplier) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    if (filterBrand && !p.items.some((i) => i.brand === filterBrand)) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      const matchInvoice = p.invoiceNo.toLowerCase().includes(term);
      const matchSupplier = p.supplierName.toLowerCase().includes(term);
      const matchImei = p.items.some((i) => i.imeis.some((im) => im.toLowerCase().includes(term)));
      if (!matchInvoice && !matchSupplier && !matchImei) return false;
    }
    return true;
  });

  const handleCancelPurchase = (id: string, invoiceNo: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    if (window.confirm(`আপনি কি নিশ্চিত পারচেজ ইনভয়েস ${invoiceNo} ক্যানসেল করতে চান?`)) {
      const result = cancelPurchase(id);
      if (!result.success) {
        setErrorMsg(result.error || 'পারচেজ ক্যানসেল ব্যর্থ হয়েছে!');
      } else {
        setSuccessMsg(`পারচেজ ${invoiceNo} সফলভাবে ক্যানসেল করা হয়েছে।`);
      }
    }
  };

  const totalCount = filteredPurchases.length;
  const totalQty = filteredPurchases.reduce((acc, p) => acc + p.totalQty, 0);
  const totalAmount = filteredPurchases.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalPaid = filteredPurchases.reduce((acc, p) => acc + p.paidAmount, 0);
  const totalDue = filteredPurchases.reduce((acc, p) => acc + p.dueAmount, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-blue-100 text-[#0B5ED7]">
            <Truck className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              পারচেজ ইনভয়েস ম্যানেজমেন্ট (Purchase Manage)
            </h2>
            <p className="text-xs text-slate-500">
              আফিফা টেলিকম এন্ড ইলেকট্রনিক্স • বরগুনা
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('new_purchase')}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition active:scale-95"
        >
          + নিউ পারচেজ এন্ট্রি
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs sm:text-sm text-rose-800 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs sm:text-sm text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-600 mb-1">সার্চ (PUR... / IMEI / সাপ্লায়ার)</label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="PUR-00001, 86450..."
              className="w-full p-2 pl-7 border border-slate-300 rounded-lg bg-slate-50 outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-600 mb-1">সাপ্লায়ার</label>
          <select
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none"
          >
            <option value="">-- সব সাপ্লায়ার --</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-600 mb-1">ব্র্যান্ড</label>
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none"
          >
            <option value="">-- সব ব্র্যান্ড --</option>
            {brands.map((b) => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-600 mb-1">স্ট্যাটাস</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none font-medium"
          >
            <option value="">-- সব স্ট্যাটাস --</option>
            <option value="completed">কমপ্লিট</option>
            <option value="cancelled">ক্যানসেল</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs sm:text-sm text-slate-800">
            ক্রয় ইনভয়েস তালিকা ({filteredPurchases.length} টি)
          </h3>
        </div>

        {filteredPurchases.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
            কোনো ক্রয় ইনভয়েস পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-100/80 font-bold text-slate-700">
                <tr>
                  <th className="p-3">চালান নং</th>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3">সাপ্লায়ার</th>
                  <th className="p-3 text-center">মোট ফোন</th>
                  <th className="p-3 text-right">মোট বিল</th>
                  <th className="p-3 text-right">পরিশোধ</th>
                  <th className="p-3 text-right">বাকি</th>
                  <th className="p-3">মেথড</th>
                  <th className="p-3 text-center">স্ট্যাটাস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPurchases.map((pur) => (
                  <tr key={pur.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-blue-800">{pur.invoiceNo}</td>
                    <td className="p-3 text-slate-600">{pur.date}</td>
                    <td className="p-3 font-semibold text-slate-900">{pur.supplierName}</td>
                    <td className="p-3 text-center font-bold text-slate-800">{pur.totalQty} টি</td>
                    <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(pur.totalAmount)}</td>
                    <td className="p-3 text-right text-emerald-700 font-semibold">{formatCurrency(pur.paidAmount)}</td>
                    <td className="p-3 text-right text-rose-700 font-bold">
                      {pur.dueAmount > 0 ? formatCurrency(pur.dueAmount) : '-'}
                    </td>
                    <td className="p-3 uppercase font-mono text-[11px] text-slate-500">{pur.paymentMethod}</td>
                    <td className="p-3 text-center">
                      {pur.status === 'cancelled' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                          ক্যানসেল
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          কমপ্লিট
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setInspectedPurchase(pur)}
                          className="p-1 text-slate-500 hover:text-blue-700 rounded hover:bg-slate-100"
                          title="ডিটেইলস"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenPrint({ type: 'purchase', data: pur })}
                          className="p-1 text-slate-500 hover:text-blue-700 rounded hover:bg-slate-100"
                          title="প্রিন্ট চালান"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {pur.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelPurchase(pur.id, pur.invoiceNo)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                            title="ক্যানসেল করুন"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-semibold">
          <span>মোট ক্রয়: <strong>{totalCount} টি ইনভয়েস</strong> ({totalQty} টি ফোন)</span>
          <div className="flex items-center space-x-4">
            <span>মোট ক্রয় বিল: <strong className="text-slate-900">{formatCurrency(totalAmount)}</strong></span>
            <span>মোট পরিশোধ: <strong className="text-emerald-700">{formatCurrency(totalPaid)}</strong></span>
            <span>সাপ্লায়ার বাকি: <strong className="text-rose-700">{formatCurrency(totalDue)}</strong></span>
          </div>
        </div>
      </div>

      {/* Inspect Modal */}
      {inspectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-4 bg-blue-800 text-white flex justify-between items-center">
              <div>
                <h4 className="font-bold text-base">পারচেজ ইনভয়েস: {inspectedPurchase.invoiceNo}</h4>
                <p className="text-xs text-blue-100">সাপ্লায়ার: {inspectedPurchase.supplierName} • {inspectedPurchase.date}</p>
              </div>
              <button
                onClick={() => setInspectedPurchase(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs divide-y divide-slate-200">
                  <thead className="bg-slate-50 font-bold">
                    <tr>
                      <th className="p-2">মডেল</th>
                      <th className="p-2">কোয়ান্টিটি</th>
                      <th className="p-2">ক্রয় মূল্য</th>
                      <th className="p-2 text-right">টাকা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inspectedPurchase.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2">
                          <div className="font-bold">{item.brand} {item.model}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            IMEI: {item.imeis.join(', ')}
                          </div>
                        </td>
                        <td className="p-2 font-bold">{item.imeis.length} টি</td>
                        <td className="p-2">{formatCurrency(item.purchasePrice)}</td>
                        <td className="p-2 text-right font-bold">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => onOpenPrint({ type: 'purchase', data: inspectedPurchase })}
                className="flex items-center space-x-1.5 px-4 py-2 bg-blue-800 text-white font-bold text-xs rounded-lg"
              >
                <Printer className="w-4 h-4" />
                <span>চালান প্রিন্ট</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
