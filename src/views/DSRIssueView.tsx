import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle, Printer, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isValidIMEI } from '../utils/helpers';

interface DSRIssueViewProps {
  onOpenPrint: (data: any) => void;
  onNavigate: (view: string) => void;
}

export const DSRIssueView: React.FC<DSRIssueViewProps> = ({ onOpenPrint, onNavigate }) => {
  const { dsrs, phones, addDSRIssue, dsrIssues } = useApp();
  const todayStr = new Date().toISOString().split('T')[0];

  const [dsrId, setDsrId] = useState('');
  const [bulkImeiText, setBulkImeiText] = useState('');
  const [notes, setNotes] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Brand / Model Filter for Helper selection
  const [filterBrand, setFilterBrand] = useState('');
  const [filterModel, setFilterModel] = useState('');

  // Filter in-stock phones
  const inStockPhones = phones.filter((p) => p.status === 'in_stock');
  const availableBrands = Array.from(new Set(inStockPhones.map((p) => p.brand)));
  const availableModels = filterBrand
    ? Array.from(new Set(inStockPhones.filter((p) => p.brand === filterBrand).map((p) => p.model)))
    : [];

  const candidatePhones = inStockPhones.filter((p) => {
    if (filterBrand && p.brand !== filterBrand) return false;
    if (filterModel && p.model !== filterModel) return false;
    return true;
  });

  // Parse bulk text
  const parsedImeis = bulkImeiText
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Validate parsed IMEIs
  const detectedItems: { brand: string; model: string; imei: string }[] = [];
  let validationError = '';

  for (const imei of parsedImeis) {
    if (!isValidIMEI(imei)) {
      validationError = `IMEI "${imei}" অবশ্যই ১৫ ডিজিটের হতে হবে!`;
      break;
    }
    const phone = phones.find((p) => p.imei === imei);
    if (!phone) {
      validationError = `IMEI "${imei}" ডাটাবেজে নেই!`;
      break;
    }
    if (phone.status === 'sold') {
      validationError = `IMEI "${imei}" আগে বিক্রি হয়ে গেছে! DSR কে দেওয়া যাবে না।`;
      break;
    }
    if (phone.status === 'with_dsr') {
      validationError = `IMEI "${imei}" ইতিমধ্যে অন্য DSR (${phone.dsrName}) এর কাছে আছে!`;
      break;
    }
    if (phone.status !== 'in_stock') {
      validationError = `IMEI "${imei}" মেইন স্টকে নেই (${phone.status})!`;
      break;
    }
    detectedItems.push({
      brand: phone.brand,
      model: phone.model,
      imei: phone.imei,
    });
  }

  // Quick append an IMEI from candidate list
  const handleAppendImei = (imei: string) => {
    if (parsedImeis.includes(imei)) return;
    const newText = bulkImeiText.trim() ? `${bulkImeiText.trim()}\n${imei}` : imei;
    setBulkImeiText(newText);
  };

  // Submit Issue
  const handleIssueSubmit = () => {
    setErrorMsg('');
    if (!dsrId) {
      setErrorMsg('DSR নির্বাচন করুন!');
      return;
    }
    if (parsedImeis.length === 0) {
      setErrorMsg('কমপক্ষে একটি ১৫ ডিজিট IMEI দিন!');
      return;
    }
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    const dsrObj = dsrs.find((d) => d.id === dsrId);
    const dsrName = dsrObj ? dsrObj.name : 'DSR';

    const result = addDSRIssue({
      date: todayStr,
      dsrId,
      dsrName,
      imeis: detectedItems.map((i) => i.imei),
      items: detectedItems,
      totalQty: detectedItems.length,
      notes,
    });

    if (!result.success) {
      setErrorMsg(result.error || 'DSR ইস্যু ব্যর্থ হয়েছে!');
      return;
    }

    setSuccessMsg(`DSR কে ফোন সফলভাবে ইস্যু করা হয়েছে! চালান নং: ${result.issueNo}`);

    // Print Chalan
    const issueChalan = {
      id: `iss-${Date.now()}`,
      issueNo: result.issueNo!,
      date: todayStr,
      dsrId,
      dsrName,
      imeis: detectedItems.map((i) => i.imei),
      items: detectedItems,
      totalQty: detectedItems.length,
      notes,
      createdAt: new Date().toISOString(),
      createdBy: 'এডমিন',
    };

    onOpenPrint({ type: 'dsr_issue', data: issueChalan });

    setBulkImeiText('');
    setNotes('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-blue-100 text-[#0B5ED7]">
            <Send className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              ইস্যু ফর DSR (বাল্ক IMEI চালান)
            </h2>
            <p className="text-xs text-slate-500">
              দোকান মেইন স্টক থেকে DSR প্রতিনিধির কাছে ফোন হস্তান্তর • বরগুনা
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              DSR সিলেক্ট করুন <span className="text-rose-500">*</span>
            </label>
            <select
              value={dsrId}
              onChange={(e) => setDsrId(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 outline-none font-medium"
            >
              <option value="">-- DSR নির্বাচন করুন --</option>
              {dsrs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.phone}) {d.route ? `- রুট: ${d.route}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ইস্যু নোট / মন্তব্য
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="যেমন: বরগুনা বাজার রুট সেলসের জন্য"
              className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 outline-none"
            />
          </div>
        </div>

        {/* Bulk IMEI Text Box */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700">
              বাল্ক IMEI ইনপুট বক্স (এক লাইনে একটি ১৫ ডিজিট IMEI)
            </label>
            <span className="text-xs text-blue-700 font-bold">
              ইনপুট সংখ্যা: {parsedImeis.length} টি
            </span>
          </div>
          <textarea
            rows={4}
            value={bulkImeiText}
            onChange={(e) => setBulkImeiText(e.target.value)}
            placeholder="এখানে ১৫ ডিজিটের IMEI পেস্ট করুন..."
            className="w-full p-3 font-mono text-xs sm:text-sm border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Filter helpers to quickly click & add available in-stock phones */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>স্টকে থাকা ফোন থেকে দ্রুত বাছাই (ফিল্টার):</span>
            <span className="text-[11px] text-slate-500">ক্লিক করলেই বক্সে যোগ হবে</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={filterBrand}
              onChange={(e) => {
                setFilterBrand(e.target.value);
                setFilterModel('');
              }}
              className="text-xs p-1.5 border border-slate-300 rounded bg-white"
            >
              <option value="">-- সব ব্র্যান্ড --</option>
              {availableBrands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <select
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              disabled={!filterBrand}
              className="text-xs p-1.5 border border-slate-300 rounded bg-white"
            >
              <option value="">-- সব মডেল --</option>
              {availableModels.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
            {candidatePhones.slice(0, 15).map((p) => (
              <button
                key={p.imei}
                type="button"
                onClick={() => handleAppendImei(p.imei)}
                className={`text-[11px] px-2 py-0.5 rounded border font-mono transition ${
                  parsedImeis.includes(p.imei)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white hover:bg-blue-50 border-slate-300 text-slate-700'
                }`}
              >
                + {p.brand} {p.model} ({p.imei})
              </button>
            ))}
          </div>
        </div>

        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
            {validationError}
          </div>
        )}

        {/* Real-time Detected Table */}
        {detectedItems.length > 0 && !validationError && (
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
            <h4 className="text-xs font-bold text-blue-900 uppercase">
              চালানে অন্তর্ভুক্ত ফোনসমূহ ({detectedItems.length} টি)
            </h4>
            <div className="divide-y divide-blue-200/60 text-xs">
              {detectedItems.map((item, idx) => (
                <div key={idx} className="py-1.5 flex justify-between">
                  <span className="font-semibold">{idx + 1}. {item.brand} {item.model}</span>
                  <span className="font-mono text-slate-600">{item.imei}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleIssueSubmit}
            disabled={detectedItems.length === 0 || !!validationError}
            className="px-6 py-2.5 bg-[#0B5ED7] hover:bg-[#0A4AB0] disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition active:scale-95"
          >
            DSR ইস্যু চালান কনফার্ম ও প্রিন্ট (ISS-XXXXX)
          </button>
        </div>
      </div>
    </div>
  );
};
