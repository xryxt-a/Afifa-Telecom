import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Download, Printer, Filter, DollarSign, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, computeStockMatrix } from '../utils/helpers';

export const ReportsView: React.FC = () => {
  const { sales, purchases, phones, customers, suppliers, expenses, dsrs } = useApp();

  const [activeReport, setActiveReport] = useState<'sales_profit' | 'stock' | 'customer_due' | 'supplier_due' | 'dsr'>('sales_profit');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 1. Sales & Profit calculations
  const filteredSales = sales.filter((s) => {
    if (s.status === 'cancelled') return false;
    if (startDate && s.date < startDate) return false;
    if (endDate && s.date > endDate) return false;
    return true;
  });

  const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);

  // Calculate COGS (Cost of goods sold) from sold phone purchase prices
  let totalCOGS = 0;
  filteredSales.forEach((s) => {
    s.items.forEach((item) => {
      const p = phones.find((phone) => phone.imei === item.imei);
      if (p) {
        totalCOGS += p.purchasePrice || 0;
      }
    });
  });

  const grossProfit = totalSalesRevenue - totalCOGS;

  const filteredExpensesTotal = expenses
    .filter((e) => {
      if (e.status === 'cancelled') return false;
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;
      return true;
    })
    .reduce((acc, e) => acc + e.amount, 0);

  const netProfit = grossProfit - filteredExpensesTotal;

  // 2. Stock Matrix
  const stockRows = computeStockMatrix(phones);
  const totalStockValue = stockRows.reduce((acc, r) => acc + r.totalStockValue, 0);
  const totalInStockQty = stockRows.reduce((acc, r) => acc + r.finalStockQty, 0);

  // 3. Customer Dues
  const dueCustomers = customers.filter((c) => (c.currentDue || 0) > 0);
  const totalCustomerDue = dueCustomers.reduce((acc, c) => acc + (c.currentDue || 0), 0);

  // 4. Supplier Dues
  const dueSuppliers = suppliers.filter((s) => (s.totalDue || 0) > 0);
  const totalSupplierDue = dueSuppliers.reduce((acc, s) => acc + (s.totalDue || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-blue-100 text-[#0B5ED7]">
            <BarChart3 className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              ব্যবসায়িক রিপোর্টস ও লাভ-ক্ষতি খতিয়ান
            </h2>
            <p className="text-xs text-slate-500">
              আফিফা টেলিকম এন্ড ইলেকট্রনিক্স • বরগুনা
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm no-print"
        >
          <Printer className="w-4 h-4" />
          <span>রিপোর্ট প্রিন্ট করুন</span>
        </button>
      </div>

      {/* Report Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-xl text-xs sm:text-sm font-semibold no-print">
        <button
          onClick={() => setActiveReport('sales_profit')}
          className={`px-4 py-2 rounded-lg transition ${
            activeReport === 'sales_profit' ? 'bg-[#0B5ED7] text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          সেলস ও নীট প্রফিট
        </button>
        <button
          onClick={() => setActiveReport('stock')}
          className={`px-4 py-2 rounded-lg transition ${
            activeReport === 'stock' ? 'bg-[#0B5ED7] text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          স্টক ভ্যালুয়েশন
        </button>
        <button
          onClick={() => setActiveReport('customer_due')}
          className={`px-4 py-2 rounded-lg transition ${
            activeReport === 'customer_due' ? 'bg-[#0B5ED7] text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          কাস্টমার বাকি রিপোর্ট ({dueCustomers.length})
        </button>
        <button
          onClick={() => setActiveReport('supplier_due')}
          className={`px-4 py-2 rounded-lg transition ${
            activeReport === 'supplier_due' ? 'bg-[#0B5ED7] text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          সাপ্লায়ার বাকি রিপোর্ট ({dueSuppliers.length})
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs no-print">
        <span className="font-bold text-slate-700 flex items-center">
          <Filter className="w-3.5 h-3.5 mr-1 text-[#0B5ED7]" /> তারিখ ফিল্টার:
        </span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-1.5 border border-slate-300 rounded-lg outline-none bg-slate-50"
        />
        <span className="text-slate-400">হতে</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-1.5 border border-slate-300 rounded-lg outline-none bg-slate-50"
        />
        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="text-blue-700 font-bold hover:underline"
          >
            মুছুন
          </button>
        )}
      </div>

      {/* 1. SALES & PROFIT REPORT */}
      {activeReport === 'sales_profit' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">মোট বিক্রয় মূল্য:</span>
              <strong className="text-lg sm:text-xl font-bold text-slate-900">{formatCurrency(totalSalesRevenue)}</strong>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">ক্রয় খরচ (COGS):</span>
              <strong className="text-lg sm:text-xl font-bold text-slate-600">{formatCurrency(totalCOGS)}</strong>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">দোকান খরচ:</span>
              <strong className="text-lg sm:text-xl font-bold text-rose-700">{formatCurrency(filteredExpensesTotal)}</strong>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs ring-2 ring-emerald-500/20">
              <span className="text-xs text-slate-500 block">নীট লাভ (Net Profit):</span>
              <strong className={`text-lg sm:text-xl font-bold ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatCurrency(netProfit)}
              </strong>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs sm:text-sm text-slate-800">
              বিক্রয় ইনভয়েস বিস্তারিত তালিকা ({filteredSales.length} টি)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-3">ইনভয়েস</th>
                    <th className="p-3">তারিখ</th>
                    <th className="p-3">কাস্টমার</th>
                    <th className="p-3 text-center">কোয়ান্টিটি</th>
                    <th className="p-3 text-right">বিক্রয় মূল্য</th>
                    <th className="p-3 text-right">আদায়</th>
                    <th className="p-3 text-right">বাকি</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredSales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-[#0B5ED7]">{s.invoiceNo}</td>
                      <td className="p-3 text-slate-600">{s.date}</td>
                      <td className="p-3 font-semibold text-slate-900">{s.customerName}</td>
                      <td className="p-3 text-center font-bold">{s.totalQty} টি</td>
                      <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(s.totalAmount)}</td>
                      <td className="p-3 text-right text-emerald-700 font-medium">{formatCurrency(s.paidAmount)}</td>
                      <td className="p-3 text-right text-rose-700 font-bold">
                        {s.dueAmount > 0 ? formatCurrency(s.dueAmount) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. STOCK REPORT */}
      {activeReport === 'stock' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-500 block">বর্তমান মোট ইন-স্টক ফোন:</span>
              <strong className="text-xl font-bold text-[#0B5ED7]">{totalInStockQty} টি</strong>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">মোট ইনভেন্টরি ক্রয় মূল্য:</span>
              <strong className="text-xl font-bold text-emerald-700">{formatCurrency(totalStockValue)}</strong>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs sm:text-sm text-slate-800">
              মডেল ওয়াইজ স্টক মূল্য তালিকা
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-3">ব্র্যান্ড ও মডেল</th>
                    <th className="p-3 text-center">ইন স্টক</th>
                    <th className="p-3 text-center">DSR স্টক</th>
                    <th className="p-3">গড় ক্রয় মূল্য</th>
                    <th className="p-3">বিক্রয় মূল্য</th>
                    <th className="p-3 text-right">মোট স্টক ভ্যালু</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {stockRows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{r.brand} {r.model}</td>
                      <td className="p-3 text-center font-bold text-blue-700">{r.finalStockQty} টি</td>
                      <td className="p-3 text-center font-medium text-amber-700">{r.dsrCurrentQty} টি</td>
                      <td className="p-3">{formatCurrency(r.avgPurchasePrice)}</td>
                      <td className="p-3 font-semibold">{formatCurrency(r.avgSalePrice)}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(r.totalStockValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. CUSTOMER DUE REPORT */}
      {activeReport === 'customer_due' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-rose-200 shadow-xs flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-500 block">বাকি থাকা কাস্টমার:</span>
              <strong className="text-xl font-bold text-slate-900">{dueCustomers.length} জন</strong>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">মোট কাস্টমার বাকি পাওনা:</span>
              <strong className="text-xl font-bold text-rose-700">{formatCurrency(totalCustomerDue)}</strong>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs sm:text-sm text-slate-800">
              বকেয়া কাস্টমারদের বিস্তারিত তালিকা
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-3">কাস্টমারের নাম</th>
                    <th className="p-3">মোবাইল</th>
                    <th className="p-3">ঠিকানা</th>
                    <th className="p-3 text-right">প্রারম্ভিক বাকি</th>
                    <th className="p-3 text-right">বর্তমান বাকি (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dueCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{c.name}</td>
                      <td className="p-3 text-blue-700 font-medium">{c.phone}</td>
                      <td className="p-3 text-slate-600">{c.address || 'বরগুনা'}</td>
                      <td className="p-3 text-right text-slate-500">{formatCurrency(c.openingDue)}</td>
                      <td className="p-3 text-right font-bold text-rose-700 text-sm">{formatCurrency(c.currentDue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUPPLIER DUE REPORT */}
      {activeReport === 'supplier_due' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-xs flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-500 block">বাকি থাকা সাপ্লায়ার:</span>
              <strong className="text-xl font-bold text-slate-900">{dueSuppliers.length} টি কোম্পানি</strong>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">মোট সাপ্লায়ার বাকি দেনা:</span>
              <strong className="text-xl font-bold text-amber-800">{formatCurrency(totalSupplierDue)}</strong>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs sm:text-sm text-slate-800">
              সাপ্লায়ার বাকি তালিকা
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-3">কোম্পানি / সাপ্লায়ার</th>
                    <th className="p-3">ফোন</th>
                    <th className="p-3">ঠিকানা</th>
                    <th className="p-3 text-right">বাকি দেনা (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dueSuppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{s.name}</td>
                      <td className="p-3 text-slate-600">{s.phone}</td>
                      <td className="p-3 text-slate-500">{s.address || 'বরগুনা'}</td>
                      <td className="p-3 text-right font-bold text-rose-700 text-sm">{formatCurrency(s.totalDue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
