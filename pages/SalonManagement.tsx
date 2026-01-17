
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DB } from '../services/db';
import { User, Salon } from '../types';
import { useLanguage } from '../App';
import { ArrowLeft, Save, Camera, Check, X, UserMinus, Home, MapPin, Users, UserCheck } from 'lucide-react';

const SalonManagement: React.FC = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const user = DB.getCurrentUser();
  
  if (!user || !user.isSalonOwner || !user.salonId) {
    return <div className="p-10 text-center">Unauthorized</div>;
  }

  const [salon, setSalon] = useState<Salon | null>(DB.getSalonById(user.salonId) || null);
  const [salonForm, setSalonForm] = useState({
    name: salon?.name || '',
    region: salon?.region || '',
    image: salon?.image || ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!salon) return <div className="p-10 text-center">Salon not found</div>;

  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSalonForm({ ...salonForm, image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSalon = { ...salon, ...salonForm };
    DB.saveSalon(updatedSalon);
    setSalon(updatedSalon);
    alert(t.profileUpdated);
  };

  const handleApprove = (barberId: string) => {
    const pending = salon.pendingBarberIds || [];
    const members = salon.barberIds || [];
    
    const updated = { 
      ...salon,
      pendingBarberIds: pending.filter(id => id !== barberId),
      barberIds: [...members, barberId]
    };
    
    DB.saveSalon(updated);
    
    const bUser = DB.getUserById(barberId);
    if (bUser) {
      bUser.salonId = updated.id;
      DB.saveUser(bUser);
      DB.addNotification(barberId, `Accepted in ${updated.name}`);
    }
    setSalon(updated);
  };

  const handleReject = (barberId: string) => {
    const pending = salon.pendingBarberIds || [];
    const updated = { 
      ...salon,
      pendingBarberIds: pending.filter(id => id !== barberId)
    };
    DB.saveSalon(updated);
    DB.addNotification(barberId, `Join request rejected by ${updated.name}`);
    setSalon(updated);
  };

  const handleKick = (barberId: string) => {
    if (barberId === user.id) return;
    const members = salon.barberIds || [];
    const updated = { 
      ...salon,
      barberIds: members.filter(id => id !== barberId)
    };
    DB.saveSalon(updated);
    
    const bUser = DB.getUserById(barberId);
    if (bUser) {
      bUser.salonId = undefined;
      DB.saveUser(bUser);
      DB.addNotification(barberId, `Removed from ${updated.name}`);
    }
    setSalon(updated);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/profile')} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-gold">
          <ArrowLeft size={24} className={lang === 'ar' ? 'rotate-180' : ''} />
        </button>
        <h1 className="text-3xl font-gold font-bold">{t.manageSalon}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Salon Info Editor */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-8"><Home className="text-gold" /> {t.salonInfo}</h2>
            <form onSubmit={handleUpdateInfo} className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative group w-32 h-32 flex-shrink-0">
                  <div className="w-full h-full rounded-2xl bg-black border border-zinc-800 flex items-center justify-center overflow-hidden">
                    {salonForm.image ? (
                      <img src={salonForm.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Home size={48} className="text-zinc-800" />
                    )}
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera size={24} />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImgChange} />
                </div>
                
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">{t.salonName}</label>
                    <input type="text" required className="w-full bg-black border border-zinc-800 rounded-xl p-3 focus:border-gold outline-none" value={salonForm.name} onChange={(e) => setSalonForm({...salonForm, name: e.target.value})}/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">{t.salonRegion}</label>
                    <input type="text" required className="w-full bg-black border border-zinc-800 rounded-xl p-3 focus:border-gold outline-none" value={salonForm.region} onChange={(e) => setSalonForm({...salonForm, region: e.target.value})}/>
                  </div>
                </div>
              </div>
              <button type="submit" className="bg-gold text-black font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-yellow-600 transition-colors uppercase tracking-widest text-sm">{t.save}</button>
            </form>
          </div>

          {/* Members List */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-8"><Users className="text-gold" /> {t.members}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {(salon.barberIds || []).map(id => {
                const b = DB.getUserById(id);
                if (!b) return null;
                return (
                  <div key={id} className="flex items-center justify-between p-4 bg-black/40 border border-zinc-800 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center border border-zinc-700">
                        {b.profilePicture ? <img src={b.profilePicture} className="w-full h-full object-cover" /> : <UserCheck size={18} className="text-zinc-500"/>}
                      </div>
                      <div className="leading-tight">
                        <p className="font-bold text-sm">{b.fullName}</p>
                        <p className="text-[10px] text-zinc-500 uppercase">{b.id === user.id ? 'Owner' : 'Barber'}</p>
                      </div>
                    </div>
                    {id !== user.id && (
                      <button onClick={() => handleKick(id)} className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all">
                        <UserMinus size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
              {(salon.barberIds || []).length === 0 && <p className="text-center py-4 text-zinc-600 col-span-full">{t.noMembers}</p>}
            </div>
          </div>
        </section>

        {/* Pending Requests Sidebar */}
        <section className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl sticky top-24">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-gold"><UserCheck /> {t.requests}</h2>
            <div className="space-y-4">
              {(salon.pendingBarberIds || []).length === 0 && (
                <div className="py-10 text-center space-y-3 grayscale opacity-30">
                  <X size={40} className="mx-auto text-zinc-500" />
                  <p className="text-sm font-bold">{t.noRequests}</p>
                </div>
              )}
              {(salon.pendingBarberIds || []).map(id => {
                const b = DB.getUserById(id);
                if (!b) return null;
                return (
                  <div key={id} className="p-4 bg-black border border-zinc-800 rounded-2xl space-y-4 shadow-sm border-l-4 border-l-gold">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                        {b.profilePicture ? <img src={b.profilePicture} className="w-full h-full object-cover" /> : <Users size={18}/>}
                      </div>
                      <div className="leading-tight">
                        <p className="font-bold text-sm">{b.fullName}</p>
                        <p className="text-xs text-zinc-500">{b.experience} yrs exp.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(id)} className="flex-1 bg-green-600/10 text-green-500 border border-green-600/20 py-2 rounded-xl text-xs font-bold hover:bg-green-600 hover:text-white transition-all">{t.approve}</button>
                      <button onClick={() => handleReject(id)} className="flex-1 bg-red-600/10 text-red-500 border border-red-600/20 py-2 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all">{t.reject}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SalonManagement;
