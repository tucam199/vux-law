"use client";

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
import { motion } from "motion/react";

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
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="notion-card pl-5 border-[#E9E9E7] hover:border-[#D3D3D0] hover:shadow-xs transition-all duration-200 rounded-lg bg-white">
        {/* Top Mini Accent Bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            isFine
              ? "bg-[var(--token-card-stripe-fine,#2F3438)]"
              : "bg-[var(--token-card-stripe-restriction,#787774)]"
          }`}
        />

        {/* Clean Left Vertical Accent Stripe */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${
            isFine ? 'bg-[var(--token-card-stripe-fine,#2F3438)]' : 'bg-[var(--token-card-stripe-restriction,#787774)]'
          }`}
        />

        <CardHeader className="p-0 pb-2.5 pt-1">
          <div className="flex justify-between items-start gap-2">
            <div className="space-y-1">
              <span className="token-badge-category">
                <Tag className="w-3 h-3 text-[#2F3438]" />
                {regulation.category}
              </span>
              <CardTitle className="text-sm font-bold text-[#2F3438] leading-snug pt-1.5">
                {regulation.violation}
              </CardTitle>
            </div>

            <Badge
              variant="outline"
              className={isFine ? "token-badge-fine" : "token-badge-restriction"}
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
          <Separator className="bg-[#E9E9E7] mb-2.5" />
          <div className="space-y-1 bg-[#F7F7F5] p-2.5 rounded-md border border-[#E9E9E7]">
            <span className="block text-[10px] font-bold text-[#787774] uppercase tracking-wider">
              MỨC XỬ PHẠT QUY ĐỊNH
            </span>
            {isFine ? (
              <div className="text-lg font-extrabold text-[#2F3438] leading-tight">
                {formatCurrency(regulation.penalty.amount ?? 0)}
              </div>
            ) : (
              <p className="text-xs text-[#2F3438] font-medium italic leading-relaxed">
                "{regulation.penalty.details || 'Không có chi tiết'}"
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-0 pt-3 border-t border-[#E9E9E7] flex justify-between items-center gap-2">
          <div className="flex items-center gap-1.5">
            {onQuickPenalty && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => onQuickPenalty(regulation)}
                className="btn-token-green text-[11px] py-1 px-2.5 font-bold flex items-center gap-1 shadow-2xs"
                title="Ghi nhận vi phạm nhanh cho nhân sự với quy định này"
              >
                <Zap className="w-3.5 h-3.5 fill-white text-white" />
                Phạt Nhanh
              </motion.button>
            )}

            <button
              onClick={onEdit}
              className="btn-token-primary text-[11px] py-1 px-2.5 font-semibold"
            >
              Sửa
            </button>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-[#787774] hover:text-[#2F3438] hover:bg-[#F7F7F5] px-1.5 rounded"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white border-[#E9E9E7] rounded-lg">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[#2F3438] font-bold text-sm">Xác nhận xóa quy định?</AlertDialogTitle>
                <AlertDialogDescription className="text-[#787774] text-xs">
                  Hành động này sẽ xóa quy định khỏi hệ thống CSDL.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-[#F7F7F5] text-[#2F3438] hover:bg-[#EFEFED] border-[#E9E9E7] text-xs h-8">Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-[#2F3438] hover:bg-[#191919] text-white text-xs h-8"
                >
                  Xóa Quy Định
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
