import React, { useState } from 'react';
import { RotateCcw, AlertCircle, CheckCircle, Printer } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isValidIMEI } from '../utils/helpers';

interface DSRReturnViewProps {
  onOpenPrint: (data: any) => void;
  onNavigate: (view: string) => void;
}

export const DSRReturnView: React.FC<DSRReturnViewProps> = ({ onOpenPrint }) => {
  const { dsrs, phones, addDSRReturn } = useApp();
  const todayStr = new Date().toISOString().split('T')[0];

  const [dsrId, setDsrId] = useState('');
  const [bulkImeiText, setBulkImeiText] = useState('');
  const [reason, setReason] = useState('বিক্রি হয় নাই');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Phones currently with the selected DSR
  const dsrPhones = dsrId ? phones.filter((p) => p.status === 'with_dsr' && p.dsrId === dsrId) : [];

  const parsedImeis = bulkImeiText
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const detectedItems: { brand: string; model: string; imei: string }[] = [];
  let validationError = '';

  for (const imei of parsedImeis) {
    if (!isValidIMEI(imei)) {
      validationError = `IMEI "${imei}" সঠিক ১৫ ডিজিটের নয়!`;
      break;
    }
    const phone = phones.find((p) => p.imei === imei);
    if (!phone) {
      validationError = `IMEI "${imei}" সিস্টেমে পাওয়া যায়নি!`;
      break;
    }
    if (phone.status !== 'with_dsr' || phone.dsrId !== dsrId) {
      validationError = `ত্রুটি: IMEI "${imei}" এই DSR এর কাছে নেই!`;
      break;
    }
    detectedItems.push({
      brand: phone.brand,
      model: phone.model,
      imei: phone.imei,
    });
  }

  const handleAppendImei = (imei: string) => {
    if (parsedImeis.includes(imei)) return;
    const newText = bulkImeiText.trim() ? `${bulkImeiText.trim()}\n${imei}` : imei;
    setBulkImeiText(newText);
  };

  const handleReturnSubmit = () => {
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

    const result = addDSRReturn({
      date: todayStr,
      dsrId,
      dsrName,
      imeis: detectedItems.map((i) => i.imei),
      items: detectedItems,
      totalQty: detectedItems.length,
      reason,
    });

    if (!result.success) {
      setErrorMsg(result.error || 'DSR রিটার্ন সংরক্ষণ ব্যর্থ হয়েছে!');
      return;
    }

    setSuccessMsg(`DSR থেকে ফোন মেইন স্টকে ফেরত এসেছে! রিটার্ন মেমো: ${result.returnNo}`);

    const returnMemo = {
      id: `ret-${Date.now()}`,
      returnNo: result.returnNo!,
      date: todayStr,
      dsrId,
      dsrName,
      imeis: detectedItems.map((i) => i.imei),
      items: detectedItems,
      totalQty: detectedItems.length,
      reason,
      createdAt: new Date().toISOString(),
      createdBy: 'এডমিন',
    };

    onOpenPrint({ type: 'dsr_return', data: returnMemo });

    setBulkImeiText('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-amber-100 text-amber-700">
            <RotateCcw className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              রিটার্ন ফ্রম DSR (DSR থেকে মেইন স্টকে ফেরত)
            </h2>
            <p className="text-xs text-slate-500">
              DSR প্রতিনিধি থেকে অবিক্রিত ফোন দোকানে গ্রহণ • বরগুনা
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

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              DSR নির্বাচন করুন <span className="text-rose-500">*</span>
            </label>
            <select
              value={dsrId}
              onChange={(e) => {
                setDsrId(e.target.value);
                setBulkImeiText('');
              }}
              className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 outline-none font-medium"
            >
              <option value="">-- DSR নির্বাচন করুন --</option>
              {dsrs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ফেরতের কারণ
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 outline-none font-medium"
            >
              <option value="বিক্রি হয় নাই">বিক্রি হয় নাই</option>
              <option value="ড্যামেজ">ড্যামেজ / ত্রুটি</option>
              <option value="কাস্টমার নেয় নাই">কাস্টমার নেয় নাই</option>
              <option value="অন্যান্য">অন্যান্য</option>
            </select>
          </div>
        </div>

        {dsrId && (
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
            <div className="text-xs font-bold text-amber-900 flex justify-between items-center">
              <span>বর্তমানে এই DSR এর কাছে থাকা ফোন ({dsrPhones.length} টি):</span>
              <span className="text-[11px] text-amber-700">ক্লিক করে সরাসরি বক্সে নিন</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {dsrPhones.length === 0 ? (
                <span className="text-xs text-amber-600">এই DSR এর কাছে কোনো সক্রিয় ফোন নেই</span>
              ) : (
                dsrPhones.map((p) => (
                  <button
                    key={p.imei}
                    type="button"
                    onClick={() => handleAppendImei(p.imei)}
                    className="text-[11px] px-2 py-0.5 rounded border border-amber-300 bg-white hover:bg-amber-100 text-slate-800 font-mono"
                  >
                    + {p.brand} {p.model} ({p.imei})
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ফেরতকৃত IMEI বাল্ক ইনপুট বক্স (এক লাইনে একটি IMEI)
          </label>
          <textarea
            rows={4}
            value={bulkImeiText}
            onChange={(e) => setBulkImeiText(e.target.value)}
            placeholder="এখানে ১৫ ডিজিট IMEI পেস্ট করুন..."
            className="w-full p-3 font-mono text-xs sm:text-sm border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
            {validationError}
          </div>
        )}

        {detectedItems.length > 0 && !validationError && (
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900">
            <strong>{detectedItems.length} টি</strong> ফোন মেইন স্টকে ফেরত আসার জন্য প্রস্তুত।
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleReturnSubmit}
            disabled={detectedItems.length === 0 || !!validationError}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition active:scale-95"
          >
            DSR রিটার্ন সম্পন্ন করুন (RET-XXXXX)
          </button>
        </div>
      </div>
    </div>
  );
};
