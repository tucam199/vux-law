import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { HeaderNav } from '@/components/HeaderNav';
import { VibeHostStatus } from '@/components/vibehost-status';

export default function VibeHostPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529] font-sans">
      {/* Unified Odoo Header Bar */}
      <HeaderNav />

      {/* Odoo Control Panel Bar */}
      <div className="bg-white border-b border-[#DEE2E6] shadow-xs sticky top-12 z-20">
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
