import type { Metadata } from 'next';
import { Inter, Nunito, Comic_Neue } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const comicNeue = Comic_Neue({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Lenny's Children's Book Generator",
  description:
    'Transform podcast conversations into magical personalized children\'s books. Powered by AI, crafted with love.',
  keywords: [
    'children\'s books',
    'personalized books',
    'AI story generator',
    'kids books',
    'custom books',
    'podcast to book',
  ],
  authors: [{ name: "Lenny's Books" }],
  openGraph: {
    title: "Lenny's Children's Book Generator",
    description: 'Create magical personalized children\'s books from your conversations',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${nunito.variable} ${comicNeue.variable}`}>
      <body className="font-body min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
