import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="flex flex-col bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 group rounded-xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              {regulation.category}
            </span>
            <CardTitle className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">
              {regulation.violation}
            </CardTitle>
          </div>

          <Badge
            variant="outline"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full shrink-0 ${
              isFine
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
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

      <CardContent className="flex-grow pt-1">
        <Separator className="bg-slate-800/80 mb-4" />
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Hình Thức Xử Phạt
          </p>
          {isFine ? (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                {formatCurrency(regulation.penalty.amount ?? 0)}
              </span>
            </div>
          ) : (
            <p className="text-sm text-slate-200 bg-slate-950/50 p-3 rounded-lg border border-slate-800/60 italic leading-relaxed">
              "{regulation.penalty.details || 'Không có thông tin chi tiết'}"
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-4 border-t border-slate-800/50 bg-slate-950/20">
        <div className="flex w-full justify-end gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Xóa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-800">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-slate-100">Xác nhận xóa quy định?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  Hành động này không thể hoàn tác. Quy định sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-800 text-slate-200 hover:bg-slate-700">Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
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
            className="h-8 text-xs text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-300 gap-1.5"
          >
            <FilePenLine className="h-3.5 w-3.5" />
            Sửa
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
