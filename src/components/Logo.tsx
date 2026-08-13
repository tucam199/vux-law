import Link from 'next/link';
import { Grid3X3, Scale } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 group transition-transform hover:opacity-90">
      {/* Odoo App Switcher Matrix Menu Icon */}
      <div className="w-9 h-9 rounded-lg bg-[#714B67] hover:bg-[#5f3e56] text-white flex items-center justify-center shadow-sm transition-colors border border-[#85587a]">
        <Grid3X3 className="w-5 h-5 text-white/90 group-hover:rotate-90 transition-transform duration-300" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-[#017e84]" />
            VUX Law
          </span>
          <span className="text-[10px] font-semibold bg-[#714B67]/20 text-[#017e84] border border-[#017e84]/30 px-1.5 py-0.5 rounded uppercase">
            Enterprise
          </span>
        </div>
        <span className="text-[10px] font-medium tracking-wide text-zinc-400 -mt-0.5">
          Quy Định & Xử Phạt ERP
        </span>
      </div>
    </Link>
  );
}
