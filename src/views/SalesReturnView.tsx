import React, { useState } from 'react';
import { Undo2, AlertCircle, CheckCircle, Search, Layers, Printer } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, isValidIMEI } from '../utils/helpers';
import { SalesReturnItem } from '../types';

interface SalesReturnViewProps {
  onOpenPrint: (data: any) => void;
  onNavigate: (view: string) => void;
}

export const SalesReturnView: React.FC<SalesReturnViewProps> = ({ onOpenPrint, onNavigate }) => {
  const { phones, sales, addSalesReturn, salesReturns } = useApp();
  const todayStr = new Date().toISOString().split('T')[0];

  const [returnImeiText, setReturnImeiText] = useState('');
  const [returnReason, setReturnReason] = useState<'customer_choice' | 'damaged' | 'defective' | 'exchange' | 'other'>('customer_choice');
  const [refundMethod, setRefundMethod] = useState<'cash' | 'bkash' | 'bank' | 'adjust_due'>('cash');
  const [customRefundAmount, setCustomRefundAmount] = useState<number | null>(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Matched phone items from the bulk IMEI box
  const parsedImeis = returnImeiText
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Auto-detect details for each IMEI
  const detectedItems: {
    imei: string;
    brand: string;
    model: string;
    salePrice: number;
    invoiceNo: string;
    customerId: string;
    customerName: string;
  }[] = [];

  let validationError = '';
  for (const imei of parsedImeis) {
    if (!isValidIMEI(imei)) {
      validationError = `IMEI "${imei}" অবশ্যই ১৫ ডিজিটের সংখ্যা হতে হবে!`;
      break;
    }
    const phone = phones.find((p) => p.imei === imei);
    if (!phone) {
      validationError = `IMEI "${imei}" ডাটাবেজে পাওয়া যায়নি!`;
      break;
    }
    if (phone.status !== 'sold') {
      validationError = `IMEI "${imei}" বিক্রি করা অবস্থায় নেই (বর্তমান স্ট্যাটাস: ${phone.status})! শুধু বিক্রি করা ফোনই সেলস রিটার্ন করা যাবে।`;
      break;
    }
    detectedItems.push({
      imei,
      brand: phone.brand,
      model: phone.model,
      salePrice: phone.salePrice || 0,
      invoiceNo: phone.soldInvoiceNo || 'N/A',
      customerId: phone.customerId || '',
      customerName: phone.customerName || 'কাস্টমার',
    });
  }

  const calculatedRefundTotal = detectedItems.reduce((acc, item) => acc + item.salePrice, 0);
  const actualRefundAmount = customRefundAmount !== null ? customRefundAmount : calculatedRefundTotal;

  // Process Sales Return
  const handleProcessReturn = () => {
    setErrorMsg('');
    if (parsedImeis.length === 0) {
      setErrorMsg('কমপক্ষে একটি ফেরত ১৫ ডিজিট IMEI দিন!');
      return;
    }
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    const firstItem = detectedItems[0];
    const returnItems: SalesReturnItem[] = detectedItems.map((item) => ({
      brand: item.brand,
      model: item.model,
      imei: item.imei,
      refundPrice: item.salePrice,
    }));

    const result = addSalesReturn({
      date: todayStr,
      originalInvoiceNo: firstItem.invoiceNo,
      customerId: firstItem.customerId,
      customerName: firstItem.customerName,
      imeis: detectedItems.map((i) => i.imei),
      items: returnItems,
      returnReason,
      refundAmount: actualRefundAmount,
      refundMethod,
    });

    if (!result.success) {
      setErrorMsg(result.error || 'সেলস রিটার্ন ব্যর্থ হয়েছে!');
      return;
    }

    setSuccessMsg(`সেলস রিটার্ন সফল হয়েছে! মেমো নম্বর: ${result.returnNo}`);
    setReturnImeiText('');
    setCustomRefundAmount(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-amber-100 text-amber-700">
            <Undo2 className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              সেলস রিটার্ন (গ্রাহক হতে ফোন ফেরত)
            </h2>
            <p className="text-xs text-slate-500">
              আফিফা টেলিকম এন্ড ইলেকট্রনিক্স • বরগুনা
            </p>
          </div>
        </div>
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

      {/* Main Form */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ফেরতকৃত IMEI বাল্ক ইনপুট বক্স (এক লাইনে একটি IMEI)
          </label>
          <textarea
            rows={4}
            value={returnImeiText}
            onChange={(e) => setReturnImeiText(e.target.value)}
            placeholder="এখানে বিক্রি করা ১৫ ডিজিটের IMEI পেস্ট করুন..."
            className="w-full p-3 font-mono text-xs sm:text-sm border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Real-time Detected Table */}
        {detectedItems.length > 0 && !validationError && (
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
            <h4 className="text-xs font-bold text-blue-900 uppercase">
              স্বয়ংক্রিয়ভাবে সনাক্তকৃত সেলস রেকর্ড ({detectedItems.length} টি ফোন)
            </h4>
            <div className="divide-y divide-blue-200/60 text-xs">
              {detectedItems.map((item, idx) => (
                <div key={idx} className="py-2 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900">{item.brand} {item.model}</span>
                    <span className="font-mono text-slate-600 ml-2">IMEI: {item.imei}</span>
                    <div className="text-[11px] text-slate-500">
                      ইনভয়েস: <strong>{item.invoiceNo}</strong> • কাস্টমার: <strong>{item.customerName}</strong>
                    </div>
                  </div>
                  <div className="text-right font-bold text-slate-900">
                    {formatCurrency(item.salePrice)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
            {validationError}
          </div>
        )}

        {/* Return Details Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              রিটার্নের কারণ
            </label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value as any)}
              className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none font-medium"
            >
              <option value="customer_choice">কাস্টমার পছন্দ করে নাই</option>
              <option value="damaged">ড্যামেজ / ত্রুটি</option>
              <option value="defective">ডিফেক্টিভ</option>
              <option value="exchange">এক্সচেঞ্জ (অন্য মডেল নেওয়া)</option>
              <option value="other">অন্যান্য</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              রিফান্ড মেথড
            </label>
            <select
              value={refundMethod}
              onChange={(e) => setRefundMethod(e.target.value as any)}
              className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none font-medium"
            >
              <option value="cash">ক্যাশ রিফান্ড (Cash)</option>
              <option value="bkash">বিকাশ (bKash)</option>
              <option value="bank">ব্যাংক (Bank)</option>
              <option value="adjust_due">বাকির সাথে অ্যাডজাস্ট</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              রিফান্ড অ্যামাউন্ট (টাকা ৳)
            </label>
            <input
              type="number"
              value={actualRefundAmount || ''}
              onChange={(e) => setCustomRefundAmount(Number(e.target.value))}
              placeholder="0"
              className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none font-bold text-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleProcessReturn}
            disabled={detectedItems.length === 0 || !!validationError}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition active:scale-95"
          >
            সেলস রিটার্ন কনফার্ম করুন (SR-XXXXX)
          </button>
        </div>
      </div>

      {/* Return History */}
      {salesReturns.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs sm:text-sm text-slate-800">
            পূর্বের রিটার্ন হিস্ট্রি ({salesReturns.length} টি)
          </div>
          <div className="divide-y divide-slate-200 text-xs">
            {salesReturns.map((sr) => (
              <div key={sr.id} className="p-3 flex justify-between items-center">
                <div>
                  <span className="font-bold text-amber-800">{sr.returnNo}</span>
                  <span className="text-slate-500 ml-2">• {sr.date}</span>
                  <p className="text-slate-700 mt-0.5">
                    কাস্টমার: {sr.customerName} • ইনভয়েস: {sr.originalInvoiceNo} • কারণ: {sr.returnReason}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">{formatCurrency(sr.refundAmount)}</span>
                  <span className="text-[10px] text-slate-500">{sr.refundMethod}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
