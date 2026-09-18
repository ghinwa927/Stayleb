import type { Booking, User, Review, Amenity, Settlement } from '@/lib/types';
export const bookings: Booking[] = [
  { id: 'STL-2026-0925', propertyId: 'azure-coast', guest: 'Rami Khoury', checkIn: '2026-09-25', checkOut: '2026-09-28', guests: 4, total: 385, method: 'Cash', status: 'Pending' },
  { id: 'STL-2026-1002', propertyId: 'batroun-sunset', guest: 'Maya Nasser', checkIn: '2026-10-02', checkOut: '2026-10-05', guests: 6, total: 505, method: 'Card', status: 'Confirmed' },
  { id: 'STL-2026-0812', propertyId: 'cedars-summit', guest: 'Jad Azar', checkIn: '2026-08-12', checkOut: '2026-08-15', guests: 4, total: 580, method: 'Card', status: 'Completed' },
  { id: 'STL-2026-0901', propertyId: 'saida-heritage', guest: 'Lina Saab', checkIn: '2026-09-01', checkOut: '2026-09-03', guests: 2, total: 215, method: 'Cash', status: 'Cancelled' },
];
export const users: User[] = [
  { id: 'tarek-haddad', name: 'Tarek Haddad', email: 'tarek.haddad@example.com', role: 'Owner', status: 'Active', joined: '2025-02-14' },
  { id: 'rami-khoury', name: 'Rami Khoury', email: 'rami.khoury@example.com', role: 'Client', status: 'Active', joined: '2025-04-20' },
  { id: 'maya-nasser', name: 'Maya Nasser', email: 'maya.nasser@example.com', role: 'Client', status: 'Active', joined: '2025-06-12' },
  { id: 'jad-azar', name: 'Jad Azar', email: 'jad.azar@example.com', role: 'Owner', status: 'Blocked', joined: '2024-11-08' },
];
export const reviews: Review[] = [{ id: 'REV-104', propertyId: 'azure-coast', author: 'Rami Khoury', rating: 5, body: 'A wonderful seaside stay. The solar power and Wi-Fi worked perfectly, and Tarek was an excellent host.', date: '2026-09-10', status: 'Published' }];
export const amenities: Amenity[] = [{ id: 'AMN-104', name: '24/7 Solar Power', category: 'Infrastructure & Energy', active: true }, { id: 'AMN-105', name: 'Private Pool', category: 'Leisure & Outdoors', active: true }, { id: 'AMN-106', name: 'Indoor Fireplace', category: 'Comfort & Utilities', active: true }];
export const settlements: Settlement[] = [{ id: 'SET-0925', owner: 'Tarek Haddad', bookingId: 'STL-2026-0925', amount: 38.5, status: 'Outstanding' }];
export const rules: Amenity[] = [{ id: 'RULE-101', name: 'No indoor smoking', category: 'Guest Conduct', active: true }, { id: 'RULE-102', name: 'No parties or events', category: 'Guest Conduct', active: true }, { id: 'RULE-103', name: 'Quiet hours after 10 PM', category: 'Quiet Hours & Noise', active: true }, { id: 'RULE-104', name: 'Guest ID at check-in', category: 'Safety & Legal', active: true }, { id: 'RULE-105', name: 'No pets', category: 'Guest Conduct', active: false }];
