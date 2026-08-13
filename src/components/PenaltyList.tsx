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
import { Ban, CircleDollarSign, SearchX, Trash2, ChevronDown, CheckCircle2, Clock } from "lucide-react";
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
import { useMemo } from "react";
import React from 'react';
import { motion } from 'motion/react';

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

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function PenaltyList({ penalties, onDelete, onToggleComplete }: PenaltyListProps) {
  const validPenalties = useMemo(() => {
    return penalties.filter(p => p.regulation && p.regulation.penalty);
  }, [penalties]);

  // Group penalties by person
  const groupedPenalties = useMemo(() => {
    const map = new Map<string, ViolationRecord[]>();
    for (const pen of validPenalties) {
      const list = map.get(pen.personName) || [];
      list.push(pen);
      map.set(pen.personName, list);
    }
    return Array.from(map.entries());
  }, [validPenalties]);

  if (validPenalties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded border border-dashed border-[#E9E9E7] bg-white py-16 text-center space-y-2">
        <SearchX className="h-8 w-8 text-[#787774]" />
        <h3 className="text-sm font-bold text-[#2F3438]">Không tìm thấy bản ghi vi phạm nào trong CSDL</h3>
        <p className="text-xs text-[#787774] max-w-xs">
          Thử thay đổi từ khóa tìm kiếm hoặc lọc theo nhân sự.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[#E0E0E0] rounded-xl bg-white overflow-x-auto">
      <Table className="text-xs">
        <TableHeader className="bg-[#F8F8F8] border-b border-[#E0E0E0]">
          <TableRow className="hover:bg-transparent border-b border-[#E0E0E0]">
            <TableHead className="w-[36px] py-3 px-3"></TableHead>
            <TableHead className="w-[44px] text-[11px] font-bold text-[#6B6B6B] uppercase py-3 px-3">STT</TableHead>
            <TableHead className="text-[11px] font-bold text-[#6B6B6B] uppercase py-3 px-3">EMPLOYEE (NGƯỜI VI PHẠM)</TableHead>
            <TableHead className="text-[11px] font-bold text-[#6B6B6B] uppercase py-3 px-3">DATE (NGÀY)</TableHead>
            <TableHead className="text-[11px] font-bold text-[#6B6B6B] uppercase py-3 px-3">CATEGORY (HẠNG MỤC)</TableHead>
            <TableHead className="text-[11px] font-bold text-[#6B6B6B] uppercase py-3 px-3">VIOLATION (CHI TIẾT VI PHẠM)</TableHead>
            <TableHead className="text-[11px] font-bold text-[#6B6B6B] uppercase py-3 px-3">LOẠI PHẠT</TableHead>
            <TableHead className="text-[11px] font-bold text-[#6B6B6B] uppercase py-3 px-3">MỨC PHẠT</TableHead>
            <TableHead className="text-[11px] font-bold text-[#6B6B6B] uppercase py-3 px-3">STATUS (TRẠNG THÁI)</TableHead>
            <TableHead className="text-right text-[11px] font-bold text-[#6B6B6B] uppercase py-3 px-3">ACTION</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedPenalties.map(([personName, personList]) => {
            const groupTotalFine = personList.reduce((sum, p) => {
              return sum + (p.regulation.penalty.type === 'fine' ? (p.regulation.penalty.amount || 0) : 0);
            }, 0);

            const initials = getInitials(personName);

            return (
              <React.Fragment key={personName}>
                {/* Grouping Accordion Row */}
                <TableRow className="bg-[#F8F8F8] hover:bg-[#F2F2F2] font-semibold text-[#1F1F1F] border-b border-[#E0E0E0]">
                  <TableCell colSpan={3} className="py-2.5 px-3">
                    <div className="flex items-center gap-2 font-bold text-xs text-[#1F1F1F]">
                      <ChevronDown className="w-3.5 h-3.5 text-[#1F1F1F]" />
                      <span className="w-6 h-6 rounded-full bg-[#1E74E8] text-white text-[10px] font-bold flex items-center justify-center">
                        {initials}
                      </span>
                      <span>{personName}</span>
                      <span className="text-[#6B6B6B] font-normal">({personList.length} lượt)</span>
                    </div>
                  </TableCell>
                  <TableCell colSpan={4} className="py-2.5 px-3 text-[11px] text-[#6B6B6B]">
                    Tổng lượt vi phạm của nhân sự
                  </TableCell>
                  <TableCell className="py-2.5 px-3 font-bold text-[#1F1F1F]">
                    {formatCurrency(groupTotalFine)}
                  </TableCell>
                  <TableCell colSpan={2} className="py-2.5 px-3"></TableCell>
                </TableRow>

                {/* Individual Violation Rows */}
                {personList.map((penalty, idx) => {
                  const isCompleted = penalty.isCompleted;
                  const isFine = penalty.regulation.penalty.type === "fine";

                  return (
                    <TableRow
                      key={penalty.id}
                      className={`border-b border-[#E0E0E0] transition-colors hover:bg-[rgba(0,0,0,0.04)] ${
                        isCompleted ? "bg-[#F8F8F8]/50 text-[#6B6B6B]" : "text-[#1F1F1F]"
                      }`}
                    >
                      <TableCell className="py-3 px-3">
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={(checked) => onToggleComplete(penalty.id, !!checked)}
                          className="border-[#D1D1D1] data-[state=checked]:bg-[#7FCA27] data-[state=checked]:border-[#7FCA27] rounded-sm"
                          aria-label="Đánh dấu hoàn thành"
                        />
                      </TableCell>
                      <TableCell className={`py-3 px-3 text-xs text-[#6B6B6B] ${isCompleted ? "line-through opacity-60" : ""}`}>
                        {idx + 1}
                      </TableCell>
                      <TableCell className={`py-3 px-3 font-semibold text-xs ${isCompleted ? "line-through opacity-60 text-[#6B6B6B]" : "text-[#1F1F1F]"}`}>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#1E74E8]" />
                          <span>{penalty.personName}</span>
                        </div>
                      </TableCell>
                      <TableCell className={`py-3 px-3 text-xs text-[#6B6B6B] ${isCompleted ? "line-through opacity-60" : ""}`}>
                        {formatDate(penalty.date)}
                      </TableCell>
                      <TableCell className={`py-3 px-3 text-xs font-semibold text-[#1F1F1F] ${isCompleted ? "line-through opacity-60" : ""}`}>
                        {penalty.regulation.category}
                      </TableCell>
                      <TableCell className={`py-3 px-3 ${isCompleted ? "line-through opacity-60" : ""}`}>
                        <p className="font-semibold text-xs text-[#1F1F1F]">{penalty.regulation.violation}</p>
                        {penalty.notes && <p className="text-[11px] text-[#6B6B6B] mt-0.5">{penalty.notes}</p>}
                      </TableCell>
                      <TableCell className="py-3 px-3">
                        <Badge
                          variant="outline"
                          className={`${isFine ? "badge-ds-success" : "badge-ds-warning"} ${isCompleted ? "opacity-50" : ""}`}
                        >
                          {isFine ? (
                            <CircleDollarSign className="h-3.5 w-3.5 mr-1" />
                          ) : (
                            <Ban className="h-3.5 w-3.5 mr-1" />
                          )}
                          {isFine ? "Phạt tiền" : "Hạn chế"}
                        </Badge>
                      </TableCell>
                      <TableCell className={`py-3 px-3 font-semibold text-xs ${isCompleted ? "line-through opacity-60" : ""}`}>
                        {isFine ? (
                          <span className="text-[#1F1F1F] font-bold">
                            {formatCurrency(penalty.regulation.penalty.amount ?? 0)}
                          </span>
                        ) : (
                          <span className="text-xs italic text-[#1F1F1F]">
                            "{penalty.regulation.penalty.details || 'Hạn chế'}"
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 px-3">
                        <span className={isCompleted ? "badge-ds-success" : "badge-ds-warning"}>
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#7FCA27]" />
                              Đã nộp phạt
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-[#FF8832]" />
                              Chờ xử lý
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-3 text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[#6B6B6B] hover:text-[#D32F2F] hover:bg-[#FDECEC] rounded-sm"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white border-[#E0E0E0] text-[#1F1F1F] rounded-xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-base font-bold">Xác nhận xóa bản ghi vi phạm?</AlertDialogTitle>
                              <AlertDialogDescription className="text-[#6B6B6B] text-xs">
                                Hành động này sẽ xóa bản ghi khỏi CSDL hệ thống.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="btn-ds-secondary text-xs h-9">Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(penalty.id)}
                                className="bg-[#D32F2F] hover:bg-[#b71c1c] text-white text-xs h-9 font-bold rounded-sm"
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
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
