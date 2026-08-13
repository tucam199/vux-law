"use client";

import type { Regulation } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Ban, CircleDollarSign, Tag, Trash2, Zap, Edit3 } from "lucide-react";
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
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
}

export function RegulationCard({ regulation, onEdit, onDelete, onQuickPenalty }: RegulationCardProps) {
  if (!regulation || !regulation.penalty) {
    return null;
  }
  
  const isFine = regulation.penalty.type === 'fine';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="card-ds p-4 rounded-xl border border-[#E0E0E0] bg-white transition-all flex flex-col justify-between relative overflow-hidden">
        {/* Top Accent Stripe */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isFine ? "bg-[#7FCA27]" : "bg-[#FF8832]"
          }`}
        />

        <CardHeader className="p-0 pb-3 pt-1">
          <div className="flex justify-between items-start gap-2">
            <div className="space-y-1.5">
              {/* NEUTRAL CATEGORY BADGE: Eliminates visual color collision */}
              <span className="badge-ds-neutral">
                <Tag className="w-3 h-3 text-[#6B6B6B]" />
                {regulation.category}
              </span>
              <CardTitle className="text-sm font-bold text-[#1F1F1F] leading-snug pt-1">
                {regulation.violation}
              </CardTitle>
            </div>

            <Badge
              variant="outline"
              className={isFine ? "badge-ds-success" : "badge-ds-warning"}
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

        <CardContent className="p-0 py-2.5 flex-grow">
          <Separator className="bg-[#E0E0E0] mb-2.5" />
          <div className="space-y-1 bg-[#F8F8F8] p-3 rounded-md border border-[#E0E0E0]">
            <span className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
              MỨC XỬ PHẠT QUY ĐỊNH
            </span>
            {isFine ? (
              <div className="text-lg font-extrabold text-[#1F1F1F] leading-tight">
                {formatCurrency(regulation.penalty.amount ?? 0)}
              </div>
            ) : (
              <p className="text-xs text-[#1F1F1F] font-medium italic leading-relaxed">
                "{regulation.penalty.details || 'Không có chi tiết'}"
              </p>
            )}
          </div>
        </CardContent>

        {/* CARD FOOTER ACTION BAR */}
        <CardFooter className="p-0 pt-3 border-t border-[#E0E0E0] flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            {onQuickPenalty && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => onQuickPenalty(regulation)}
                className="btn-ds-primary text-xs py-1.5 px-3 font-bold flex items-center gap-1.5"
                title="Ghi nhận vi phạm nhanh cho nhân sự với quy định này"
              >
                <Zap className="w-3.5 h-3.5 fill-white text-white" />
                Phạt Nhanh
              </motion.button>
            )}

            <button
              onClick={onEdit}
              className="btn-ds-secondary text-xs py-1.5 px-3 font-medium flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#1E74E8]" />
              Sửa
            </button>
          </div>

          {/* SAFELY SEPARATED DELETE BUTTON TO PREVENT ACCIDENTAL CLICKS */}
          <div className="ml-auto">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#6B6B6B] hover:text-[#D32F2F] hover:bg-[#FDECEC] rounded-sm transition-colors"
                  title="Xóa quy định này"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white border-[#E0E0E0] rounded-xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[#1F1F1F] font-bold text-base">Xác nhận xóa quy định?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[#6B6B6B] text-xs">
                    Hành động này sẽ xóa quy định khỏi CSDL hệ thống.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="btn-ds-secondary text-xs h-9">Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-[#D32F2F] hover:bg-[#b71c1c] text-white text-xs h-9 font-bold rounded-sm"
                  >
                    Xóa Quy Định
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
