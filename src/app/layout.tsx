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
  title: 'Trung tâm xử lý vi phạm VUX LAW ERP',
  description: 'Hệ thống quản lý quy định và xử phạt chuẩn Odoo ERP.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`light ${inter.variable}`}>
      <body className={`${inter.className} font-sans bg-[#F8F9FA] text-[#212529] antialiased selection:bg-[#017E84] selection:text-white`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
