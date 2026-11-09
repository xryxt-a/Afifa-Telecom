import React, { useState } from 'react';
import {
  Boxes,
  Users,
  PackagePlus,
  TrendingUp,
  Store,
  CreditCard,
  AlertTriangle,
  Clock,
  PhoneCall,
  Search,
  Wallet,
  Wrench,
  ChevronRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, computeStockMatrix } from '../utils/helpers';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onSelectPrint?: (data: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    phones,
    purchases,
    sales,
    customers,
    dsrs,
    expenses,
    warrantyTasks,
    models,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Stock matrix & counts
  const stockRows = computeStockMatrix(phones);
  const finalStockQty = phones.filter((p) => p.status === 'in_stock').length;
  const dsrTotalQty = phones.filter((p) => p.status === 'with_dsr').length;

  // DSR Wise breakdown
  const dsrBreakdown = dsrs.map((d) => {
    const qty = phones.filter((p) => p.status === 'with_dsr' && p.dsrId === d.id).length;
    return { ...d, qty };
  });

  // 2. Today's Purchases (Total Receive)
  const todayPurchases = purchases.filter((p) => p.date === todayStr && p.status !== 'cancelled');
  const todayReceiveQty = todayPurchases.reduce((acc, p) => acc + p.totalQty, 0);

  // 3. Today's Sales
  const todaySales = sales.filter((s) => s.date === todayStr && s.status !== 'cancelled');
  const todaySalesAmount = todaySales.reduce((acc, s) => acc + s.totalAmount, 0);
  const todaySalesQty = todaySales.reduce((acc, s) => acc + s.totalQty, 0);

  // 4. Total Customer Due
  const totalCustomerDue = customers.reduce((acc, c) => acc + (c.currentDue || 0), 0);

  // 5. Today's Due vs Previous Due
  const todayDueCustomers = todaySales.filter((s) => s.dueAmount > 0);
  const previousDueCustomers = customers.filter((c) => (c.currentDue || 0) > 0);

  // 6. Low stock items (stock <= 2)
  const lowStockItems = stockRows.filter((r) => r.finalStockQty <= 2);

  // 7. Expenses
  const todayExpensesList = expenses.filter((e) => e.date === todayStr && e.status !== 'cancelled');
  const todayExpenseTotal = todayExpensesList.reduce((acc, e) => acc + e.amount, 0);

  const currentMonthStr = todayStr.substring(0, 7);
  const thisMonthExpensesList = expenses.filter((e) => e.date.startsWith(currentMonthStr) && e.status !== 'cancelled');
  const thisMonthExpenseTotal = thisMonthExpensesList.reduce((acc, e) => acc + e.amount, 0);

  // 8. Warranty counts
  const warrantyStep1Count = warrantyTasks.filter((w) => w.status === 'received_from_customer').length;
  const warrantyStep2Count = warrantyTasks.filter((w) => w.status === 'sent_to_care').length;
  const warrantyStep3Count = warrantyTasks.filter((w) => w.status === 'received_from_care').length;
  const totalInWarranty = warrantyTasks.filter((w) => w.status !== 'delivered_to_customer').length;

  // Search section state
  const [selectedImei, setSelectedImei] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');

  // Selected quick detail preview
  const inspectedPhone = selectedImei ? phones.find((p) => p.imei === selectedImei) : null;
  const inspectedCustomer = selectedCustomer ? customers.find((c) => c.id === selectedCustomer) : null;
  const inspectedModelRows = selectedModel ? stockRows.filter((r) => `${r.brand} ${r.model}` === selectedModel) : null;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-[#0B5ED7] to-[#0A4AB0] rounded-xl p-4 sm:p-6 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-white/20 rounded-md text-xs font-bold uppercase tracking-wider">
              দোকান অবস্থান: বরগুনা
            </span>
            <span className="text-blue-100 text-xs">আজকের হিসাব ও রিয়েল-টাইম ওভারভিউ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-1">
            আফিফা টেলিকম এন্ড ইলেকট্রনিক্স
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
            ১৫ ডিজিট ইউনিক IMEI ভিত্তিক পূর্ণাঙ্গ ইনভেন্টরি, DSR ট্র্যাকিং ও ক্যাশ সিস্টেম
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('new_sales')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-xs sm:text-sm rounded-lg shadow-sm transition active:scale-95"
          >
            + নিউ সেলস
          </button>
          <button
            onClick={() => onNavigate('new_purchase')}
            className="px-4 py-2 bg-white text-[#0B5ED7] hover:bg-blue-50 font-bold text-xs sm:text-sm rounded-lg shadow-sm transition active:scale-95"
          >
            + নিউ পারচেজ
          </button>
        </div>
      </div>

      {/* 6 Core Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Opening Quantity */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">১. ওপেনিং স্টক</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {finalStockQty} <span className="text-xs font-normal text-slate-500">টি</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">মেইন গোডাউন / দোকান</p>
        </div>

        {/* 2. DSR Stock */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">২. DSR স্টক</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-700">
            {dsrTotalQty} <span className="text-xs font-normal text-slate-500">টি</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {dsrs.length} জন DSR ফিল্ডে আছেন
          </div>
        </div>

        {/* 3. Total Receive Today */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">৩. আজকের রিসিভ</span>
            <PackagePlus className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700">
            {todayReceiveQty} <span className="text-xs font-normal text-slate-500">টি</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">আজকে কেনা / এন্ট্রি</p>
        </div>

        {/* 4. Total Sales Today */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">৪. আজকের সেলস</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-blue-700 truncate">
            {formatCurrency(todaySalesAmount)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            মোট ফোন: <strong>{todaySalesQty}</strong> টি
          </p>
        </div>

        {/* 5. Final Main Stock */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs ring-1 ring-blue-500/20">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">৫. ফাইনাল স্টক</span>
            <Store className="w-4 h-4 text-[#0B5ED7]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#0B5ED7]">
            {finalStockQty} <span className="text-xs font-normal text-slate-500">টি</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">বিক্রয়যোগ্য মেইন স্টক</p>
        </div>

        {/* 6. Customer Due */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">৬. কাস্টমার বাকি</span>
            <CreditCard className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-rose-700 truncate">
            {formatCurrency(totalCustomerDue)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">মোট পাওনা টাকা</p>
        </div>
      </div>

      {/* DSR Individual Allocation Pill List (If any DSR holds phones) */}
      {dsrBreakdown.length > 0 && dsrTotalQty > 0 && (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-amber-900 flex items-center">
            <Users className="w-3.5 h-3.5 mr-1" />
            DSR ওয়াইজ স্টক:
          </span>
          {dsrBreakdown.map((d) => (
            <span
              key={d.id}
              className="inline-flex items-center px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-amber-900 font-medium"
            >
              {d.name}: <strong className="ml-1 text-amber-700">{d.qty} টি</strong>
            </span>
          ))}
        </div>
      )}

      {/* Interactive Quick Search Section with 3 Dropdowns */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <Search className="w-5 h-5 text-[#0B5ED7]" />
          <h3 className="font-bold text-sm sm:text-base text-slate-800">
            রিয়েল-টাইম সার্চ ও ইনস্ট্যান্ট ডিটেইলস
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Dropdown 1: Select IMEI */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              সিলেক্ট IMEI (১৫ ডিজিট)
            </label>
            <select
              value={selectedImei}
              onChange={(e) => {
                setSelectedImei(e.target.value);
                setSelectedModel('');
                setSelectedCustomer('');
              }}
              className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- IMEI সিলেক্ট করুন ({phones.length} টি) --</option>
              {phones.map((p) => (
                <option key={p.imei} value={p.imei}>
                  {p.imei} ({p.brand} {p.model} - {p.status === 'in_stock' ? 'স্টকে' : p.status === 'with_dsr' ? 'DSR' : p.status})
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 2: Select Model */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              সিলেক্ট মডেল
            </label>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                setSelectedImei('');
                setSelectedCustomer('');
              }}
              className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- মডেল সিলেক্ট করুন --</option>
              {stockRows.map((r) => (
                <option key={`${r.brand} ${r.model}`} value={`${r.brand} ${r.model}`}>
                  {r.brand} {r.model} (স্টক: {r.finalStockQty} টি)
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 3: Select Customer */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              সিলেক্ট কাস্টমার
            </label>
            <select
              value={selectedCustomer}
              onChange={(e) => {
                setSelectedCustomer(e.target.value);
                setSelectedImei('');
                setSelectedModel('');
              }}
              className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- কাস্টমার সিলেক্ট করুন ({customers.length}) --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.phone} {c.currentDue > 0 ? `(বাকি: ৳${c.currentDue})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Instant Details Box */}
        {inspectedPhone && (
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs sm:text-sm space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 text-sm">
                {inspectedPhone.brand} {inspectedPhone.model}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-white text-blue-800 font-bold border border-blue-300">
                IMEI: {inspectedPhone.imei}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
              <div>স্ট্যাটাস: <strong className="text-blue-700">{inspectedPhone.status}</strong></div>
              <div>কেনা মূল্য: <strong>{formatCurrency(inspectedPhone.purchasePrice)}</strong></div>
              <div>বিক্রয় মূল্য: <strong>{formatCurrency(inspectedPhone.salePrice)}</strong></div>
              <div>কেনার চালান: <strong>{inspectedPhone.purchaseInvoiceNo || 'N/A'}</strong></div>
              {inspectedPhone.customerName && <div>ক্রেতা: <strong>{inspectedPhone.customerName}</strong></div>}
              {inspectedPhone.soldInvoiceNo && <div>সেল ইনভয়েস: <strong>{inspectedPhone.soldInvoiceNo}</strong></div>}
              {inspectedPhone.dsrName && <div>বর্তমান DSR: <strong>{inspectedPhone.dsrName}</strong></div>}
              <div>এন্ট্রি তারিখ: <strong>{inspectedPhone.purchaseDate}</strong></div>
            </div>
          </div>
        )}

        {inspectedCustomer && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs sm:text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 text-sm">{inspectedCustomer.name}</span>
              <span className="text-xs text-emerald-700">মোবাইল: {inspectedCustomer.phone}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-emerald-200">
              <span>ঠিকানা: <strong>{inspectedCustomer.address || 'বরগুনা'}</strong></span>
              <span>বর্তমান বাকি: <strong className="text-rose-600 text-base">{formatCurrency(inspectedCustomer.currentDue)}</strong></span>
            </div>
          </div>
        )}

        {inspectedModelRows && inspectedModelRows.length > 0 && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm space-y-2">
            <div className="font-bold text-slate-900">{inspectedModelRows[0].brand} {inspectedModelRows[0].model} স্টক সামারি</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
              <div>ইন স্টক: <strong className="text-emerald-700">{inspectedModelRows[0].finalStockQty} টি</strong></div>
              <div>DSR স্টক: <strong className="text-amber-700">{inspectedModelRows[0].dsrCurrentQty} টি</strong></div>
              <div>মোট কেনা: <strong>{inspectedModelRows[0].purchasedQty} টি</strong></div>
              <div>মোট বিক্রি: <strong>{inspectedModelRows[0].soldQty} টি</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* 3 Real-time Tables: Yesterday Due, Today Due, Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ক) পূর্বের / গতকালের বাকি */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <CreditCard className="w-4 h-4 text-rose-600" />
              <h4 className="font-bold text-xs sm:text-sm text-slate-800">
                ক) পূর্বের / বকেয়া কাস্টমার ({previousDueCustomers.length})
              </h4>
            </div>
            <button
              onClick={() => onNavigate('receive_voucher')}
              className="text-[11px] font-semibold text-[#0B5ED7] hover:underline"
            >
              + বাকি জমা
            </button>
          </div>

          <div className="p-3 flex-1 overflow-y-auto max-h-72 space-y-2">
            {previousDueCustomers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">কোনো পূর্বের বাকি নেই</p>
            ) : (
              previousDueCustomers.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 bg-rose-50/40 border border-rose-100 rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800 block">{c.name}</span>
                    <a
                      href={`tel:${c.phone}`}
                      className="inline-flex items-center text-[11px] text-blue-700 hover:underline mt-0.5"
                    >
                      <PhoneCall className="w-3 h-3 mr-1" />
                      {c.phone}
                    </a>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-700 block">{formatCurrency(c.currentDue)}</span>
                    <span className="text-[10px] text-slate-400">{c.address || 'বরগুনা'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* খ) আজকের বাকি */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <h4 className="font-bold text-xs sm:text-sm text-slate-800">
                খ) আজকের বাকি মেমো ({todayDueCustomers.length})
              </h4>
            </div>
            <button
              onClick={() => onNavigate('sales_manage')}
              className="text-[11px] font-semibold text-[#0B5ED7] hover:underline"
            >
              সেলস হিস্ট্রি
            </button>
          </div>

          <div className="p-3 flex-1 overflow-y-auto max-h-72 space-y-2">
            {todayDueCustomers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">আজকে কোনো বাকি বিক্রি হয়নি</p>
            ) : (
              todayDueCustomers.map((s) => (
                <div
                  key={s.id}
                  className="p-2.5 bg-amber-50/40 border border-amber-100 rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800 block">{s.customerName}</span>
                    <span className="text-[11px] text-slate-500">{s.invoiceNo} • {s.customerPhone}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-800 block">{formatCurrency(s.dueAmount)}</span>
                    <span className="text-[10px] text-slate-500">বিল: {formatCurrency(s.totalAmount)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* গ) লো স্টক রি-অর্ডার অ্যালার্ট */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h4 className="font-bold text-xs sm:text-sm text-slate-800">
                গ) লো স্টক অ্যালার্ট (২ বা কম)
              </h4>
            </div>
            <button
              onClick={() => onNavigate('new_purchase')}
              className="text-[11px] font-semibold text-emerald-600 hover:underline"
            >
              + পারচেজ করুন
            </button>
          </div>

          <div className="p-3 flex-1 overflow-y-auto max-h-72 space-y-2">
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">সব মডেলের পর্যাপ্ত স্টক আছে</p>
            ) : (
              lowStockItems.map((r, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-rose-50/60 border border-rose-200 rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{r.brand} {r.model}</span>
                    <span className="text-[10px] text-slate-500">বিক্রয় মূল্য: {formatCurrency(r.avgSalePrice)}</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 bg-rose-600 text-white font-bold rounded text-[11px]">
                      স্টক: {r.finalStockQty} টি
                    </span>
                    <span className="text-[10px] text-rose-600 block mt-0.5 font-medium">রি-অর্ডার প্রয়োজন</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom 2 Cards: Expense Summary & Warranty Service Pending */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expenses Summary */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-600 mb-1">
              <Wallet className="w-4 h-4 text-sky-600" />
              <span className="font-bold text-xs sm:text-sm">দোকান খরচ সামারি</span>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <div>
                <span className="text-xs text-slate-500 block">আজকের মোট খরচ:</span>
                <span className="text-base sm:text-lg font-bold text-slate-900">
                  {formatCurrency(todayExpenseTotal)}
                </span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-xs text-slate-500 block">এই চলতি মাসের খরচ:</span>
                <span className="text-base sm:text-lg font-bold text-[#0B5ED7]">
                  {formatCurrency(thisMonthExpenseTotal)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('expense_manage')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            খরচ দেখুন →
          </button>
        </div>

        {/* Warranty Pending Summary */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-600 mb-1">
              <Wrench className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-xs sm:text-sm">ওয়ারেন্টি সার্ভিস ট্র্যাকিং সামারি</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
              <div className="p-1.5 bg-purple-50 rounded border border-purple-100">
                <span className="text-[10px] text-purple-700 block">রিসিভ কৃত:</span>
                <strong className="text-purple-900">{warrantyStep1Count} টি</strong>
              </div>
              <div className="p-1.5 bg-blue-50 rounded border border-blue-100">
                <span className="text-[10px] text-blue-700 block">কেয়ারে পাঠানো:</span>
                <strong className="text-blue-900">{warrantyStep2Count} টি</strong>
              </div>
              <div className="p-1.5 bg-emerald-50 rounded border border-emerald-100">
                <span className="text-[10px] text-emerald-700 block">কেয়ার হতে ফেরত:</span>
                <strong className="text-emerald-900">{warrantyStep3Count} টি</strong>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('tasks')}
            className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-semibold rounded-lg transition"
          >
            সার্ভিস টাস্কস →
          </button>
        </div>
      </div>
    </div>
  );
};
