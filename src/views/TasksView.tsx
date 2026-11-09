import React, { useState } from 'react';
import {
  ClipboardList,
  CheckSquare,
  Wrench,
  Clock,
  PhoneCall,
  AlertTriangle,
  ArrowRight,
  Printer,
  Plus,
  Send,
  RotateCcw,
  CheckCircle2,
  CheckCircle,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, isValidIMEI, computeStockMatrix } from '../utils/helpers';
import { WarrantyTask, WarrantyStep1, WarrantyStep2, WarrantyStep3, WarrantyStep4 } from '../types';

interface TasksViewProps {
  onOpenPrint: (data: any) => void;
  onNavigate: (view: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onOpenPrint, onNavigate }) => {
  const {
    customers,
    phones,
    dsrs,
    expenses,
    brands,
    models,
    warrantyTasks,
    addWarrantyStep1,
    updateWarrantyStep2,
    updateWarrantyStep3,
    updateWarrantyStep4,
    currentUser,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Active Main Tab: 'daily' | 'warranty'
  const [activeMainTab, setActiveMainTab] = useState<'daily' | 'warranty'>('warranty');

  // Warranty Active Step / Modal
  const [warrantySubTab, setWarrantySubTab] = useState<'all' | 'step1' | 'step2' | 'step3' | 'step4'>('all');
  const [showStep1Modal, setShowStep1Modal] = useState(false);
  const [selectedTaskForStep2, setSelectedTaskForStep2] = useState<WarrantyTask | null>(null);
  const [selectedTaskForStep3, setSelectedTaskForStep3] = useState<WarrantyTask | null>(null);
  const [selectedTaskForStep4, setSelectedTaskForStep4] = useState<WarrantyTask | null>(null);

  // Alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Daily Tasks Data
  const dueCustomers = customers.filter((c) => (c.currentDue || 0) > 0);
  const stockRows = computeStockMatrix(phones);
  const lowStockRows = stockRows.filter((r) => r.isLowStock);
  const todayExpense = expenses
    .filter((e) => e.date === todayStr && e.status !== 'cancelled')
    .reduce((acc, e) => acc + e.amount, 0);

  // Step 1 Form State
  const [step1PartyName, setStep1PartyName] = useState('');
  const [step1Phone, setStep1Phone] = useState('');
  const [step1Brand, setStep1Brand] = useState('');
  const [step1Model, setStep1Model] = useState('');
  const [step1Imei, setStep1Imei] = useState('');
  const [step1Problem, setStep1Problem] = useState('ডিসপ্লে সমস্যা');
  const [step1Accessories, setStep1Accessories] = useState('শুধু ফোন');
  const [step1Condition, setStep1Condition] = useState('');

  // Step 2 Form State
  const [step2CareName, setStep2CareName] = useState('Samsung সার্ভিস কেয়ার');
  const [step2Date, setStep2Date] = useState(todayStr);
  const [step2Courier, setStep2Courier] = useState('সুন্দরবন কুরিয়ার / পার্সেল');
  const [step2Tracking, setStep2Tracking] = useState('');
  const [step2ExpectedDate, setStep2ExpectedDate] = useState('');
  const [step2ChargeType, setStep2ChargeType] = useState<'free' | 'paid'>('free');
  const [step2Charge, setStep2Charge] = useState<number>(0);

  // Step 3 Form State
  const [step3Date, setStep3Date] = useState(todayStr);
  const [step3Report, setStep3Report] = useState<'repaired' | 'replaced' | 'parts_changed' | 'not_repaired' | 'rejected'>('repaired');
  const [step3WorkDone, setStep3WorkDone] = useState('');
  const [step3Cost, setStep3Cost] = useState<number>(0);
  const [step3NewImei, setStep3NewImei] = useState('');

  // Step 4 Form State
  const [step4Date, setStep4Date] = useState(todayStr);
  const [step4CollectedBy, setStep4CollectedBy] = useState('');
  const [step4Satisfaction, setStep4Satisfaction] = useState('সন্তোষজনক');
  const [step4FinalCharge, setStep4FinalCharge] = useState<number>(0);

  // Step 1 Submit
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!step1PartyName.trim()) {
      setErrorMsg('গ্রাহকের নাম লিখুন!');
      return;
    }
    if (!step1Phone.trim()) {
      setErrorMsg('গ্রাহকের মোবাইল নম্বর লিখুন!');
      return;
    }
    if (!step1Brand || !step1Model) {
      setErrorMsg('ব্র্যান্ড ও মডেল নির্বাচন করুন!');
      return;
    }
    const cleanImei = step1Imei.trim();
    if (!isValidIMEI(cleanImei)) {
      setErrorMsg('IMEI অবশ্যই ১৫ ডিজিটের সংখ্যা হতে হবে!');
      return;
    }

    const res = addWarrantyStep1({
      warrantyNo: '',
      receiveDate: todayStr,
      partyName: step1PartyName.trim(),
      phone: step1Phone.trim(),
      brand: step1Brand,
      model: step1Model,
      imei: cleanImei,
      problem: step1Problem,
      accessoriesIncluded: step1Accessories,
      conditionNote: step1Condition.trim() || undefined,
      receivedBy: currentUser,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'ওয়ারেন্টি এন্ট্রি ব্যর্থ হয়েছে!');
      return;
    }

    setSuccessMsg(`ওয়ারেন্টি রিসিভ টোকেন তৈরি হয়েছে! নম্বর: ${res.warrantyNo}`);

    const newTaskObj: WarrantyTask = {
      id: `wr-${Date.now()}`,
      warrantyNo: res.warrantyNo!,
      status: 'received_from_customer',
      step1: {
        warrantyNo: res.warrantyNo!,
        receiveDate: todayStr,
        partyName: step1PartyName.trim(),
        phone: step1Phone.trim(),
        brand: step1Brand,
        model: step1Model,
        imei: cleanImei,
        problem: step1Problem,
        accessoriesIncluded: step1Accessories,
        conditionNote: step1Condition.trim() || undefined,
        receivedBy: currentUser,
      },
      createdAt: new Date().toISOString(),
      createdBy: currentUser,
    };

    onOpenPrint({ type: 'warranty_receive', data: newTaskObj });

    // Reset Step 1
    setStep1PartyName('');
    setStep1Phone('');
    setStep1Imei('');
    setStep1Condition('');
    setShowStep1Modal(false);
  };

  // Step 2 Submit
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForStep2) return;
    setErrorMsg('');

    const res = updateWarrantyStep2(selectedTaskForStep2.id, {
      careName: step2CareName,
      sentDate: step2Date,
      sentBy: currentUser,
      courierOrPerson: step2Courier,
      trackingNo: step2Tracking || undefined,
      expectedReturnDate: step2ExpectedDate || undefined,
      serviceChargeType: step2ChargeType,
      serviceCharge: step2Charge || 0,
    });

    if (!res.success) {
      setErrorMsg('ধাপ ২ সংরক্ষণ ব্যর্থ হয়েছে!');
      return;
    }

    setSuccessMsg(`ফোনটি সফলভাবে কেয়ারে পাঠানোর স্ট্যাটাস আপডেট হয়েছে (${selectedTaskForStep2.warrantyNo})!`);

    const updatedTask = {
      ...selectedTaskForStep2,
      status: 'sent_to_care' as const,
      step2: {
        careName: step2CareName,
        sentDate: step2Date,
        sentBy: currentUser,
        courierOrPerson: step2Courier,
        trackingNo: step2Tracking || undefined,
        expectedReturnDate: step2ExpectedDate || undefined,
        serviceChargeType: step2ChargeType,
        serviceCharge: step2Charge || 0,
      },
    };

    onOpenPrint({ type: 'warranty_chalan', data: updatedTask });
    setSelectedTaskForStep2(null);
  };

  // Step 3 Submit
  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForStep3) return;

    if (step3Report === 'replaced' && step3NewImei.trim()) {
      if (!isValidIMEI(step3NewImei.trim())) {
        setErrorMsg('নতুন রিপ্লেসমেন্ট IMEI অবশ্যই ১৫ ডিজিটের হতে হবে!');
        return;
      }
    }

    const res = updateWarrantyStep3(selectedTaskForStep3.id, {
      careReceiveDate: step3Date,
      careReceivedBy: currentUser,
      careReport: step3Report,
      workDone: step3WorkDone.trim() || 'সার্ভিসিং সম্পন্ন',
      careCost: step3Cost || 0,
      newImeiIfReplaced: step3NewImei.trim() || undefined,
    });

    if (!res.success) {
      setErrorMsg('ধাপ ৩ সংরক্ষণ ব্যর্থ হয়েছে!');
      return;
    }

    setSuccessMsg(`কেয়ার থেকে ফোন রিসিভ এন্ট্রি সম্পন্ন হয়েছে (${selectedTaskForStep3.warrantyNo})!`);
    setSelectedTaskForStep3(null);
  };

  // Step 4 Submit
  const handleStep4Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForStep4) return;

    const res = updateWarrantyStep4(selectedTaskForStep4.id, {
      deliveryDate: step4Date,
      deliveredBy: currentUser,
      customerSatisfaction: step4Satisfaction,
      customerCollectedBy: step4CollectedBy.trim() || selectedTaskForStep4.step1.partyName,
      finalChargeCollected: step4FinalCharge || 0,
    });

    if (!res.success) {
      setErrorMsg('ধাপ ৪ সংরক্ষণ ব্যর্থ হয়েছে!');
      return;
    }

    setSuccessMsg(`গ্রাহককে সফলভাবে ফোন ডেলিভারি প্রদান সম্পন্ন হয়েছে (${selectedTaskForStep4.warrantyNo})!`);
    setSelectedTaskForStep4(null);
  };

  // Filter Tasks
  const filteredTasks = warrantyTasks.filter((t) => {
    if (warrantySubTab === 'step1') return t.status === 'received_from_customer';
    if (warrantySubTab === 'step2') return t.status === 'sent_to_care';
    if (warrantySubTab === 'step3') return t.status === 'received_from_care';
    if (warrantySubTab === 'step4') return t.status === 'delivered_to_customer';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-amber-100 text-amber-800">
            <ClipboardList className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              টাস্কস ও ওয়ারেন্টি সার্ভিস ট্র্যাকিং (Tasks & Service)
            </h2>
            <p className="text-xs text-slate-500">
              আফিফা টেলিকম এন্ড ইলেকট্রনিক্স • বরগুনা
            </p>
          </div>
        </div>

        {/* Tab Toggle: Daily Tasks vs Warranty Tracking */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs sm:text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveMainTab('warranty')}
            className={`px-4 py-1.5 rounded-lg transition ${
              activeMainTab === 'warranty' ? 'bg-[#0B5ED7] text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            পার্ট খ: ওয়ারেন্টি সার্ভিস ট্র্যাকিং ({warrantyTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab('daily')}
            className={`px-4 py-1.5 rounded-lg transition ${
              activeMainTab === 'daily' ? 'bg-[#0B5ED7] text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            পার্ট ক: ডেইলি টাস্কস
          </button>
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

      {/* PART A: DAILY TASKS */}
      {activeMainTab === 'daily' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Due Customer Follow-up with direct Call button */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-1.5">
                <PhoneCall className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  ১. বাকি থাকা কাস্টমারদের ফলো-আপ ও কল লিস্ট ({dueCustomers.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('receive_voucher')}
                className="text-xs text-[#0B5ED7] font-semibold hover:underline"
              >
                + টাকা জমা
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {dueCustomers.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">কোনো কাস্টমার বাকি নেই</p>
              ) : (
                dueCustomers.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-slate-900 block">{c.name}</strong>
                      <span className="text-slate-500">{c.phone} • {c.address || 'বরগুনা'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-rose-700">{formatCurrency(c.currentDue)}</span>
                      <a
                        href={`tel:${c.phone}`}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center text-[11px]"
                      >
                        <PhoneCall className="w-3 h-3 mr-1" /> কল
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. Low Stock Alerts & DSR Checks */}
          <div className="space-y-4">
            {/* Low stock */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                    ২. লো স্টক রি-অর্ডার রিমাইন্ডার ({lowStockRows.length})
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('new_purchase')}
                  className="text-xs text-blue-700 font-semibold hover:underline"
                >
                  + পারচেজ
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {lowStockRows.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">সব মডেলের পর্যাপ্ত স্টক আছে</p>
                ) : (
                  lowStockRows.map((r, i) => (
                    <div key={i} className="flex justify-between items-center text-xs p-2 bg-rose-50/60 rounded border border-rose-100">
                      <span className="font-semibold text-slate-800">{r.brand} {r.model}</span>
                      <span className="px-2 py-0.5 bg-rose-600 text-white font-bold rounded text-[10px]">
                        স্টক: {r.finalStockQty} টি
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Daily Expense Check */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">৩. আজকের মোট দোকান খরচ:</span>
                <strong className="text-lg font-bold text-slate-900">{formatCurrency(todayExpense)}</strong>
              </div>
              <button
                onClick={() => onNavigate('expense_manage')}
                className="px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold rounded-lg"
              >
                খরচ হিস্ট্রি →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PART B: WARRANTY PRODUCT / SERVICE TRACKING (4 CLEAR STEPS) */}
      {activeMainTab === 'warranty' && (
        <div className="space-y-5">
          {/* Action Header */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <button
                onClick={() => setWarrantySubTab('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  warrantySubTab === 'all' ? 'bg-[#0B5ED7] text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                সব সার্ভিস ({warrantyTasks.length})
              </button>
              <button
                onClick={() => setWarrantySubTab('step1')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  warrantySubTab === 'step1' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-800'
                }`}
              >
                ধাপ ১: রিসিভ কৃত
              </button>
              <button
                onClick={() => setWarrantySubTab('step2')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  warrantySubTab === 'step2' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800'
                }`}
              >
                ধাপ ২: কেয়ারে পাঠানো
              </button>
              <button
                onClick={() => setWarrantySubTab('step3')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  warrantySubTab === 'step3' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800'
                }`}
              >
                ধাপ ৩: কেয়ার হতে ফেরত
              </button>
              <button
                onClick={() => setWarrantySubTab('step4')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  warrantySubTab === 'step4' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800'
                }`}
              >
                ধাপ ৪: ডেলিভারি সম্পন্ন
              </button>
            </div>

            <button
              onClick={() => setShowStep1Modal(true)}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm flex items-center space-x-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ গ্রাহকের কাছ থেকে রিসিভ (ধাপ ১)</span>
            </button>
          </div>

          {/* 4 Steps Info Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <span className="font-bold text-purple-900 block">ধাপ ১: রিসিভ</span>
              <span className="text-[11px] text-purple-700">গ্রাহক স্লিপ WR-XXXXX তৈরি ও প্রমাণ</span>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="font-bold text-blue-900 block">ধাপ ২: কেয়ারে পাঠানো</span>
              <span className="text-[11px] text-blue-700">কুরিয়ার ও সার্ভিস চালান প্রিন্ট</span>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="font-bold text-amber-900 block">ধাপ ৩: কেয়ার থেকে রিসিভ</span>
              <span className="text-[11px] text-amber-700">রিপেয়ার রিপোর্ট ও টেস্ট যাচাই</span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="font-bold text-emerald-900 block">ধাপ ৪: ডেলিভারি</span>
              <span className="text-[11px] text-emerald-700">গ্রাহককে বুঝিয়ে দেওয়া ও সমাপ্তি</span>
            </div>
          </div>

          {/* Warranty List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs sm:text-sm text-slate-800">
              ওয়ারেন্টি সার্ভিস রিকোয়েস্ট তালিকা ({filteredTasks.length} টি)
            </div>

            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
                কোনো ওয়ারেন্টি সার্ভিস রেকর্ড নেই। উপরে "+ গ্রাহকের কাছ থেকে রিসিভ (ধাপ ১)" চাপুন।
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredTasks.map((t) => (
                  <div key={t.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs sm:text-sm hover:bg-slate-50/70">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <strong className="text-purple-800 font-mono text-sm">{t.warrantyNo}</strong>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 font-medium">তারিখ: {t.step1.receiveDate}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono text-slate-800 font-bold">IMEI: {t.step1.imei}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-slate-700">
                        <span className="font-bold text-slate-900">{t.step1.brand} {t.step1.model}</span>
                        <span>•</span>
                        <span>গ্রাহক: <strong>{t.step1.partyName}</strong> ({t.step1.phone})</span>
                        <span>•</span>
                        <span className="text-rose-700 font-medium">সমস্যা: {t.step1.problem}</span>
                      </div>

                      <div className="text-[11px] text-slate-500">
                        মালামাল: {t.step1.accessoriesIncluded} {t.step1.conditionNote && `• নোট: ${t.step1.conditionNote}`}
                      </div>

                      {/* Step Progress Pills */}
                      <div className="flex items-center space-x-1.5 pt-1 text-[11px]">
                        <span className="px-2 py-0.5 rounded font-bold bg-purple-100 text-purple-800">
                          ১. গৃহীত ✓
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          t.step2 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-400'
                        }`}>
                          ২. কেয়ারে {t.step2 ? '✓' : 'বাকি'}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          t.step3 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'
                        }`}>
                          ৩. ফেরত {t.step3 ? '✓' : 'বাকি'}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          t.step4 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                        }`}>
                          ৪. ডেলিভারি {t.step4 ? '✓' : 'বাকি'}
                        </span>
                      </div>
                    </div>

                    {/* Step Progression Buttons */}
                    <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                      <button
                        onClick={() => onOpenPrint({ type: 'warranty_receive', data: t })}
                        className="px-2.5 py-1.5 text-slate-600 hover:text-purple-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center"
                        title="গ্রাহক রিসিভ স্লিপ প্রিন্ট"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" /> রিসিভ স্লিপ
                      </button>

                      {t.status === 'received_from_customer' && (
                        <button
                          onClick={() => setSelectedTaskForStep2(t)}
                          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-lg flex items-center shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5 mr-1" /> ধাপ ২: কেয়ারে পাঠান →
                        </button>
                      )}

                      {t.status === 'sent_to_care' && (
                        <>
                          <button
                            onClick={() => onOpenPrint({ type: 'warranty_chalan', data: t })}
                            className="px-2.5 py-1.5 text-blue-700 border border-blue-300 rounded-lg text-xs font-semibold flex items-center"
                          >
                            <Printer className="w-3.5 h-3.5 mr-1" /> কেয়ার চালান
                          </button>
                          <button
                            onClick={() => setSelectedTaskForStep3(t)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg flex items-center shadow-xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" /> ধাপ ৩: কেয়ার হতে রিসিভ →
                          </button>
                        </>
                      )}

                      {t.status === 'received_from_care' && (
                        <button
                          onClick={() => setSelectedTaskForStep4(t)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> ধাপ ৪: গ্রাহককে ডেলিভারি দিন →
                        </button>
                      )}

                      {t.status === 'delivered_to_customer' && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> সম্পন্ন
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 1 MODAL: Receive from Customer / Dealer */}
      {showStep1Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleStep1Submit}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
          >
            <div className="p-4 bg-purple-700 text-white flex justify-between items-center">
              <h4 className="font-bold text-sm sm:text-base">
                ধাপ ১: কাস্টমার / দোকানদারের কাছ থেকে ফোন রিসিভ
              </h4>
              <button
                type="button"
                onClick={() => setShowStep1Modal(false)}
                className="text-white hover:text-purple-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    কাস্টমার / দোকানদারের নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={step1PartyName}
                    onChange={(e) => setStep1PartyName(e.target.value)}
                    placeholder="নাম লিখুন"
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    মোবাইল নম্বর <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={step1Phone}
                    onChange={(e) => setStep1Phone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ব্র্যান্ড <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={step1Brand}
                    onChange={(e) => setStep1Brand(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                    required
                  >
                    <option value="">-- ব্র্যান্ড --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    মডেল <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={step1Model}
                    onChange={(e) => setStep1Model(e.target.value)}
                    placeholder="যেমন: Galaxy A15, Y28"
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  IMEI (১৫ ডিজিট বাধ্যতামূলক) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={step1Imei}
                  onChange={(e) => setStep1Imei(e.target.value)}
                  placeholder="১৫ ডিজিট IMEI দিন"
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    সমস্যা / কমপ্লেইন
                  </label>
                  <select
                    value={step1Problem}
                    onChange={(e) => setStep1Problem(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="ডিসপ্লে সমস্যা">ডিসপ্লে সমস্যা / টাচ কাজ করে না</option>
                    <option value="ব্যাটারি ব্যাকআপ কম / চার্জ ধরে না">ব্যাটারি / ব্যাকআপ কম</option>
                    <option value="নেটওয়ার্ক পায় না">নেটওয়ার্ক পায় না</option>
                    <option value="সফটওয়্যার সমস্যা / হ্যাং করে">সফটওয়্যার হ্যাং</option>
                    <option value="চার্জিং পোর্ট সমস্যা">চার্জিং পোর্ট সমস্যা</option>
                    <option value="স্পিকার / মাইক্রোফোন নষ্ট">স্পিকার / মাইক নষ্ট</option>
                    <option value="অন্যান্য সমস্যা">অন্যান্য সমস্যা</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    কাস্টমার কি কি দিছে
                  </label>
                  <select
                    value={step1Accessories}
                    onChange={(e) => setStep1Accessories(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="শুধু ফোন">শুধু ফোন</option>
                    <option value="ফোন + বক্স">ফোন + বক্স</option>
                    <option value="ফোন + চার্জার">ফোন + চার্জার</option>
                    <option value="ফোন + বক্স + চার্জার">সবকিছু (ফোন + বক্স + চার্জার)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  কন্ডিশন নোট (স্ক্র্যাচ / ডেন্ট / লিকুইড ইত্যাদি)
                </label>
                <input
                  type="text"
                  value={step1Condition}
                  onChange={(e) => setStep1Condition(e.target.value)}
                  placeholder="যেমন: ব্যাকশেলে হালকা স্ক্র্যাচ আছে"
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowStep1Modal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-purple-700 text-white font-bold text-xs sm:text-sm rounded-lg"
              >
                রিসিভ সম্পন্ন ও প্রিন্ট স্লিপ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2 MODAL: Sent to Care */}
      {selectedTaskForStep2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleStep2Submit}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-3 text-xs sm:text-sm"
          >
            <h4 className="font-bold text-base text-blue-900 border-b border-blue-200 pb-2">
              ধাপ ২: কাস্টমার কেয়ার / সার্ভিস সেন্টারে পাঠান ({selectedTaskForStep2.warrantyNo})
            </h4>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">সার্ভিস সেন্টারের নাম</label>
              <input
                type="text"
                value={step2CareName}
                onChange={(e) => setStep2CareName(e.target.value)}
                placeholder="যেমন: Samsung Care Barishal / Dhaka"
                className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">পাঠানোর তারিখ</label>
                <input
                  type="date"
                  value={step2Date}
                  onChange={(e) => setStep2Date(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">কুরিয়ার / প্রেরক</label>
                <input
                  type="text"
                  value={step2Courier}
                  onChange={(e) => setStep2Courier(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ট্র্যাকিং / চালান নং</label>
                <input
                  type="text"
                  value={step2Tracking}
                  onChange={(e) => setStep2Tracking(e.target.value)}
                  placeholder="CN-12345"
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">সম্ভাব্য ফেরত তারিখ</label>
                <input
                  type="date"
                  value={step2ExpectedDate}
                  onChange={(e) => setStep2ExpectedDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedTaskForStep2(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-lg"
              >
                কেয়ারে পাঠানো কনফার্ম ও প্রিন্ট চালান
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3 MODAL: Receive from Care */}
      {selectedTaskForStep3 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleStep3Submit}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-3 text-xs sm:text-sm"
          >
            <h4 className="font-bold text-base text-amber-900 border-b border-amber-200 pb-2">
              ধাপ ৩: কাস্টমার কেয়ার থেকে রিসিভ ({selectedTaskForStep3.warrantyNo})
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">রিসিভের তারিখ</label>
                <input
                  type="date"
                  value={step3Date}
                  onChange={(e) => setStep3Date(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">কেয়ার রিপোর্ট</label>
                <select
                  value={step3Report}
                  onChange={(e) => setStep3Report(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none font-semibold"
                >
                  <option value="repaired">রিপেয়ার সফল হয়েছে</option>
                  <option value="replaced">হ্যান্ডসেট রিপ্লেস হয়েছে</option>
                  <option value="parts_changed">পার্টস চেঞ্জ হয়েছে</option>
                  <option value="not_repaired">রিপেয়ার হয় নাই</option>
                  <option value="rejected">রিজেক্ট / বাতিল</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">কি কাজ হয়েছে (বিবরণ)</label>
              <input
                type="text"
                value={step3WorkDone}
                onChange={(e) => setStep3WorkDone(e.target.value)}
                placeholder="যেমন: নতুন ডিসপ্লে লাগানো হয়েছে"
                className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                required
              />
            </div>

            {step3Report === 'replaced' && (
              <div>
                <label className="block font-semibold text-rose-700 mb-1">
                  নতুন রিপ্লেসমেন্ট IMEI (১৫ ডিজিট)
                </label>
                <input
                  type="text"
                  value={step3NewImei}
                  onChange={(e) => setStep3NewImei(e.target.value)}
                  placeholder="নতুন ১৫ ডিজিট IMEI"
                  className="w-full p-2 border border-rose-300 rounded-lg outline-none font-mono font-bold"
                  required
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">কেয়ার খরচ (যদি প্রযোজ্য ৳)</label>
              <input
                type="number"
                value={step3Cost || ''}
                onChange={(e) => setStep3Cost(Number(e.target.value))}
                placeholder="0"
                className="w-full p-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedTaskForStep3(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-amber-600 text-white font-bold text-xs sm:text-sm rounded-lg"
              >
                কেয়ার থেকে রিসিভ কনফার্ম
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 4 MODAL: Deliver to Customer */}
      {selectedTaskForStep4 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleStep4Submit}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-3 text-xs sm:text-sm"
          >
            <h4 className="font-bold text-base text-emerald-900 border-b border-emerald-200 pb-2">
              ধাপ ৪: গ্রাহককে ফোন বুঝিয়ে দেওয়া / ডেলিভারি ({selectedTaskForStep4.warrantyNo})
            </h4>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ডেলিভারির তারিখ</label>
              <input
                type="date"
                value={step4Date}
                onChange={(e) => setStep4Date(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">কার কাছে হস্তান্তর করা হলো</label>
              <input
                type="text"
                value={step4CollectedBy || selectedTaskForStep4.step1.partyName}
                onChange={(e) => setStep4CollectedBy(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">গ্রাহকের প্রতিক্রিয়া / সন্তুষ্টি</label>
              <select
                value={step4Satisfaction}
                onChange={(e) => setStep4Satisfaction(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none"
              >
                <option value="সন্তোষজনক">সন্তোষজনক (ভালো)</option>
                <option value="খুব ভালো">খুব ভালো</option>
                <option value="সাধারণ">সাধারণ</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">গৃহীত সার্ভিস চার্জ (৳)</label>
              <input
                type="number"
                value={step4FinalCharge || ''}
                onChange={(e) => setStep4FinalCharge(Number(e.target.value))}
                placeholder="0"
                className="w-full p-2 border border-slate-300 rounded-lg outline-none font-bold text-emerald-700"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedTaskForStep4(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-lg"
              >
                ডেলিভারি সম্পন্ন করুন
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
