import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Waelio Admin',
  description: 'Admin panel for Waelio Marketing',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
