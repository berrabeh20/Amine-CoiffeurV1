
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DB } from '../services/db';
import { User } from '../types';
import { Scissors, AlertCircle } from 'lucide-react';
import { useLanguage } from '../App';

interface Props {
  onLogin: (user: User) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const { t } = useLanguage();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = DB.findUserByPhone(phoneNumber);
    if (user && user.password === password) {
      DB.setCurrentUser(user);
      onLogin(user);
      navigate(user.role === 'BARBER' ? '/barber' : '/customer');
    } else {
      setError(t.invalidLogin);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-zinc-900 p-8 border border-zinc-800 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-zinc-800 border border-gold text-gold">
              <Scissors />
            </div>
          </div>
          <h2 className="font-gold text-3xl font-bold mb-2">{t.welcome}</h2>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/50 p-4 rounded flex items-center gap-3 text-red-200">
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">{t.phone}</label>
            <input
              type="tel"
              required
              className="w-full bg-black border border-zinc-700 rounded p-3 focus:outline-none focus:border-gold transition-colors"
              placeholder="+213 555 555 555"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">{t.password}</label>
            <input
              type="password"
              required
              className="w-full bg-black border border-zinc-700 rounded p-3 focus:outline-none focus:border-gold transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gold hover:bg-yellow-600 text-black font-bold py-3 rounded transition-colors uppercase tracking-widest"
          >
            {t.login}
          </button>
        </form>

        <p className="mt-8 text-center text-zinc-500 text-sm">
          {t.dontHaveAccount}{' '}
          <Link to="/register" className="text-gold hover:underline">
            {t.registerNow}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
