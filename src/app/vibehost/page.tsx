import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { VibeHostStatus } from '@/components/vibehost-status';

export default function VibeHostPage() {
  return (
    <div className="min-h-screen bg-[#1e1e24] text-zinc-100 font-sans">
      {/* Odoo Top Navbar */}
      <header className="bg-[#18181c] border-b border-[#32323d] sticky top-0 z-30">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex h-14 items-center justify-between">
            <Logo />
            <Link href="/">
              <Button variant="ghost" size="sm" className="h-8 text-xs text-zinc-300 hover:text-white hover:bg-[#25252d]">
                <ArrowLeft className="w-3.5 h-3.5 mr-1 text-[#017e84]" />
                Quay lại Trang Chủ
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Odoo Control Panel Bar */}
      <div className="bg-[#25252d] border-b border-[#32323d] shadow-sm sticky top-14 z-20">
        <div className="container mx-auto px-4 lg:px-6 py-3">
          <div className="flex items-center text-sm font-medium text-zinc-300 gap-1.5">
            <span className="text-[#017e84] font-bold">Kỹ thuật</span>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
            <span className="text-zinc-100 font-semibold">VibeHost MCP Integration</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-6 py-6 max-w-5xl space-y-6">
        <VibeHostStatus />
      </main>
    </div>
  );
}
