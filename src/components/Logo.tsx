import Link from 'next/link';
import { Grid3X3, Scale } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group hover:opacity-90">
      {/* Odoo App Switcher Matrix Icon in Characteristic Odoo Purple #714B67 */}
      <div className="w-8 h-8 rounded bg-[#714B67] text-white flex items-center justify-center shadow-xs border border-[#5f3e56]">
        <Grid3X3 className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight text-[#212529] flex items-center gap-1">
            <Scale className="w-4 h-4 text-[#714B67]" />
            VUX Law
          </span>
          <span className="text-[10px] font-semibold bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20 px-1.5 py-0.2 rounded uppercase">
            ERP
          </span>
        </div>
        <span className="text-[10px] font-medium text-[#6C757D] -mt-0.5">
          Quy Định & Xử Phạt
        </span>
      </div>
    </Link>
  );
}
