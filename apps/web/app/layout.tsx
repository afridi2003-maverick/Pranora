import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from '../hooks/useSession';
import { ToastProvider } from '../components/ToastProvider';

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
    <html lang="bn" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <ToastProvider>{children as any}</ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
