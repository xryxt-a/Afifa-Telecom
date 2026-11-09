import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Brand,
  PhoneModel,
  Supplier,
  Customer,
  DSR,
  ExpenseCategory,
  PhoneItem,
  PurchaseInvoice,
  SalesInvoice,
  SalesReturn,
  DSRIssue,
  DSRReturn,
  DSRReissue,
  CashBookEntry,
  PaymentVoucher,
  ReceiveVoucher,
  Expense,
  WarrantyTask,
  PriceProtection,
  WarrantyStep1,
  WarrantyStep2,
  WarrantyStep3,
  WarrantyStep4,
} from '../types';

interface AppContextType {
  // Master lists
  brands: Brand[];
  models: PhoneModel[];
  suppliers: Supplier[];
  customers: Customer[];
  dsrs: DSR[];
  expenseCategories: ExpenseCategory[];

  // Core Data
  phones: PhoneItem[];
  purchases: PurchaseInvoice[];
  sales: SalesInvoice[];
  salesReturns: SalesReturn[];
  dsrIssues: DSRIssue[];
  dsrReturns: DSRReturn[];
  dsrReissues: DSRReissue[];
  cashBook: CashBookEntry[];
  paymentVouchers: PaymentVoucher[];
  receiveVouchers: ReceiveVoucher[];
  expenses: Expense[];
  warrantyTasks: WarrantyTask[];
  priceProtections: PriceProtection[];

  // Current User
  currentUser: string;
  setCurrentUser: (user: string) => void;

  // Actions
  addBrand: (name: string) => void;
  deleteBrand: (id: string) => void;
  addModel: (model: Omit<PhoneModel, 'id'>) => void;
  deleteModel: (id: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'totalDue'> & { initialDue?: number }) => void;
  deleteSupplier: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'currentDue'> & { openingDue?: number }) => void;
  deleteCustomer: (id: string) => void;
  addDSR: (dsr: Omit<DSR, 'id'>) => void;
  deleteDSR: (id: string) => void;
  addExpenseCategory: (name: string) => void;
  deleteExpenseCategory: (id: string) => void;

  // Transactions
  addPurchase: (purchase: Omit<PurchaseInvoice, 'id' | 'invoiceNo' | 'status' | 'createdAt' | 'createdBy'>) => { success: boolean; error?: string; invoiceNo?: string };
  cancelPurchase: (invoiceId: string) => { success: boolean; error?: string };
  addSale: (sale: Omit<SalesInvoice, 'id' | 'invoiceNo' | 'status' | 'createdAt' | 'createdBy'>) => { success: boolean; error?: string; invoiceNo?: string };
  cancelSale: (saleId: string) => { success: boolean; error?: string };
  addSalesReturn: (returnData: Omit<SalesReturn, 'id' | 'returnNo' | 'status' | 'createdAt' | 'createdBy'>) => { success: boolean; error?: string; returnNo?: string };
  addDSRIssue: (issue: Omit<DSRIssue, 'id' | 'issueNo' | 'createdAt' | 'createdBy'>) => { success: boolean; error?: string; issueNo?: string };
  addDSRReturn: (returnData: Omit<DSRReturn, 'id' | 'returnNo' | 'createdAt' | 'createdBy'>) => { success: boolean; error?: string; returnNo?: string };
  addDSRReissue: (reissue: Omit<DSRReissue, 'id' | 'transferNo' | 'createdAt' | 'createdBy'>) => { success: boolean; error?: string; transferNo?: string };
  addPaymentVoucher: (voucher: Omit<PaymentVoucher, 'id' | 'voucherNo' | 'status' | 'createdAt' | 'createdBy'>) => { success: boolean; error?: string; voucherNo?: string };
  cancelPaymentVoucher: (id: string) => { success: boolean; error?: string };
  addReceiveVoucher: (voucher: Omit<ReceiveVoucher, 'id' | 'voucherNo' | 'status' | 'createdAt' | 'createdBy' | 'remainingDue'>) => { success: boolean; error?: string; voucherNo?: string };
  cancelReceiveVoucher: (id: string) => { success: boolean; error?: string };
  addExpense: (expense: Omit<Expense, 'id' | 'expenseNo' | 'status' | 'createdAt' | 'createdBy'>) => { success: boolean; error?: string; expenseNo?: string };
  cancelExpense: (id: string) => { success: boolean; error?: string };

  // Warranty
  addWarrantyStep1: (step1: WarrantyStep1) => { success: boolean; error?: string; warrantyNo?: string };
  updateWarrantyStep2: (warrantyId: string, step2: WarrantyStep2) => { success: boolean; error?: string };
  updateWarrantyStep3: (warrantyId: string, step3: WarrantyStep3) => { success: boolean; error?: string };
  updateWarrantyStep4: (warrantyId: string, step4: WarrantyStep4) => { success: boolean; error?: string };

  // Price Protection
  addPriceProtection: (data: Omit<PriceProtection, 'id' | 'createdAt' | 'createdBy'>) => void;

  // System Helpers
  loadDemoData: () => void;
  resetToBlank: () => void;
}

const STORAGE_KEY = 'afifa_telecom_data_v1';

