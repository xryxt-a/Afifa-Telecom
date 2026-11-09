import React, { useState } from 'react';
import { ArrowUpRight, AlertCircle, CheckCircle, Printer } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';

interface PaymentVoucherViewProps {
  onOpenPrint: (data: any) => void;
  onNavigate: (view: string) => void;
}

export const PaymentVoucherView: React.FC<PaymentVoucherViewProps> = ({ onOpenPrint, onNavigate }) => {
  const { suppliers, addPaymentVoucher } = useApp();
  const todayStr = new Date().toISOString().split('T')[0];

  const [supplierId, setSupplierId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'bank'>('cash');
  const [note, setNote] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  const handleSubmit = () => {
    setErrorMsg('');
    if (!supplierId) {
      setErrorMsg('সাপ্লায়ার নির্বাচন করুন!');
      return;
    }
    if (amount <= 0) {
      setErrorMsg('সঠিক টাকার পরিমাণ লিখুন!');
      return;
    }

    const result = addPaymentVoucher({
      date: todayStr,
      supplierId,
      supplierName: selectedSupplier?.name || 'সাপ্লায়ার',
      amount,
      paymentMethod,
      note,
    });

    if (!result.success) {
      setErrorMsg(result.error || 'পেমেন্ট সংরক্ষণ ব্যর্থ হয়েছে!');
      return;
    }

    setSuccessMsg(`পেমেন্ট ভাউচার সংরক্ষিত হয়েছে! নম্বর: ${result.voucherNo}`);

    const voucherData = {
      id: `pay-${Date.now()}`,
      voucherNo: result.voucherNo!,
      date: todayStr,
      supplierId,
      supplierName: selectedSupplier?.name || 'সাপ্লায়ার',
      amount,
      paymentMethod,
      note,
      status: 'completed' as const,
      createdAt: new Date().toISOString(),
      createdBy: 'এডমিন',
    };

    onOpenPrint({ type: 'payment_voucher', data: voucherData });

    setAmount(0);
    setNote('');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-amber-100 text-amber-800">
            <ArrowUpRight className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              পেমেন্ট ভাউচার (সাপ্লায়ার বাকি পরিশোধ)
            </h2>
            <p className="text-xs text-slate-500">
              আফিফা টেলিকম এন্ড ইলেকট্রনিক্স • বরগুনা
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('payment_manage')}
          className="text-xs font-semibold text-[#0B5ED7] hover:underline"
        >
          পেমেন্ট লিস্ট →
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

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            সাপ্লায়ার নির্বাচন করুন <span className="text-rose-500">*</span>
          </label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 outline-none font-medium"
          >
            <option value="">-- সাপ্লায়ার সিলেক্ট করুন --</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.phone}) - বর্তমান বাকি: ৳{s.totalDue || 0}
              </option>
            ))}
          </select>
        </div>

        {selectedSupplier && (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs flex justify-between items-center text-amber-900">
            <span>সাপ্লায়ার: <strong>{selectedSupplier.name}</strong></span>
            <span>মোট বাকি পাওনা: <strong className="text-rose-700 text-sm">{formatCurrency(selectedSupplier.totalDue)}</strong></span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              প্রদানের পরিমাণ (টাকা ৳) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0"
              className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 outline-none font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              পেমেন্ট মাধ্যম
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 outline-none font-medium"
            >
              <option value="cash">ক্যাশ (Cash)</option>
              <option value="bkash">বিকাশ (bKash)</option>
              <option value="bank">ব্যাংক (Bank)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            পেমেন্ট নোট / রেফারেন্স
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="যেমন: চেক নম্বর / চালান নং পরিশোধ"
            className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 outline-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition active:scale-95"
          >
            পেমেন্ট সম্পন্ন ও প্রিন্ট ভাউচার (PAY-XXXXX)
          </button>
        </div>
      </div>
    </div>
  );
};
