
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DB } from '../services/db';
import { User, Role } from '../types';
import { User as UserIcon, Scissors, AlertCircle, MapPin, Award } from 'lucide-react';
import { useLanguage } from '../App';

interface Props {
  onRegister: (user: User) => void;
}

const Register: React.FC<Props> = ({ onRegister }) => {
  const { t } = useLanguage();
  const [role, setRole] = useState<Role>('CUSTOMER');
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    city: '',
    experience: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (DB.findUserByPhone(formData.phoneNumber)) {
      setError('This phone number is already registered.');
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
      role,
      ...(role === 'BARBER' ? {
        city: formData.city,
        experience: parseInt(formData.experience) || 0,
        isAvailable: true,
        bio: ""
      } : {})
    };

    DB.saveUser(newUser);
    DB.setCurrentUser(newUser);
    onRegister(newUser);
    navigate(role === 'BARBER' ? '/barber' : '/customer');
  };

  return (
    <div className="min-h-screen py-12 px-4 flex justify-center items-center">
      <div className="max-w-xl w-full bg-zinc-900 p-8 border border-zinc-800 shadow-2xl">
        <h2 className="font-gold text-4xl text-center mb-8 font-bold uppercase">{t.register}</h2>
        
        <div className="flex p-1 bg-black rounded-lg mb-10">
          <button 
            onClick={() => setRole('CUSTOMER')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded transition-all ${role === 'CUSTOMER' ? 'bg-gold text-black font-bold' : 'text-zinc-500 hover:text-white'}`}
          >
            <UserIcon size={18} /> {t.customer}
          </button>
          <button 
            onClick={() => setRole('BARBER')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded transition-all ${role === 'BARBER' ? 'bg-gold text-black font-bold' : 'text-zinc-500 hover:text-white'}`}
          >
            <Scissors size={18} /> {t.barber}
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/50 p-4 rounded flex items-center gap-3 text-red-200">
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-zinc-400 mb-2">{t.fullName}</label>
              <input
                type="text"
                required
                className="w-full bg-black border border-zinc-700 rounded p-3 focus:outline-none focus:border-gold transition-colors"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-zinc-400 mb-2">{t.phone}</label>
              <input
                type="tel"
                required
                className="w-full bg-black border border-zinc-700 rounded p-3 focus:outline-none focus:border-gold transition-colors"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              />
            </div>
          </div>

          {role === 'BARBER' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <MapPin size={14} className="text-gold" /> {t.city}
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-black border border-zinc-700 rounded p-3 focus:outline-none focus:border-gold transition-colors"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <Award size={14} className="text-gold" /> {t.experience}
                </label>
                <input
                  type="number"
                  required
                  className="w-full bg-black border border-zinc-700 rounded p-3 focus:outline-none focus:border-gold transition-colors"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">{t.password}</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full bg-black border border-zinc-700 rounded p-3 focus:outline-none focus:border-gold transition-colors"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gold hover:bg-yellow-600 text-black font-bold py-4 rounded transition-all uppercase tracking-widest text-lg shadow-lg"
          >
            {t.createAccount}
          </button>
        </form>

        <p className="mt-8 text-center text-zinc-500 text-sm">
          {t.alreadyHaveAccount}{' '}
          <Link to="/login" className="text-gold hover:underline">
            {t.login}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