// Default standard initial brands & categories for a Bangladeshi mobile shop
const DEFAULT_BRANDS: Brand[] = [
  { id: 'b-1', name: 'Samsung' },
  { id: 'b-2', name: 'Vivo' },
  { id: 'b-3', name: 'Oppo' },
  { id: 'b-4', name: 'Realme' },
  { id: 'b-5', name: 'Xiaomi' },
  { id: 'b-6', name: 'Apple' },
  { id: 'b-7', name: 'Infinix' },
  { id: 'b-8', name: 'Tecno' },
];

const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'ec-1', name: 'দোকান ভাড়া' },
  { id: 'ec-2', name: 'কারেন্ট বিল' },
  { id: 'ec-3', name: 'স্টাফ বেতন' },
  { id: 'ec-4', name: 'চা / খাবার / নাস্তা' },
  { id: 'ec-5', name: 'ট্রান্সপোর্ট / রিকশা / ফুয়েল' },
  { id: 'ec-6', name: 'মোবাইল রিচার্জ / ইন্টারনেট বিল' },
  { id: 'ec-7', name: 'দোকান মেরামত / ডেকোরেশন' },
  { id: 'ec-8', name: 'মার্কেটিং / ব্যানার / পোস্টার' },
  { id: 'ec-9', name: 'DSR কমিশন / TA DA' },
  { id: 'ec-10', name: 'অফিস স্টেশনারি' },
  { id: 'ec-11', name: 'অন্যান্য খরচ' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<string>('এডমিন');

  // Master lists
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_BRANDS);
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dsrs, setDsrs] = useState<DSR[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(DEFAULT_EXPENSE_CATEGORIES);

  // Operational items
  const [phones, setPhones] = useState<PhoneItem[]>([]);
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [sales, setSales] = useState<SalesInvoice[]>([]);
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>([]);
  const [dsrIssues, setDsrIssues] = useState<DSRIssue[]>([]);
  const [dsrReturns, setDsrReturns] = useState<DSRReturn[]>([]);
  const [dsrReissues, setDsrReissues] = useState<DSRReissue[]>([]);
  const [cashBook, setCashBook] = useState<CashBookEntry[]>([]);
  const [paymentVouchers, setPaymentVouchers] = useState<PaymentVoucher[]>([]);
  const [receiveVouchers, setReceiveVouchers] = useState<ReceiveVoucher[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [warrantyTasks, setWarrantyTasks] = useState<WarrantyTask[]>([]);
  const [priceProtections, setPriceProtections] = useState<PriceProtection[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.brands) setBrands(parsed.brands);
        if (parsed.models) setModels(parsed.models);
        if (parsed.suppliers) setSuppliers(parsed.suppliers);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.dsrs) setDsrs(parsed.dsrs);
        if (parsed.expenseCategories) setExpenseCategories(parsed.expenseCategories);
        if (parsed.phones) setPhones(parsed.phones);
        if (parsed.purchases) setPurchases(parsed.purchases);
        if (parsed.sales) setSales(parsed.sales);
        if (parsed.salesReturns) setSalesReturns(parsed.salesReturns);
        if (parsed.dsrIssues) setDsrIssues(parsed.dsrIssues);
        if (parsed.dsrReturns) setDsrReturns(parsed.dsrReturns);
        if (parsed.dsrReissues) setDsrReissues(parsed.dsrReissues);
        if (parsed.cashBook) setCashBook(parsed.cashBook);
        if (parsed.paymentVouchers) setPaymentVouchers(parsed.paymentVouchers);
        if (parsed.receiveVouchers) setReceiveVouchers(parsed.receiveVouchers);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.warrantyTasks) setWarrantyTasks(parsed.warrantyTasks);
        if (parsed.priceProtections) setPriceProtections(parsed.priceProtections);
      }
    } catch (e) {
      console.error('Failed to load local storage data', e);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      const dataToSave = {
        brands,
        models,
        suppliers,
        customers,
        dsrs,
        expenseCategories,
        phones,
        purchases,
        sales,
        salesReturns,
        dsrIssues,
        dsrReturns,
        dsrReissues,
        cashBook,
        paymentVouchers,
        receiveVouchers,
        expenses,
        warrantyTasks,
        priceProtections,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }, [
    brands,
    models,
    suppliers,
    customers,
    dsrs,
    expenseCategories,
    phones,
    purchases,
    sales,
    salesReturns,
    dsrIssues,
    dsrReturns,
    dsrReissues,
    cashBook,
    paymentVouchers,
    receiveVouchers,
    expenses,
    warrantyTasks,
    priceProtections,
  ]);

  // Master List Handlers
  const addBrand = (name: string) => {
    if (!name.trim()) return;
    const newBrand: Brand = { id: `b-${Date.now()}`, name: name.trim() };
    setBrands((prev) => [...prev, newBrand]);
  };

  const deleteBrand = (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
  };

  const addModel = (model: Omit<PhoneModel, 'id'>) => {
    const newModel: PhoneModel = { id: `m-${Date.now()}`, ...model };
    setModels((prev) => [...prev, newModel]);
  };

  const deleteModel = (id: string) => {
    setModels((prev) => prev.filter((m) => m.id !== id));
  };

  const addSupplier = (supplier: Omit<Supplier, 'id' | 'totalDue'> & { initialDue?: number }) => {
    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name: supplier.name,
      phone: supplier.phone,
      address: supplier.address,
      totalDue: supplier.initialDue || 0,
    };
    setSuppliers((prev) => [...prev, newSup]);
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const addCustomer = (cust: Omit<Customer, 'id' | 'currentDue'> & { openingDue?: number }) => {
    const opening = cust.openingDue || 0;
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: cust.name,
      phone: cust.phone,
      address: cust.address,
      openingDue: opening,
      currentDue: opening,
    };
    setCustomers((prev) => [...prev, newCust]);
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const addDSR = (dsr: Omit<DSR, 'id'>) => {
    const newDsr: DSR = { id: `dsr-${Date.now()}`, ...dsr };
    setDsrs((prev) => [...prev, newDsr]);
  };

  const deleteDSR = (id: string) => {
    setDsrs((prev) => prev.filter((d) => d.id !== id));
  };

  const addExpenseCategory = (name: string) => {
    if (!name.trim()) return;
    const newCat: ExpenseCategory = { id: `ec-${Date.now()}`, name: name.trim() };
    setExpenseCategories((prev) => [...prev, newCat]);
  };

  const deleteExpenseCategory = (id: string) => {
    setExpenseCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // 4. New Purchase
  const addPurchase = (data: Omit<PurchaseInvoice, 'id' | 'invoiceNo' | 'status' | 'createdAt' | 'createdBy'>) => {
    // Validate all IMEIs are 15 digits and unique across existing phones
    const allNewImeis: string[] = [];
    for (const item of data.items) {
      for (const imei of item.imeis) {
        const cleanImei = imei.trim();
        if (!/^\d{15}$/.test(cleanImei)) {
          return { success: false, error: `IMEI ${cleanImei} অবশ্যই ১৫ ডিজিটের হতে হবে!` };
        }
        if (allNewImeis.includes(cleanImei)) {
          return { success: false, error: `ডুপ্লিকেট IMEI ${cleanImei} একই পারচেজে দুইবার আছে!` };
        }
        // Check if exists in active phones
        const existing = phones.find((p) => p.imei === cleanImei);
        if (existing) {
          return { success: false, error: `IMEI ${cleanImei} ইতিমধ্যে ডাটাবেজে আছে! এক IMEI দুইবার কেনা যাবে না।` };
        }
        allNewImeis.push(cleanImei);
      }
    }

    const now = new Date();
    const invoiceNo = `PUR-${String(purchases.length + 1).padStart(5, '0')}`;
    const newInvoice: PurchaseInvoice = {
      ...data,
      id: `pur-${Date.now()}`,
      invoiceNo,
      status: 'completed',
      createdAt: now.toISOString(),
      createdBy: currentUser,
    };

    // Create new phone items
    const newPhoneItems: PhoneItem[] = [];
    data.items.forEach((item) => {
      item.imeis.forEach((imei) => {
        newPhoneItems.push({
          imei: imei.trim(),
          brand: item.brand,
          model: item.model,
          purchasePrice: item.purchasePrice,
          salePrice: item.salePrice,
          status: 'in_stock',
          purchaseInvoiceNo: invoiceNo,
          purchaseDate: data.date,
          supplierId: data.supplierId,
          supplierName: data.supplierName,
          createdAt: now.toISOString(),
          createdBy: currentUser,
        });
      });
    });

    setPurchases((prev) => [newInvoice, ...prev]);
    setPhones((prev) => [...newPhoneItems, ...prev]);

    // Update supplier due if any
    if (data.dueAmount > 0) {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === data.supplierId ? { ...s, totalDue: (s.totalDue || 0) + data.dueAmount } : s))
      );
    }

    // Add cashbook entry if paid
    if (data.paidAmount > 0) {
      const cashEntry: CashBookEntry = {
        id: `cb-${Date.now()}`,
        date: data.date,
        description: `পারচেজ বিল: ${invoiceNo} (${data.supplierName})`,
        category: 'পারচেজ',
        type: 'cash_out',
        amount: data.paidAmount,
        paymentMethod: data.paymentMethod,
        referenceId: invoiceNo,
        createdAt: now.toISOString(),
        createdBy: currentUser,
      };
      setCashBook((prev) => [cashEntry, ...prev]);
    }

    return { success: true, invoiceNo };
  };

  const cancelPurchase = (invoiceId: string) => {
    const purchase = purchases.find((p) => p.id === invoiceId);
    if (!purchase) return { success: false, error: 'পারচেজ ইনভয়েস পাওয়া যায়নি!' };
    if (purchase.status === 'cancelled') return { success: false, error: 'এই ইনভয়েস ইতিমধ্যে ক্যানসেল করা হয়েছে।' };

    // Check if any IMEI from this purchase has been sold or issued
    const purchaseImeis = purchase.items.flatMap((i) => i.imeis);
    const affectedPhones = phones.filter((p) => purchaseImeis.includes(p.imei));
    const nonStockPhones = affectedPhones.filter((p) => p.status !== 'in_stock');
    if (nonStockPhones.length > 0) {
      return {
        success: false,
        error: `ক্যানসেল করা যাবে না! ${nonStockPhones.length} টি ফোন ইতিমধ্যে বিক্রি বা DSR কে প্রদান করা হয়েছে।`,
      };
    }

    // Mark invoice cancelled
    setPurchases((prev) =>
      prev.map((p) => (p.id === invoiceId ? { ...p, status: 'cancelled' } : p))
    );

    // Remove phones from active phone list
    setPhones((prev) => prev.filter((p) => !purchaseImeis.includes(p.imei)));

    // Revert supplier due
    if (purchase.dueAmount > 0) {
      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === purchase.supplierId ? { ...s, totalDue: Math.max(0, (s.totalDue || 0) - purchase.dueAmount) } : s
        )
      );
    }

    // Revert cashbook if paid
    if (purchase.paidAmount > 0) {
      const now = new Date();
      const cashEntry: CashBookEntry = {
        id: `cb-${Date.now()}`,
        date: now.toISOString().split('T')[0],
        description: `পারচেজ ক্যানসেল রিভার্সাল: ${purchase.invoiceNo}`,
        category: 'পারচেজ',
        type: 'cash_in',
        amount: purchase.paidAmount,
        paymentMethod: purchase.paymentMethod,
        referenceId: purchase.invoiceNo,
        createdAt: now.toISOString(),
        createdBy: currentUser,
      };
      setCashBook((prev) => [cashEntry, ...prev]);
    }

    return { success: true };
  };

  // 5. New Sales (Strictly NO warranty)
  const addSale = (data: Omit<SalesInvoice, 'id' | 'invoiceNo' | 'status' | 'createdAt' | 'createdBy'>) => {
    // Validate each IMEI is in stock
    for (const item of data.items) {
      const phone = phones.find((p) => p.imei === item.imei);
      if (!phone) {
        return { success: false, error: `IMEI ${item.imei} ইনভেন্টরিতে পাওয়া যায়নি!` };
      }
      if (phone.status === 'sold') {
        return { success: false, error: `IMEI ${item.imei} আগে বিক্রি হয়ে গেছে!` };
      }
      if (phone.status === 'with_dsr') {
        return { success: false, error: `IMEI ${item.imei} এখন DSR এর কাছে আছে!` };
      }
      if (phone.status !== 'in_stock') {
        return { success: false, error: `IMEI ${item.imei} বর্তমানে স্টকে নেই (স্ট্যাটাস: ${phone.status})!` };
      }
    }

    const now = new Date();
    const invoiceNo = `SAL-${String(sales.length + 1).padStart(5, '0')}`;
    const newInvoice: SalesInvoice = {
      ...data,
      id: `sal-${Date.now()}`,
      invoiceNo,
      status: 'completed',
      createdAt: now.toISOString(),
      createdBy: currentUser,
    };

    // Update phones status to 'sold'
    const soldImeis = data.items.map((i) => i.imei);
    setPhones((prev) =>
      prev.map((p) =>
        soldImeis.includes(p.imei)
          ? {
              ...p,
              status: 'sold',
              soldInvoiceNo: invoiceNo,
              soldDate: data.date,
              customerId: data.customerId,
              customerName: data.customerName,
            }
          : p
      )
    );

    setSales((prev) => [newInvoice, ...prev]);

    // Update customer due if any
    if (data.dueAmount > 0 && data.customerId) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === data.customerId ? { ...c, currentDue: (c.currentDue || 0) + data.dueAmount } : c
        )
      );
    }

    // Add cashbook entry if paid
    if (data.paidAmount > 0 && data.paymentMethod !== 'due') {
      const cashEntry: CashBookEntry = {
        id: `cb-${Date.now()}`,
        date: data.date,
        description: `সেলস ইনভয়েস: ${invoiceNo} (${data.customerName})`,
        category: 'সেলস',
        type: 'cash_in',
        amount: data.paidAmount,
        paymentMethod: data.paymentMethod as any,
        referenceId: invoiceNo,
        createdAt: now.toISOString(),
        createdBy: currentUser,
      };
      setCashBook((prev) => [cashEntry, ...prev]);
    }

    return { success: true, invoiceNo };
  };

  const cancelSale = (saleId: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return { success: false, error: 'সেল ইনভয়েস পাওয়া যায়নি!' };
    if (sale.status === 'cancelled') return { success: false, error: 'এই ইনভয়েস ইতিমধ্যে ক্যানসেল করা হয়েছে।' };

    const saleImeis = sale.items.map((i) => i.imei);

    // Revert phone status to in_stock
    setPhones((prev) =>
      prev.map((p) =>
        saleImeis.includes(p.imei)
          ? {
              ...p,
              status: 'in_stock',
              soldInvoiceNo: undefined,
              soldDate: undefined,
              customerId: undefined,
              customerName: undefined,
            }
          : p
      )
    );

    // Mark cancelled
    setSales((prev) =>
      prev.map((s) => (s.id === saleId ? { ...s, status: 'cancelled' } : s))
    );

    // Revert customer due
    if (sale.dueAmount > 0 && sale.customerId) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === sale.customerId ? { ...c, currentDue: Math.max(0, (c.currentDue || 0) - sale.dueAmount) } : c
        )
      );
    }

    // Revert cashbook if paid
    if (sale.paidAmount > 0 && sale.paymentMethod !== 'due') {
      const now = new Date();
      const cashEntry: CashBookEntry = {
        id: `cb-${Date.now()}`,
        date: now.toISOString().split('T')[0],
        description: `সেল ক্যানসেল রিভার্সাল: ${sale.invoiceNo}`,
        category: 'সেলস',
        type: 'cash_out',
        amount: sale.paidAmount,
        paymentMethod: sale.paymentMethod as any,
        referenceId: sale.invoiceNo,
        createdAt: now.toISOString(),
        createdBy: currentUser,
      };
      setCashBook((prev) => [cashEntry, ...prev]);
    }

    return { success: true };
  };

  // 6. Sales Return
  const addSalesReturn = (data: Omit<SalesReturn, 'id' | 'returnNo' | 'status' | 'createdAt' | 'createdBy'>) => {
    const returnNo = `SR-${String(salesReturns.length + 1).padStart(5, '0')}`;
    const now = new Date();

    const newReturn: SalesReturn = {
      ...data,
      id: `sr-${Date.now()}`,
      returnNo,
      status: 'completed',
      createdAt: now.toISOString(),
      createdBy: currentUser,
    };

    // Update returned phones back to 'in_stock'
    setPhones((prev) =>
      prev.map((p) =>
        data.imeis.includes(p.imei)
          ? {
              ...p,
              status: 'in_stock',
              notes: `সেলস রিটার্ন (${returnNo}): ${data.returnReason}`,
            }
          : p
      )
    );

    // Update sales invoice status if applicable
    setSales((prev) =>
      prev.map((s) => {
        if (s.invoiceNo === data.originalInvoiceNo) {
          return { ...s, status: 'returned' };
        }
        return s;
      })
    );

    // Adjust customer due if refund method is adjust_due
    if (data.refundMethod === 'adjust_due' && data.customerId) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === data.customerId ? { ...c, currentDue: Math.max(0, (c.currentDue || 0) - data.refundAmount) } : c
        )
      );
    }

    // Cashbook entry if cash/bkash/bank refund
    if (data.refundMethod !== 'adjust_due' && data.refundAmount > 0) {
      const cashEntry: CashBookEntry = {
        id: `cb-${Date.now()}`,
        date: data.date,
        description: `সেলস রিটার্ন রিফান্ড: ${returnNo} (${data.customerName})`,
        category: 'সেলস রিটার্ন',
        type: 'cash_out',
        amount: data.refundAmount,
        paymentMethod: data.refundMethod as any,
        referenceId: returnNo,
        createdAt: now.toISOString(),
        createdBy: currentUser,
      };
      setCashBook((prev) => [cashEntry, ...prev]);
    }

    setSalesReturns((prev) => [newReturn, ...prev]);
    return { success: true, returnNo };
  };

  // 7. Issue for DSR
  const addDSRIssue = (data: Omit<DSRIssue, 'id' | 'issueNo' | 'createdAt' | 'createdBy'>) => {
    const issueNo = `ISS-${String(dsrIssues.length + 1).padStart(5, '0')}`;
    const now = new Date();

    const newIssue: DSRIssue = {
      ...data,
      id: `iss-${Date.now()}`,
      issueNo,
      createdAt: now.toISOString(),
      createdBy: currentUser,
    };

    // Update phones status to with_dsr
    setPhones((prev) =>
      prev.map((p) =>
        data.imeis.includes(p.imei)
          ? {
              ...p,
              status: 'with_dsr',
              dsrId: data.dsrId,
              dsrName: data.dsrName,
            }
          : p
      )
    );

    setDsrIssues((prev) => [newIssue, ...prev]);
    return { success: true, issueNo };
  };

  // 8. Return from DSR
  const addDSRReturn = (data: Omit<DSRReturn, 'id' | 'returnNo' | 'createdAt' | 'createdBy'>) => {
    const returnNo = `RET-${String(dsrReturns.length + 1).padStart(5, '0')}`;
    const now = new Date();

    const newReturn: DSRReturn = {
      ...data,
      id: `ret-${Date.now()}`,
      returnNo,
      createdAt: now.toISOString(),
      createdBy: currentUser,
    };

    // Return to main stock
    setPhones((prev) =>
      prev.map((p) =>
        data.imeis.includes(p.imei)
          ? {
              ...p,
              status: 'in_stock',
              dsrId: undefined,
              dsrName: undefined,
            }
          : p
      )
    );

    setDsrReturns((prev) => [newReturn, ...prev]);
    return { success: true, returnNo };
  };

  // 9. Re-issue (DSR to DSR)
  const addDSRReissue = (data: Omit<DSRReissue, 'id' | 'transferNo' | 'createdAt' | 'createdBy'>) => {
    const transferNo = `TRS-${String(dsrReissues.length + 1).padStart(5, '0')}`;
    const now = new Date();

    const newReissue: DSRReissue = {
      ...data,
      id: `trs-${Date.now()}`,
      transferNo,
      createdAt: now.toISOString(),
      createdBy: currentUser,
    };

    // Update DSR owner
    setPhones((prev) =>
      prev.map((p) =>
        data.imeis.includes(p.imei)
          ? {
              ...p,
              status: 'with_dsr',
              dsrId: data.toDsrId,
              dsrName: data.toDsrName,
            }
          : p
      )
    );

    setDsrReissues((prev) => [newReissue, ...prev]);
    return { success: true, transferNo };
  };

  // 12. Payment Voucher (To Supplier)
  const addPaymentVoucher = (data: Omit<PaymentVoucher, 'id' | 'voucherNo' | 'status' | 'createdAt' | 'createdBy'>) => {
    const voucherNo = `PAY-${String(paymentVouchers.length + 1).padStart(5, '0')}`;
    const now = new Date();

    const newVoucher: PaymentVoucher = {
      ...data,
      id: `pay-${Date.now()}`,
      voucherNo,
      status: 'completed',
      createdAt: now.toISOString(),
      createdBy: currentUser,
    };

    // Reduce supplier due
    setSuppliers((prev) =>
      prev.map((s) => (s.id === data.supplierId ? { ...s, totalDue: Math.max(0, (s.totalDue || 0) - data.amount) } : s))
    );

    // Cashbook cash_out
    const cashEntry: CashBookEntry = {
      id: `cb-${Date.now()}`,
      date: data.date,
      description: `সাপ্লায়ার পেমেন্ট: ${data.supplierName} (${voucherNo})`,
      category: 'সাপ্লায়ার পেমেন্ট',
      type: 'cash_out',
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceId: voucherNo,
      createdAt: now.toISOString(),
      createdBy: currentUser,
    };
    setCashBook((prev) => [cashEntry, ...prev]);

    setPaymentVouchers((prev) => [newVoucher, ...prev]);
    return { success: true, voucherNo };
  };

  const cancelPaymentVoucher = (id: string) => {
    const voucher = paymentVouchers.find((v) => v.id === id);
    if (!voucher) return { success: false, error: 'পেমেন্ট ভাউচার পাওয়া যায়নি!' };
    if (voucher.status === 'cancelled') return { success: false, error: 'ইতিমধ্যে ক্যানসেল করা হয়েছে।' };

    setPaymentVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'cancelled' } : v))
    );

    // Revert supplier due
    setSuppliers((prev) =>
      prev.map((s) => (s.id === voucher.supplierId ? { ...s, totalDue: (s.totalDue || 0) + voucher.amount } : s))
    );

    // Revert cashbook
    const now = new Date();
    const cashEntry: CashBookEntry = {
      id: `cb-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      description: `পেমেন্ট ক্যানসেল রিভার্সাল: ${voucher.voucherNo}`,
      category: 'সাপ্লায়ার পেমেন্ট',
      type: 'cash_in',
      amount: voucher.amount,
      paymentMethod: voucher.paymentMethod,
      referenceId: voucher.voucherNo,
      createdAt: now.toISOString(),
      createdBy: currentUser,
    };
    setCashBook((prev) => [cashEntry, ...prev]);

    return { success: true };
  };

  // 13. Receive Voucher (From Customer)
  const addReceiveVoucher = (
    data: Omit<ReceiveVoucher, 'id' | 'voucherNo' | 'status' | 'createdAt' | 'createdBy' | 'remainingDue'>
  ) => {
    const voucherNo = `RCV-${String(receiveVouchers.length + 1).padStart(5, '0')}`;
    const now = new Date();

    const targetCustomer = customers.find((c) => c.id === data.customerId);
    const prevDue = targetCustomer ? targetCustomer.currentDue : 0;
    const remainingDue = Math.max(0, prevDue - data.amount);

    const newVoucher: ReceiveVoucher = {
      ...data,
      id: `rcv-${Date.now()}`,
      voucherNo,
      remainingDue,
      status: 'completed',
      createdAt: now.toISOString(),
      createdBy: currentUser,
    };

    // Reduce customer due
    setCustomers((prev) =>
      prev.map((c) => (c.id === data.customerId ? { ...c, currentDue: remainingDue } : c))
    );

    // Cashbook cash_in
    const cashEntry: CashBookEntry = {
      id: `cb-${Date.now()}`,
      date: data.date,
      description: `কাস্টমার বাকি কালেকশন: ${data.customerName} (${voucherNo})`,
      category: 'বাকি কালেকশন',
      type: 'cash_in',
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceId: voucherNo,
      createdAt: now.toISOString(),
      createdBy: currentUser,
    };
    setCashBook((prev) => [cashEntry, ...prev]);

    setReceiveVouchers((prev) => [newVoucher, ...prev]);
    return { success: true, voucherNo };
  };

  const cancelReceiveVoucher = (id: string) => {
    const voucher = receiveVouchers.find((v) => v.id === id);
    if (!voucher) return { success: false, error: 'রিসিভ ভাউচার পাওয়া যায়নি!' };
    if (voucher.status === 'cancelled') return { success: false, error: 'ইতিমধ্যে ক্যানসেল করা হয়েছে।' };

    setReceiveVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'cancelled' } : v))
    );

    // Revert customer due
    setCustomers((prev) =>
      prev.map((c) => (c.id === voucher.customerId ? { ...c, currentDue: (c.currentDue || 0) + voucher.amount } : c))
    );

    // Revert cashbook
    const now = new Date();
    const cashEntry: CashBookEntry = {
      id: `cb-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      description: `রিসিভ ক্যানসেল রিভার্সাল: ${voucher.voucherNo}`,
      category: 'বাকি কালেকশন',
      type: 'cash_out',
      amount: voucher.amount,
      paymentMethod: voucher.paymentMethod,
      referenceId: voucher.voucherNo,
      createdAt: now.toISOString(),
      createdBy: currentUser,
    };
    setCashBook((prev) => [cashEntry, ...prev]);

    return { success: true };
  };

  // 14. Expense
  const addExpense = (data: Omit<Expense, 'id' | 'expenseNo' | 'status' | 'createdAt' | 'createdBy'>) => {
    const expenseNo = `EXP-${String(expenses.length + 1).padStart(5, '0')}`;
    const now = new Date();

    const newExpense: Expense = {
      ...data,
      id: `exp-${Date.now()}`,
      expenseNo,
      status: 'completed',
      createdAt: now.toISOString(),
      createdBy: currentUser,
    };

    // Cashbook cash_out
    const cashEntry: CashBookEntry = {
      id: `cb-${Date.now()}`,
      date: data.date,
      description: `খরচ: ${data.categoryName} - ${data.title} (${expenseNo})`,
      category: 'দোকান খরচ',
      type: 'cash_out',
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceId: expenseNo,
      createdAt: now.toISOString(),
      createdBy: currentUser,
    };
    setCashBook((prev) => [cashEntry, ...prev]);

    setExpenses((prev) => [newExpense, ...prev]);
    return { success: true, expenseNo };
  };

  const cancelExpense = (id: string) => {
    const expense = expenses.find((e) => e.id === id);
    if (!expense) return { success: false, error: 'খরচ পাওয়া যায়নি!' };
    if (expense.status === 'cancelled') return { success: false, error: 'ইতিমধ্যে ক্যানসেল করা হয়েছে।' };

    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'cancelled' } : e))
    );

    // Revert cashbook
    const now = new Date();
    const cashEntry: CashBookEntry = {
      id: `cb-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      description: `খরচ ক্যানসেল রিভার্সাল: ${expense.expenseNo}`,
      category: 'দোকান খরচ',
      type: 'cash_in',
      amount: expense.amount,
      paymentMethod: expense.paymentMethod,
      referenceId: expense.expenseNo,
      createdAt: now.toISOString(),
      createdBy: currentUser,
    };
    setCashBook((prev) => [cashEntry, ...prev]);

    return { success: true };
  };

  // 20. Warranty Service Tracking (4 Steps)
  const addWarrantyStep1 = (step1: WarrantyStep1) => {
    const cleanImei = step1.imei.trim();
    if (!/^\d{15}$/.test(cleanImei)) {
      return { success: false, error: 'IMEI অবশ্যই ১৫ ডিজিটের হতে হবে!' };
    }

    const warrantyNo = `WR-${String(warrantyTasks.length + 1).padStart(5, '0')}`;
    const now = new Date();

    const newTask: WarrantyTask = {
      id: `wr-${Date.now()}`,
      warrantyNo,
      status: 'received_from_customer',
      step1: {
        ...step1,
        warrantyNo,
        receivedBy: currentUser,
      },
      createdAt: now.toISOString(),
      createdBy: currentUser,
    };

    // Update phone status if phone exists in store
    setPhones((prev) =>
      prev.map((p) =>
        p.imei === cleanImei
          ? {
              ...p,
              status: 'in_warranty',
              notes: `ওয়ারেন্টি সার্ভিসে গৃহীত: ${warrantyNo}`,
            }
          : p
      )
    );

    setWarrantyTasks((prev) => [newTask, ...prev]);
    return { success: true, warrantyNo };
  };

  const updateWarrantyStep2 = (warrantyId: string, step2: WarrantyStep2) => {
    setWarrantyTasks((prev) =>
      prev.map((w) =>
        w.id === warrantyId
          ? {
              ...w,
              status: 'sent_to_care',
              step2: {
                ...step2,
                sentBy: currentUser,
              },
            }
          : w
      )
    );
    return { success: true };
  };

  const updateWarrantyStep3 = (warrantyId: string, step3: WarrantyStep3) => {
    setWarrantyTasks((prev) =>
      prev.map((w) =>
        w.id === warrantyId
          ? {
              ...w,
              status: 'received_from_care',
              step3: {
                ...step3,
                careReceivedBy: currentUser,
              },
            }
          : w
      )
    );
    return { success: true };
  };

  const updateWarrantyStep4 = (warrantyId: string, step4: WarrantyStep4) => {
    const task = warrantyTasks.find((w) => w.id === warrantyId);
    if (task && task.step1.imei) {
      // Revert phone status to in_stock or sold
      setPhones((prev) =>
        prev.map((p) =>
          p.imei === task.step1.imei
            ? {
                ...p,
                status: 'sold',
                notes: `ওয়ারেন্টি সম্পন্ন ও ডেলিভারি কৃত: ${task.warrantyNo}`,
              }
            : p
        )
      );
    }

    setWarrantyTasks((prev) =>
      prev.map((w) =>
        w.id === warrantyId
          ? {
              ...w,
              status: 'delivered_to_customer',
              step4: {
                ...step4,
                deliveredBy: currentUser,
              },
            }
          : w
      )
    );
    return { success: true };
  };

  // Price Protection
  const addPriceProtection = (data: Omit<PriceProtection, 'id' | 'createdAt' | 'createdBy'>) => {
    const now = new Date();
    const newPP: PriceProtection = {
      ...data,
      id: `pp-${Date.now()}`,
      createdAt: now.toISOString(),
      createdBy: currentUser,
    };
    setPriceProtections((prev) => [newPP, ...prev]);
  };

  // Reset to Blank Site (As requested: "এখানে এক্সাম্পল হিসেবে যেগুলো ব্যবহার করা হয়েছে সেগুলো সেগুলো মুছে দিয়ে আমাকে একদম আপডেট ব্লাঙ্ক সাইট দিবে")
  const resetToBlank = () => {
    setPhones([]);
    setPurchases([]);
    setSales([]);
    setSalesReturns([]);
    setDsrIssues([]);
    setDsrReturns([]);
    setDsrReissues([]);
    setCashBook([]);
    setPaymentVouchers([]);
    setReceiveVouchers([]);
    setExpenses([]);
    setWarrantyTasks([]);
    setPriceProtections([]);
    setSuppliers([]);
    setCustomers([]);
    setDsrs([]);
    setModels([]);
    setBrands(DEFAULT_BRANDS);
    setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Helper: load sample demo data if user ever wants to inspect
  const loadDemoData = () => {
    const demoSuppliers: Supplier[] = [
      { id: 'sup-1', name: 'স্মার্ট ডিস্ট্রিবিউশন লিমিটেড', phone: '01711000001', address: 'ঢাকা', totalDue: 25000 },
      { id: 'sup-2', name: 'ভিভো ন্যাশনাল ডিস্ট্রিবিউটর', phone: '01811000002', address: 'বরিশাল', totalDue: 0 },
    ];
    const demoCustomers: Customer[] = [
      { id: 'cust-1', name: 'মো: রফিকুল ইসলাম', phone: '01712345678', address: 'বরগুনা সদর', openingDue: 1500, currentDue: 1500 },
      { id: 'cust-2', name: 'আল-আমীন আহমেদ', phone: '01987654321', address: 'আমতলী রোড, বরগুনা', openingDue: 0, currentDue: 0 },
    ];
    const demoDsrs: DSR[] = [
      { id: 'dsr-1', name: 'তানভীর হাসান', phone: '01622334455', route: 'বরগুনা টাউন ও বাজার রোড' },
      { id: 'dsr-2', name: 'শাকিল আহমেদ', phone: '01511223344', route: 'বেতাগী রোড' },
    ];
    const demoModels: PhoneModel[] = [
      { id: 'm-1', brand: 'Samsung', name: 'Galaxy A15', defaultPurchasePrice: 16500, defaultSalePrice: 18500, minStockAlert: 2 },
      { id: 'm-2', brand: 'Vivo', name: 'Y28', defaultPurchasePrice: 18000, defaultSalePrice: 20500, minStockAlert: 2 },
      { id: 'm-3', brand: 'Realme', name: 'C65', defaultPurchasePrice: 14500, defaultSalePrice: 16200, minStockAlert: 2 },
    ];

    setSuppliers(demoSuppliers);
    setCustomers(demoCustomers);
    setDsrs(demoDsrs);
    setModels(demoModels);
  };

  return (
    <AppContext.Provider
      value={{
        brands,
        models,
        suppliers,
        customers,
        dsrs,
        expenseCategories,
        phones,
        purchases,
        sales,
        salesReturns,
        dsrIssues,
        dsrReturns,
        dsrReissues,
        cashBook,
        paymentVouchers,
        receiveVouchers,
        expenses,
        warrantyTasks,
        priceProtections,
        currentUser,
        setCurrentUser,
        addBrand,
        deleteBrand,
        addModel,
        deleteModel,
        addSupplier,
        deleteSupplier,
        addCustomer,
        deleteCustomer,
        addDSR,
        deleteDSR,
        addExpenseCategory,
        deleteExpenseCategory,
        addPurchase,
        cancelPurchase,
        addSale,
        cancelSale,
        addSalesReturn,
        addDSRIssue,
        addDSRReturn,
        addDSRReissue,
        addPaymentVoucher,
        cancelPaymentVoucher,
        addReceiveVoucher,
        cancelReceiveVoucher,
        addExpense,
        cancelExpense,
        addWarrantyStep1,
        updateWarrantyStep2,
        updateWarrantyStep3,
        updateWarrantyStep4,
        addPriceProtection,
        loadDemoData,
        resetToBlank,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
