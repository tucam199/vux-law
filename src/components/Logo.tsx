import Link from 'next/link';
import { Grid3X3, Scale } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group hover:opacity-90">
      {/* Notion Monochrome Logo Matrix Icon */}
      <div className="w-8 h-8 rounded bg-[#2F3438] text-white flex items-center justify-center shadow-2xs border border-[#191919]">
        <Grid3X3 className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight text-[#2F3438] flex items-center gap-1">
            <Scale className="w-4 h-4 text-[#2F3438]" />
            VUX Law
          </span>
          <span className="text-[10px] font-bold bg-[#F0F0EF] text-[#2F3438] border border-[#E0E0DE] px-1.5 py-0.2 rounded uppercase">
            ERP
          </span>
        </div>
        <span className="text-[10px] font-medium text-[#787774] -mt-0.5">
          Quy Định & Xử Phạt
        </span>
      </div>
    </Link>
  );
}

