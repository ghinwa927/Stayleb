import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import '../styles/screen-details.css';
import '../styles/application.css';
import '../styles/homepage.css';
import '../styles/responsive.css';
import { InteractionProvider } from '@/components/ui/Interactions';
import { FeedbackProvider } from '@/components/ui/Feedback';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

const inter = localFont({
  src: [
    { path: '../../public/fonts/inter-400.ttf', weight: '400' },
    { path: '../../public/fonts/inter-500.ttf', weight: '500' },
    { path: '../../public/fonts/inter-600.ttf', weight: '600' },
    { path: '../../public/fonts/inter-700.ttf', weight: '700' },
  ],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = { title: { default: 'StayLeb — Authentic stays across Lebanon', template: '%s' }, description: 'Discover Lebanese chalets, coastal villas and mountain guesthouses. Explore and manage your next stay with StayLeb.' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${outfit.variable} ${jakarta.variable} ${inter.variable}`}><body><a className="skip-link" href="#main-content">Skip to content</a><FeedbackProvider><InteractionProvider>{children}</InteractionProvider></FeedbackProvider></body></html>;
}
