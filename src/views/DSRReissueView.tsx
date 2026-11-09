import React, { useState } from 'react';
import { Repeat, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isValidIMEI } from '../utils/helpers';

interface DSRReissueViewProps {
  onOpenPrint?: (data: any) => void;
  onNavigate?: (view: string) => void;
}

export const DSRReissueView: React.FC<DSRReissueViewProps> = () => {
  const { dsrs, phones, addDSRReissue, dsrReissues } = useApp();
  const todayStr = new Date().toISOString().split('T')[0];

  const [fromDsrId, setFromDsrId] = useState('');
  const [toDsrId, setToDsrId] = useState('');
  const [bulkImeiText, setBulkImeiText] = useState('');
  const [notes, setNotes] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fromDsrPhones = fromDsrId ? phones.filter((p) => p.status === 'with_dsr' && p.dsrId === fromDsrId) : [];

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
    if (phone.status !== 'with_dsr' || phone.dsrId !== fromDsrId) {
      validationError = `IMEI "${imei}" নির্বাচিত প্রেরক DSR এর কাছে নেই!`;
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

  const handleReissueSubmit = () => {
    setErrorMsg('');
    if (!fromDsrId || !toDsrId) {
      setErrorMsg('উভয় DSR নির্বাচন করুন!');
      return;
    }
    if (fromDsrId === toDsrId) {
      setErrorMsg('একই DSR এর মধ্যে ট্রান্সফার করা যাবে না!');
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

    const fromDsrObj = dsrs.find((d) => d.id === fromDsrId);
    const toDsrObj = dsrs.find((d) => d.id === toDsrId);

    const result = addDSRReissue({
      date: todayStr,
      fromDsrId,
      fromDsrName: fromDsrObj?.name || 'From DSR',
      toDsrId,
      toDsrName: toDsrObj?.name || 'To DSR',
      imeis: detectedItems.map((i) => i.imei),
      items: detectedItems,
      totalQty: detectedItems.length,
      notes,
    });

    if (!result.success) {
      setErrorMsg(result.error || 'DSR রি-ইস্যু ব্যর্থ হয়েছে!');
      return;
    }

    setSuccessMsg(`DSR রি-ইস্যু ট্রান্সফার সফল! ট্রান্সফার নং: ${result.transferNo}`);
    setBulkImeiText('');
    setNotes('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
            <Repeat className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              রি ইস্যু (DSR থেকে অন্য DSR এ ট্রান্সফার)
            </h2>
            <p className="text-xs text-slate-500">
              এক DSR থেকে সরাসরি অন্য DSR এর কাছে স্টক স্থানান্তর • বরগুনা
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
              ১. ফ্রম DSR (যার কাছ থেকে ট্রান্সফার হবে) <span className="text-rose-500">*</span>
            </label>
            <select
              value={fromDsrId}
              onChange={(e) => {
                setFromDsrId(e.target.value);
                setBulkImeiText('');
              }}
              className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 outline-none font-medium"
            >
              <option value="">-- ফ্রম DSR সিলেক্ট করুন --</option>
              {dsrs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ২. টু DSR (যে DSR গ্রহণ করবে) <span className="text-rose-500">*</span>
            </label>
            <select
              value={toDsrId}
              onChange={(e) => setToDsrId(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 outline-none font-medium"
            >
              <option value="">-- টু DSR সিলেক্ট করুন --</option>
              {dsrs.map((d) => (
                <option key={d.id} value={d.id} disabled={d.id === fromDsrId}>
                  {d.name} ({d.phone})
                </option>
              ))}
            </select>
          </div>
        </div>

        {fromDsrId && (
          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
            <div className="text-xs font-bold text-indigo-900 flex justify-between items-center">
              <span>ফ্রম DSR এর কাছে থাকা ফোন ({fromDsrPhones.length} টি):</span>
              <span className="text-[11px] text-indigo-700">ক্লিক করে ট্রান্সফার বক্সে যোগ করুন</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {fromDsrPhones.length === 0 ? (
                <span className="text-xs text-indigo-500">এই DSR এর কাছে কোনো ফোন নেই</span>
              ) : (
                fromDsrPhones.map((p) => (
                  <button
                    key={p.imei}
                    type="button"
                    onClick={() => handleAppendImei(p.imei)}
                    className="text-[11px] px-2 py-0.5 rounded border border-indigo-300 bg-white hover:bg-indigo-100 text-slate-800 font-mono"
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
            ট্রান্সফার কৃত IMEI বাল্ক ইনপুট বক্স (এক লাইনে একটি IMEI)
          </label>
          <textarea
            rows={4}
            value={bulkImeiText}
            onChange={(e) => setBulkImeiText(e.target.value)}
            placeholder="এখানে ১৫ ডিজিটের IMEI পেস্ট করুন..."
            className="w-full p-3 font-mono text-xs sm:text-sm border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
            {validationError}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleReissueSubmit}
            disabled={detectedItems.length === 0 || !!validationError}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition active:scale-95"
          >
            DSR ট্রান্সফার সম্পন্ন করুন (TRS-XXXXX)
          </button>
        </div>
      </div>
    </div>
  );
};
