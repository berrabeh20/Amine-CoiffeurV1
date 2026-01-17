
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { User } from './types';
import { DB } from './services/db';
import { translations } from './translations';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import BarberDashboard from './pages/BarberDashboard';
import Profile from './pages/Profile';
import SalonManagement from './pages/SalonManagement';
import { Scissors, User as UserIcon, LogOut, Globe } from 'lucide-react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>((localStorage.getItem('ac_lang') as Language) || 'ar');

  useEffect(() => {
    localStorage.setItem('ac_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const current = DB.getCurrentUser();
    if (current) {
      const fresh = DB.getUserById(current.id);
      setUser(fresh || null);
    }
    setLoading(false);
  }, []);

  const t = translations[lang];

  const handleLogout = () => {
    DB.setCurrentUser(null);
    setUser(null);
    window.location.hash = '/';
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gold">Loading...</div>;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <Router>
        <div className="min-h-screen flex flex-col bg-black text-white">
          <header className="sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Scissors className="text-gold w-6 h-6" />
              <span className="font-gold text-lg font-bold tracking-tight">{t.title}</span>
            </Link>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="flex items-center gap-1 text-xs sm:text-sm bg-zinc-800 px-3 py-1 rounded-full hover:bg-zinc-700 transition-colors"
              >
                <Globe size={14} /> {lang === 'en' ? 'العربية' : 'English'}
              </button>

              {user ? (
                <>
                  <Link to="/profile" className="flex items-center gap-2 hover:text-gold transition-colors">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="" className="w-8 h-8 rounded-full border border-gold object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                    <span className="hidden sm:inline">{user.fullName}</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-red-500"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="text-sm font-medium hover:text-gold">{t.login}</Link>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1">
            <Routes>
              <Route path="/" element={user ? <Navigate to={user.role === 'BARBER' ? '/barber' : '/customer'} /> : <LandingPage />} />
              <Route path="/login" element={<Login onLogin={setUser} />} />
              <Route path="/register" element={<Register onRegister={setUser} />} />
              <Route path="/customer" element={user?.role === 'CUSTOMER' ? <CustomerDashboard user={user} /> : <Navigate to="/login" />} />
              <Route path="/barber" element={user?.role === 'BARBER' ? <BarberDashboard user={user} /> : <Navigate to="/login" />} />
              <Route path="/profile" element={user ? <Profile user={user} onUpdate={setUser} /> : <Navigate to="/login" />} />
              <Route path="/salon-management" element={user?.isSalonOwner ? <SalonManagement /> : <Navigate to="/login" />} />
            </Routes>
          </main>

          <footer className="bg-zinc-950 py-8 border-t border-zinc-900 text-center text-zinc-600 text-sm">
            <p>© {new Date().getFullYear()} {t.title}. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </LanguageContext.Provider>
  );
};

export default App;
