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
import { Ban, CircleDollarSign, SearchX, Trash2, CheckCircle2 } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 py-24 text-center">
        <div className="mb-4 p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-500">
          <SearchX className="h-10 w-10 text-indigo-400/50" />
        </div>
        <h3 className="text-lg font-bold text-slate-200">Không tìm thấy bản ghi vi phạm nào</h3>
        <p className="mt-1 text-sm text-slate-400 max-w-sm">
          Hãy thử từ khóa tìm kiếm khác hoặc thay đổi bộ lọc thời gian/nhân sự.
        </p>
      </div>
    );
  }

  const validPenalties = penalties.filter(p => p.regulation && p.regulation.penalty);

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 backdrop-blur-md shadow-xl">
      <Table>
        <TableHeader className="bg-slate-950/80">
          <TableRow className="border-b border-slate-800 hover:bg-transparent">
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[60px] text-xs font-semibold uppercase text-slate-400">STT</TableHead>
            <TableHead className="text-xs font-semibold uppercase text-slate-400">Người Vi Phạm</TableHead>
            <TableHead className="text-xs font-semibold uppercase text-slate-400">Ngày</TableHead>
            <TableHead className="text-xs font-semibold uppercase text-slate-400">Hạng Mục</TableHead>
            <TableHead className="text-xs font-semibold uppercase text-slate-400">Chi Tiết Vi Phạm</TableHead>
            <TableHead className="text-xs font-semibold uppercase text-slate-400">Loại Phạt</TableHead>
            <TableHead className="text-xs font-semibold uppercase text-slate-400">Mức Phạt</TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase text-slate-400">Hành Động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {validPenalties.map((penalty, index) => {
            const isCompleted = penalty.isCompleted;
            const isFine = penalty.regulation.penalty.type === "fine";

            return (
              <TableRow
                key={penalty.id}
                className={`border-b border-slate-800/60 transition-colors ${
                  isCompleted ? "bg-slate-950/50 text-slate-400" : "hover:bg-slate-800/40 text-slate-200"
                }`}
              >
                <TableCell>
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(checked) => onToggleComplete(penalty.id, !!checked)}
                    className="border-slate-700 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    aria-label="Đánh dấu hoàn thành"
                  />
                </TableCell>
                <TableCell className={`text-xs ${isCompleted ? "line-through opacity-60" : ""}`}>
                  {index + 1}
                </TableCell>
                <TableCell className={`font-semibold ${isCompleted ? "line-through opacity-60 text-slate-400" : "text-slate-100"}`}>
                  {penalty.personName}
                </TableCell>
                <TableCell className={`text-xs text-slate-400 ${isCompleted ? "line-through opacity-60" : ""}`}>
                  {formatDate(penalty.date)}
                </TableCell>
                <TableCell className={`text-xs font-medium text-indigo-400 ${isCompleted ? "line-through opacity-60" : ""}`}>
                  {penalty.regulation.category}
                </TableCell>
                <TableCell className={isCompleted ? "line-through opacity-60" : ""}>
                  <p className="font-semibold text-sm text-slate-100">{penalty.regulation.violation}</p>
                  {penalty.notes && <p className="text-xs text-slate-400 mt-0.5">{penalty.notes}</p>}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`whitespace-nowrap text-xs font-medium px-2 py-0.5 rounded-full ${
                      isFine
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
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
                <TableCell className={`font-semibold ${isCompleted ? "line-through opacity-60" : ""}`}>
                  {isFine ? (
                    <span className="text-emerald-400">
                      {formatCurrency(penalty.regulation.penalty.amount ?? 0)}
                    </span>
                  ) : (
                    <span className="text-xs italic text-slate-300">
                      "{penalty.regulation.penalty.details || 'Hạn chế'}"
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-100">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa bản ghi vi phạm?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                          Hành động này không thể hoàn tác. Bản ghi vi phạm sẽ bị xóa khỏi cơ sở dữ liệu.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-800 text-slate-200">Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(penalty.id)}
                          className="bg-rose-600 hover:bg-rose-700 text-white"
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
