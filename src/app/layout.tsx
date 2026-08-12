import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Trung tâm xử lý vi phạm VUX LAW',
  description: 'Quản lý và theo dõi các khoản phạt và quy định vi phạm.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`dark ${inter.variable}`}>
      <body className={`${inter.className} font-sans bg-[#09090b] text-zinc-100 antialiased selection:bg-emerald-500 selection:text-zinc-950`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
