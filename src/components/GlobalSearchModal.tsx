import React, { useState } from 'react';
import { Search, X, Smartphone, User, FileText, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { phones, customers, suppliers, sales, purchases, warrantyTasks } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const term = searchTerm.trim().toLowerCase();

  // Matched Phones by IMEI or Model or Brand
  const matchedPhones = term
    ? phones.filter(
        (p) =>
          p.imei.toLowerCase().includes(term) ||
          p.model.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term)
      ).slice(0, 8)
    : [];

  // Matched Customers
  const matchedCustomers = term
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.phone.toLowerCase().includes(term)
      ).slice(0, 5)
    : [];

  // Matched Invoices
  const matchedSales = term
    ? sales.filter(
        (s) =>
          s.invoiceNo.toLowerCase().includes(term) ||
          s.customerName.toLowerCase().includes(term) ||
          s.customerPhone.toLowerCase().includes(term)
      ).slice(0, 5)
    : [];

  // Matched Purchases
  const matchedPurchases = term
    ? purchases.filter(
        (p) =>
          p.invoiceNo.toLowerCase().includes(term) ||
          p.supplierName.toLowerCase().includes(term)
      ).slice(0, 5)
    : [];

  // Matched Warranty
  const matchedWarranties = term
    ? warrantyTasks.filter(
        (w) =>
          w.warrantyNo.toLowerCase().includes(term) ||
          w.step1.imei.toLowerCase().includes(term) ||
          w.step1.partyName.toLowerCase().includes(term)
      ).slice(0, 5)
    : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">ইন স্টক (দোকান)</span>;
      case 'sold':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">বিক্রি হয়েছে</span>;
      case 'with_dsr':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">DSR এর কাছে</span>;
      case 'in_warranty':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">ওয়ারেন্টি সার্ভিসে</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 px-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header Search Input */}
        <div className="p-3.5 border-b border-slate-200 flex items-center space-x-3 bg-slate-50">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="IMEI (১৫ ডিজিট), মডেল, কাস্টমার, ইনভয়েস নং দিয়ে দ্রুত খুঁজুন..."
            className="w-full bg-transparent text-sm sm:text-base outline-none text-slate-800 placeholder-slate-400 font-medium"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded"
            >
              মুছুন
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="overflow-y-auto p-4 space-y-4">
          {!searchTerm && (
            <div className="text-center py-10 text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-40 text-blue-500" />
              <p className="text-sm font-medium">যেকোনো IMEI, ব্র্যান্ড, মডেল, কাস্টমার নাম বা ইনভয়েস সার্চ করুন</p>
              <p className="text-xs text-slate-400 mt-1">দোকানের অবস্থান: বরগুনা</p>
            </div>
          )}

          {searchTerm && (
            matchedPhones.length === 0 &&
            matchedCustomers.length === 0 &&
            matchedSales.length === 0 &&
            matchedPurchases.length === 0 &&
            matchedWarranties.length === 0
          ) && (
            <div className="text-center py-8 text-slate-500">
              <AlertCircle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
              <p className="text-sm font-medium">"{searchTerm}" এর সাথে মিল রেখে কোনো রেকর্ড পাওয়া যায়নি</p>
            </div>
          )}

          {/* Matched Phones / IMEI */}
          {matchedPhones.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                <Smartphone className="w-3.5 h-3.5 mr-1 text-[#0B5ED7]" />
                মোবাইল ও IMEI ({matchedPhones.length})
              </h3>
              <div className="space-y-2">
                {matchedPhones.map((phone) => (
                  <div
                    key={phone.imei}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm hover:border-blue-300 transition"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{phone.brand} {phone.model}</span>
                        {getStatusBadge(phone.status)}
                      </div>
                      <div className="mt-1 font-mono text-xs text-slate-600">
                        IMEI: <strong className="text-blue-700">{phone.imei}</strong>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        ক্রয়: {formatCurrency(phone.purchasePrice)} | বিক্রয় মূল্য: {formatCurrency(phone.salePrice)}
                        {phone.supplierName && ` • সাপ্লায়ার: ${phone.supplierName}`}
                        {phone.customerName && ` • কাস্টমার: ${phone.customerName}`}
                        {phone.dsrName && ` • DSR: ${phone.dsrName}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Customers */}
          {matchedCustomers.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                কাস্টমার ({matchedCustomers.length})
              </h3>
              <div className="space-y-2">
                {matchedCustomers.map((cust) => (
                  <div
                    key={cust.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs sm:text-sm"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{cust.name}</p>
                      <p className="text-slate-500 text-xs">ফোন: {cust.phone} {cust.address && `• ${cust.address}`}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">বর্তমান বাকি</span>
                      <span className={`font-bold ${cust.currentDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {formatCurrency(cust.currentDue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Sales Invoices */}
          {matchedSales.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                <FileText className="w-3.5 h-3.5 mr-1 text-blue-600" />
                সেলস ইনভয়েস ({matchedSales.length})
              </h3>
              <div className="space-y-2">
                {matchedSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs sm:text-sm"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <strong className="text-blue-700">{sale.invoiceNo}</strong>
                        <span className="text-slate-500">• {sale.date}</span>
                      </div>
                      <p className="text-slate-700 text-xs mt-0.5">কাস্টমার: {sale.customerName} ({sale.customerPhone})</p>
                      <p className="text-slate-500 text-[11px]">মোট ফোন: {sale.totalQty} টি</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{formatCurrency(sale.totalAmount)}</div>
                      {sale.dueAmount > 0 && (
                        <span className="text-[11px] text-rose-600 font-semibold">বাকি: {formatCurrency(sale.dueAmount)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Warranties */}
          {matchedWarranties.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-purple-600" />
                ওয়ারেন্টি সার্ভিস ({matchedWarranties.length})
              </h3>
              <div className="space-y-2">
                {matchedWarranties.map((w) => (
                  <div
                    key={w.id}
                    className="p-3 bg-purple-50/50 border border-purple-200 rounded-lg flex items-center justify-between text-xs sm:text-sm"
                  >
                    <div>
                      <strong className="text-purple-700">{w.warrantyNo}</strong>
                      <span className="text-slate-500 text-xs ml-2">IMEI: {w.step1.imei}</span>
                      <p className="text-slate-700 text-xs mt-0.5">{w.step1.brand} {w.step1.model} • কাস্টমার: {w.step1.partyName}</p>
                      <p className="text-purple-900 text-[11px]">সমস্যা: {w.step1.problem}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
