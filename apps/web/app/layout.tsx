import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pranora · প্রাণোরা',
  description: 'আপনার পোষা প্রাণীর সম্পূর্ণ যত্ন, এক জায়গায়।',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}

