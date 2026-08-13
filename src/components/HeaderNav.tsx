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
    <header className="bg-white border-b border-[#E0E0E0] sticky top-0 z-[100]">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-14 items-center justify-between gap-4 py-2">
          <Logo />

          {/* Design System Module Nav Tabs */}
          <nav className="flex items-center gap-2 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.href}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative"
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-sm transition-all whitespace-nowrap relative ${
                      item.active
                        ? 'bg-[#EAF2FD] text-[#1E74E8] border border-[#1E74E8]'
                        : 'text-[#1F1F1F] hover:bg-[#F8F8F8] hover:text-[#185EC0]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${item.active ? 'text-[#1E74E8]' : 'text-[#6B6B6B]'}`} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <motion.span
                        initial={{ scale: 0.7 }}
                        animate={{ scale: 1 }}
                        className="badge-ds-warning text-[10px] font-bold px-1.5 py-0.2 rounded-full"
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
