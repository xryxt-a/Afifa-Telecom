import React, { useState } from 'react';
import { ArrowDownLeft, AlertCircle, CheckCircle, Printer } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';

interface ReceiveVoucherViewProps {
  onOpenPrint: (data: any) => void;
  onNavigate: (view: string) => void;
}

export const ReceiveVoucherView: React.FC<ReceiveVoucherViewProps> = ({ onOpenPrint, onNavigate }) => {
  const { customers, addReceiveVoucher } = useApp();
  const todayStr = new Date().toISOString().split('T')[0];

  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank'>('cash');
  const [note, setNote] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const handleSubmit = () => {
    setErrorMsg('');
    if (!customerId) {
      setErrorMsg('কাস্টমার নির্বাচন করুন!');
      return;
    }
    if (amount <= 0) {
      setErrorMsg('সঠিক টাকার পরিমাণ লিখুন!');
      return;
    }

    const result = addReceiveVoucher({
      date: todayStr,
      customerId,
      customerName: selectedCustomer?.name || 'কাস্টমার',
      customerPhone: selectedCustomer?.phone,
      amount,
      paymentMethod,
      note,
    });

    if (!result.success) {
      setErrorMsg(result.error || 'রিসিভ ভাউচার সংরক্ষণ ব্যর্থ হয়েছে!');
      return;
    }

    setSuccessMsg(`টাকা জমা সফল হয়েছে! মানি রিসিপ্ট নম্বর: ${result.voucherNo}`);

    const voucherData = {
      id: `rcv-${Date.now()}`,
      voucherNo: result.voucherNo!,
      date: todayStr,
      customerId,
      customerName: selectedCustomer?.name || 'কাস্টমার',
      customerPhone: selectedCustomer?.phone,
      amount,
      paymentMethod,
      note,
      remainingDue: Math.max(0, (selectedCustomer?.currentDue || 0) - amount),
      status: 'completed' as const,
      createdAt: new Date().toISOString(),
      createdBy: 'এডমিন',
    };

    onOpenPrint({ type: 'receive_voucher', data: voucherData });

    setAmount(0);
    setNote('');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
            <ArrowDownLeft className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              রিসিভ ভাউচার (কাস্টমার বাকি কালেকশন)
            </h2>
            <p className="text-xs text-slate-500">
              আফিফা টেলিকম এন্ড ইলেকট্রনিক্স • বরগুনা
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('receive_manage')}
          className="text-xs font-semibold text-[#0B5ED7] hover:underline"
        >
          রিসিভ লিস্ট →
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
            কাস্টমার নির্বাচন করুন <span className="text-rose-500">*</span>
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 outline-none font-medium"
          >
            <option value="">-- কাস্টমার সিলেক্ট করুন --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone}) - বর্তমান বাকি: ৳{c.currentDue || 0}
              </option>
            ))}
          </select>
        </div>

        {selectedCustomer && (
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs flex justify-between items-center text-emerald-900">
            <span>কাস্টমার: <strong>{selectedCustomer.name}</strong></span>
            <span>বর্তমান বাকি পাওনা: <strong className="text-rose-700 text-sm">{formatCurrency(selectedCustomer.currentDue)}</strong></span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              জমার পরিমাণ (টাকা ৳) <span className="text-rose-500">*</span>
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
              <option value="nagad">নগদ (Nagad)</option>
              <option value="bank">ব্যাংক (Bank)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            মন্তব্য / রসিদ নোট
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="যেমন: পূর্বের মোবাইল বাকির কিস্তি পরিশোধ"
            className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 outline-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition active:scale-95"
          >
            টাকা জমা কনফার্ম ও প্রিন্ট মানি রিসিপ্ট (RCV)
          </button>
        </div>
      </div>
    </div>
  );
};
