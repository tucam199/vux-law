import Link from 'next/link';
import { Scale } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-[1.02]">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500 p-0.5 shadow-md shadow-indigo-500/20">
        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
          <Scale className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
          VUX LAW
        </span>
        <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase -mt-0.5">
          Quy Định & Xử Phạt
        </span>
      </div>
    </Link>
  );
}
