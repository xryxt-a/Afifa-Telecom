import React from 'react';
import { 
  ShoppingCart, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  CheckSquare, 
  Search, 
  Menu,
  Clock,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TopBarProps {
  onNavigate: (view: string) => void;
  onOpenSearch: () => void;
  onToggleSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onNavigate, onOpenSearch, onToggleSidebar }) => {
  const { currentUser } = useApp();
  const today = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-[#0B5ED7] text-white shadow-md no-print border-b border-[#0A4AB0]">
      <div className="flex flex-wrap items-center justify-between px-3 py-2.5 sm:px-6">
        {/* Left: Mobile Menu toggle + Shop Identity */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg hover:bg-[#0A4AB0] md:hidden focus:outline-none"
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg sm:text-xl tracking-wide leading-tight">
                আফিফা টেলিকম এন্ড ইলেকট্রনিক্স
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30">
                <MapPin className="w-3 h-3 mr-1" />
                বরগুনা
              </span>
            </div>
            <div className="flex items-center text-xs text-blue-100 space-x-2">
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1 opacity-80" />
                {today}
              </span>
              <span>•</span>
              <span>ইউজার: <strong className="text-white">{currentUser}</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 mt-2 sm:mt-0 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => onNavigate('new_sales')}
            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-xs sm:text-sm shadow-sm transition active:scale-95"
            title="নিউ সেলস"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">নিউ সেলস</span>
            <span className="sm:hidden">সেলস</span>
          </button>

          <button
            onClick={() => onNavigate('new_purchase')}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-lg font-medium text-xs sm:text-sm shadow-sm transition active:scale-95 border border-blue-400/30"
            title="নিউ পারচেজ"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">নিউ পারচেজ</span>
            <span className="sm:hidden">পারচেজ</span>
          </button>

          <button
            onClick={() => onNavigate('receive_voucher')}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium text-xs sm:text-sm transition active:scale-95"
            title="রিসিভ ভাউচার (কাস্টমার বাকি)"
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
            <span className="hidden md:inline">রিসিভ ভাউচার</span>
          </button>

          <button
            onClick={() => onNavigate('payment_voucher')}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium text-xs sm:text-sm transition active:scale-95"
            title="পেমেন্ট ভাউচার (সাপ্লায়ার বাকি)"
          >
            <ArrowUpRight className="w-4 h-4 text-amber-300" />
            <span className="hidden md:inline">পেমেন্ট ভাউচার</span>
          </button>

          <button
            onClick={() => onNavigate('expense_manage')}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium text-xs sm:text-sm transition active:scale-95"
            title="দোকান খরচ"
          >
            <Wallet className="w-4 h-4 text-sky-200" />
            <span className="hidden sm:inline">এক্সপেন্স</span>
          </button>

          <button
            onClick={() => onNavigate('tasks')}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg font-medium text-xs sm:text-sm shadow-sm transition active:scale-95"
            title="টাস্কস ও সার্ভিস ট্র্যাকিং"
          >
            <CheckSquare className="w-4 h-4 text-slate-900" />
            <span className="hidden sm:inline">টাস্কস</span>
          </button>

          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-white text-[#0B5ED7] hover:bg-blue-50 rounded-lg font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95"
            title="গ্লোবাল সার্চ"
          >
            <Search className="w-4 h-4" />
            <span className="hidden lg:inline">সার্চিং</span>
          </button>
        </div>
      </div>
    </header>
  );
};
