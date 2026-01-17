
import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Salon } from '../types';
import { DB } from '../services/db';
import { Camera, Save, User as UserIcon, Home, Plus, Search, UserPlus, Settings, Info, XCircle, MapPin } from 'lucide-react';
import { useLanguage } from '../App';

interface Props {
  user: User;
  onUpdate: (user: User) => void;
}

const Profile: React.FC<Props> = ({ user, onUpdate }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    city: user.city || '',
    experience: user.experience?.toString() || '',
    bio: user.bio || ''
  });
  const [profileImg, setProfileImg] = useState<string | undefined>(user.profilePicture);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Salon states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [salonForm, setSalonForm] = useState({ name: '', region: '', image: '' });
  const [salonSearch, setSalonSearch] = useState('');
  const [allSalons, setAllSalons] = useState<Salon[]>(DB.getSalons());
  const salonImgRef = useRef<HTMLInputElement>(null);

  const freshUser = DB.getUserById(user.id) || user;
  const currentSalon = freshUser.salonId ? DB.getSalonById(freshUser.salonId) : null;

  const filteredSalons = useMemo(() => {
    return allSalons.filter(s => s.name.toLowerCase().includes(salonSearch.toLowerCase()));
  }, [salonSearch, allSalons]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImg(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSalonImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSalonForm({ ...salonForm, image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: User = {
      ...user,
      fullName: formData.fullName,
      city: formData.city,
      experience: parseInt(formData.experience) || 0,
      bio: formData.bio,
      profilePicture: profileImg
    };
    DB.saveUser(updatedUser);
    DB.setCurrentUser(updatedUser);
    onUpdate(updatedUser);
    alert(t.profileUpdated);
  };

  const handleCreateSalon = (e: React.FormEvent) => {
    e.preventDefault();
    if (salonForm.name.trim() && salonForm.region.trim()) {
      const newSalon: Salon = {
        id: Math.random().toString(36).substr(2, 9),
        name: salonForm.name.trim(),
        region: salonForm.region.trim(),
        image: salonForm.image,
        ownerId: freshUser.id,
        barberIds: [freshUser.id],
        pendingBarberIds: []
      };
      
      DB.saveSalon(newSalon);
      const updatedUser = { ...freshUser, salonId: newSalon.id, isSalonOwner: true };
      DB.saveUser(updatedUser);
      DB.setCurrentUser(updatedUser);
      onUpdate(updatedUser);
      setAllSalons(DB.getSalons());
      setShowCreateModal(false);
      setSalonForm({ name: '', region: '', image: '' });
    }
  };

  const handleJoinRequest = (salonId: string) => {
    const s = DB.getSalonById(salonId);
    if (s) {
      // Robustness: ensure arrays exist
      const pending = s.pendingBarberIds || [];
      const members = s.barberIds || [];
      
      if (pending.includes(freshUser.id) || members.includes(freshUser.id)) return;
      
      const updatedSalon = { 
        ...s, 
        pendingBarberIds: [...pending, freshUser.id],
        barberIds: members 
      };
      
      DB.saveSalon(updatedSalon);
      DB.addNotification(s.ownerId, `${freshUser.fullName} requested to join ${s.name}.`);
      setAllSalons(DB.getSalons()); // Refresh local state to trigger UI update
      alert(t.requestSent);
    }
  };

  const pendingInSalon = allSalons.find(s => (s.pendingBarberIds || []).includes(freshUser.id));

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      {/* Profile Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-zinc-800 to-black relative">
          <div className="absolute -bottom-12 ltr:left-10 rtl:right-10">
            <div className="relative group">
              {profileImg ? (
                <img src={profileImg} alt="" className="w-32 h-32 rounded-full border-4 border-zinc-900 object-cover shadow-xl" />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-zinc-900 bg-zinc-800 flex items-center justify-center">
                  <UserIcon size={48} className="text-zinc-600" />
                </div>
              )}
              <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <Camera size={24} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>
          </div>
        </div>

        <div className="pt-16 p-8">
          <h1 className="text-3xl font-gold font-bold mb-10">{user.fullName}</h1>
          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm text-zinc-500 font-bold uppercase tracking-wider">{t.fullName}</label>
                <input type="text" className="w-full bg-black border border-zinc-800 rounded-xl p-4 focus:border-gold outline-none" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})}/>
              </div>
              {user.role === 'BARBER' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-500 font-bold uppercase tracking-wider">{t.city}</label>
                    <input type="text" className="w-full bg-black border border-zinc-800 rounded-xl p-4 focus:border-gold outline-none" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-500 font-bold uppercase tracking-wider">{t.experience}</label>
                    <input type="number" className="w-full bg-black border border-zinc-800 rounded-xl p-4 focus:border-gold outline-none" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})}/>
                  </div>
                </>
              )}
            </div>
            {user.role === 'BARBER' && (
              <div className="space-y-2">
                <label className="text-sm text-zinc-500 font-bold uppercase tracking-wider">{t.bio}</label>
                <textarea rows={4} className="w-full bg-black border border-zinc-800 rounded-xl p-4 focus:border-gold outline-none" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})}/>
              </div>
            )}
            <button type="submit" className="bg-gold hover:bg-yellow-600 text-black font-bold py-4 px-10 rounded-xl flex items-center justify-center gap-2 transition-all uppercase tracking-widest shadow-lg">
              <Save size={20} /> {t.save}
            </button>
          </form>
        </div>
      </div>

      {/* Salon Section (Barber Only) */}
      {user.role === 'BARBER' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-gold font-bold flex items-center gap-2"><Home className="text-gold" /> {t.salonManagement}</h2>
            {currentSalon && freshUser.isSalonOwner && (
              <button onClick={() => navigate('/salon-management')} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-gold px-5 py-2.5 rounded-xl transition-colors font-bold shadow-md">
                <Settings size={20} /> {t.manageSalon}
              </button>
            )}
          </div>

          {currentSalon ? (
            <div className="flex flex-col md:flex-row items-center gap-8 bg-black/40 p-6 rounded-3xl border border-zinc-800">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700">
                {currentSalon.image ? (
                  <img src={currentSalon.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600"><Home size={40} /></div>
                )}
              </div>
              <div className="flex-1 space-y-2 text-center md:text-start">
                <h3 className="text-2xl font-bold">{currentSalon.name}</h3>
                <p className="text-zinc-500 flex items-center justify-center md:justify-start gap-1"><MapPin size={16}/> {currentSalon.region}</p>
                <p className="text-sm text-gold font-bold">{(currentSalon.barberIds || []).length} {t.members}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingInSalon ? (
                <div className="p-6 bg-yellow-900/10 border border-yellow-600/30 rounded-2xl space-y-3 text-yellow-200">
                  <div className="flex items-center gap-2 font-bold text-lg"><Info size={24}/> {t.pendingApproval}</div>
                  <p className="leading-relaxed opacity-80">{t.joinRequested} <span className="text-white font-bold">{pendingInSalon.name}</span>. {t.waitingReview}</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <button onClick={() => setShowCreateModal(true)} className="w-full bg-gold/10 border border-gold/40 hover:bg-gold hover:text-black text-gold py-6 rounded-3xl font-bold flex flex-col items-center gap-2 transition-all shadow-xl group">
                      <Plus size={32} className="group-hover:scale-110 transition-transform" /> {t.createSalon}
                    </button>
                  </div>
                  <div className="space-y-4 border-l border-zinc-800 pl-8">
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{t.joinSalon}</p>
                    <div className="relative">
                      <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18}/>
                      <input type="text" placeholder={t.searchSalon} className="w-full bg-black border border-zinc-800 rounded-xl ltr:pl-10 rtl:pr-10 py-3 text-sm focus:border-gold outline-none" value={salonSearch} onChange={(e) => setSalonSearch(e.target.value)}/>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {filteredSalons.map(s => (
                        <div key={s.id} className="flex items-center justify-between p-4 bg-black border border-zinc-800 rounded-xl hover:border-gold/40 transition-all group">
                          <span className="font-semibold">{s.name}</span>
                          <button onClick={() => handleJoinRequest(s.id)} className="text-zinc-500 group-hover:text-gold p-2"><UserPlus size={20}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Salon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[200] backdrop-blur-md">
          <form onSubmit={handleCreateSalon} className="bg-zinc-900 border border-gold/40 p-8 rounded-3xl w-full max-w-md relative shadow-2xl space-y-6">
            <button type="button" onClick={() => setShowCreateModal(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"><XCircle size={28}/></button>
            <h2 className="text-2xl font-gold font-bold text-center">{t.createSalon}</h2>
            
            <div className="flex justify-center">
              <div className="relative w-24 h-24 bg-black rounded-2xl border border-zinc-800 flex items-center justify-center group cursor-pointer overflow-hidden" onClick={() => salonImgRef.current?.click()}>
                {salonForm.image ? (
                  <img src={salonForm.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={32} className="text-zinc-700" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera size={20} /></div>
                <input type="file" ref={salonImgRef} className="hidden" accept="image/*" onChange={handleSalonImgChange} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">{t.salonName}</label>
                <input type="text" required className="w-full bg-black border border-zinc-800 rounded-xl p-3 focus:border-gold outline-none" value={salonForm.name} onChange={(e) => setSalonForm({...salonForm, name: e.target.value})}/>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">{t.salonRegion}</label>
                <input type="text" required className="w-full bg-black border border-zinc-800 rounded-xl p-3 focus:border-gold outline-none" value={salonForm.region} onChange={(e) => setSalonForm({...salonForm, region: e.target.value})}/>
              </div>
            </div>

            <button type="submit" className="w-full bg-gold text-black font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all">{t.save}</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
