import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { PrintModal, PrintDataType } from './components/PrintModal';

// Views
import { DashboardView } from './views/DashboardView';
import { NewPurchaseView } from './views/NewPurchaseView';
import { NewSalesView } from './views/NewSalesView';
import { SalesReturnView } from './views/SalesReturnView';
import { DSRIssueView } from './views/DSRIssueView';
import { DSRReturnView } from './views/DSRReturnView';
import { DSRReissueView } from './views/DSRReissueView';
import { StockView } from './views/StockView';
import { CashBookView } from './views/CashBookView';
import { PaymentVoucherView } from './views/PaymentVoucherView';
import { ReceiveVoucherView } from './views/ReceiveVoucherView';
import { ExpenseManageView } from './views/ExpenseManageView';
import { SalesManageView } from './views/SalesManageView';
import { PurchaseManageView } from './views/PurchaseManageView';
import { PaymentManageView } from './views/PaymentManageView';
import { ReceiveManageView } from './views/ReceiveManageView';
import { TasksView } from './views/TasksView';
import { SetupView } from './views/SetupView';
import { ReportsView } from './views/ReportsView';
import { PriceProtectionView } from './views/PriceProtectionView';

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

function MainAppContent() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [printData, setPrintData] = useState<PrintDataType | null>(null);

  const handleOpenPrint = (data: PrintDataType) => {
    setPrintData(data);
  };

  const handleClosePrint = () => {
    setPrintData(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* TopBar (Always visible) */}
        <TopBar
          onNavigate={(view) => setCurrentView(view)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* View Content Body */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          {currentView === 'dashboard' && (
            <DashboardView
              onNavigate={(view) => setCurrentView(view)}
              onSelectPrint={handleOpenPrint}
            />
          )}

          {currentView === 'new_purchase' && (
            <NewPurchaseView
              onOpenPrint={handleOpenPrint}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'new_sales' && (
            <NewSalesView
              onOpenPrint={handleOpenPrint}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'sales_return' && (
            <SalesReturnView
              onOpenPrint={handleOpenPrint}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'dsr_issue' && (
            <DSRIssueView
              onOpenPrint={handleOpenPrint}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'dsr_return' && (
            <DSRReturnView
              onOpenPrint={handleOpenPrint}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'dsr_reissue' && (
            <DSRReissueView
              onOpenPrint={handleOpenPrint}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'stock' && <StockView />}

          {currentView === 'cash_book' && <CashBookView />}

          {currentView === 'payment_voucher' && (
            <PaymentVoucherView
              onOpenPrint={handleOpenPrint}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'receive_voucher' && (
            <ReceiveVoucherView
              onOpenPrint={handleOpenPrint}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'expense_manage' && (
            <ExpenseManageView onOpenPrint={handleOpenPrint} />
          )}

          {currentView === 'sales_manage' && (
            <SalesManageView
              onOpenPrint={handleOpenPrint}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'purchase_manage' && (
            <PurchaseManageView
              onOpenPrint={handleOpenPrint}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'payment_manage' && (
            <PaymentManageView
              onOpenPrint={handleOpenPrint}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'receive_manage' && (
            <ReceiveManageView
              onOpenPrint={handleOpenPrint}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'tasks' && (
            <TasksView
              onOpenPrint={handleOpenPrint}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'setup' && <SetupView />}

          {currentView === 'reports' && <ReportsView />}

          {currentView === 'price_protection' && <PriceProtectionView />}
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(view) => {
          setCurrentView(view);
          setIsSearchOpen(false);
        }}
      />

      {/* Print Preview Modal */}
      <PrintModal
        printData={printData}
        onClose={handleClosePrint}
      />
    </div>
  );
}
