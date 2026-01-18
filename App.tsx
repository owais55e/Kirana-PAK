
import React, { useState, useEffect } from 'react';
import { View, Notification, Language, UserStatus, UserSession, Product, Customer } from './types';
import { INITIAL_NOTIFICATIONS, TRANSLATIONS, INITIAL_PRODUCTS, INITIAL_CUSTOMERS } from './constants';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './views/Dashboard';
import Billing from './views/Billing';
import Subscription from './views/Subscription';
import Inventory from './views/Inventory';
import Customers from './views/Customers';

const SESSION_KEY = 'kirana_pak_user_session_v1';

const App: React.FC = () => {
  // Initialize session from localStorage
  const [session, setSession] = useState<UserSession | null>(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    return savedSession ? JSON.parse(savedSession) : null;
  });

  const [loginStep, setLoginStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [notifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [lang, setLang] = useState<Language>('en');
  const [showPopup, setShowPopup] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Store Management State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);

  // Sync HTML dir with language choice
  useEffect(() => {
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Handle Session persistence and Trial Logic
  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      if (session.status === 'trial') {
        const start = new Date(session.trialStartDate);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays > 7) {
          setSession(prev => prev ? { ...prev, status: 'trial_expired' } : null);
        }
      }
    }
  }, [session]);

  // Trigger popup only for new/trial users on mount if they aren't premium
  useEffect(() => {
    if (session && session.status !== 'premium') {
      const timer = setTimeout(() => setShowPopup(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLogin = () => {
    if (loginStep === 'mobile') {
      if (mobileNumber.length < 10) return alert("Enter valid number");
      setLoginStep('otp');
    } else {
      const newSession: UserSession = {
        mobileNumber,
        status: 'trial',
        trialStartDate: new Date().toISOString()
      };
      setSession(newSession);
      setShowPopup(true);
    }
  };

  const activatePro = () => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    setSession(prev => ({
      ...prev!,
      status: 'premium',
      premiumExpiryDate: expiry.toISOString()
    }));
    setCurrentView(View.DASHBOARD);
    setShowPopup(false);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const t = TRANSLATIONS[lang];

  if (!session) {
    return (
      <div className={`min-h-screen bg-slate-50 flex items-center justify-center p-4 ${lang === 'ur' ? 'font-urdu' : ''}`}>
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-8 md:p-14 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center text-white font-black text-4xl mx-auto mb-8 shadow-2xl shadow-emerald-100 ring-8 ring-emerald-50">K</div>
            <h2 className="text-3xl font-black text-slate-800 mb-2 leading-tight">{t.loginTitle}</h2>
            <p className="text-slate-500 text-sm font-medium">{t.loginDesc}</p>
          </div>

          <div className="space-y-6">
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">{loginStep === 'mobile' ? t.mobileLabel : t.otpLabel}</label>
              <div className="flex bg-slate-50 rounded-[1.2rem] px-6 py-4 items-center ring-1 ring-slate-100 focus-within:ring-emerald-500 transition-all">
                {loginStep === 'mobile' && <span className="text-slate-400 font-bold mr-2">+92</span>}
                <input 
                  type={loginStep === 'mobile' ? 'tel' : 'number'}
                  value={loginStep === 'mobile' ? mobileNumber : otp}
                  onChange={(e) => loginStep === 'mobile' ? setMobileNumber(e.target.value) : setOtp(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-sm outline-none font-black text-slate-800"
                  placeholder={loginStep === 'mobile' ? "3XX XXXXXXX" : "0000"}
                />
              </div>
            </div>
            
            <button 
              onClick={handleLogin}
              className="w-full bg-emerald-600 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all transform active:scale-95 text-lg"
            >
              {loginStep === 'mobile' ? t.sendOTP : t.verifyOTP}
            </button>
            
            <div className="pt-6 text-center">
              <button onClick={() => setLang(lang === 'en' ? 'ur' : 'en')} className="text-xs font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
                {lang === 'en' ? 'اردو میں لاگ ان کریں' : 'Switch to English'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    if (session.status === 'trial_expired' && currentView !== View.SUBSCRIPTION) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-white rounded-[2.5rem] py-16 px-8 text-center shadow-xl border border-rose-100 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 text-rose-500">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 className="text-2xl font-black text-slate-800">{t.trialExpiredTitle}</h3>
          <p className="text-slate-500 mt-4 max-w-xs mx-auto font-medium">{t.trialExpiredDesc}</p>
          <button onClick={() => setCurrentView(View.SUBSCRIPTION)} className="mt-8 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all">
            {t.buyNow}
          </button>
        </div>
      );
    }

    switch (currentView) {
      case View.DASHBOARD: return <Dashboard lang={lang} products={products} setCurrentView={setCurrentView} />;
      case View.BILLING: return <Billing lang={lang} products={products} customers={customers} setProducts={setProducts} />;
      case View.SUBSCRIPTION: return <Subscription lang={lang} status={session.status} activatePro={activatePro} />;
      case View.INVENTORY: return <Inventory lang={lang} products={products} setProducts={setProducts} />;
      case View.CUSTOMERS: return <Customers lang={lang} customers={customers} setCustomers={setCustomers} />;
      default: return <Dashboard lang={lang} products={products} setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className={`flex min-h-screen h-screen overflow-hidden bg-slate-50/50 ${lang === 'ur' ? 'font-urdu' : ''}`}>
      {/* Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar} 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 animate-in fade-in duration-300"
        />
      )}

      <Sidebar 
        currentView={currentView} 
        setCurrentView={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} 
        lang={lang} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <TopBar 
          notifications={notifications} 
          storeName={lang === 'ur' ? 'گلبرگ کرانہ سینٹر' : 'Gulberg Kirana Center'} 
          lang={lang} 
          setLang={setLang}
          onToggleSidebar={toggleSidebar}
        />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto h-full">
            {renderView()}
          </div>
        </div>
      </main>

      {/* Upgrade Popup - Only for non-premium */}
      {showPopup && session.status !== 'premium' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="bg-emerald-600 p-10 text-white relative">
              <button onClick={() => setShowPopup(false)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-3xl font-black leading-tight tracking-tight">{t.popupTitle}</h3>
              <p className="text-emerald-50 mt-2 font-medium opacity-90">{t.popupDesc}</p>
            </div>
            <div className="p-10 space-y-4">
              <button onClick={() => { setCurrentView(View.SUBSCRIPTION); setShowPopup(false); }} className="w-full bg-emerald-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl hover:bg-emerald-700 transition-all text-lg">
                {t.buyNow}
              </button>
              <button onClick={() => setShowPopup(false)} className="w-full text-slate-400 font-black py-4 rounded-2xl hover:bg-slate-50 transition-all text-xs uppercase tracking-widest">
                {t.startTrial}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
