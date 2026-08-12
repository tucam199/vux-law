import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { VibeHostStatus } from '@/components/vibehost-status';

export default function VibeHostPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-emerald-500 selection:text-zinc-950 font-sans">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-[#09090b]/80 backdrop-blur-2xl border-b border-zinc-800/80">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Logo />
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2 border-zinc-800 hover:bg-zinc-900 rounded-xl text-zinc-200">
                <ArrowLeft className="w-4 h-4 text-emerald-400" />
                Quay lại Trang Chủ
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 lg:px-8 py-10 max-w-5xl space-y-8 relative z-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white">VibeHost MCP Integration</h1>
          <p className="text-sm text-zinc-400">
            Quản lý và kiểm tra kết nối API / MCP Server dịch vụ MatBao VibeHost (`https://vibehost.matbao.ai/api/agent/mcp`).
          </p>
        </div>

        <VibeHostStatus />
      </main>
    </div>
  );
}
