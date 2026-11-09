import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Printer,
  Eye,
  Edit2,
  XCircle,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';
import { SalesInvoice } from '../types';

interface SalesManageViewProps {
  onOpenPrint: (data: any) => void;
  onNavigate: (view: string) => void;
}

export const SalesManageView: React.FC<SalesManageViewProps> = ({ onOpenPrint, onNavigate }) => {
  const { sales, cancelSale, customers, brands, models } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected Detail Modal
  const [inspectedSale, setInspectedSale] = useState<SalesInvoice | null>(null);

  // Alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filter Sales
  const filteredSales = sales.filter((s) => {
    if (startDate && s.date < startDate) return false;
    if (endDate && s.date > endDate) return false;
    if (filterCustomer && s.customerId !== filterCustomer) return false;
    if (filterStatus && s.status !== filterStatus) return false;
    if (filterMethod && s.paymentMethod !== filterMethod) return false;
    if (filterBrand && !s.items.some((i) => i.brand === filterBrand)) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      const matchInvoice = s.invoiceNo.toLowerCase().includes(term);
      const matchCustomer = s.customerName.toLowerCase().includes(term) || s.customerPhone.toLowerCase().includes(term);
      const matchImei = s.items.some((i) => i.imei.toLowerCase().includes(term) || i.model.toLowerCase().includes(term));
      if (!matchInvoice && !matchCustomer && !matchImei) return false;
    }
    return true;
  });

  // Cancel Handler
  const handleCancelSale = (id: string, invoiceNo: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    if (window.confirm(`আপনি কি নিশ্চিত সেলস ইনভয়েস ${invoiceNo} ক্যানসেল করতে চান? সব ফোন ইন স্টকে ফেরত আসবে এবং বাকি ও ক্যাশ রিভার্স হবে।`)) {
      const result = cancelSale(id);
      if (!result.success) {
        setErrorMsg(result.error || 'সেলস ক্যানসেল ব্যর্থ হয়েছে!');
      } else {
        setSuccessMsg(`ইনভয়েস ${invoiceNo} সফলভাবে ক্যানসেল করা হয়েছে।`);
      }
    }
  };

  // Totals
  const totalCount = filteredSales.length;
  const totalQty = filteredSales.reduce((acc, s) => acc + s.totalQty, 0);
  const totalAmount = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalPaid = filteredSales.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalDue = filteredSales.reduce((acc, s) => acc + s.dueAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-blue-100 text-[#0B5ED7]">
            <Receipt className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              সেলস ইনভয়েস ম্যানেজমেন্ট (Sales Manage)
            </h2>
            <p className="text-xs text-slate-500">
              আফিফা টেলিকম এন্ড ইলেকট্রনিক্স • বরগুনা
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('new_sales')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition active:scale-95"
        >
          + নিউ সেলস এন্ট্রি
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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">সার্চ (ইনভয়েস / IMEI / নাম / ফোন)</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="SAL..., 86450..., নাম"
                className="w-full p-2 pl-7 border border-slate-300 rounded-lg bg-slate-50 outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">কাস্টমার</label>
            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none"
            >
              <option value="">-- সব কাস্টমার --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
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
              <option value="returned">রিটার্ন</option>
              <option value="cancelled">ক্যানসেল</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">তারিখ থেকে</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">তারিখ পর্যন্ত</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">পেমেন্ট মেথড</label>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none"
            >
              <option value="">-- সব মেথড --</option>
              <option value="cash">ক্যাশ</option>
              <option value="bkash">বিকাশ</option>
              <option value="nagad">নগদ</option>
              <option value="bank">ব্যাংক</option>
              <option value="due">বাকি</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs sm:text-sm text-slate-800">
            বিক্রয় ইনভয়েস তালিকা ({filteredSales.length} টি)
          </h3>
          <span className="text-xs text-slate-500">লোকেশন: বরগুনা</span>
        </div>

        {filteredSales.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
            কোনো বিক্রয় ইনভয়েস পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-100/80 font-bold text-slate-700">
                <tr>
                  <th className="p-3">ইনভয়েস নং</th>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3">কাস্টমার ও মোবাইল</th>
                  <th className="p-3 text-center">কোয়ান্টিটি</th>
                  <th className="p-3 text-right">মোট বিল</th>
                  <th className="p-3 text-right">পরিশোধ</th>
                  <th className="p-3 text-right">বাকি</th>
                  <th className="p-3">পেমেন্ট</th>
                  <th className="p-3 text-center">স্ট্যাটাস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-[#0B5ED7]">
                      {sale.invoiceNo}
                    </td>
                    <td className="p-3 text-slate-600">{sale.date}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{sale.customerName}</span>
                      <span className="text-slate-500 text-[11px]">{sale.customerPhone}</span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-800">{sale.totalQty} টি</td>
                    <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(sale.totalAmount)}</td>
                    <td className="p-3 text-right text-emerald-700 font-semibold">{formatCurrency(sale.paidAmount)}</td>
                    <td className="p-3 text-right text-rose-700 font-bold">
                      {sale.dueAmount > 0 ? formatCurrency(sale.dueAmount) : '-'}
                    </td>
                    <td className="p-3 uppercase font-mono text-[11px] text-slate-600">
                      {sale.paymentMethod}
                    </td>
                    <td className="p-3 text-center">
                      {sale.status === 'cancelled' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                          ক্যানসেল
                        </span>
                      ) : sale.status === 'returned' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          রিটার্ন
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
                          onClick={() => setInspectedSale(sale)}
                          className="p-1 text-slate-500 hover:text-blue-700 rounded hover:bg-slate-100"
                          title="ডিটেইলস দেখুন"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenPrint({ type: 'sales', data: sale })}
                          className="p-1 text-slate-500 hover:text-[#0B5ED7] rounded hover:bg-slate-100"
                          title="মেমো প্রিন্ট করুন"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {sale.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelSale(sale.id, sale.invoiceNo)}
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

        {/* Totals Summary Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-semibold">
          <span>মোট সেলস: <strong>{totalCount} টি ইনভয়েস</strong> (মোট ফোন: <strong>{totalQty} টি</strong>)</span>
          <div className="flex items-center space-x-4">
            <span>মোট বিল: <strong className="text-slate-900">{formatCurrency(totalAmount)}</strong></span>
            <span>মোট পরিশোধ: <strong className="text-emerald-700">{formatCurrency(totalPaid)}</strong></span>
            <span>মোট বাকি: <strong className="text-rose-700">{formatCurrency(totalDue)}</strong></span>
          </div>
        </div>
      </div>

      {/* Sale Detail Modal */}
      {inspectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-4 bg-[#0B5ED7] text-white flex justify-between items-center">
              <div>
                <h4 className="font-bold text-base">ইনভয়েস ডিটেইলস: {inspectedSale.invoiceNo}</h4>
                <p className="text-xs text-blue-100">তারিখ: {inspectedSale.date} • আফিফা টেলিকম এন্ড ইলেকট্রনিক্স, বরগুনা</p>
              </div>
              <button
                onClick={() => setInspectedSale(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs text-slate-500 block">কাস্টমার তথ্য:</span>
                  <strong className="text-base text-slate-900">{inspectedSale.customerName}</strong>
                  <p className="text-slate-600">ফোন: {inspectedSale.customerPhone}</p>
                  {inspectedSale.customerAddress && <p className="text-slate-500">{inspectedSale.customerAddress}</p>}
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">বিক্রেতা:</span>
                  <strong>{inspectedSale.createdBy}</strong>
                  <div className="mt-1">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 uppercase">
                      {inspectedSale.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h5 className="font-bold text-slate-700 mb-2">বিক্রি করা ফোনের তালিকা ({inspectedSale.items.length} টি)</h5>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs divide-y divide-slate-200">
                    <thead className="bg-slate-50 font-semibold text-slate-600">
                      <tr>
                        <th className="p-2">মডেল</th>
                        <th className="p-2">IMEI (১৫ ডিজিট)</th>
                        <th className="p-2 text-right">মূল্য</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inspectedSale.items.map((item, i) => (
                        <tr key={i}>
                          <td className="p-2 font-semibold text-slate-900">{item.brand} {item.model}</td>
                          <td className="p-2 font-mono text-blue-700 font-bold">{item.imei}</td>
                          <td className="p-2 text-right font-semibold">{formatCurrency(item.salePrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financials */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span>সাবটোটাল:</span>
                  <span>{formatCurrency(inspectedSale.subTotal)}</span>
                </div>
                {inspectedSale.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>ডিসকাউন্ট:</span>
                    <span>- {formatCurrency(inspectedSale.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-200 pt-1">
                  <span>সর্বমোট বিল:</span>
                  <span>{formatCurrency(inspectedSale.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>পরিশোধ ({inspectedSale.paymentMethod}):</span>
                  <span>{formatCurrency(inspectedSale.paidAmount)}</span>
                </div>
                {inspectedSale.dueAmount > 0 && (
                  <div className="flex justify-between text-rose-700 font-bold border-t border-slate-200 pt-1">
                    <span>বাকি টাকা:</span>
                    <span>{formatCurrency(inspectedSale.dueAmount)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => {
                  onOpenPrint({ type: 'sales', data: inspectedSale });
                }}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#0B5ED7] hover:bg-[#0A4AB0] text-white font-bold text-xs sm:text-sm rounded-lg"
              >
                <Printer className="w-4 h-4" />
                <span>মেমো প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
