import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Scan,
  User,
  CreditCard,
  Layers,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, isValidIMEI } from '../utils/helpers';
import { SaleItem } from '../types';

interface NewSalesViewProps {
  onOpenPrint: (data: any) => void;
  onNavigate: (view: string) => void;
}

export const NewSalesView: React.FC<NewSalesViewProps> = ({ onOpenPrint, onNavigate }) => {
  const {
    brands,
    models,
    phones,
    customers,
    addCustomer,
    addSale,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Cart Items
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);

  // Customer Section
  const [customerId, setCustomerId] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('বরগুনা');
  const [newCustOpeningDue, setNewCustOpeningDue] = useState<number>(0);

  // Billing
  const [discount, setDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank' | 'due'>('cash');

  // Input Options: Mode 1 (Bulk), Mode 2 (Dropdowns), Mode 3 (Single Scan/Type)
  const [activeInputMode, setActiveInputMode] = useState<'bulk' | 'dropdown' | 'scan'>('bulk');

  // Bulk input box
  const [bulkImeiText, setBulkImeiText] = useState('');

  // Dropdown input box
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedPhoneImei, setSelectedPhoneImei] = useState('');

  // Scan/Single IMEI input box
  const [singleImeiInput, setSingleImeiInput] = useState('');

  // Alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Available in-stock phones
  const inStockPhones = phones.filter((p) => p.status === 'in_stock');
  const availableBrands = Array.from(new Set(inStockPhones.map((p) => p.brand)));
  const availableModels = selectedBrand
    ? Array.from(new Set(inStockPhones.filter((p) => p.brand === selectedBrand).map((p) => p.model)))
    : [];
  const availablePhonesForModel = (selectedBrand && selectedModel)
    ? inStockPhones.filter((p) => p.brand === selectedBrand && p.model === selectedModel)
    : [];

  // Parse Bulk IMEIs and Auto-Add
  const handleProcessBulkImeis = () => {
    setErrorMsg('');
    const lines = bulkImeiText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (lines.length === 0) {
      setErrorMsg('দয়া করে বক্সে কমপক্ষে একটি ১৫ ডিজিট IMEI দিন!');
      return;
    }

    const currentCartImeis = new Set(cartItems.map((c) => c.imei));
    const newItemsToAdd: SaleItem[] = [];

    for (const imei of lines) {
      if (!isValidIMEI(imei)) {
        setErrorMsg(`IMEI "${imei}" সঠিক ১৫ ডিজিটের নয়! সংশোধন করুন।`);
        return;
      }
      if (currentCartImeis.has(imei)) {
        setErrorMsg(`IMEI "${imei}" ইতিমধ্যে সেলস কার্টে যোগ করা আছে!`);
        return;
      }

      // Check stock status
      const targetPhone = phones.find((p) => p.imei === imei);
      if (!targetPhone) {
        setErrorMsg(`IMEI "${imei}" ডাটাবেজে পাওয়া যায়নি! আগে পারচেজ এন্ট্রি করুন।`);
        return;
      }
      if (targetPhone.status === 'sold') {
        setErrorMsg(`IMEI "${imei}" আগে বিক্রি হয়ে গেছে! আবার বিক্রি করা যাবে না।`);
        return;
      }
      if (targetPhone.status === 'with_dsr') {
        setErrorMsg(`IMEI "${imei}" বর্তমানে DSR (${targetPhone.dsrName || 'অজ্ঞাত'}) এর কাছে আছে! দোকান স্টকে নেই।`);
        return;
      }
      if (targetPhone.status !== 'in_stock') {
        setErrorMsg(`IMEI "${imei}" বিক্রয়যোগ্য স্টকে নেই (স্ট্যাটাস: ${targetPhone.status})!`);
        return;
      }

      newItemsToAdd.push({
        brand: targetPhone.brand,
        model: targetPhone.model,
        imei: targetPhone.imei,
        salePrice: targetPhone.salePrice || targetPhone.purchasePrice || 0,
      });
      currentCartImeis.add(imei);
    }

    setCartItems((prev) => [...prev, ...newItemsToAdd]);
    setBulkImeiText('');
    setSuccessMsg(`${newItemsToAdd.length} টি ফোন সেলস কার্টে যুক্ত হয়েছে!`);
  };

  // Handle Dropdown Selection
  const handleAddFromDropdown = () => {
    setErrorMsg('');
    if (!selectedPhoneImei) {
      setErrorMsg('স্টক থেকে ফোন সিলেক্ট করুন!');
      return;
    }

    if (cartItems.some((c) => c.imei === selectedPhoneImei)) {
      setErrorMsg('এই ফোনটি ইতিমধ্যে কার্টে যোগ করা হয়েছে!');
      return;
    }

    const phoneObj = inStockPhones.find((p) => p.imei === selectedPhoneImei);
    if (!phoneObj) {
      setErrorMsg('ফোনটি স্টকে পাওয়া যায়নি!');
      return;
    }

    setCartItems((prev) => [
      ...prev,
      {
        brand: phoneObj.brand,
        model: phoneObj.model,
        imei: phoneObj.imei,
        salePrice: phoneObj.salePrice || 0,
      },
    ]);

    setSelectedPhoneImei('');
  };

  // Handle Single Scan / Type IMEI
  const handleSingleImeiScan = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    setErrorMsg('');

    const cleanImei = singleImeiInput.trim();
    if (!isValidIMEI(cleanImei)) {
      setErrorMsg(`IMEI "${cleanImei}" অবশ্যই সঠিক ১৫ ডিজিটের হতে হবে!`);
      return;
    }

    if (cartItems.some((c) => c.imei === cleanImei)) {
      setErrorMsg(`IMEI "${cleanImei}" ইতিমধ্যে কার্টে যোগ করা হয়েছে!`);
      return;
    }

    const phone = phones.find((p) => p.imei === cleanImei);
    if (!phone) {
      setErrorMsg(`IMEI "${cleanImei}" স্টকে পাওয়া যায়নি!`);
      return;
    }
    if (phone.status === 'sold') {
      setErrorMsg(`সতর্কতা: IMEI "${cleanImei}" আগে বিক্রি হয়ে গেছে!`);
      return;
    }
    if (phone.status === 'with_dsr') {
      setErrorMsg(`সতর্কতা: IMEI "${cleanImei}" এখন DSR (${phone.dsrName}) এর কাছে আছে!`);
      return;
    }
    if (phone.status !== 'in_stock') {
      setErrorMsg(`সতর্কতা: IMEI "${cleanImei}" স্টকে নেই (${phone.status})!`);
      return;
    }

    setCartItems((prev) => [
      ...prev,
      {
        brand: phone.brand,
        model: phone.model,
        imei: phone.imei,
        salePrice: phone.salePrice || 0,
      },
    ]);
    setSingleImeiInput('');
  };

  // Update Custom Sale Price in cart
  const handleUpdatePrice = (index: number, newPrice: number) => {
    setCartItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, salePrice: newPrice } : item))
    );
  };

  // Remove from cart
  const handleRemoveFromCart = (index: number) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Quick Customer Creation
  const handleCreateCustomer = () => {
    if (!newCustName.trim()) {
      setErrorMsg('কাস্টমারের নাম লিখুন!');
      return;
    }
    if (!newCustPhone.trim()) {
      setErrorMsg('কাস্টমারের ফোন নম্বর লিখুন!');
      return;
    }
    addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim() || 'বরগুনা',
      openingDue: newCustOpeningDue || 0,
    });
    setNewCustName('');
    setNewCustPhone('');
    setNewCustOpeningDue(0);
    setShowAddCustomerModal(false);
  };

  // Billing Math
  const subTotal = cartItems.reduce((acc, item) => acc + (item.salePrice || 0), 0);
  const totalAmount = Math.max(0, subTotal - (discount || 0));
  const dueAmount = Math.max(0, totalAmount - (paidAmount || 0));

  // Auto update paid amount to match total if not due
  const handleTotalFill = () => {
    setPaidAmount(totalAmount);
  };

  // Complete Sale
  const handleCompleteSale = () => {
    setErrorMsg('');
    if (!customerId) {
      setErrorMsg('দয়া করে কাস্টমার সিলেক্ট করুন বা নতুন কাস্টমার অ্যাড করুন!');
      return;
    }
    if (cartItems.length === 0) {
      setErrorMsg('কার্টে কমপক্ষে একটি ফোন যোগ করুন!');
      return;
    }

    const selectedCust = customers.find((c) => c.id === customerId);
    const customerName = selectedCust ? selectedCust.name : 'কাস্টমার';
    const customerPhone = selectedCust ? selectedCust.phone : '';
    const customerAddress = selectedCust ? selectedCust.address : 'বরগুনা';

    const result = addSale({
      date: todayStr,
      customerId,
      customerName,
      customerPhone,
      customerAddress,
      items: cartItems,
      totalQty: cartItems.length,
      subTotal,
      discount: discount || 0,
      totalAmount,
      paidAmount: paidAmount || 0,
      dueAmount,
      paymentMethod,
    });

    if (!result.success) {
      setErrorMsg(result.error || 'সেল সংরক্ষণ ব্যর্থ হয়েছে!');
      return;
    }

    setSuccessMsg(`সেলস সফল হয়েছে! ইনভয়েস নম্বর: ${result.invoiceNo}`);

    // Prepare Invoice for Print Preview (STRICTLY NO WARRANTY)
    const saleInvoiceData = {
      id: `sal-${Date.now()}`,
      invoiceNo: result.invoiceNo!,
      date: todayStr,
      customerId,
      customerName,
      customerPhone,
      customerAddress,
      items: cartItems,
      totalQty: cartItems.length,
      subTotal,
      discount: discount || 0,
      totalAmount,
      paidAmount: paidAmount || 0,
      dueAmount,
      paymentMethod,
      status: 'completed' as const,
      createdAt: new Date().toISOString(),
      createdBy: 'এডমিন',
    };

    onOpenPrint({ type: 'sales', data: saleInvoiceData });

    // Reset Form
    setCartItems([]);
    setDiscount(0);
    setPaidAmount(0);
    setCustomerId('');
  };

  // Group Cart Items by Brand
  const groupedCart = cartItems.reduce<{ [brand: string]: (SaleItem & { originalIndex: number })[] }>(
    (acc, item, index) => {
      if (!acc[item.brand]) acc[item.brand] = [];
      acc[item.brand].push({ ...item, originalIndex: index });
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <ShoppingCart className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                নিউ সেলস (বাল্ক IMEI ও ড্রপডাউন)
              </h2>
              <p className="text-xs text-slate-500">
                আফিফা টেলিকম এন্ড ইলেকট্রনিক্স • বরগুনা • সেলসে ওয়ারেন্টি সম্পূর্ণ বাদ
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('sales_manage')}
          className="text-xs sm:text-sm font-semibold text-[#0B5ED7] hover:underline"
        >
          সেলস হিস্ট্রি ও মেমো ম্যানেজ দেখুন →
        </button>
      </div>

      {/* Alerts */}
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

      {/* Options Selection: 1. Bulk IMEI, 2. Dropdowns, 3. Scan */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              ফোন সিলেকশন মোড:
            </span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveInputMode('bulk')}
                className={`px-3 py-1.5 rounded-md font-bold transition ${
                  activeInputMode === 'bulk' ? 'bg-[#0B5ED7] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                বাল্ক IMEI বক্স
              </button>
              <button
                type="button"
                onClick={() => setActiveInputMode('dropdown')}
                className={`px-3 py-1.5 rounded-md font-bold transition ${
                  activeInputMode === 'dropdown' ? 'bg-[#0B5ED7] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                ড্রপডাউন সিলেক্ট
              </button>
              <button
                type="button"
                onClick={() => setActiveInputMode('scan')}
                className={`px-3 py-1.5 rounded-md font-bold transition ${
                  activeInputMode === 'scan' ? 'bg-[#0B5ED7] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                IMEI স্ক্যান / টাইপ
              </button>
            </div>
          </div>

          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            স্টকে আছে: {inStockPhones.length} টি ফোন
          </span>
        </div>

        {/* MODE 1: Bulk IMEI Text Box */}
        {activeInputMode === 'bulk' && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              বাল্ক IMEI ইনপুট বক্স (এক লাইনে একটি IMEI, একসাথে অনেকগুলো পেস্ট করতে পারেন)
            </label>
            <textarea
              rows={4}
              value={bulkImeiText}
              onChange={(e) => setBulkImeiText(e.target.value)}
              placeholder="এখানে ১৫ ডিজিট IMEI পেস্ট করুন...&#10;864501051234567&#10;864501051234568"
              className="w-full p-3 font-mono text-xs sm:text-sm border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleProcessBulkImeis}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#0B5ED7] hover:bg-[#0A4AB0] text-white font-bold text-xs sm:text-sm rounded-lg shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>সব ফোন কার্টে যোগ করুন</span>
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: Dropdowns (Brand -> Model -> Stock Phone) */}
        {activeInputMode === 'dropdown' && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ১. ব্র্যান্ড সিলেক্ট
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setSelectedModel('');
                  setSelectedPhoneImei('');
                }}
                className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none"
              >
                <option value="">-- ব্র্যান্ড নির্বাচন --</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ২. মডেল সিলেক্ট
              </label>
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  setSelectedPhoneImei('');
                }}
                disabled={!selectedBrand}
                className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-slate-50 disabled:bg-slate-100 outline-none"
              >
                <option value="">-- মডেল নির্বাচন --</option>
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ৩. স্টকে থাকা ফোন (IMEI)
              </label>
              <select
                value={selectedPhoneImei}
                onChange={(e) => setSelectedPhoneImei(e.target.value)}
                disabled={!selectedModel}
                className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-slate-50 disabled:bg-slate-100 outline-none font-mono text-xs"
              >
                <option value="">-- স্টক থেকে সিলেক্ট ({availablePhonesForModel.length} টি) --</option>
                {availablePhonesForModel.map((p) => (
                  <option key={p.imei} value={p.imei}>
                    {p.imei} (৳{p.salePrice})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddFromDropdown}
                disabled={!selectedPhoneImei}
                className="w-full py-2 bg-[#0B5ED7] hover:bg-[#0A4AB0] disabled:bg-slate-200 text-white font-bold text-xs sm:text-sm rounded-lg transition"
              >
                + কার্টে অ্যাড করুন
              </button>
            </div>
          </div>
        )}

        {/* MODE 3: Single Scan / Type 15 Digits IMEI */}
        {activeInputMode === 'scan' && (
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Scan className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={singleImeiInput}
                onChange={(e) => setSingleImeiInput(e.target.value)}
                onKeyDown={handleSingleImeiScan}
                placeholder="এখানে ১৫ ডিজিটের IMEI স্ক্যান করুন বা টাইপ করে Enter চাপুন..."
                className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleSingleImeiScan}
              className="px-4 py-2 bg-[#0B5ED7] hover:bg-[#0A4AB0] text-white font-bold text-xs sm:text-sm rounded-lg"
            >
              যোগ করুন
            </button>
          </div>
        )}
      </div>

      {/* Cart: Grouped by Brand */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs sm:text-sm text-slate-800">
            সেলস কার্ট ({cartItems.length} টি ফোন)
          </h3>
          <span className="text-xs font-semibold text-slate-600">
            মোট সাবটোটাল: <strong className="text-blue-700">{formatCurrency(subTotal)}</strong>
          </span>
        </div>

        {cartItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
            কার্ট খালি। উপরের বক্স বা ড্রপডাউন থেকে ফোন যোগ করুন।
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {Object.entries(groupedCart).map(([brandName, items]) => (
              <div key={brandName} className="p-3 sm:p-4">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-[#0B5ED7] mr-1.5" />
                  ব্র্যান্ড: {brandName} ({items.length} টি)
                </div>

                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.imei}
                      className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm gap-2"
                    >
                      <div className="flex items-center space-x-3">
                        <div>
                          <span className="font-bold text-slate-900">{item.model}</span>
                          <span className="font-mono text-xs text-slate-600 ml-2 block sm:inline">
                            IMEI: {item.imei}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 self-end sm:self-auto">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-slate-500">বিক্রয় মূল্য:</span>
                          <input
                            type="number"
                            value={item.salePrice || ''}
                            onChange={(e) => handleUpdatePrice(item.originalIndex, Number(e.target.value))}
                            className="w-24 text-right p-1 text-xs font-bold border border-slate-300 rounded bg-white outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.originalIndex)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer & Billing Card */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <h3 className="font-bold text-sm sm:text-base text-slate-800 border-b border-slate-100 pb-2">
          কাস্টমার ও বিলিং ক্যালকুলেশন
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Customer Selection */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700 flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-[#0B5ED7]" />
                কাস্টমার সিলেক্ট করুন <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(true)}
                className="text-xs font-bold text-[#0B5ED7] hover:underline flex items-center"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" /> + নতুন কাস্টমার
              </button>
            </div>

            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            >
              <option value="">-- কাস্টমার নির্বাচন করুন --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) - {c.address || 'বরগুনা'} {c.currentDue > 0 ? `[বাকি: ৳${c.currentDue}]` : ''}
                </option>
              ))}
            </select>

            {customerId && (
              <div className="p-2.5 bg-blue-50/60 rounded-lg text-xs text-slate-700 border border-blue-200">
                {(() => {
                  const c = customers.find((cust) => cust.id === customerId);
                  if (!c) return null;
                  return (
                    <div className="flex justify-between items-center">
                      <span>কাস্টমার: <strong>{c.name}</strong> ({c.phone})</span>
                      <span>পূর্বের বাকি: <strong className={c.currentDue > 0 ? 'text-rose-600' : 'text-emerald-600'}>{formatCurrency(c.currentDue)}</strong></span>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Billing Inputs */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ডিসকাউন্ট (৳)
                </label>
                <input
                  type="number"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পেমেন্ট মাধ্যম
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none font-medium"
                >
                  <option value="cash">ক্যাশ (Cash)</option>
                  <option value="bkash">বিকাশ (bKash)</option>
                  <option value="nagad">নগদ (Nagad)</option>
                  <option value="bank">ব্যাংক (Bank)</option>
                  <option value="due">সম্পূর্ণ বাকি (Due)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    পরিশোধ (নগদ গ্রহণ)
                  </label>
                  <button
                    type="button"
                    onClick={handleTotalFill}
                    className="text-[11px] text-[#0B5ED7] hover:underline font-bold"
                  >
                    ফুল পে
                  </button>
                </div>
                <input
                  type="number"
                  value={paidAmount || ''}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  বাকি টাকা
                </label>
                <div className="p-2 border border-slate-300 rounded-lg bg-slate-100 font-bold text-xs sm:text-sm text-rose-700">
                  {formatCurrency(dueAmount)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Big Total Summary Box */}
        <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block">মোট বিক্রয়যোগ্য ফোন: {cartItems.length} টি</span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-0.5">
              {formatCurrency(totalAmount)}
            </div>
            {discount > 0 && (
              <span className="text-xs text-emerald-400">
                (সাবটোটাল {formatCurrency(subTotal)} - ডিসকাউন্ট {formatCurrency(discount)})
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleCompleteSale}
            disabled={cartItems.length === 0}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-bold text-sm sm:text-base rounded-xl shadow-lg transition active:scale-95 flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>বিক্রয় সম্পন্ন ও প্রিন্ট মেমো (SAL)</span>
          </button>
        </div>
      </div>

      {/* Add Customer Inline Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">
              + নতুন কাস্টমার এন্ট্রি
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  কাস্টমারের নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="যেমন: মো: রফিকুল ইসলাম"
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  মোবাইল নম্বর <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ঠিকানা
                </label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="বরগুনা"
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ওপেনিং বাকি (যদি থাকে ৳)
                </label>
                <input
                  type="number"
                  value={newCustOpeningDue || ''}
                  onChange={(e) => setNewCustOpeningDue(Number(e.target.value))}
                  placeholder="0"
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleCreateCustomer}
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
