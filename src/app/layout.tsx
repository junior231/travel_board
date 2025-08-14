import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Travel Inspiration Board',
  description:
    'Search destinations, explore stunning photos from Unsplash, and peek at the local weather — all in one place.',
  metadataBase: new URL('https://your-domain.com'), // <-- update after deploy
  openGraph: {
    title: 'Travel Inspiration Board',
    description:
      'Search destinations, explore stunning photos from Unsplash, and check local weather.',
    url: 'https://your-domain.com',
    siteName: 'Travel Inspiration Board',
    images: [
      { url: '/og.png', width: 1200, height: 630, alt: 'Travel Inspiration Board' },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Inspiration Board',
    description:
      'Search destinations, explore stunning photos from Unsplash, and check local weather.',
    images: ['/og.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
