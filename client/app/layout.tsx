import './globals.css';
import type { Metadata, Viewport } from 'next';
import { DreamyBackground } from '@/components/DreamyBackground/DreamyBackground';
import { PwaRegistration } from '@/components/PwaRegistration/PwaRegistration';

export const metadata: Metadata = {
  title: 'Friend in a Pocket',
  description: 'A reflective AI wellness chat app.',
  applicationName: 'Friend in a Pocket',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Friend in a Pocket',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#7c5cff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PwaRegistration />
        <DreamyBackground />
        {children}
      </body>
    </html>
  );
}