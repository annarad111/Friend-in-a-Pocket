import './globals.css';
import type { Metadata, Viewport } from 'next';
import { DreamyBackground } from '@/components/DreamyBackground/DreamyBackground';

export const metadata: Metadata = {
  title: 'Friend in a Pocket',
  description: 'A reflective AI wellness chat app.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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