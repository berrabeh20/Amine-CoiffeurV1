
import React, { useState } from 'react';
import { DB } from '../services/db';
import { User, Booking } from '../types';
import { useLanguage } from '../App';
import { Check, X, Clock, CheckCircle } from 'lucide-react';

interface Props {
  user: User;
}

const BarberDashboard: React.FC<Props> = ({ user }) => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>(DB.getBarberBookings(user.id));
  const [isAvailable, setIsAvailable] = useState(user.isAvailable || false);

  const handleStatusUpdate = (bookingId: string, status: Booking['status']) => {
    const b = DB.getBookings().find(b => b.id === bookingId);
    if (b) {
      b.status = status;
      DB.saveBooking(b);
      
      let msg = `Your booking for ${b.date} at ${b.timeSlot} has been ${status.toLowerCase()}.`;
      if (status === 'COMPLETED') msg = `Service completed! Please rate your experience with ${user.fullName}.`;
      
      DB.addNotification(b.customerId, msg);
      setBookings(DB.getBarberBookings(user.id));
    }
  };

  const toggleAvailability = () => {
    const newVal = !isAvailable;
    setIsAvailable(newVal);
    const updatedUser = { ...user, isAvailable: newVal };
    DB.saveUser(updatedUser);
    DB.setCurrentUser(updatedUser);
  };

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const approvedBookings = bookings.filter(b => b.status === 'APPROVED');

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-zinc-500 text-sm uppercase tracking-wider">{t.status}</p>
            <h3 className={`text-2xl font-bold ${isAvailable ? 'text-green-500' : 'text-red-500'}`}>
              {isAvailable ? t.available : t.unavailable}
            </h3>
          </div>
          <button onClick={toggleAvailability} className={`w-12 h-6 rounded-full relative transition-colors ${isAvailable ? 'bg-green-600' : 'bg-zinc-700'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isAvailable ? 'ltr:left-7 rtl:right-7' : 'ltr:left-1 rtl:right-1'}`}></div>
          </button>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
          <p className="text-zinc-500 text-sm uppercase tracking-wider">{t.pending}</p>
          <h3 className="text-3xl font-bold font-gold">{pendingBookings.length}</h3>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pending Requests */}
        <section className="space-y-6">
          <h2 className="text-2xl font-gold font-bold flex items-center gap-2"><Clock className="text-gold" /> {t.pending}</h2>
          <div className="grid gap-4">
            {pendingBookings.length === 0 && (
              <div className="p-10 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-600 font-bold">
                {t.noSalons}
              </div>
            )}
            {pendingBookings.map(b => (
              <div key={b.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between hover:border-gold/30 transition-colors shadow-sm">
                <div>
                  <h4 className="font-bold text-lg">{b.customerName}</h4>
                  <p className="text-sm text-zinc-500">{b.date} @ {b.timeSlot}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleStatusUpdate(b.id, 'APPROVED')} className="p-2.5 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors shadow-md" title={t.approve}><Check size={20}/></button>
                  <button onClick={() => handleStatusUpdate(b.id, 'REJECTED')} className="p-2.5 bg-zinc-800 text-white rounded-lg hover:bg-red-900 transition-colors shadow-md" title={t.reject}><X size={20}/></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Approved Appointments */}
        <section className="space-y-6">
          <h2 className="text-2xl font-gold font-bold flex items-center gap-2 text-green-500"><CheckCircle /> {t.approved}</h2>
          <div className="grid gap-4">
            {approvedBookings.length === 0 && (
              <div className="p-10 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-600 font-bold">
                {t.noSalons}
              </div>
            )}
            {approvedBookings.map(b => (
              <div key={b.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between hover:border-gold/30 transition-colors shadow-sm">
                <div>
                  <h4 className="font-bold text-lg">{b.customerName}</h4>
                  <p className="text-sm text-zinc-500">{b.date} @ {b.timeSlot}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleStatusUpdate(b.id, 'COMPLETED')} 
                    className="flex items-center gap-2 bg-gold text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-600 transition-all shadow-md active:scale-95"
                  >
                    <CheckCircle size={18} /> {t.completeAction}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BarberDashboard;
