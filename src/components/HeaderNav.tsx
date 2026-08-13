"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { FileText, ClipboardList, Server } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderNavProps {
  pendingPenaltiesCount?: number;
}

export function HeaderNav({ pendingPenaltiesCount = 0 }: HeaderNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Khung Quy Định',
      href: '/',
      icon: FileText,
      active: pathname === '/',
    },
    {
      label: 'Nhật Ký Vi Phạm',
      href: '/penalties',
      icon: ClipboardList,
      active: pathname === '/penalties',
      badge: pendingPenaltiesCount > 0 ? pendingPenaltiesCount : undefined,
    },
    {
      label: 'VibeHost Technical',
      href: '/vibehost',
      icon: Server,
      active: pathname === '/vibehost',
    },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#DEE2E6] sticky top-0 z-30 shadow-xs">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-13 items-center justify-between gap-4 py-1.5">
          <Logo />

          {/* Odoo Enterprise Module Nav Tabs with UI Layouts Pill & Glow */}
          <nav className="flex items-center gap-2 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.href}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="relative"
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap relative ${
                      item.active
                        ? 'bg-[#714B67] text-white shadow-sm ring-1 ring-[#714B67]/40'
                        : 'text-[#212529] hover:bg-zinc-100/80 hover:text-[#714B67]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.active ? 'text-white' : 'text-[#714B67]'}`} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <motion.span
                        initial={{ scale: 0.7 }}
                        animate={{ scale: 1 }}
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-xs ${
                          item.active
                            ? 'bg-amber-400 text-zinc-900 font-extrabold'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
