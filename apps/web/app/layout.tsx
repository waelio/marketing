import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Wælio Marketing',
    description: 'Advertising network for independent publishers and advertisers.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
