
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../App';
import { Scissors, Star, Calendar, ShieldCheck } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="relative">
      <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-[url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full border-2 border-gold text-gold"><Scissors size={48} /></div>
          </div>
          <h1 className="font-gold text-5xl md:text-8xl mb-4 uppercase tracking-widest">{t.title}</h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link to="/register" className="bg-gold hover:bg-yellow-600 text-black font-bold py-4 px-10 transition-all text-xl">{t.bookNow}</Link>
            <Link to="/login" className="bg-transparent border border-white/20 hover:border-gold py-4 px-10 transition-all text-xl">{t.login}</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
