
import React, { useState, useMemo } from 'react';
import { DB } from '../services/db';
import { User, Booking, Rating } from '../types';
import { useLanguage } from '../App';
import { Search, MapPin, Calendar, Clock, Star, Scissors, XCircle, Home, ArrowLeft, Phone, User as UserIcon } from 'lucide-react';

interface Props {
  user: User;
}

const CustomerDashboard: React.FC<Props> = ({ user }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<'BARBER' | 'SALON'>('BARBER');
  const [selectedSalon, setSelectedSalon] = useState<any | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState<Booking[]>(DB.getCustomerBookings(user.id));
  
  // Rating state
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  const allBarbers = DB.getUsers().filter(u => u.role === 'BARBER');
  const allSalons = DB.getSalons();
  
  const filteredResults = useMemo(() => {
    if (searchMode === 'BARBER') {
      return allBarbers.filter(b => b.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || (b.city && b.city.toLowerCase().includes(searchTerm.toLowerCase())));
    } else {
      return allSalons.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.region.toLowerCase().includes(searchTerm.toLowerCase()));
    }
  }, [searchTerm, searchMode, allBarbers, allSalons]);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  // Check if a slot is locked globally for this barber on this date
  const isSlotLocked = (time: string) => {
    if (!selectedBarber) return false;
    const allBookings = DB.getBookings();
    return allBookings.some(b => 
      b.barberId === selectedBarber.id && 
      b.date === selectedDate && 
      b.timeSlot === time && 
      (b.status === 'PENDING' || b.status === 'APPROVED')
    );
  };

  const handleBooking = (time: string) => {
    if (!selectedBarber) return;
    if (isSlotLocked(time)) {
      alert(t.slotTaken);
      return;
    }
    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      barberId: selectedBarber.id,
      customerId: user.id,
      date: selectedDate,
      timeSlot: time,
      status: 'PENDING',
      customerName: user.fullName
    };
    DB.saveBooking(newBooking);
    DB.addNotification(selectedBarber.id, `New request from ${user.fullName} for ${selectedDate} @ ${time}`);
    setBookings(DB.getCustomerBookings(user.id));
    setSelectedBarber(null);
    alert(t.bookSuccess);
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingBooking) return;

    const newRating: Rating = {
      id: Math.random().toString(36).substr(2, 9),
      barberId: ratingBooking.barberId,
      customerId: user.id,
      stars: ratingStars,
      comment: ratingComment,
      bookingId: ratingBooking.id
    };

    DB.addRating(newRating);
    
    // Update booking locally to indicate it's been rated
    const updatedBooking = { ...ratingBooking, rating: ratingStars, review: ratingComment };
    DB.saveBooking(updatedBooking);
    
    setBookings(DB.getCustomerBookings(user.id));
    setRatingBooking(null);
    setRatingStars(5);
    setRatingComment('');
    alert(t.thankYouRating);
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'PENDING': return t.pending;
      case 'APPROVED': return t.approved;
      case 'REJECTED': return t.rejected;
      case 'COMPLETED': return t.completed;
      default: return status;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Search & Mode Toggles */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
          <div className="flex bg-zinc-900 p-1 rounded-xl w-fit">
            <button onClick={() => { setSearchMode('BARBER'); setSelectedSalon(null); }} className={`px-6 py-2 rounded-lg font-bold transition-all ${searchMode === 'BARBER' ? 'bg-gold text-black' : 'text-zinc-500'}`}>{t.barber}</button>
            <button onClick={() => setSearchMode('SALON')} className={`px-6 py-2 rounded-lg font-bold transition-all ${searchMode === 'SALON' ? 'bg-gold text-black' : 'text-zinc-500'}`}>{t.salonManagement}</button>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18}/>
            <input type="text" placeholder={t.searchPlaceholder} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl ltr:pl-10 rtl:pr-10 py-3 text-sm focus:border-gold outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
          </div>
        </div>

        {selectedSalon ? (
          <div className="space-y-6 animate-fade-in">
            <button onClick={() => setSelectedSalon(null)} className="flex items-center gap-2 text-gold hover:underline font-bold"><ArrowLeft size={16}/> {t.back}</button>
            <div className="flex flex-col md:flex-row items-center gap-6 bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
              {selectedSalon.image && <img src={selectedSalon.image} className="w-24 h-24 rounded-2xl object-cover" alt=""/>}
              <div>
                <h2 className="text-3xl font-bold font-gold">{selectedSalon.name}</h2>
                <p className="text-zinc-400 flex items-center gap-2"><MapPin size={16}/> {selectedSalon.region}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {selectedSalon.barberIds.map((bid: string) => {
                const b = DB.getUserById(bid);
                return b ? (
                  <div key={bid} onClick={() => setSelectedBarber(b)} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-gold cursor-pointer transition-all group">
                    <div className="flex items-center gap-4">
                      {b.profilePicture ? (
                        <img src={b.profilePicture} className="w-14 h-14 rounded-full border border-zinc-700 group-hover:border-gold object-cover" alt=""/>
                      ) : (
                        <div className="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center text-gold border border-zinc-700 group-hover:border-gold transition-colors">
                          <Scissors size={20}/>
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg">{b.fullName}</h3>
                        <p className="text-xs text-zinc-500">{b.experience} {t.yearsExp}</p>
                        <p className="text-[10px] text-gold font-bold flex items-center gap-1 mt-1"><Phone size={10}/> {b.phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredResults.map((item: any) => (
              <div 
                key={item.id} 
                onClick={() => searchMode === 'BARBER' ? setSelectedBarber(item) : setSelectedSalon(item)} 
                className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-gold cursor-pointer transition-all group shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-black rounded-lg border border-zinc-800 group-hover:border-gold transition-colors overflow-hidden">
                    {searchMode === 'BARBER' ? (
                      item.profilePicture ? <img src={item.profilePicture} className="w-10 h-10 object-cover" alt=""/> : <Scissors className="text-gold" size={20}/>
                    ) : (
                      item.image ? <img src={item.image} className="w-10 h-10 object-cover" alt=""/> : <Home className="text-gold" size={20}/>
                    )}
                  </div>
                  <h3 className="font-bold text-lg">{item.fullName || item.name}</h3>
                </div>
                {searchMode === 'BARBER' && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <MapPin size={14}/> {item.city}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gold font-bold">
                      <Phone size={14}/> {item.phoneNumber}
                    </div>
                  </div>
                )}
                {searchMode === 'SALON' && (
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <MapPin size={14}/> {item.region}
                  </div>
                )}
              </div>
            ))}
            {filteredResults.length === 0 && <div className="col-span-full py-20 text-center text-zinc-600 font-bold">{t.noSalons}</div>}
          </div>
        )}
      </section>

      {/* Booking Modal */}
      {selectedBarber && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[100] backdrop-blur-md">
          <div className="bg-zinc-900 border border-gold/30 p-8 rounded-3xl w-full max-w-xl relative shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh]">
            <button onClick={() => setSelectedBarber(null)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"><XCircle size={28}/></button>
            
            <div className="flex flex-col items-center text-center mb-8">
              {selectedBarber.profilePicture ? (
                <img src={selectedBarber.profilePicture} className="w-24 h-24 rounded-full border-4 border-gold object-cover mb-4" alt=""/>
              ) : (
                <div className="w-24 h-24 bg-zinc-800 rounded-full border-4 border-gold flex items-center justify-center mb-4 text-gold">
                  <UserIcon size={40}/>
                </div>
              )}
              <h2 className="text-3xl font-gold font-bold mb-2">{selectedBarber.fullName}</h2>
              <p className="text-gold font-bold mb-4 flex items-center gap-2 text-xl bg-black/50 px-4 py-2 rounded-full border border-gold/20 shadow-inner">
                <Phone size={20}/> {selectedBarber.phoneNumber}
              </p>
              <p className="text-zinc-500 max-w-md italic">"{selectedBarber.bio || "Professional Barbering services."}"</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{t.selectDate}</label>
                <input type="date" min={new Date().toISOString().split('T')[0]} className="w-full bg-black border border-zinc-800 rounded-xl p-3 focus:border-gold outline-none" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}/>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{t.selectTime}</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {generateTimeSlots().map(time => {
                    const locked = isSlotLocked(time);
                    return (
                      <button 
                        key={time} 
                        disabled={locked}
                        onClick={() => handleBooking(time)} 
                        className={`p-3 text-xs rounded-lg font-bold transition-all border ${
                          locked 
                            ? 'bg-zinc-950 border-zinc-900 text-zinc-800 cursor-not-allowed line-through' 
                            : 'bg-black border-zinc-800 hover:border-gold hover:text-gold'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingBooking && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[110] backdrop-blur-md">
          <form onSubmit={handleRatingSubmit} className="bg-zinc-900 border border-gold/40 p-8 rounded-3xl w-full max-w-md relative shadow-2xl space-y-6">
            <button type="button" onClick={() => setRatingBooking(null)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"><XCircle size={28}/></button>
            <h2 className="text-2xl font-gold font-bold text-center">{t.rateService}</h2>
            <p className="text-center text-zinc-400 text-sm">How was your session with {DB.getUserById(ratingBooking.barberId)?.fullName}?</p>
            
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  type="button" 
                  onClick={() => setRatingStars(star)}
                  className={`p-1 transition-all transform hover:scale-125 ${star <= ratingStars ? 'text-gold' : 'text-zinc-800'}`}
                >
                  <Star fill={star <= ratingStars ? "currentColor" : "none"} size={32} />
                </button>
              ))}
            </div>

            <textarea 
              rows={4} 
              className="w-full bg-black border border-zinc-800 rounded-xl p-4 focus:border-gold outline-none text-white resize-none"
              placeholder={t.commentPlaceholder}
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
            />

            <button type="submit" className="w-full bg-gold text-black font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all uppercase tracking-widest">
              {t.submitRating}
            </button>
          </form>
        </div>
      )}

      {/* Appointment History */}
      <section className="space-y-6 pt-8 border-t border-zinc-900">
        <h2 className="text-2xl font-gold font-bold">{t.myAppointments}</h2>
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
          {bookings.length === 0 ? (
            <div className="p-10 text-center text-zinc-600">{t.noSalons}</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {bookings.sort((a,b) => b.date.localeCompare(a.date) || b.timeSlot.localeCompare(a.timeSlot)).map(b => (
                <div key={b.id} className="p-5 flex justify-between items-center hover:bg-zinc-800/30 transition-colors">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 overflow-hidden border border-zinc-700">
                      {DB.getUserById(b.barberId)?.profilePicture ? (
                        <img src={DB.getUserById(b.barberId)?.profilePicture} className="w-full h-full object-cover" alt=""/>
                      ) : (
                        <Calendar size={18}/>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{DB.getUserById(b.barberId)?.fullName}</p>
                      <p className="text-xs text-zinc-500">{b.date} • {b.timeSlot}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {b.status === 'COMPLETED' && !b.rating && (
                      <button 
                        onClick={() => setRatingBooking(b)} 
                        className="bg-gold text-black text-[10px] font-bold px-4 py-2 rounded-full hover:bg-yellow-600 transition-all uppercase tracking-widest shadow-md"
                      >
                        {t.rateService}
                      </button>
                    )}
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      b.status === 'APPROVED' ? 'bg-green-600/10 text-green-500 border-green-500/20' : 
                      b.status === 'PENDING' ? 'bg-gold/10 text-gold border-gold/20' : 
                      b.status === 'COMPLETED' ? 'bg-zinc-800 text-zinc-400 border-zinc-700' :
                      'bg-red-600/10 text-red-500 border-red-500/20'
                    }`}>
                      {getStatusText(b.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CustomerDashboard;
