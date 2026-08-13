import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { HeaderNav } from '@/components/HeaderNav';
import { VibeHostStatus } from '@/components/vibehost-status';

export default function VibeHostPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main,#FAFAFA)] text-[var(--text-primary,#2F3438)] font-sans">
      {/* Unified Notion Header Bar */}
      <HeaderNav />

      {/* Notion Control Panel Bar */}
      <div className="bg-white border-b border-[#E9E9E7] shadow-2xs sticky top-12 z-20">
        <div className="container mx-auto px-4 lg:px-6 py-2.5">
          <div className="flex items-center text-xs font-semibold text-[#2F3438] gap-1">
            <span className="text-[#2F3438] font-bold">Kỹ thuật</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#787774]" />
            <span className="text-[#2F3438]">VibeHost MCP Integration</span>
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
