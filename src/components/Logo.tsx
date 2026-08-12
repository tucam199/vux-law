import Link from 'next/link';
import { Scale } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-[1.02] duration-300">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-lime-400 p-[1.5px] shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all">
        <div className="w-full h-full bg-slate-950/90 backdrop-blur-md rounded-[14px] flex items-center justify-center">
          <Scale className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-lime-300 bg-clip-text text-transparent drop-shadow-sm">
          VUX LAW
        </span>
        <span className="text-[10px] font-bold tracking-widest text-emerald-400/70 uppercase -mt-1">
          Visual User Experience
        </span>
      </div>
    </Link>
  );
}
