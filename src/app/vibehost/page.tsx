import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { VibeHostStatus } from '@/components/vibehost-status';

export default function VibeHostPage() {
  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Ambient Emerald Glow */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-[#070b12]/70 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Logo />
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5 rounded-xl backdrop-blur-md">
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
          <p className="text-sm text-slate-400">
            Quản lý và kiểm tra kết nối API / MCP Server dịch vụ MatBao VibeHost (`https://vibehost.matbao.ai/api/agent/mcp`).
          </p>
        </div>

        <VibeHostStatus />
      </main>
    </div>
  );
}
