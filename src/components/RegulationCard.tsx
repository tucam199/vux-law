import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Ban, CircleDollarSign, FilePenLine, Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog"

interface RegulationCardProps {
  regulation: Regulation;
  onEdit: () => void;
  onDelete: () => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

export function RegulationCard({ regulation, onEdit, onDelete }: RegulationCardProps) {
  // Add a safety check here. If regulation or its penalty is missing, don't render the card.
  if (!regulation || !regulation.penalty) {
    return null;
  }
  
  const isFine = regulation.penalty.type === 'fine';
  
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-lg mb-1">{regulation.category}</CardTitle>
            <Badge variant={isFine ? "secondary" : "destructive"}>
                {isFine ? (
                    <CircleDollarSign className="h-4 w-4 mr-1.5" />
                ) : (
                    <Ban className="h-4 w-4 mr-1.5" />
                )}
                {isFine ? 'Phạt tiền' : 'Hạn chế'}
            </Badge>
        </div>
        <CardDescription>{regulation.violation}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Separator />
        <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Chi Tiết Hình Phạt</p>
            {isFine ? (
              <p className="text-2xl font-bold text-accent">{formatCurrency(regulation.penalty.amount ?? 0)}</p>
            ) : (
              <p className="text-sm text-foreground italic">"{regulation.penalty.details}"</p>
            )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full justify-end gap-2">
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này không thể được hoàn tác. Thao tác này sẽ xóa vĩnh viễn quy định khỏi cơ sở dữ liệu.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Tiếp tục</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <FilePenLine className="h-4 w-4 mr-2" />
            Sửa
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
