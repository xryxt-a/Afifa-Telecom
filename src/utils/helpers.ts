import { PhoneItem } from '../types';

export const formatCurrency = (amount: number): string => {
  return `৳${(amount || 0).toLocaleString('en-IN')}`;
};

export const isValidIMEI = (imei: string): boolean => {
  const clean = imei.trim();
  return /^\d{15}$/.test(clean);
};

// Generate n sequential or unique valid 15-digit IMEIs
export const generateSerialIMEIs = (count: number, existingImeis: string[] = []): string[] => {
  const result: string[] = [];
  const basePrefix = '86' + String(Math.floor(100000000 + Math.random() * 900000000)).slice(0, 8); // 10 digits
  let counter = 10001;

  while (result.length < count && counter < 99999) {
    const candidate = `${basePrefix}${counter}`;
    if (!existingImeis.includes(candidate) && !result.includes(candidate)) {
      result.push(candidate);
    }
    counter++;
  }
  return result;
};

export interface StockSummaryRow {
  brand: string;
  model: string;
  openingQty: number;
  purchasedQty: number;
  soldQty: number;
  dsrIssuedQty: number;
  dsrReturnedQty: number;
  salesReturnedQty: number;
  finalStockQty: number;
  dsrCurrentQty: number;
  warrantyQty: number;
  avgPurchasePrice: number;
  avgSalePrice: number;
  totalStockValue: number;
  isLowStock: boolean;
}

export const computeStockMatrix = (phones: PhoneItem[]): StockSummaryRow[] => {
  const groups: { [key: string]: PhoneItem[] } = {};

  phones.forEach((p) => {
    const key = `${p.brand}:::${p.model}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });

  const rows: StockSummaryRow[] = [];

  Object.entries(groups).forEach(([key, items]) => {
    const [brand, model] = key.split(':::');
    
    // Purchases: total non-cancelled phones entered
    const purchasedQty = items.length;
    
    // In Stock currently
    const finalStockQty = items.filter((p) => p.status === 'in_stock').length;
    
    // Sold
    const soldQty = items.filter((p) => p.status === 'sold').length;

    // DSR currently holding
    const dsrCurrentQty = items.filter((p) => p.status === 'with_dsr').length;

    // In Warranty service
    const warrantyQty = items.filter((p) => p.status === 'in_warranty').length;

    // Sales return items
    const salesReturnedQty = items.filter((p) => p.notes && p.notes.includes('সেলস রিটার্ন')).length;

    // Pricing
    const totalPurchasePrice = items.reduce((acc, p) => acc + (p.purchasePrice || 0), 0);
    const avgPurchasePrice = items.length > 0 ? Math.round(totalPurchasePrice / items.length) : 0;
    const totalSalePrice = items.reduce((acc, p) => acc + (p.salePrice || 0), 0);
    const avgSalePrice = items.length > 0 ? Math.round(totalSalePrice / items.length) : 0;
    
    // Stock value = final in-stock phones * purchase price
    const inStockItems = items.filter((p) => p.status === 'in_stock');
    const totalStockValue = inStockItems.reduce((acc, p) => acc + (p.purchasePrice || 0), 0);

    rows.push({
      brand,
      model,
      openingQty: 0,
      purchasedQty,
      soldQty,
      dsrIssuedQty: dsrCurrentQty, // Currently active with DSR
      dsrReturnedQty: 0,
      salesReturnedQty,
      finalStockQty,
      dsrCurrentQty,
      warrantyQty,
      avgPurchasePrice,
      avgSalePrice,
      totalStockValue,
      isLowStock: finalStockQty <= 2,
    });
  });

  return rows.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));
};
