import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Ban, CircleDollarSign, FilePenLine, Trash2, ShieldAlert } from "lucide-react";
import type { Regulation } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RegulationCardProps {
  regulation: Regulation;
  onEdit: () => void;
  onDelete: () => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

export function RegulationCard({ regulation, onEdit, onDelete }: RegulationCardProps) {
  if (!regulation || !regulation.penalty) {
    return null;
  }
  
  const isFine = regulation.penalty.type === 'fine';
  
  return (
    <Card className="flex flex-col bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_8px_32px_0_rgba(16,185,129,0.2)] group rounded-2xl overflow-hidden relative">
      {/* Specular Top Liquid Highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              {regulation.category}
            </span>
            <CardTitle className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors leading-snug">
              {regulation.violation}
            </CardTitle>
          </div>

          <Badge
            variant="outline"
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full shrink-0 ${
              isFine
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/40'
            }`}
          >
            {isFine ? (
              <CircleDollarSign className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Ban className="h-3.5 w-3.5 text-rose-400" />
            )}
            {isFine ? 'Phạt tiền' : 'Hạn chế'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow pt-1 px-5">
        <Separator className="bg-white/5 mb-4" />
        <div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
            Hình Thức Xử Phạt
          </p>
          {isFine ? (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-lime-300 bg-clip-text text-transparent drop-shadow">
                {formatCurrency(regulation.penalty.amount ?? 0)}
              </span>
            </div>
          ) : (
            <p className="text-sm text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-white/5 italic leading-relaxed backdrop-blur-md">
              "{regulation.penalty.details || 'Không có thông tin chi tiết'}"
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 pb-4 px-5 border-t border-white/5 bg-slate-950/40 backdrop-blur-md">
        <div className="flex w-full justify-end gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1.5 rounded-xl"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Xóa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900/90 backdrop-blur-2xl border-white/10 rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-slate-100">Xác nhận xóa quy định?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  Hành động này không thể hoàn tác. Quy định sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-xl">Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl"
                >
                  Xóa Quy Định
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="h-8 text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300 gap-1.5 rounded-xl"
          >
            <FilePenLine className="h-3.5 w-3.5" />
            Sửa
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
