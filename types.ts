
export type Role = 'BARBER' | 'CUSTOMER';

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  role: Role;
  city?: string; // Barber only
  experience?: number; // Barber only
  bio?: string; // Barber only
  profilePicture?: string;
  isAvailable?: boolean; // Barber only
  salonId?: string; // Barber only
  isSalonOwner?: boolean; // Barber only
  password?: string; // Only for local storage simulation
}

export interface Salon {
  id: string;
  name: string;
  ownerId: string;
  region: string;
  image?: string;
  barberIds: string[];
  pendingBarberIds: string[];
}

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface Booking {
  id: string;
  barberId: string;
  customerId: string;
  date: string; // ISO string for the day
  timeSlot: string; // e.g., "09:30"
  status: BookingStatus;
  customerName: string;
  rating?: number;
  review?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface Rating {
  id: string;
  barberId: string;
  customerId: string;
  stars: number;
  comment: string;
  bookingId: string;
}
