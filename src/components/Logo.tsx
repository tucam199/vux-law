import Link from 'next/link';
import { Grid3X3, Scale } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group hover:opacity-90">
      {/* Design System Primary CTA Green Logo Icon */}
      <div className="w-8 h-8 rounded-sm bg-[#7FCA27] text-white flex items-center justify-center border border-[#6BB01F]">
        <Grid3X3 className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight text-[#1F1F1F] flex items-center gap-1">
            <Scale className="w-4 h-4 text-[#1E74E8]" />
            VUX Law
          </span>
          <span className="badge-ds-info text-[10px] font-bold px-1.5 py-0.2 uppercase">
            ERP
          </span>
        </div>
        <span className="text-[11px] font-medium text-[#6B6B6B] -mt-0.5">
          Quy Định & Xử Phạt
        </span>
      </div>
    </Link>
  );
}

