import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { VibeHostStatus } from '@/components/vibehost-status';

export default function VibeHostPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529] font-sans">
      {/* Odoo Top Navbar */}
      <header className="bg-white border-b border-[#DEE2E6] sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex h-12 items-center justify-between">
            <Logo />
            <Link href="/">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-[#212529] hover:bg-zinc-100">
                <ArrowLeft className="w-3.5 h-3.5 mr-1 text-[#017E84]" />
                Quay lại Trang Chủ
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Odoo Control Panel Bar */}
      <div className="bg-white border-b border-[#DEE2E6] shadow-sm sticky top-12 z-20">
        <div className="container mx-auto px-4 lg:px-6 py-2.5">
          <div className="flex items-center text-xs font-semibold text-[#212529] gap-1">
            <span className="text-[#017E84] font-bold">Kỹ thuật</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#6C757D]" />
            <span className="text-[#212529]">VibeHost MCP Integration</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-6 py-5 max-w-5xl space-y-5">
        <VibeHostStatus />
      </main>
    </div>
  );
}
