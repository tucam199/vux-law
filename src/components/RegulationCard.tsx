import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Ban, CircleDollarSign, Zap, Trash2, Tag, FilePenLine } from "lucide-react";
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
  onQuickPenalty?: (regulation: Regulation) => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

export function RegulationCard({ regulation, onEdit, onDelete, onQuickPenalty }: RegulationCardProps) {
  if (!regulation || !regulation.penalty) {
    return null;
  }
  
  const isFine = regulation.penalty.type === 'fine';
  
  return (
    <Card className="odoo-kanban-card pl-5">
      {/* Clean Left Vertical Accent Stripe */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          isFine ? 'bg-[#017E84]' : 'bg-[#714B67]'
        }`}
      />

      <CardHeader className="p-0 pb-2.5">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#017E84] bg-[#017E84]/10 border border-[#017E84]/20 px-2 py-0.5 rounded">
              <Tag className="w-3 h-3" />
              {regulation.category}
            </span>
            <CardTitle className="text-sm font-bold text-[#212529] leading-snug pt-1">
              {regulation.violation}
            </CardTitle>
          </div>

          <Badge
            variant="outline"
            className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded shrink-0 border ${
              isFine
                ? 'bg-[#28A745]/10 text-[#28A745] border-[#28A745]/30'
                : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
            }`}
          >
            {isFine ? (
              <CircleDollarSign className="h-3 w-3" />
            ) : (
              <Ban className="h-3 w-3" />
            )}
            {isFine ? 'Phạt tiền' : 'Hạn chế'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0 py-2.5 flex-grow">
        <Separator className="bg-[#E5E7EB] mb-2.5" />
        <div className="space-y-1">
          <span className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-wider">
            MỨC XỬ PHẠT
          </span>
          {isFine ? (
            <div className="text-lg font-bold text-[#212529] leading-tight">
              {formatCurrency(regulation.penalty.amount ?? 0)}
            </div>
          ) : (
            <p className="text-xs text-[#212529] bg-[#F8F9FA] p-2.5 rounded border border-[#DEE2E6] italic leading-relaxed">
              "{regulation.penalty.details || 'Không có chi tiết'}"
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-0 pt-3 border-t border-[#E5E7EB] flex justify-between items-center gap-2">
        <div className="flex items-center gap-1.5">
          {/* Quick Action: ⚡ Phạt Nhanh Button */}
          {onQuickPenalty && (
            <button
              onClick={() => onQuickPenalty(regulation)}
              className="btn-odoo-green text-[11px] py-1 px-2 font-bold flex items-center gap-1"
              title="Ghi nhận vi phạm nhanh cho nhân sự với quy định này"
            >
              <Zap className="w-3 h-3 fill-current text-amber-300" />
              Phạt Nhanh
            </button>
          )}

          <button
            onClick={onEdit}
            className="btn-odoo-purple text-[11px] py-1 px-2 font-semibold"
          >
            Sửa
          </button>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-1.5 rounded"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white border-[#DEE2E6] rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#212529] font-bold text-sm">Xác nhận xóa quy định?</AlertDialogTitle>
              <AlertDialogDescription className="text-[#6C757D] text-xs">
                Hành động này sẽ xóa quy định khỏi CSDL Odoo ERP.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-zinc-100 text-[#212529] hover:bg-zinc-200 border-[#DEE2E6] text-xs h-8">Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-8"
              >
                Xóa Quy Định
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
