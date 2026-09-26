import Link from 'next/link';
import { Mountain, Search, Banknote, MapPin } from 'lucide-react';
const assurances = [
  { icon: Mountain, title: 'Across Lebanon', description: 'Explore coastal stays and mountain getaways.' },
  { icon: Search, title: 'Find Your Fit', description: 'Compare amenities, house rules and stay options.' },
  { icon: Banknote, title: 'Choose How to Pay', description: 'Pay online or request a cash booking for owner approval.' },
  { icon: MapPin, title: 'Discover Somewhere New', description: 'Find a base for your next Lebanese adventure.' },
];
export function Assurances() {
  return <section className="page-container assurances" aria-label="Discover StayLeb">{assurances.map(({ icon: Icon, title, description }) => <article key={title}><span><Icon size={25}/></span><div><h2>{title}</h2><p>{description}</p></div></article>)}</section>;
}
export function Guarantee() {
  return <section id="guarantee" className="page-container guarantee-section"><div className="guarantee"><div className="guarantee-copy"><h2>Plan Your Stay with StayLeb</h2><h3>Coastal weekends. Mountain mornings.</h3><p>Choose a destination, compare properties and find the stay that suits your plans. Review the amenities, house rules and seasonal prices before booking.</p></div><div className="bg-white rounded-xl p-6 space-y-4"><h3 className="text-lg font-semibold">Your next getaway starts here</h3><p className="text-sm text-on-surface-variant">Search with your dates and guest count to explore stays for your trip.</p><Link className="primary-button" href="/search">Explore stays</Link></div></div></section>;
}
