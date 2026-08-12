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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 py-24 text-center">
        <div className="mb-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500">
          <SearchX className="h-10 w-10 text-emerald-400/50" />
        </div>
        <h3 className="text-lg font-bold text-zinc-200">Không tìm thấy bản ghi vi phạm nào</h3>
        <p className="mt-1 text-sm text-zinc-400 max-w-sm">
          Hãy thử từ khóa tìm kiếm khác hoặc thay đổi bộ lọc thời gian/nhân sự.
        </p>
      </div>
    );
  }

  const validPenalties = penalties.filter(p => p.regulation && p.regulation.penalty);

  return (
    <div className="border border-zinc-800/80 rounded-2xl overflow-hidden bg-zinc-900/60 backdrop-blur-xl shadow-xl">
      <Table>
        <TableHeader className="bg-zinc-950">
          <TableRow className="border-b border-zinc-800 hover:bg-transparent">
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[60px] text-xs font-bold uppercase text-zinc-400">STT</TableHead>
            <TableHead className="text-xs font-bold uppercase text-zinc-400">Người Vi Phạm</TableHead>
            <TableHead className="text-xs font-bold uppercase text-zinc-400">Ngày</TableHead>
            <TableHead className="text-xs font-bold uppercase text-zinc-400">Hạng Mục</TableHead>
            <TableHead className="text-xs font-bold uppercase text-zinc-400">Chi Tiết Vi Phạm</TableHead>
            <TableHead className="text-xs font-bold uppercase text-zinc-400">Loại Phạt</TableHead>
            <TableHead className="text-xs font-bold uppercase text-zinc-400">Mức Phạt</TableHead>
            <TableHead className="text-right text-xs font-bold uppercase text-zinc-400">Hành Động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {validPenalties.map((penalty, index) => {
            const isCompleted = penalty.isCompleted;
            const isFine = penalty.regulation.penalty.type === "fine";

            return (
              <TableRow
                key={penalty.id}
                className={`border-b border-zinc-800/60 transition-colors ${
                  isCompleted ? "bg-zinc-950/60 text-zinc-500" : "hover:bg-zinc-800/40 text-zinc-200"
                }`}
              >
                <TableCell>
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(checked) => onToggleComplete(penalty.id, !!checked)}
                    className="border-zinc-700 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    aria-label="Đánh dấu hoàn thành"
                  />
                </TableCell>
                <TableCell className={`text-xs ${isCompleted ? "line-through opacity-60" : ""}`}>
                  {index + 1}
                </TableCell>
                <TableCell className={`font-bold ${isCompleted ? "line-through opacity-60 text-zinc-500" : "text-zinc-100"}`}>
                  {penalty.personName}
                </TableCell>
                <TableCell className={`text-xs text-zinc-400 ${isCompleted ? "line-through opacity-60" : ""}`}>
                  {formatDate(penalty.date)}
                </TableCell>
                <TableCell className={`text-xs font-semibold text-emerald-400 ${isCompleted ? "line-through opacity-60" : ""}`}>
                  {penalty.regulation.category}
                </TableCell>
                <TableCell className={isCompleted ? "line-through opacity-60" : ""}>
                  <p className="font-semibold text-sm text-zinc-100">{penalty.regulation.violation}</p>
                  {penalty.notes && <p className="text-xs text-zinc-400 mt-0.5">{penalty.notes}</p>}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`whitespace-nowrap text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isFine
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    } ${isCompleted ? "opacity-50" : ""}`}
                  >
                    {isFine ? (
                      <CircleDollarSign className="h-3 w-3 mr-1 text-emerald-400" />
                    ) : (
                      <Ban className="h-3 w-3 mr-1 text-rose-400" />
                    )}
                    {isFine ? "Phạt tiền" : "Hạn chế"}
                  </Badge>
                </TableCell>
                <TableCell className={`font-semibold ${isCompleted ? "line-through opacity-60" : ""}`}>
                  {isFine ? (
                    <span className="text-emerald-400 font-bold">
                      {formatCurrency(penalty.regulation.penalty.amount ?? 0)}
                    </span>
                  ) : (
                    <span className="text-xs italic text-zinc-300">
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
                        className="h-8 w-8 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa bản ghi vi phạm?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                          Hành động này không thể hoàn tác. Bản ghi vi phạm sẽ bị xóa khỏi cơ sở dữ liệu.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-800 text-zinc-200 border-zinc-700">Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(penalty.id)}
                          className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl"
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
