import type { ViolationRecord } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Ban, CircleDollarSign, SearchX, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
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
import { Checkbox } from "./ui/checkbox";

interface PenaltyListProps {
  penalties: ViolationRecord[];
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
}

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString('vi-VN');
  } catch (e) {
    return "Ngày không hợp lệ";
  }
}

export function PenaltyList({ penalties, onDelete, onToggleComplete }: PenaltyListProps) {
  if (penalties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#32323d] bg-[#25252d] py-20 text-center space-y-2">
        <SearchX className="h-8 w-8 text-zinc-500" />
        <h3 className="text-base font-bold text-zinc-200">Không tìm thấy bản ghi vi phạm nào trong Odoo</h3>
        <p className="text-xs text-zinc-400 max-w-xs">
          Thử thay đổi từ khóa tìm kiếm hoặc lọc theo mốc thời gian/nhân sự.
        </p>
      </div>
    );
  }

  const validPenalties = penalties.filter(p => p.regulation && p.regulation.penalty);

  return (
    <div className="border border-[#32323d] rounded-lg overflow-hidden bg-[#25252d] shadow-sm">
      <Table>
        <TableHeader className="bg-[#1e1e24]">
          <TableRow className="border-b border-[#32323d] hover:bg-transparent">
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="w-[50px] text-[11px] font-bold uppercase text-zinc-400">STT</TableHead>
            <TableHead className="text-[11px] font-bold uppercase text-zinc-400">NGƯỜI VI PHẠM</TableHead>
            <TableHead className="text-[11px] font-bold uppercase text-zinc-400">NGÀY GHI NHẬN</TableHead>
            <TableHead className="text-[11px] font-bold uppercase text-zinc-400">HẠNG MỤC ODOO</TableHead>
            <TableHead className="text-[11px] font-bold uppercase text-zinc-400">CHI TIẾT VI PHẠM</TableHead>
            <TableHead className="text-[11px] font-bold uppercase text-zinc-400">LOẠI PHẠT</TableHead>
            <TableHead className="text-[11px] font-bold uppercase text-zinc-400">MỨC PHẠT</TableHead>
            <TableHead className="text-[11px] font-bold uppercase text-zinc-400">TRẠNG THÁI</TableHead>
            <TableHead className="text-right text-[11px] font-bold uppercase text-zinc-400">THAO TÁC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {validPenalties.map((penalty, index) => {
            const isCompleted = penalty.isCompleted;
            const isFine = penalty.regulation.penalty.type === "fine";

            return (
              <TableRow
                key={penalty.id}
                className={`border-b border-[#32323d] transition-colors ${
                  isCompleted ? "bg-[#1e1e24]/60 text-zinc-500" : "hover:bg-[#2e2e38] text-zinc-200"
                }`}
              >
                <TableCell className="p-2">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(checked) => onToggleComplete(penalty.id, !!checked)}
                    className="border-zinc-600 data-[state=checked]:bg-[#28a745] data-[state=checked]:border-[#28a745]"
                    aria-label="Đánh dấu hoàn thành"
                  />
                </TableCell>
                <TableCell className={`text-xs ${isCompleted ? "line-through opacity-60" : ""}`}>
                  {index + 1}
                </TableCell>
                <TableCell className={`font-semibold text-xs ${isCompleted ? "line-through opacity-60 text-zinc-500" : "text-zinc-100"}`}>
                  {penalty.personName}
                </TableCell>
                <TableCell className={`text-xs text-zinc-400 ${isCompleted ? "line-through opacity-60" : ""}`}>
                  {formatDate(penalty.date)}
                </TableCell>
                <TableCell className={`text-xs font-semibold text-[#017e84] ${isCompleted ? "line-through opacity-60" : ""}`}>
                  {penalty.regulation.category}
                </TableCell>
                <TableCell className={isCompleted ? "line-through opacity-60" : ""}>
                  <p className="font-semibold text-xs text-zinc-100">{penalty.regulation.violation}</p>
                  {penalty.notes && <p className="text-[11px] text-zinc-400 mt-0.5">{penalty.notes}</p>}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`whitespace-nowrap text-[11px] font-semibold px-2 py-0.5 rounded ${
                      isFine
                        ? "bg-[#28a745]/15 text-[#28a745] border-[#28a745]/30"
                        : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                    } ${isCompleted ? "opacity-50" : ""}`}
                  >
                    {isFine ? (
                      <CircleDollarSign className="h-3 w-3 mr-1" />
                    ) : (
                      <Ban className="h-3 w-3 mr-1" />
                    )}
                    {isFine ? "Phạt tiền" : "Hạn chế"}
                  </Badge>
                </TableCell>
                <TableCell className={`font-semibold text-xs ${isCompleted ? "line-through opacity-60" : ""}`}>
                  {isFine ? (
                    <span className="text-[#28a745] font-bold">
                      {formatCurrency(penalty.regulation.penalty.amount ?? 0)}
                    </span>
                  ) : (
                    <span className="text-xs italic text-zinc-300">
                      "{penalty.regulation.penalty.details || 'Hạn chế'}"
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                    isCompleted
                      ? "bg-[#28a745]/20 text-[#28a745] border border-[#28a745]/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}>
                    {isCompleted ? "Đã nộp phạt" : "Chờ xử lý"}
                  </span>
                </TableCell>
                <TableCell className="text-right p-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#25252d] border-[#32323d] text-zinc-100 rounded-lg">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm font-bold">Xác nhận xóa bản ghi vi phạm?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400 text-xs">
                          Hành động này sẽ xóa bản ghi khỏi CSDL Odoo.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-[#1e1e24] text-zinc-200 border-[#32323d] text-xs h-8">Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(penalty.id)}
                          className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-8"
                        >
                          Xóa Bản Ghi
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
