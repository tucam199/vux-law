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
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-28 text-center">
        <div className="mb-6 text-muted-foreground/50">
          <SearchX className="h-20 w-20" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Không tìm thấy kết quả</h2>
        <p className="mt-2 text-muted-foreground">
          Hãy thử một từ khóa tìm kiếm khác hoặc thay đổi bộ lọc.
        </p>
      </div>
    );
  }

  const validPenalties = penalties.filter(p => p.regulation && p.regulation.penalty);

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[50px]">STT</TableHead>
            <TableHead>Người Vi Phạm</TableHead>
            <TableHead>Ngày Vi Phạm</TableHead>
            <TableHead>Hạng Mục Vi Phạm</TableHead>
            <TableHead>Chi Tiết</TableHead>
            <TableHead>Loại Hình Phạt</TableHead>
            <TableHead>Hình Phạt</TableHead>
            <TableHead className="text-right">Hành Động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {validPenalties.map((penalty, index) => (
            <TableRow key={penalty.id} data-state={penalty.isCompleted ? "completed" : "default"}>
              <TableCell>
                 <Checkbox
                    checked={penalty.isCompleted}
                    onCheckedChange={(checked) => onToggleComplete(penalty.id, !!checked)}
                    aria-label="Đánh dấu hoàn thành"
                />
              </TableCell>
              <TableCell className="group-data-[state=completed]:line-through">{index + 1}</TableCell>
              <TableCell className="font-medium group-data-[state=completed]:line-through">{penalty.personName}</TableCell>
              <TableCell className="group-data-[state=completed]:line-through">{formatDate(penalty.date)}</TableCell>
              <TableCell className="group-data-[state=completed]:line-through">{penalty.regulation.category}</TableCell>
              <TableCell className="group-data-[state=completed]:line-through}">
                <p className="font-semibold">{penalty.regulation.violation}</p>
                <p className="text-sm text-muted-foreground">{penalty.notes}</p>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    penalty.regulation.penalty.type === "fine"
                      ? "secondary"
                      : "destructive"
                  }
                  className="whitespace-nowrap group-data-[state=completed]:opacity-50"
                >
                  {penalty.regulation.penalty.type === "fine" ? (
                    <CircleDollarSign className="h-4 w-4 mr-1.5" />
                  ) : (
                    <Ban className="h-4 w-4 mr-1.5" />
                  )}
                  {penalty.regulation.penalty.type === "fine"
                    ? "Phạt tiền"
                    : "Hạn chế"}
                </Badge>
              </TableCell>
              <TableCell className="group-data-[state=completed]:line-through">
                {penalty.regulation.penalty.type === "fine"
                  ? formatCurrency(penalty.regulation.penalty.amount ?? 0)
                  : `"${penalty.regulation.penalty.details}"`}
              </TableCell>
              <TableCell className="text-right">
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                         <Trash2 className="h-4 w-4 text-white" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Hành động này không thể được hoàn tác. Thao tác này sẽ xóa vĩnh viễn lỗi vi phạm khỏi cơ sở dữ liệu.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(penalty.id)}>Tiếp tục</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
