import type { Metadata } from "next";
import { AppProvider } from '@/components/ui/AppProvider';
import "./globals.css";
import '@/styles/application.css';

export const metadata: Metadata = {
  title: { default: 'StayLeb — Lebanese Chalets & Retreats', template: '%s | StayLeb' },
  description: 'Discover verified coastal retreats and mountain chalets across Lebanon.',
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="antialiased"
    >
      <body><AppProvider>{children}</AppProvider></body>
    </html>
  );
}
