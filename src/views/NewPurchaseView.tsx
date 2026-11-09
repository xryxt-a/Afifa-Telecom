import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layers,
  Printer,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, isValidIMEI, generateSerialIMEIs } from '../utils/helpers';
import { PurchaseItem } from '../types';

interface NewPurchaseViewProps {
  onOpenPrint: (data: any) => void;
  onNavigate: (view: string) => void;
}

export const NewPurchaseView: React.FC<NewPurchaseViewProps> = ({ onOpenPrint, onNavigate }) => {
  const {
    brands,
    models,
    suppliers,
    addModel,
    addSupplier,
    addPurchase,
    phones,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Invoice Form State
  const [purchaseDate, setPurchaseDate] = useState(todayStr);
  const [supplierId, setSupplierId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank'>('cash');
  const [paidAmount, setPaidAmount] = useState<number>(0);

  // Model Adding Row State
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [imeiBulkText, setImeiBulkText] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);

  // Added Items List
  const [addedItems, setAddedItems] = useState<PurchaseItem[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Inline Quick Add Modals
  const [showNewModelModal, setShowNewModelModal] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');

  // Alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Available models for selected brand
  const filteredModels = models.filter((m) => m.brand === selectedBrand);

  // Handle Model Change -> Auto-fill default pricing if exists
  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName);
    const m = models.find((item) => item.brand === selectedBrand && item.name === modelName);
    if (m) {
      if (m.defaultPurchasePrice) setPurchasePrice(m.defaultPurchasePrice);
      if (m.defaultSalePrice) setSalePrice(m.defaultSalePrice);
    }
  };

  // Parse Bulk IMEIs
  const parseBulkImeis = (): string[] => {
    return imeiBulkText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const parsedImeis = parseBulkImeis();

  // Auto Generate Serial IMEIs
  const handleAutoGenerate = (count: number) => {
    const existingImeis = phones.map((p) => p.imei);
    const addedImeis = addedItems.flatMap((i) => i.imeis);
    const currentBoxImeis = parseBulkImeis();
    const allKnown = [...existingImeis, ...addedImeis, ...currentBoxImeis];

    const generated = generateSerialIMEIs(count, allKnown);
    const newText = imeiBulkText.trim()
      ? `${imeiBulkText.trim()}\n${generated.join('\n')}`
      : generated.join('\n');
    setImeiBulkText(newText);
  };

  // Add Row to Cart
  const handleAddItem = () => {
    setErrorMsg('');
    if (!selectedBrand) {
      setErrorMsg('আগে ব্র্যান্ড সিলেক্ট করুন!');
      return;
    }
    if (!selectedModel) {
      setErrorMsg('মডেল সিলেক্ট করুন!');
      return;
    }
    if (parsedImeis.length === 0) {
      setErrorMsg('কমপক্ষে একটি ১৫ ডিজিট IMEI ইনপুট দিন!');
      return;
    }

    // Validate 15 digits & duplicates
    const existingImeiSet = new Set(phones.map((p) => p.imei));
    const currentAddedImeiSet = new Set(addedItems.flatMap((i) => i.imeis));
    const seenThisBatch = new Set<string>();

    for (const imei of parsedImeis) {
      if (!isValidIMEI(imei)) {
        setErrorMsg(`IMEI "${imei}" সঠিক ১৫ ডিজিটের সংখ্যা নয়! সংশোধন করুন।`);
        return;
      }
      if (seenThisBatch.has(imei)) {
        setErrorMsg(`ডুপ্লিকেট IMEI "${imei}" একই লিস্টে দুইবার দেওয়া হয়েছে!`);
        return;
      }
      seenThisBatch.add(imei);

      if (currentAddedImeiSet.has(imei)) {
        setErrorMsg(`IMEI "${imei}" ইতিমধ্যে নিচের অ্যাডেড লিস্টে যোগ করা আছে!`);
        return;
      }
      if (existingImeiSet.has(imei)) {
        setErrorMsg(`IMEI "${imei}" ইতিমধ্যে ডাটাবেজে স্টকে/আগের চালানে আছে! এক IMEI দুইবার কেনা যাবে না।`);
        return;
      }
    }

    if (purchasePrice <= 0) {
      setErrorMsg('সঠিক ক্রয় মূল্য দিন!');
      return;
    }
    if (salePrice < purchasePrice) {
      // warning allow but alert
    }

    const newItem: PurchaseItem = {
      brand: selectedBrand,
      model: selectedModel,
      imeis: parsedImeis,
      purchasePrice,
      salePrice: salePrice || purchasePrice,
      total: purchasePrice * parsedImeis.length,
    };

    setAddedItems((prev) => [...prev, newItem]);

    // Reset input row
    setSelectedModel('');
    setImeiBulkText('');
    setPurchasePrice(0);
    setSalePrice(0);
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    setAddedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Calculations
  const totalQty = addedItems.reduce((acc, i) => acc + i.imeis.length, 0);
  const totalAmount = addedItems.reduce((acc, i) => acc + i.total, 0);
  const dueAmount = Math.max(0, totalAmount - (paidAmount || 0));

  // Quick Add Model Submit
  const handleCreateNewModel = () => {
    if (!newModelName.trim()) return;
    addModel({
      brand: selectedBrand,
      name: newModelName.trim(),
      defaultPurchasePrice: purchasePrice || undefined,
      defaultSalePrice: salePrice || undefined,
    });
    setSelectedModel(newModelName.trim());
    setNewModelName('');
    setShowNewModelModal(false);
  };

  // Quick Add Supplier Submit
  const handleCreateNewSupplier = () => {
    if (!newSupplierName.trim()) return;
    addSupplier({
      name: newSupplierName.trim(),
      phone: newSupplierPhone.trim() || 'N/A',
      address: 'বরগুনা',
    });
    setNewSupplierName('');
    setNewSupplierPhone('');
    setShowNewSupplierModal(false);
  };

  // Submit Purchase
  const handleCompletePurchase = () => {
    setErrorMsg('');
    if (!supplierId) {
      setErrorMsg('দয়া করে সাপ্লায়ার সিলেক্ট করুন!');
      return;
    }
    if (addedItems.length === 0) {
      setErrorMsg('কমপক্ষে একটি মডেল ও IMEI যোগ করুন!');
      return;
    }

    const supplierObj = suppliers.find((s) => s.id === supplierId);
    const supplierName = supplierObj ? supplierObj.name : 'সাপ্লায়ার';

    const result = addPurchase({
      date: purchaseDate,
      supplierId,
      supplierName,
      items: addedItems,
      totalQty,
      totalAmount,
      paidAmount: paidAmount || 0,
      dueAmount,
      paymentMethod,
    });

    if (!result.success) {
      setErrorMsg(result.error || 'পারচেজ সংরক্ষণ ব্যর্থ হয়েছে!');
      return;
    }

    setSuccessMsg(`পারচেজ সফল হয়েছে! চালান নম্বর: ${result.invoiceNo}`);
    
    // Auto-open print preview
    const completedInvoice = {
      id: `pur-${Date.now()}`,
      invoiceNo: result.invoiceNo!,
      date: purchaseDate,
      supplierId,
      supplierName,
      items: addedItems,
      totalQty,
      totalAmount,
      paidAmount: paidAmount || 0,
      dueAmount,
      paymentMethod,
      status: 'completed' as const,
      createdAt: new Date().toISOString(),
      createdBy: 'এডমিন',
    };

    onOpenPrint({ type: 'purchase', data: completedInvoice });

    // Reset Form
    setAddedItems([]);
    setPaidAmount(0);
    setSelectedBrand('');
    setSelectedModel('');
    setImeiBulkText('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-blue-100 text-[#0B5ED7]">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                নিউ পারচেজ এন্ট্রি (বাল্ক IMEI)
              </h2>
              <p className="text-xs text-slate-500">
                ব্র্যান্ড ওয়াইজ ও মডেল ওয়াইজ বাল্ক IMEI ইনপুট • লোকেশন: বরগুনা
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('purchase_manage')}
          className="text-xs sm:text-sm font-semibold text-[#0B5ED7] hover:underline"
        >
          পারচেজ লিস্ট ও ম্যানেজ দেখুন →
        </button>
      </div>

      {/* Success / Error Alerts */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs sm:text-sm text-rose-800 flex items-center space-x-2 animate-shake">
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

      {/* STEP 1 to STEP 5: Model & Bulk IMEI Input Card */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm sm:text-base text-slate-800 border-b border-slate-100 pb-2 flex items-center">
          <Layers className="w-4 h-4 mr-1.5 text-[#0B5ED7]" />
          মডেল ও IMEI ইনপুট বক্স (এক লাইনে একটি IMEI)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 1: Brand Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ধাপ ১: ব্র্যান্ড সিলেক্ট করুন <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setSelectedModel('');
              }}
              className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            >
              <option value="">-- ব্র্যান্ড নির্বাচন করুন --</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Model Select + Inline "+ নিউ মডেল" Modal trigger */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">
                ধাপ ২: মডেল সিলেক্ট করুন <span className="text-rose-500">*</span>
              </label>
              {selectedBrand && (
                <button
                  type="button"
                  onClick={() => setShowNewModelModal(true)}
                  className="text-xs font-bold text-[#0B5ED7] hover:underline flex items-center"
                >
                  <Plus className="w-3 h-3 mr-0.5" /> নিউ মডেল
                </button>
              )}
            </div>
            <select
              value={selectedModel}
              onChange={(e) => handleModelSelect(e.target.value)}
              disabled={!selectedBrand}
              className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 disabled:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            >
              <option value="">
                {!selectedBrand ? '-- আগে ব্র্যান্ড সিলেক্ট করুন --' : '-- মডেল নির্বাচন করুন --'}
              </option>
              {filteredModels.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 3: Bulk IMEI Input Box + Serial IMEI Generator Dropdown */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <label className="text-xs font-semibold text-slate-700">
              ধাপ ৩: IMEI বাল্ক ইনপুট বক্স (প্রতি লাইনে একটি ১৫ ডিজিট IMEI)
              <span className="ml-2 font-normal text-slate-500">
                (বর্তমান সংখ্যা: <strong className="text-blue-700 font-bold">{parsedImeis.length} টি</strong>)
              </span>
            </label>

            {/* Serial IMEI auto select buttons */}
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-slate-500 text-[11px] mr-1 hidden sm:inline">অটো সিরিয়াল তৈরি:</span>
              {[1, 3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleAutoGenerate(num)}
                  className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-[#0B5ED7] font-semibold rounded border border-blue-200 transition"
                  title={`${num} টি ইউনিক ১৫ ডিজিট IMEI যোগ করুন`}
                >
                  +{num}টি IMEI
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={4}
            value={imeiBulkText}
            onChange={(e) => setImeiBulkText(e.target.value)}
            placeholder="এখানে সরাসরি পেস্ট করুন বা স্ক্যান করুন...&#10;864501051234567&#10;864501051234568&#10;864501051234569"
            className="w-full p-3 font-mono text-xs sm:text-sm border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-400"
          />
        </div>

        {/* Step 4: Purchase & Sale Price Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ধাপ ৪: পারচেজ প্রাইস (প্রতি পিস ক্রয় মূল্য ৳) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={purchasePrice || ''}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
              placeholder="0"
              className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ধার্যকৃত সেল প্রাইস (বিক্রয় মূল্য ৳)
            </label>
            <input
              type="number"
              value={salePrice || ''}
              onChange={(e) => setSalePrice(Number(e.target.value))}
              placeholder="0"
              className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
            />
          </div>
        </div>

        {/* Step 5: Add Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-[#0B5ED7] hover:bg-[#0A4AB0] text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>লিস্টে অ্যাড করুন (ধাপ ৫)</span>
          </button>
        </div>
      </div>

      {/* Step 6: Added Items List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs sm:text-sm text-slate-800">
            ধাপ ৬: অ্যাডেড মডেল ও IMEI তালিকা ({addedItems.length} টি আইটেম)
          </h3>
          <span className="text-xs text-slate-500">
            মোট ফোন: <strong className="text-blue-700">{totalQty} টি</strong>
          </span>
        </div>

        {addedItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
            এখনো কোনো মডেল অ্যাড করা হয়নি। উপরের বক্সে মডেল ও IMEI দিয়ে "লিস্টে অ্যাড করুন" চাপুন।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm divide-y divide-slate-200">
              <thead className="bg-slate-100/70 font-semibold text-slate-600">
                <tr>
                  <th className="p-3">ব্র্যান্ড ও মডেল</th>
                  <th className="p-3 text-center">কোয়ান্টিটি</th>
                  <th className="p-3">ক্রয় মূল্য</th>
                  <th className="p-3">বিক্রয় মূল্য</th>
                  <th className="p-3">মোট টাকা</th>
                  <th className="p-3 text-center">IMEI লিস্ট</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {addedItems.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-3">
                        <span className="font-bold text-slate-900">{item.brand}</span>{' '}
                        <span className="text-slate-700">{item.model}</span>
                      </td>
                      <td className="p-3 text-center font-bold text-blue-700">
                        {item.imeis.length} টি
                      </td>
                      <td className="p-3 font-medium">{formatCurrency(item.purchasePrice)}</td>
                      <td className="p-3 font-medium text-slate-600">{formatCurrency(item.salePrice)}</td>
                      <td className="p-3 font-bold text-slate-900">{formatCurrency(item.total)}</td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                          className="inline-flex items-center text-xs text-[#0B5ED7] hover:underline font-semibold"
                        >
                          {item.imeis.length} টি IMEI {expandedRow === idx ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                          title="মুছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    {expandedRow === idx && (
                      <tr className="bg-blue-50/40">
                        <td colSpan={7} className="p-3">
                          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                            {item.imeis.map((imei, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-white border border-blue-200 rounded font-mono text-[11px] text-slate-800"
                              >
                                {i + 1}. {imei}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Step 7 to Step 9: Supplier, Billing & Completion Card */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm sm:text-base text-slate-800 border-b border-slate-100 pb-2">
          ধাপ ৭ - ৯: সাপ্লায়ার, পেমেন্ট ও ইনভয়েস সম্পন্নকরণ
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Step 7: Supplier Select + Quick Add */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">
                ধাপ ৭: সাপ্লায়ার নির্বাচন <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowNewSupplierModal(true)}
                className="text-xs font-bold text-[#0B5ED7] hover:underline flex items-center"
              >
                <Plus className="w-3 h-3 mr-0.5" /> নিউ সাপ্লায়ার
              </button>
            </div>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            >
              <option value="">-- সাপ্লায়ার সিলেক্ট করুন --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.phone}) {s.totalDue > 0 ? `- পূর্বের বাকি: ৳${s.totalDue}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              পেমেন্ট মেথড
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            >
              <option value="cash">ক্যাশ (Cash)</option>
              <option value="bkash">বিকাশ (bKash)</option>
              <option value="nagad">নগদ (Nagad)</option>
              <option value="bank">ব্যাংক (Bank)</option>
            </select>
          </div>

          {/* Paid Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              পরিশোধিত টাকা (ক্যাশ আউট)
            </label>
            <input
              type="number"
              value={paidAmount || ''}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              placeholder="0"
              className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
            />
          </div>
        </div>

        {/* Step 8: Totals Display */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <span className="text-xs text-slate-500 block">মোট ফোন</span>
            <span className="text-lg sm:text-xl font-bold text-blue-700">{totalQty} টি</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">টোটাল বিল</span>
            <span className="text-lg sm:text-xl font-bold text-slate-900">{formatCurrency(totalAmount)}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">পরিশোধ</span>
            <span className="text-lg sm:text-xl font-bold text-emerald-700">{formatCurrency(paidAmount || 0)}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">সাপ্লায়ার বাকি</span>
            <span className="text-lg sm:text-xl font-bold text-rose-700">{formatCurrency(dueAmount)}</span>
          </div>
        </div>

        {/* Step 9: Complete Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleCompletePurchase}
            disabled={addedItems.length === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition active:scale-95"
          >
            <CheckCircle className="w-5 h-5" />
            <span>পারচেজ সম্পন্ন করুন ও প্রিন্ট ইনভয়েস (PUR)</span>
          </button>
        </div>
      </div>

      {/* Inline Modal: Add New Model */}
      {showNewModelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">
              + নতুন মডেল যুক্ত করুন ({selectedBrand})
            </h4>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                মডেলের নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder="যেমন: Galaxy A15, Y28, C65"
                className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewModelModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleCreateNewModel}
                className="px-4 py-1.5 text-xs font-bold bg-[#0B5ED7] text-white rounded-lg shadow-sm"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Modal: Add New Supplier */}
      {showNewSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">
              + নতুন সাপ্লায়ার যুক্ত করুন
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  সাপ্লায়ার / ডিস্ট্রিবিউটর নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  placeholder="যেমন: স্মার্ট ডিস্ট্রিবিউশন"
                  className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ফোন নম্বর
                </label>
                <input
                  type="text"
                  value={newSupplierPhone}
                  onChange={(e) => setNewSupplierPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewSupplierModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleCreateNewSupplier}
                className="px-4 py-1.5 text-xs font-bold bg-[#0B5ED7] text-white rounded-lg shadow-sm"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
