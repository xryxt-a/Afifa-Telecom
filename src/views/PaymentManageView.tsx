import React, { useState } from 'react';
import { ArrowUpRight, Search, Printer, XCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';

interface PaymentManageViewProps {
  onOpenPrint: (data: any) => void;
  onNavigate: (view: string) => void;
}

export const PaymentManageView: React.FC<PaymentManageViewProps> = ({ onOpenPrint, onNavigate }) => {
  const { paymentVouchers, cancelPaymentVoucher, suppliers } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const filteredVouchers = paymentVouchers.filter((v) => {
    if (startDate && v.date < startDate) return false;
    if (endDate && v.date > endDate) return false;
    if (filterSupplier && v.supplierId !== filterSupplier) return false;
    if (filterMethod && v.paymentMethod !== filterMethod) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      if (!v.voucherNo.toLowerCase().includes(term) && !v.supplierName.toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });

  const handleCancel = (id: string, voucherNo: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত পেমেন্ট ভাউচার ${voucherNo} ক্যানসেল করতে চান? সাপ্লায়ার বাকি এবং ক্যাশ বুক রিভার্স হবে।`)) {
      const res = cancelPaymentVoucher(id);
      if (!res.success) {
        setErrorMsg(res.error || 'ক্যানসেল ব্যর্থ হয়েছে!');
      } else {
        setSuccessMsg(`ভাউচার ${voucherNo} সফলভাবে ক্যানসেল করা হয়েছে।`);
      }
    }
  };

  const totalAmount = filteredVouchers
    .filter((v) => v.status !== 'cancelled')
    .reduce((acc, v) => acc + v.amount, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-amber-100 text-amber-800">
            <ArrowUpRight className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              পেমেন্ট ভাউচার ম্যানেজমেন্ট (Payment Manage)
            </h2>
            <p className="text-xs text-slate-500">
              সাপ্লায়ার বাকি পরিশোধ ভাউচার তালিকা • বরগুনা
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('payment_voucher')}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm"
        >
          + নতুন পেমেন্ট ভাউচার
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
          <label className="block font-semibold text-slate-600 mb-1">সার্চ (ভাউচার নং / সাপ্লায়ার)</label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="PAY-00001, নাম..."
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
          <label className="block font-semibold text-slate-600 mb-1">তারিখ থেকে</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
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
            <option value="bank">ব্যাংক</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs sm:text-sm text-slate-800">
            পেমেন্ট ভাউচার তালিকা ({filteredVouchers.length} টি)
          </h3>
          <span className="text-xs font-bold text-amber-800">
            মোট পরিশোধ: {formatCurrency(totalAmount)}
          </span>
        </div>

        {filteredVouchers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
            কোনো পেমেন্ট ভাউচার পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-100/80 font-bold text-slate-700">
                <tr>
                  <th className="p-3">ভাউচার নং</th>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3">সাপ্লায়ার</th>
                  <th className="p-3 text-right">টাকা (৳)</th>
                  <th className="p-3">মেথড</th>
                  <th className="p-3">নোট</th>
                  <th className="p-3 text-center">স্ট্যাটাস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-amber-800">{v.voucherNo}</td>
                    <td className="p-3 text-slate-600">{v.date}</td>
                    <td className="p-3 font-semibold text-slate-900">{v.supplierName}</td>
                    <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(v.amount)}</td>
                    <td className="p-3 uppercase font-mono text-[11px] text-slate-500">{v.paymentMethod}</td>
                    <td className="p-3 text-slate-500">{v.note || '-'}</td>
                    <td className="p-3 text-center">
                      {v.status === 'cancelled' ? (
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
                          onClick={() => onOpenPrint({ type: 'payment_voucher', data: v })}
                          className="p-1 text-slate-500 hover:text-amber-800 rounded hover:bg-slate-100"
                          title="প্রিন্ট ভাউচার"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {v.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancel(v.id, v.voucherNo)}
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
      </div>
    </div>
  );
};
