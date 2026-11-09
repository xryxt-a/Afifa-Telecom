import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Printer,
  Calendar,
  XCircle,
  Eye,
  AlertCircle,
  CheckCircle,
  BarChart2,
  TrendingDown,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';
import { Expense } from '../types';

interface ExpenseManageViewProps {
  onOpenPrint: (data: any) => void;
}

export const ExpenseManageView: React.FC<ExpenseManageViewProps> = ({ onOpenPrint }) => {
  const { expenses, expenseCategories, addExpense, cancelExpense } = useApp();
  const todayStr = new Date().toISOString().split('T')[0];

  // Add Expense Modal / Toggle
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields
  const [date, setDate] = useState(todayStr);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank'>('cash');
  const [paidTo, setPaidTo] = useState('');
  const [note, setNote] = useState('');

  // Selected Detail Modal
  const [inspectedExpense, setInspectedExpense] = useState<Expense | null>(null);

  // Alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMethod, setFilterMethod] = useState('');

  // Submit New Expense
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!categoryId) {
      setErrorMsg('দয়া করে খরচের ক্যাটাগরি নির্বাচন করুন!');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('খরচের টাইটেল বা বিবরণ লিখুন!');
      return;
    }
    if (amount <= 0) {
      setErrorMsg('সঠিক খরচের টাকার পরিমাণ লিখুন!');
      return;
    }
    if (!paidTo.trim()) {
      setErrorMsg('যাকে দেওয়া হইছে তার নাম লিখুন!');
      return;
    }

    const catObj = expenseCategories.find((c) => c.id === categoryId);
    const categoryName = catObj ? catObj.name : 'দোকান খরচ';

    const result = addExpense({
      date,
      categoryId,
      categoryName,
      title: title.trim(),
      amount,
      paymentMethod,
      paidTo: paidTo.trim(),
      note: note.trim() || undefined,
    });

    if (!result.success) {
      setErrorMsg(result.error || 'খরচ সংরক্ষণ ব্যর্থ হয়েছে!');
      return;
    }

    setSuccessMsg(`খরচ সফলভাবে এন্ট্রি হয়েছে! ভাউচার নং: ${result.expenseNo}`);

    const newExpObj = {
      id: `exp-${Date.now()}`,
      expenseNo: result.expenseNo!,
      date,
      categoryId,
      categoryName,
      title: title.trim(),
      amount,
      paymentMethod,
      paidTo: paidTo.trim(),
      note: note.trim() || undefined,
      status: 'completed' as const,
      createdAt: new Date().toISOString(),
      createdBy: 'এডমিন',
    };

    onOpenPrint({ type: 'expense', data: newExpObj });

    // Reset Form
    setTitle('');
    setAmount(0);
    setPaidTo('');
    setNote('');
    setShowAddForm(false);
  };

  // Cancel Expense
  const handleCancelExpense = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত এই খরচ ভাউচারটি ক্যানসেল করতে চান? ক্যাশ বুক স্বয়ংক্রিয়ভাবে রিভার্স হবে।')) {
      const res = cancelExpense(id);
      if (!res.success) {
        setErrorMsg(res.error || 'ক্যানসেল ব্যর্থ হয়েছে!');
      } else {
        setSuccessMsg('খরচ ভাউচার সফলভাবে ক্যানসেল করা হয়েছে।');
      }
    }
  };

  // Filtered List
  const filteredExpenses = expenses.filter((exp) => {
    if (filterStartDate && exp.date < filterStartDate) return false;
    if (filterEndDate && exp.date > filterEndDate) return false;
    if (filterCategory && exp.categoryId !== filterCategory) return false;
    if (filterMethod && exp.paymentMethod !== filterMethod) return false;
    return true;
  });

  // Category-wise totals in filtered range
  const categorySummary = expenseCategories.map((cat) => {
    const total = filteredExpenses
      .filter((e) => e.categoryId === cat.id && e.status !== 'cancelled')
      .reduce((acc, e) => acc + e.amount, 0);
    return { name: cat.name, total };
  }).filter((c) => c.total > 0);

  // Monthly Comparison: This Month vs Last Month
  const currentMonth = todayStr.substring(0, 7);
  const now = new Date();
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStr = lastMonthDate.toISOString().substring(0, 7);

  const thisMonthTotal = expenses
    .filter((e) => e.date.startsWith(currentMonth) && e.status !== 'cancelled')
    .reduce((acc, e) => acc + e.amount, 0);

  const lastMonthTotal = expenses
    .filter((e) => e.date.startsWith(lastMonthStr) && e.status !== 'cancelled')
    .reduce((acc, e) => acc + e.amount, 0);

  const totalFilteredAmount = filteredExpenses
    .filter((e) => e.status !== 'cancelled')
    .reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-sky-100 text-sky-800">
            <Wallet className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              দোকান খরচ ব্যবস্থাপনা (Expense Manage)
            </h2>
            <p className="text-xs text-slate-500">
              আফিফা টেলিকম এন্ড ইলেকট্রনিক্স • বরগুনা
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-[#0B5ED7] hover:bg-[#0A4AB0] text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ নতুন খরচ এন্ট্রি করুন</span>
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

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">চলতি মাসের মোট খরচ ({currentMonth}):</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 block">
            {formatCurrency(thisMonthTotal)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">গত মাসের মোট খরচ ({lastMonthStr}):</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-600 mt-1 block">
            {formatCurrency(lastMonthTotal)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs ring-1 ring-sky-500/20">
          <span className="text-xs text-slate-500 block">ফিল্টারকৃত মোট খরচ:</span>
          <span className="text-xl sm:text-2xl font-bold text-sky-800 mt-1 block">
            {formatCurrency(totalFilteredAmount)}
          </span>
        </div>
      </div>

      {/* Add Expense Form Modal or Inline Collapse */}
      {showAddForm && (
        <form
          onSubmit={handleCreateExpense}
          className="bg-white p-5 rounded-xl border-2 border-blue-400 shadow-md space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-sm sm:text-base text-slate-800 flex items-center">
              <Plus className="w-4 h-4 mr-1 text-[#0B5ED7]" />
              নতুন দোকান খরচ ভাউচার এন্ট্রি (EXP)
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold"
            >
              বন্ধ করুন ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                তারিখ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                খরচের ক্যাটাগরি <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none font-medium"
                required
              >
                <option value="">-- ক্যাটাগরি নির্বাচন করুন --</option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                পেমেন্ট মেথড
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none font-medium"
              >
                <option value="cash">ক্যাশ (Cash)</option>
                <option value="bkash">বিকাশ (bKash)</option>
                <option value="nagad">নগদ (Nagad)</option>
                <option value="bank">ব্যাংক (Bank)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                টাইটেল / বিবরণ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: দোকান ভাড়া, কারেন্ট বিল, নাস্তা"
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                টাকার পরিমাণ (৳) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0"
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none font-bold text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                যাকে দেওয়া হইছে (প্রাপক) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                placeholder="ব্যক্তি / প্রতিষ্ঠানের নাম"
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              নোট / রেফারেন্স
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="বিল ভাউচার নং / অতিরিক্ত তথ্য"
              className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs sm:text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#0B5ED7] hover:bg-[#0A4AB0] text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition active:scale-95"
            >
              সংরক্ষণ ও প্রিন্ট ভাউচার
            </button>
          </div>
        </form>
      )}

      {/* Category Wise Breakdown Pill List */}
      {categorySummary.length > 0 && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            ক্যাটাগরি ওয়াইজ মোট খরচ:
          </span>
          <div className="flex flex-wrap gap-2">
            {categorySummary.map((c, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 shadow-2xs"
              >
                {c.name}: <strong className="text-rose-700">{formatCurrency(c.total)}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-600 mb-1">তারিখ থেকে</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-600 mb-1">তারিখ পর্যন্ত</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-600 mb-1">ক্যাটাগরি</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none"
          >
            <option value="">-- সব ক্যাটাগরি --</option>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
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
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs sm:text-sm text-slate-800">
            খরচের তালিকা ({filteredExpenses.length} টি)
          </h3>
          <span className="text-xs text-slate-600 font-bold">
            সর্বমোট: {formatCurrency(totalFilteredAmount)}
          </span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
            কোনো খরচ রেকর্ড পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-100/70 font-semibold text-slate-600">
                <tr>
                  <th className="p-3">ভাউচার নং</th>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3">ক্যাটাগরি</th>
                  <th className="p-3">টাইটেল / বিবরণ</th>
                  <th className="p-3">প্রাপক</th>
                  <th className="p-3">মেথড</th>
                  <th className="p-3 text-right">টাকা (৳)</th>
                  <th className="p-3 text-center">স্ট্যাটাস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{exp.expenseNo}</td>
                    <td className="p-3 text-slate-600">{exp.date}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                        {exp.categoryName}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{exp.title}</td>
                    <td className="p-3 text-slate-700">{exp.paidTo}</td>
                    <td className="p-3 uppercase text-[11px] font-mono text-slate-500">{exp.paymentMethod}</td>
                    <td className="p-3 text-right font-bold text-rose-700">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="p-3 text-center">
                      {exp.status === 'cancelled' ? (
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
                          onClick={() => onOpenPrint({ type: 'expense', data: exp })}
                          className="p-1 text-slate-500 hover:text-blue-700 rounded hover:bg-slate-100"
                          title="প্রিন্ট ভাউচার"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {exp.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelExpense(exp.id)}
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
