export type PropertyStatus = 'Approved' | 'Pending' | 'Action Required';
export interface Property { id: string; name: string; region: string; area: string; image: string; price: number; rating: number; reviews: number; guests: number; bedrooms: number; bathrooms: number; amenities: string[]; status: PropertyStatus; }
export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rejected';
export interface Booking { id: string; propertyId: string; guest: string; checkIn: string; checkOut: string; guests: number; total: number; method: 'Cash' | 'Card'; status: BookingStatus; }
export interface User { id: string; name: string; email: string; role: 'Client' | 'Owner'; status: 'Active' | 'Blocked'; joined: string; }
export interface Review { id: string; propertyId: string; author: string; rating: number; body: string; date: string; status: 'Published' | 'Flagged' | 'Removed'; }
export interface Amenity { id: string; name: string; category: string; active: boolean; }
export interface Settlement { id: string; owner: string; bookingId: string; amount: number; status: 'Outstanding' | 'Settled'; }
