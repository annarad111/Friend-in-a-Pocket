import './globals.css';
import type { Metadata } from 'next';
import { DreamyBackground } from '@/components/DreamyBackground/DreamyBackground';

export const metadata: Metadata = {
  title: 'Friend in a Pocket',
  description: 'A reflective AI wellness chat app.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <DreamyBackground />
        {children}
      </body>
    </html>
  );
}