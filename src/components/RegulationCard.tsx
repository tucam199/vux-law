import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Ban, CircleDollarSign, FilePenLine, Trash2, Tag } from "lucide-react";
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
    <Card className="odoo-kanban-card group">
      <CardHeader className="p-0 pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#017e84] bg-[#017e84]/10 border border-[#017e84]/20 px-2 py-0.5 rounded">
              <Tag className="w-3 h-3" />
              {regulation.category}
            </span>
            <CardTitle className="text-base font-bold text-zinc-100 group-hover:text-white leading-snug pt-1">
              {regulation.violation}
            </CardTitle>
          </div>

          <Badge
            variant="outline"
            className={`flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded shrink-0 border ${
              isFine
                ? 'bg-[#28a745]/15 text-[#28a745] border-[#28a745]/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}
          >
            {isFine ? (
              <CircleDollarSign className="h-3.5 w-3.5" />
            ) : (
              <Ban className="h-3.5 w-3.5" />
            )}
            {isFine ? 'Phạt tiền' : 'Hạn chế'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0 py-2 flex-grow">
        <Separator className="bg-[#32323d] mb-3" />
        <div>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-1">
            HÌNH THỨC XỬ PHẠT ODOO
          </p>
          {isFine ? (
            <span className="text-xl font-bold text-[#28a745]">
              {formatCurrency(regulation.penalty.amount ?? 0)}
            </span>
          ) : (
            <p className="text-xs text-zinc-300 bg-[#1e1e24] p-2.5 rounded border border-[#32323d] italic leading-relaxed">
              "{regulation.penalty.details || 'Không có chi tiết'}"
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-0 pt-3 border-t border-[#32323d] flex justify-end gap-1.5">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 rounded"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Xóa
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#25252d] border-[#32323d] rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-zinc-100">Xác nhận xóa quy định?</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400 text-xs">
                Hành động này sẽ xóa quy định khỏi hệ thống Odoo ERP.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-[#1e1e24] text-zinc-200 hover:bg-zinc-800 border-[#32323d] text-xs h-8">Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-8"
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
          className="h-7 text-xs text-zinc-200 border-[#32323d] hover:bg-[#32323d] px-2 rounded"
        >
          <FilePenLine className="h-3.5 w-3.5 mr-1 text-[#017e84]" />
          Sửa
        </Button>
      </CardFooter>
    </Card>
  );
}
