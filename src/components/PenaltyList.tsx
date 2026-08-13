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
      <div className="flex flex-col items-center justify-center rounded border border-dashed border-[#DEE2E6] bg-white py-16 text-center space-y-2">
        <SearchX className="h-8 w-8 text-[#6C757D]" />
        <h3 className="text-sm font-bold text-[#212529]">Không tìm thấy bản ghi vi phạm nào trong Odoo</h3>
        <p className="text-xs text-[#6C757D] max-w-xs">
          Thử thay đổi từ khóa tìm kiếm hoặc lọc theo nhân sự.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[#DEE2E6] rounded-lg bg-white shadow-xs overflow-x-auto">
      <Table className="text-xs">
        <TableHeader className="bg-[#F1F3F5] border-b border-[#DEE2E6]">
          <TableRow className="hover:bg-transparent border-b border-[#DEE2E6]">
            <TableHead className="w-[36px] py-2.5 px-3"></TableHead>
            <TableHead className="w-[44px] text-[11px] font-bold text-[#212529] py-2.5 px-3">STT</TableHead>
            <TableHead className="text-[11px] font-bold text-[#212529] py-2.5 px-3">EMPLOYEE (NGƯỜI VI PHẠM)</TableHead>
            <TableHead className="text-[11px] font-bold text-[#212529] py-2.5 px-3">DATE (NGÀY)</TableHead>
            <TableHead className="text-[11px] font-bold text-[#212529] py-2.5 px-3">CATEGORY (HẠNG MỤC)</TableHead>
            <TableHead className="text-[11px] font-bold text-[#212529] py-2.5 px-3">VIOLATION (CHI TIẾT VI PHẠM)</TableHead>
            <TableHead className="text-[11px] font-bold text-[#212529] py-2.5 px-3">LOẠI PHẠT</TableHead>
            <TableHead className="text-[11px] font-bold text-[#212529] py-2.5 px-3">MỨC PHẠT</TableHead>
            <TableHead className="text-[11px] font-bold text-[#212529] py-2.5 px-3">STATUS (TRẠNG THÁI)</TableHead>
            <TableHead className="text-right text-[11px] font-bold text-[#212529] py-2.5 px-3">ACTION</TableHead>
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
                {/* Odoo Grouping Accordion Row */}
                <TableRow className="bg-[#F8F9FA] hover:bg-[#F1F3F5] font-semibold text-[#212529] border-b border-[#DEE2E6]">
                  <TableCell colSpan={3} className="py-2 px-3">
                    <div className="flex items-center gap-2 font-bold text-xs text-[#212529]">
                      <ChevronDown className="w-3.5 h-3.5 text-[#017E84]" />
                      <span className="w-6 h-6 rounded-full bg-[#714B67] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                        {initials}
                      </span>
                      <span>{personName}</span>
                      <span className="text-[#6C757D] font-normal">({personList.length} lượt)</span>
                    </div>
                  </TableCell>
                  <TableCell colSpan={4} className="py-2 px-3 text-[11px] text-[#6C757D]">
                    Tổng lượt vi phạm của nhân sự
                  </TableCell>
                  <TableCell className="py-2 px-3 font-bold text-[#28A745]">
                    {formatCurrency(groupTotalFine)}
                  </TableCell>
                  <TableCell colSpan={2} className="py-2 px-3"></TableCell>
                </TableRow>

                {/* Individual Violation Rows */}
                {personList.map((penalty, idx) => {
                  const isCompleted = penalty.isCompleted;
                  const isFine = penalty.regulation.penalty.type === "fine";

                  return (
                    <TableRow
                      key={penalty.id}
                      className={`border-b border-[#E5E7EB] transition-colors ${
                        isCompleted ? "bg-zinc-50/60 text-[#6C757D]" : "hover:bg-zinc-50 text-[#212529]"
                      }`}
                    >
                      <TableCell className="py-2.5 px-3">
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={(checked) => onToggleComplete(penalty.id, !!checked)}
                          className="border-[#DEE2E6] data-[state=checked]:bg-[#28A745] data-[state=checked]:border-[#28A745]"
                          aria-label="Đánh dấu hoàn thành"
                        />
                      </TableCell>
                      <TableCell className={`py-2.5 px-3 text-xs text-[#6C757D] ${isCompleted ? "line-through opacity-60" : ""}`}>
                        {idx + 1}
                      </TableCell>
                      <TableCell className={`py-2.5 px-3 font-semibold text-xs ${isCompleted ? "line-through opacity-60 text-[#6C757D]" : "text-[#212529]"}`}>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#017E84]" />
                          <span>{penalty.personName}</span>
                        </div>
                      </TableCell>
                      <TableCell className={`py-2.5 px-3 text-xs text-[#6C757D] ${isCompleted ? "line-through opacity-60" : ""}`}>
                        {formatDate(penalty.date)}
                      </TableCell>
                      <TableCell className={`py-2.5 px-3 text-xs font-semibold text-[#017E84] ${isCompleted ? "line-through opacity-60" : ""}`}>
                        {penalty.regulation.category}
                      </TableCell>
                      <TableCell className={`py-2.5 px-3 ${isCompleted ? "line-through opacity-60" : ""}`}>
                        <p className="font-semibold text-xs text-[#212529]">{penalty.regulation.violation}</p>
                        {penalty.notes && <p className="text-[11px] text-[#6C757D] mt-0.5">{penalty.notes}</p>}
                      </TableCell>
                      <TableCell className="py-2.5 px-3">
                        <Badge
                          variant="outline"
                          className={`whitespace-nowrap text-[11px] font-semibold px-2 py-0.5 rounded border ${
                            isFine
                              ? "bg-[#28A745]/10 text-[#28A745] border-[#28A745]/30"
                              : "bg-rose-500/10 text-rose-600 border-rose-500/30"
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
                      <TableCell className={`py-2.5 px-3 font-semibold text-xs ${isCompleted ? "line-through opacity-60" : ""}`}>
                        {isFine ? (
                          <span className="text-[#28A745] font-bold">
                            {formatCurrency(penalty.regulation.penalty.amount ?? 0)}
                          </span>
                        ) : (
                          <span className="text-xs italic text-[#212529]">
                            "{penalty.regulation.penalty.details || 'Hạn chế'}"
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded ${
                          isCompleted
                            ? "bg-[#28A745]/15 text-[#28A745] border border-[#28A745]/30"
                            : "bg-amber-500/15 text-amber-700 border border-amber-500/30"
                        }`}>
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-[#28A745]" />
                              Đã nộp phạt
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                              Chờ xử lý
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 px-3 text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-[#6C757D] hover:text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white border-[#DEE2E6] text-[#212529] rounded-lg">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-sm font-bold">Xác nhận xóa bản ghi vi phạm?</AlertDialogTitle>
                              <AlertDialogDescription className="text-[#6C757D] text-xs">
                                Hành động này sẽ xóa bản ghi khỏi CSDL Odoo ERP.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-zinc-100 text-[#212529] border-[#DEE2E6] text-xs h-8">Hủy</AlertDialogCancel>
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
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
