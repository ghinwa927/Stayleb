import type { Property, Booking, Review } from '@/lib/types';
export const properties: Property[] = [
 { id:'cedar-peak',name:'Cedar Peak Stone Chalet',location:'Faraya Mzaar, Mount Lebanon',nightlyRate:220,guests:6,bedrooms:3,rating:4.98,amenities:['24/7 power','Wi-Fi','Fireplace','Heated Jacuzzi','Mountain view'],image:'/images/e8899428208cea05.jpg' },
 { id:'batroun-sunset',name:'Batroun Sunset Seaside Villa',location:'Batroun, North Lebanon',nightlyRate:275,guests:8,bedrooms:4,rating:4.94,amenities:['Sea view','Private pool','Wi-Fi','24/7 power'],image:'/images/c331cbbd0aed5d63.jpg' },
 { id:'chouf-heritage',name:'Chouf Heritage Guesthouse',location:'Deir el Qamar, Chouf',nightlyRate:140,guests:4,bedrooms:2,rating:4.96,amenities:['Courtyard','Breakfast','Wi-Fi','Mountain view'],image:'/images/d4f8855b10361ee0.jpg' },
];
export const bookings: Booking[] = [
 {id:'stay-001',propertyId:'cedar-peak',guest:'Maya Haddad',checkIn:'2026-09-25',checkOut:'2026-09-28',guests:4,total:740,status:'Confirmed',paymentMethod:'Card'},
 {id:'stay-002',propertyId:'batroun-sunset',guest:'Maya Haddad',checkIn:'2026-10-12',checkOut:'2026-10-15',guests:4,total:865,status:'Pending',paymentMethod:'Cash'},
 {id:'stay-003',propertyId:'chouf-heritage',guest:'Nour Khoury',checkIn:'2026-08-10',checkOut:'2026-08-13',guests:2,total:460,status:'Completed',paymentMethod:'Card'},
];
export const reviews: Review[] = [{id:'review-001',propertyId:'batroun-sunset',guest:'Maya Haddad',rating:5,comment:'Beautiful stone architecture, thoughtful hosts, and unforgettable sunsets over the Mediterranean.',date:'2026-09-12'}];
export function getProperty(id: string) { return properties.find(property=>property.id===id) ?? properties[0]; }
