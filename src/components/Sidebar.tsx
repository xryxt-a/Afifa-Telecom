import React from 'react';
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  Send,
  RotateCcw,
  Repeat,
  Undo2,
  Receipt,
  Truck,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Settings,
  BarChart3,
  ShieldAlert,
  ClipboardList,
  MapPin,
  X,
  PhoneCall,
  Smartphone
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpen,
  onClose,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'হোম / ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'stock', label: 'স্টক (ব্র্যান্ড ও মডেল)', icon: Layers },
    { id: 'cash_book', label: 'ক্যাশ বুক', icon: BookOpen },
    { id: 'dsr_issue', label: 'ইস্যু ফর DSR', icon: Send },
    { id: 'dsr_return', label: 'রিটার্ন ফ্রম DSR', icon: RotateCcw },
    { id: 'dsr_reissue', label: 'রি ইস্যু (DSR to DSR)', icon: Repeat },
    { id: 'sales_return', label: 'সেলস রিটার্ন', icon: Undo2 },
    { id: 'sales_manage', label: 'সেলস ম্যানেজ', icon: Receipt },
    { id: 'purchase_manage', label: 'পারচেজ ম্যানেজ', icon: Truck },
    { id: 'payment_manage', label: 'পেমেন্ট ম্যানেজ', icon: ArrowUpRight },
    { id: 'receive_manage', label: 'রিসিভ ম্যানেজ', icon: ArrowDownLeft },
    { id: 'expense_manage', label: 'এক্সপেন্স ম্যানেজ', icon: Wallet },
    { id: 'tasks', label: 'টাস্কস ও সার্ভিস ট্র্যাকিং', icon: ClipboardList },
    { id: 'reports', label: 'রিপোর্টস', icon: BarChart3 },
    { id: 'price_protection', label: 'প্রাইস প্রটেকশন', icon: ShieldAlert },
    { id: 'setup', label: 'সেটআপ', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-20 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#0B5ED7] flex items-center justify-center text-white shadow-xs">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-sm text-slate-900 leading-tight">
                  আফিফা টেলিকম
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">এন্ড ইলেকট্রনিক্স</p>
              </div>
            </div>
            <div className="mt-2 inline-flex items-center text-[11px] font-semibold text-[#0B5ED7] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              <MapPin className="w-3 h-3 mr-1" />
              বরগুনা
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition text-left ${
                  isActive
                    ? 'bg-[#0B5ED7] text-white shadow-xs font-semibold'
                    : 'text-slate-700 hover:bg-blue-50/70 hover:text-[#0B5ED7]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500">
          <div className="flex items-center justify-between">
            <span>সিস্টেম: <strong>অনলাইন / অফলাইন</strong></span>
            <span className="font-semibold text-emerald-600">v2.5 Pro</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            বরগুনা • সম্পূর্ণ POS ও IMEI সিস্টেম
          </div>
        </div>
      </aside>
    </>
  );
};
