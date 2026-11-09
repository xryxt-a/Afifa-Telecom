export type IMEIStatus = 
  | 'in_stock'           // ইন স্টক
  | 'sold'               // বিক্রি
  | 'with_dsr'           // DSR এর কাছে
  | 'returned'           // রিটার্ন
  | 'sales_return'       // সেলস রিটার্ন
  | 'damage'             // ড্যামেজ
  | 'in_warranty';       // ওয়ারেন্টি সার্ভিসে

export interface PhoneItem {
  imei: string;
  brand: string;
  model: string;
  purchasePrice: number;
  salePrice: number;
  status: IMEIStatus;
  purchaseInvoiceNo?: string;
  purchaseDate: string;
  supplierId?: string;
  supplierName?: string;
  soldInvoiceNo?: string;
  soldDate?: string;
  customerId?: string;
  customerName?: string;
  dsrId?: string;
  dsrName?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface PhoneModel {
  id: string;
  brand: string;
  name: string;
  defaultPurchasePrice?: number;
  defaultSalePrice?: number;
  minStockAlert?: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address?: string;
  totalDue: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  openingDue: number;
  currentDue: number;
}

export interface DSR {
  id: string;
  name: string;
  phone: string;
  route?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
}

export interface PurchaseItem {
  brand: string;
  model: string;
  imeis: string[];
  purchasePrice: number;
  salePrice: number;
  total: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalQty: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'bank';
  status: 'completed' | 'cancelled';
  createdAt: string;
  createdBy: string;
}

export interface SaleItem {
  brand: string;
  model: string;
  imei: string;
  salePrice: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: SaleItem[];
  totalQty: number;
  subTotal: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'bank' | 'due';
  status: 'completed' | 'returned' | 'partial_return' | 'cancelled';
  createdAt: string;
  createdBy: string;
}

export interface SalesReturnItem {
  brand: string;
  model: string;
  imei: string;
  refundPrice: number;
}

export interface SalesReturn {
  id: string;
  returnNo: string;
  date: string;
  originalInvoiceNo: string;
  customerId: string;
  customerName: string;
  imeis: string[];
  items: SalesReturnItem[];
  returnReason: 'customer_choice' | 'damaged' | 'defective' | 'exchange' | 'other';
  refundAmount: number;
  refundMethod: 'cash' | 'bkash' | 'bank' | 'adjust_due';
  status: 'completed' | 'cancelled';
  createdAt: string;
  createdBy: string;
}

export interface DSRIssue {
  id: string;
  issueNo: string;
  date: string;
  dsrId: string;
  dsrName: string;
  imeis: string[];
  items: { brand: string; model: string; imei: string }[];
  totalQty: number;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface DSRReturn {
  id: string;
  returnNo: string;
  date: string;
  dsrId: string;
  dsrName: string;
  imeis: string[];
  items: { brand: string; model: string; imei: string }[];
  totalQty: number;
  reason: string;
  createdAt: string;
  createdBy: string;
}

export interface DSRReissue {
  id: string;
  transferNo: string;
  date: string;
  fromDsrId: string;
  fromDsrName: string;
  toDsrId: string;
  toDsrName: string;
  imeis: string[];
  items: { brand: string; model: string; imei: string }[];
  totalQty: number;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface CashBookEntry {
  id: string;
  date: string;
  description: string;
  category: 'সেলস' | 'পারচেজ' | 'সেলস রিটার্ন' | 'বাকি কালেকশন' | 'সাপ্লায়ার পেমেন্ট' | 'দোকান খরচ' | 'অন্যান্য';
  type: 'cash_in' | 'cash_out';
  amount: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'bank';
  referenceId?: string;
  balanceAfter?: number;
  createdAt: string;
  createdBy: string;
}

export interface PaymentVoucher {
  id: string;
  voucherNo: string;
  date: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  paymentMethod: 'cash' | 'bkash' | 'bank';
  note?: string;
  status: 'completed' | 'cancelled';
  createdAt: string;
  createdBy: string;
}

export interface ReceiveVoucher {
  id: string;
  voucherNo: string;
  date: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  amount: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'bank';
  note?: string;
  remainingDue?: number;
  status: 'completed' | 'cancelled';
  createdAt: string;
  createdBy: string;
}

export interface Expense {
  id: string;
  expenseNo: string;
  date: string;
  categoryId: string;
  categoryName: string;
  title: string;
  amount: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'bank';
  paidTo: string;
  note?: string;
  attachmentName?: string;
  status: 'completed' | 'cancelled';
  createdAt: string;
  createdBy: string;
}

export interface WarrantyStep1 {
  warrantyNo: string;
  receiveDate: string;
  partyName: string;
  phone: string;
  brand: string;
  model: string;
  imei: string;
  problem: string;
  accessoriesIncluded: string;
  conditionNote?: string;
  receivedBy: string;
}

export interface WarrantyStep2 {
  careName: string;
  sentDate: string;
  sentBy: string;
  courierOrPerson: string;
  trackingNo?: string;
  expectedReturnDate?: string;
  serviceChargeType: 'free' | 'paid';
  serviceCharge?: number;
}

export interface WarrantyStep3 {
  careReceiveDate: string;
  careReceivedBy: string;
  careReport: 'repaired' | 'replaced' | 'parts_changed' | 'not_repaired' | 'rejected';
  workDone: string;
  careCost?: number;
  newImeiIfReplaced?: string;
}

export interface WarrantyStep4 {
  deliveryDate: string;
  deliveredBy: string;
  customerSatisfaction?: string;
  customerCollectedBy?: string;
  finalChargeCollected?: number;
}

export interface WarrantyTask {
  id: string;
  warrantyNo: string;
  status: 'received_from_customer' | 'sent_to_care' | 'received_from_care' | 'delivered_to_customer';
  step1: WarrantyStep1;
  step2?: WarrantyStep2;
  step3?: WarrantyStep3;
  step4?: WarrantyStep4;
  createdAt: string;
  createdBy: string;
}

export interface PriceProtection {
  id: string;
  date: string;
  brand: string;
  model: string;
  oldPrice: number;
  newPrice: number;
  dropPerUnit: number;
  totalQtyClaimed: number;
  totalProtectionAmount: number;
  supplierName: string;
  status: 'claimed' | 'received' | 'adjusted';
  notes?: string;
  createdAt: string;
  createdBy: string;
}
