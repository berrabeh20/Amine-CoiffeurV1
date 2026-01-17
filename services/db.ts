
import { User, Salon, Booking, Notification, Rating } from '../types';

const KEYS = {
  USERS: 'ac_users',
  SALONS: 'ac_salons',
  BOOKINGS: 'ac_bookings',
  NOTIFICATIONS: 'ac_notifications',
  RATINGS: 'ac_ratings',
  SESSION: 'ac_session'
};

const get = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const set = <T,>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const DB = {
  // Users
  getUsers: () => get<User[]>(KEYS.USERS, []),
  saveUser: (user: User) => {
    const users = DB.getUsers();
    const existing = users.findIndex(u => u.id === user.id);
    if (existing > -1) users[existing] = user;
    else users.push(user);
    set(KEYS.USERS, users);
  },
  findUserByPhone: (phone: string) => DB.getUsers().find(u => u.phoneNumber === phone),
  getUserById: (id: string) => DB.getUsers().find(u => u.id === id),

  // Salons
  getSalons: () => {
    const salons = get<Salon[]>(KEYS.SALONS, []);
    // Ensure arrays exist for every salon object
    return salons.map(s => ({
      ...s,
      barberIds: s.barberIds || [],
      pendingBarberIds: s.pendingBarberIds || []
    }));
  },
  getSalonById: (id: string) => DB.getSalons().find(s => s.id === id),
  saveSalon: (salon: Salon) => {
    const salons = DB.getSalons();
    const existing = salons.findIndex(s => s.id === salon.id);
    if (existing > -1) salons[existing] = salon;
    else salons.push(salon);
    set(KEYS.SALONS, salons);
  },

  // Bookings
  getBookings: () => get<Booking[]>(KEYS.BOOKINGS, []),
  saveBooking: (booking: Booking) => {
    const bookings = DB.getBookings();
    const existing = bookings.findIndex(b => b.id === booking.id);
    if (existing > -1) bookings[existing] = booking;
    else bookings.push(booking);
    set(KEYS.BOOKINGS, bookings);
  },
  getBarberBookings: (barberId: string) => DB.getBookings().filter(b => b.barberId === barberId),
  getCustomerBookings: (customerId: string) => DB.getBookings().filter(b => b.customerId === customerId),

  // Notifications
  getNotifications: (userId: string) => 
    get<Notification[]>(KEYS.NOTIFICATIONS, []).filter(n => n.userId === userId),
  addNotification: (userId: string, message: string) => {
    const notifications = get<Notification[]>(KEYS.NOTIFICATIONS, []);
    notifications.push({
      id: Math.random().toString(36).substr(2, 9),
      userId,
      message,
      timestamp: Date.now(),
      read: false
    });
    set(KEYS.NOTIFICATIONS, notifications);
  },

  // Ratings
  getRatings: (barberId: string) => get<Rating[]>(KEYS.RATINGS, []).filter(r => r.barberId === barberId),
  addRating: (rating: Rating) => {
    const ratings = get<Rating[]>(KEYS.RATINGS, []);
    ratings.push(rating);
    set(KEYS.RATINGS, ratings);
  },

  // Auth Session
  getCurrentUser: () => get<User | null>(KEYS.SESSION, null),
  setCurrentUser: (user: User | null) => set(KEYS.SESSION, user),
};
