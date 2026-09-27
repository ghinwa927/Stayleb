export type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
export interface Property {
  id: string;
  name: string;
  location: string;
  nightlyRate: number;
  guests: number;
  bedrooms: number;
  rating: number;
  amenities: string[];
  image: string;
}
export interface Booking {
  id: string;
  propertyId: string;
  guest: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  total: number;
  status: BookingStatus;
  paymentMethod: 'Card' | 'Cash';
}
export interface Review {
  id: string;
  propertyId: string;
  guest: string;
  rating: number;
  comment: string;
  date: string;
}
