import React, { useState } from 'react';
import { X, Printer, FileText, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { SalesInvoice, PurchaseInvoice, DSRIssue, DSRReturn, ReceiveVoucher, PaymentVoucher, Expense, WarrantyTask } from '../types';

export type PrintDataType =
  | { type: 'sales'; data: SalesInvoice }
  | { type: 'purchase'; data: PurchaseInvoice }
  | { type: 'dsr_issue'; data: DSRIssue }
  | { type: 'dsr_return'; data: DSRReturn }
  | { type: 'receive_voucher'; data: ReceiveVoucher }
  | { type: 'payment_voucher'; data: PaymentVoucher }
  | { type: 'expense'; data: Expense }
  | { type: 'warranty_receive'; data: WarrantyTask }
  | { type: 'warranty_chalan'; data: WarrantyTask };

interface PrintModalProps {
  printData: PrintDataType | null;
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({ printData, onClose }) => {
  const [thermalMode, setThermalMode] = useState<boolean>(false);

  if (!printData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Modal Controls (No print) */}
        <div className="p-3 sm:p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm sm:text-base text-slate-800">
              প্রিন্ট প্রিভিউ
            </span>
            {printData.type === 'sales' && (
              <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-300 text-xs">
                <button
                  type="button"
                  onClick={() => setThermalMode(false)}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    !thermalMode ? 'bg-[#0B5ED7] text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  A4 মেমো
                </button>
                <button
                  type="button"
                  onClick={() => setThermalMode(true)}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    thermalMode ? 'bg-[#0B5ED7] text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ৮০ মিমি থার্মাল
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-[#0B5ED7] hover:bg-[#0A4AB0] text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200 flex justify-center">
          <div
            className={`printable-area bg-white text-slate-900 shadow-lg ${
              thermalMode
                ? 'w-[80mm] max-w-[80mm] p-3 text-[11px] leading-tight font-mono'
                : 'w-full max-w-[210mm] p-6 sm:p-10 text-xs sm:text-sm'
            }`}
          >
            {/* Header: Shop Info */}
            <div className="text-center pb-3 border-b-2 border-slate-800">
              <h1 className={`${thermalMode ? 'text-base' : 'text-xl sm:text-2xl'} font-bold tracking-tight text-slate-900`}>
                আফিফা টেলিকম এন্ড ইলেকট্রনিক্স
              </h1>
              <p className={`${thermalMode ? 'text-xs' : 'text-sm'} font-semibold text-slate-700 mt-0.5`}>
                বরগুনা
              </p>
              <p className="text-[11px] text-slate-600">
                মোবাইল ফোন ও ইলেকট্রনিক্স সমগ্রী বিক্রয় ও সার্ভিস সেন্টার
              </p>
            </div>

            {/* Document Content Based on Type */}
            {printData.type === 'sales' && (
              <SalesMemoView invoice={printData.data} thermal={thermalMode} />
            )}

            {printData.type === 'purchase' && (
              <PurchaseInvoiceView invoice={printData.data} />
            )}

            {printData.type === 'dsr_issue' && (
              <DSRIssueView issue={printData.data} />
            )}

            {printData.type === 'dsr_return' && (
              <DSRReturnView data={printData.data} />
            )}

            {printData.type === 'receive_voucher' && (
              <MoneyReceiptView voucher={printData.data} />
            )}

            {printData.type === 'payment_voucher' && (
              <PaymentVoucherView voucher={printData.data} />
            )}

            {printData.type === 'expense' && (
              <ExpenseVoucherView expense={printData.data} />
            )}

            {printData.type === 'warranty_receive' && (
              <WarrantyReceiveView task={printData.data} />
            )}

            {printData.type === 'warranty_chalan' && (
              <WarrantyCareChalanView task={printData.data} />
            )}

            {/* Signatures & Footer Note */}
            <div className="mt-8 pt-4 border-t border-slate-300">
              <div className="flex justify-between items-end text-xs text-slate-600 mb-4 pt-6">
                <div className="text-center">
                  <div className="border-t border-dashed border-slate-500 w-28 sm:w-36 pt-1">
                    গ্রাহক স্বাক্ষর
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-dashed border-slate-500 w-28 sm:w-36 pt-1">
                    কর্তৃপক্ষ স্বাক্ষর
                  </div>
                </div>
              </div>
              <p className="text-center text-[10px] text-slate-500">
                ধন্যবাদ আবার আসবেন • আফিফা টেলিকম এন্ড ইলেকট্রনিক্স, বরগুনা
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 1. Sales Memo Component (Strictly NO warranty!)
const SalesMemoView: React.FC<{ invoice: SalesInvoice; thermal: boolean }> = ({ invoice, thermal }) => {
  return (
    <div className="mt-3 space-y-3">
      <div className="text-center">
        <span className="inline-block px-3 py-0.5 bg-slate-900 text-white font-bold text-xs uppercase rounded">
          বিক্রয় চালান / সেলস মেমো
        </span>
      </div>

      <div className="flex justify-between items-start text-xs border-b border-slate-200 pb-2">
        <div>
          <p><strong>মেমো নং:</strong> {invoice.invoiceNo}</p>
          <p><strong>তারিখ:</strong> {invoice.date}</p>
          <p><strong>বিক্রেতা:</strong> {invoice.createdBy}</p>
        </div>
        <div className="text-right">
          <p><strong>কাস্টমার:</strong> {invoice.customerName}</p>
          <p><strong>মোবাইল:</strong> {invoice.customerPhone}</p>
          {invoice.customerAddress && <p><strong>ঠিকানা:</strong> {invoice.customerAddress}</p>}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left border-collapse border border-slate-300">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold">
            <th className="p-1 border-r border-slate-300">ক্র.</th>
            <th className="p-1 border-r border-slate-300">বিবরণ (ব্র্যান্ড ও মডেল)</th>
            <th className="p-1 border-r border-slate-300">IMEI (১৫ ডিজিট)</th>
            <th className="p-1 text-right">মূল্য</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-xs">
          {invoice.items.map((item, idx) => (
            <tr key={idx}>
              <td className="p-1 border-r border-slate-200 text-center">{idx + 1}</td>
              <td className="p-1 border-r border-slate-200 font-semibold">
                {item.brand} {item.model}
              </td>
              <td className="p-1 border-r border-slate-200 font-mono text-[11px] text-slate-800">
                {item.imei}
              </td>
              <td className="p-1 text-right font-semibold">
                {formatCurrency(item.salePrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Financial Summary */}
      <div className="border-t border-slate-300 pt-2 flex justify-end">
        <div className="w-48 sm:w-60 space-y-1 text-xs">
          <div className="flex justify-between">
            <span>মোট ফোন:</span>
            <span className="font-bold">{invoice.totalQty} টি</span>
          </div>
          <div className="flex justify-between">
            <span>সাব টোটাল:</span>
            <span>{formatCurrency(invoice.subTotal)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>ডিসকাউন্ট:</span>
              <span>- {formatCurrency(invoice.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold border-t border-slate-300 pt-1 text-sm">
            <span>সর্বমোট বিল:</span>
            <span>{formatCurrency(invoice.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-emerald-700 font-semibold">
            <span>পরিশোধ ({invoice.paymentMethod}):</span>
            <span>{formatCurrency(invoice.paidAmount)}</span>
          </div>
          {invoice.dueAmount > 0 && (
            <div className="flex justify-between text-rose-700 font-bold border-t border-slate-200 pt-1">
              <span>বাকি টাকা:</span>
              <span>{formatCurrency(invoice.dueAmount)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 2. Purchase Invoice View
const PurchaseInvoiceView: React.FC<{ invoice: PurchaseInvoice }> = ({ invoice }) => {
  return (
    <div className="mt-3 space-y-3">
      <div className="text-center">
        <span className="inline-block px-3 py-0.5 bg-blue-800 text-white font-bold text-xs uppercase rounded">
          পারচেজ চালান / ক্রয় ইনভয়েস
        </span>
      </div>

      <div className="flex justify-between items-start text-xs border-b border-slate-200 pb-2">
        <div>
          <p><strong>চালান নং:</strong> {invoice.invoiceNo}</p>
          <p><strong>তারিখ:</strong> {invoice.date}</p>
        </div>
        <div className="text-right">
          <p><strong>সাপ্লায়ার:</strong> {invoice.supplierName}</p>
          <p><strong>এন্ট্রি কৃত:</strong> {invoice.createdBy}</p>
        </div>
      </div>

      <table className="w-full text-left border-collapse border border-slate-300 text-xs">
        <thead className="bg-slate-100 font-bold">
          <tr>
            <th className="p-1.5 border border-slate-300">মডেল</th>
            <th className="p-1.5 border border-slate-300">কোয়ান্টিটি</th>
            <th className="p-1.5 border border-slate-300">ক্রয় মূল্য</th>
            <th className="p-1.5 border border-slate-300 text-right">মোট টাকা</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx} className="border-b border-slate-200">
              <td className="p-1.5 border border-slate-300">
                <div className="font-semibold">{item.brand} {item.model}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  IMEI: {item.imeis.join(', ')}
                </div>
              </td>
              <td className="p-1.5 border border-slate-300 text-center font-bold">{item.imeis.length} টি</td>
              <td className="p-1.5 border border-slate-300">{formatCurrency(item.purchasePrice)}</td>
              <td className="p-1.5 border border-slate-300 text-right font-bold">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-slate-300 pt-2 flex justify-end">
        <div className="w-56 space-y-1 text-xs">
          <div className="flex justify-between font-bold">
            <span>মোট বিল:</span>
            <span>{formatCurrency(invoice.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-emerald-700">
            <span>পরিশোধ:</span>
            <span>{formatCurrency(invoice.paidAmount)}</span>
          </div>
          <div className="flex justify-between text-rose-700 font-bold">
            <span>সাপ্লায়ার বাকি:</span>
            <span>{formatCurrency(invoice.dueAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. DSR Issue Chalan
const DSRIssueView: React.FC<{ issue: DSRIssue }> = ({ issue }) => {
  return (
    <div className="mt-3 space-y-3">
      <div className="text-center">
        <span className="inline-block px-3 py-0.5 bg-blue-700 text-white font-bold text-xs uppercase rounded">
          DSR স্টক ইস্যু চালান
        </span>
      </div>

      <div className="flex justify-between text-xs border-b border-slate-200 pb-2">
        <div>
          <p><strong>চালান নং:</strong> {issue.issueNo}</p>
          <p><strong>তারিখ:</strong> {issue.date}</p>
        </div>
        <div className="text-right">
          <p><strong>DSR এর নাম:</strong> {issue.dsrName}</p>
          <p><strong>ইস্যু কারী:</strong> {issue.createdBy}</p>
        </div>
      </div>

      <table className="w-full text-left border-collapse border border-slate-300 text-xs">
        <thead className="bg-slate-100 font-bold">
          <tr>
            <th className="p-1.5 border border-slate-300">ক্র.</th>
            <th className="p-1.5 border border-slate-300">ব্র্যান্ড ও মডেল</th>
            <th className="p-1.5 border border-slate-300">IMEI (১৫ ডিজিট)</th>
          </tr>
        </thead>
        <tbody>
          {issue.items.map((item, idx) => (
            <tr key={idx} className="border-b border-slate-200">
              <td className="p-1.5 border border-slate-300 text-center">{idx + 1}</td>
              <td className="p-1.5 border border-slate-300 font-semibold">{item.brand} {item.model}</td>
              <td className="p-1.5 border border-slate-300 font-mono text-[11px]">{item.imei}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right font-bold text-xs pt-2">
        মোট ইস্যু কৃত ফোন: {issue.totalQty} টি
      </div>
    </div>
  );
};

// 4. DSR Return Memo
const DSRReturnView: React.FC<{ data: DSRReturn }> = ({ data }) => {
  return (
    <div className="mt-3 space-y-3">
      <div className="text-center">
        <span className="inline-block px-3 py-0.5 bg-amber-700 text-white font-bold text-xs uppercase rounded">
          DSR স্টক রিটার্ন মেমো
        </span>
      </div>

      <div className="flex justify-between text-xs border-b border-slate-200 pb-2">
        <div>
          <p><strong>রিটার্ন মেমো:</strong> {data.returnNo}</p>
          <p><strong>তারিখ:</strong> {data.date}</p>
        </div>
        <div className="text-right">
          <p><strong>DSR:</strong> {data.dsrName}</p>
          <p><strong>কারণ:</strong> {data.reason}</p>
        </div>
      </div>

      <table className="w-full text-left border-collapse border border-slate-300 text-xs">
        <thead className="bg-slate-100 font-bold">
          <tr>
            <th className="p-1.5 border border-slate-300">ক্র.</th>
            <th className="p-1.5 border border-slate-300">ব্র্যান্ড ও মডেল</th>
            <th className="p-1.5 border border-slate-300">IMEI</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, idx) => (
            <tr key={idx} className="border-b border-slate-200">
              <td className="p-1.5 border border-slate-300 text-center">{idx + 1}</td>
              <td className="p-1.5 border border-slate-300 font-semibold">{item.brand} {item.model}</td>
              <td className="p-1.5 border border-slate-300 font-mono text-[11px]">{item.imei}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right font-bold text-xs pt-2">
        মোট রিটার্ন ফোন: {data.totalQty} টি
      </div>
    </div>
  );
};

// 5. Money Receipt (Receive Voucher)
const MoneyReceiptView: React.FC<{ voucher: ReceiveVoucher }> = ({ voucher }) => {
  return (
    <div className="mt-3 space-y-3">
      <div className="text-center">
        <span className="inline-block px-3 py-0.5 bg-emerald-700 text-white font-bold text-xs uppercase rounded">
          মানি রিসিপ্ট / টাকা জমার রসিদ
        </span>
      </div>

      <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-2 text-xs">
        <div className="flex justify-between">
          <span><strong>রসিদ নং:</strong> {voucher.voucherNo}</span>
          <span><strong>তারিখ:</strong> {voucher.date}</span>
        </div>
        <p><strong>কাস্টমারের নাম:</strong> {voucher.customerName}</p>
        {voucher.customerPhone && <p><strong>ফোন:</strong> {voucher.customerPhone}</p>}
        <div className="flex justify-between text-base font-bold text-emerald-800 border-t border-emerald-300 pt-2">
          <span>জমা প্রাপ্ত টাকা:</span>
          <span>{formatCurrency(voucher.amount)}</span>
        </div>
        <p><strong>পেমেন্ট মেথড:</strong> {voucher.paymentMethod.toUpperCase()}</p>
        {voucher.note && <p><strong>বিবরণ:</strong> {voucher.note}</p>}
        {voucher.remainingDue !== undefined && (
          <div className="flex justify-between font-semibold text-rose-700 border-t border-dashed border-emerald-300 pt-1">
            <span>অবশিষ্ট বাকি:</span>
            <span>{formatCurrency(voucher.remainingDue)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// 6. Payment Voucher
const PaymentVoucherView: React.FC<{ voucher: PaymentVoucher }> = ({ voucher }) => {
  return (
    <div className="mt-3 space-y-3">
      <div className="text-center">
        <span className="inline-block px-3 py-0.5 bg-slate-800 text-white font-bold text-xs uppercase rounded">
          পেমেন্ট ভাউচার (সাপ্লায়ার)
        </span>
      </div>
      <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg space-y-2 text-xs">
        <div className="flex justify-between">
          <span><strong>ভাউচার নং:</strong> {voucher.voucherNo}</span>
          <span><strong>তারিখ:</strong> {voucher.date}</span>
        </div>
        <p><strong>সাপ্লায়ার:</strong> {voucher.supplierName}</p>
        <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-300 pt-2">
          <span>প্রদত্ত টাকার পরিমাণ:</span>
          <span>{formatCurrency(voucher.amount)}</span>
        </div>
        <p><strong>মাধ্যম:</strong> {voucher.paymentMethod.toUpperCase()}</p>
        {voucher.note && <p><strong>নোট:</strong> {voucher.note}</p>}
      </div>
    </div>
  );
};

// 7. Expense Voucher
const ExpenseVoucherView: React.FC<{ expense: Expense }> = ({ expense }) => {
  return (
    <div className="mt-3 space-y-3">
      <div className="text-center">
        <span className="inline-block px-3 py-0.5 bg-rose-800 text-white font-bold text-xs uppercase rounded">
          দোকান খরচ ভাউচার
        </span>
      </div>
      <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg space-y-2 text-xs">
        <div className="flex justify-between">
          <span><strong>ভাউচার নং:</strong> {expense.expenseNo}</span>
          <span><strong>তারিখ:</strong> {expense.date}</span>
        </div>
        <p><strong>খরচের খাত:</strong> {expense.categoryName}</p>
        <p><strong>বিবরণ:</strong> {expense.title}</p>
        <p><strong>প্রাপক / যাকে দেওয়া হইছে:</strong> {expense.paidTo}</p>
        <div className="flex justify-between text-base font-bold text-rose-800 border-t border-slate-300 pt-2">
          <span>খরচের পরিমাণ:</span>
          <span>{formatCurrency(expense.amount)}</span>
        </div>
        <p><strong>মাধ্যম:</strong> {expense.paymentMethod.toUpperCase()}</p>
      </div>
    </div>
  );
};

// 8. Warranty Receive Slip (Customer Proof)
const WarrantyReceiveView: React.FC<{ task: WarrantyTask }> = ({ task }) => {
  const { step1 } = task;
  return (
    <div className="mt-3 space-y-3">
      <div className="text-center">
        <span className="inline-block px-3 py-0.5 bg-purple-700 text-white font-bold text-xs uppercase rounded">
          ওয়ারেন্টি সার্ভিস রিসিভ স্লিপ (গ্রাহক কপি)
        </span>
      </div>

      <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-lg space-y-2 text-xs">
        <div className="flex justify-between">
          <span><strong>ওয়ারেন্টি টোকেন নং:</strong> {step1.warrantyNo}</span>
          <span><strong>রিসিভ তারিখ:</strong> {step1.receiveDate}</span>
        </div>
        <p><strong>গ্রাহকের নাম:</strong> {step1.partyName} (মোবাইল: {step1.phone})</p>
        <div className="grid grid-cols-2 gap-2 border-t border-purple-200 pt-2">
          <p><strong>মডেল:</strong> {step1.brand} {step1.model}</p>
          <p><strong>IMEI (১৫ ডিজিট):</strong> <span className="font-mono">{step1.imei}</span></p>
        </div>
        <p className="text-purple-900"><strong>সমস্যার বিবরণ:</strong> {step1.problem}</p>
        <p><strong>গৃহীত মালামাল:</strong> {step1.accessoriesIncluded}</p>
        {step1.conditionNote && <p><strong>কন্ডিশন নোট:</strong> {step1.conditionNote}</p>}
        <p className="text-slate-500 text-[11px]">রিসিভ করেছেন: {step1.receivedBy}</p>
      </div>
    </div>
  );
};

// 9. Warranty Care Chalan
const WarrantyCareChalanView: React.FC<{ task: WarrantyTask }> = ({ task }) => {
  const { step1, step2 } = task;
  return (
    <div className="mt-3 space-y-3">
      <div className="text-center">
        <span className="inline-block px-3 py-0.5 bg-purple-800 text-white font-bold text-xs uppercase rounded">
          কাস্টমার কেয়ার সার্ভিস চালান
        </span>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg space-y-2 text-xs">
        <div className="flex justify-between">
          <span><strong>ওয়ারেন্টি ট্র্যাকিং নং:</strong> {task.warrantyNo}</span>
          <span><strong>পাঠানোর তারিখ:</strong> {step2?.sentDate}</span>
        </div>
        <p><strong>সার্ভিস সেন্টারের নাম:</strong> {step2?.careName}</p>
        <p><strong>মডেল:</strong> {step1.brand} {step1.model} | <strong>IMEI:</strong> <span className="font-mono">{step1.imei}</span></p>
        <p><strong>সমস্যা:</strong> {step1.problem}</p>
        <p><strong>কুরিয়ার / প্রেরক:</strong> {step2?.courierOrPerson} (চালান/ট্র্যাকিং: {step2?.trackingNo || 'N/A'})</p>
        <p><strong>সম্ভাব্য ফেরত তারিখ:</strong> {step2?.expectedReturnDate || 'N/A'}</p>
      </div>
    </div>
  );
};
