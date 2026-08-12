import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { VibeHostStatus } from '@/components/vibehost-status';

export default function VibeHostPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Logo />
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Quay lại Trang Chủ
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-8 py-10 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">VibeHost MCP Integration</h1>
          <p className="mt-2 text-muted-foreground">
            Quản lý và kiểm tra kết nối API / MCP Server dịch vụ MatBao VibeHost (`https://vibehost.matbao.ai/api/agent/mcp`).
          </p>
        </div>

        <VibeHostStatus />
      </main>
    </div>
  );
}
