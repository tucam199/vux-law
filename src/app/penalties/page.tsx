"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Plus, Users, CircleDollarSign, CheckCircle2, Clock, ChevronRight, ChevronLeft, LayoutGrid, List, X, UserCheck, AlertOctagon, Filter } from "lucide-react";
import { PenaltyList } from "@/components/PenaltyList";
import { HeaderNav } from "@/components/HeaderNav";
import { EmployeeManagerModal } from "@/components/EmployeeManagerModal";
import type { ViolationRecord, Regulation, Employee } from "@/lib/types";
import { useState, useMemo, useEffect, useCallback } from "react";
import { DateRange } from "react-day-picker";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ViolationForm } from "@/components/ViolationForm";
import { getPenalties, addMultiplePenalties, deletePenalty, updatePenalty } from "@/lib/penaltyService";
import { getRegulations } from "@/lib/regulationService";
import { getEmployees } from "@/lib/employeeService";
import { useToast } from "@/hooks/use-toast";
import { motion } from "motion/react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
}

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState<ViolationRecord[]>([]);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedPenalties, fetchedRegulations, fetchedEmployees] = await Promise.all([
        getPenalties(),
        getRegulations(),
        getEmployees(),
      ]);
      setPenalties(fetchedPenalties);
      setRegulations(fetchedRegulations);
      setEmployees(fetchedEmployees);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const peopleNames = useMemo(() => {
    return employees.map(e => e.name);
  }, [employees]);

  const handleAddViolation = () => {
    setIsSheetOpen(true);
  };

  const handleSaveViolations = async (violations: Omit<ViolationRecord, 'id'>[]) => {
    try {
      await addMultiplePenalties(violations);
      toast({
        title: "Thành công",
        description: `Đã ghi nhận ${violations.length} vi phạm mới.`,
      });
      setIsSheetOpen(false);
      await fetchData();
    } catch (error) {
      console.error("Error adding penalties: ", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu vi phạm. Vui lòng thử lại.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeletePenalty = async (id: string) => {
    try {
      await deletePenalty(id);
      setPenalties(prevPenalties => prevPenalties.filter(p => p.id !== id));
      toast({
        title: "Thành công",
        description: "Đã xóa bản ghi vi phạm.",
      });
    } catch (error) {
      console.error("Error deleting penalty: ", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa bản ghi. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
    try {
      await updatePenalty(id, { isCompleted });
      setPenalties(prevPenalties =>
        prevPenalties.map(p =>
          p.id === id ? { ...p, isCompleted } : p
        )
      );
      toast({
        title: "Thành công",
        description: isCompleted ? "Đã đánh dấu hoàn thành xử phạt." : "Đã chuyển về chưa hoàn thành.",
      });
    } catch (error) {
      console.error("Error updating penalty status:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const filteredPenalties = useMemo(() => {
    let filtered = penalties;

    if (selectedPerson) {
      filtered = filtered.filter(p => p.personName === selectedPerson);
    }

    if (filter) {
      const now = new Date();
      let interval: { start: Date; end: Date; } | undefined;

      if (filter === 'today') {
        interval = { start: new Date(now.setHours(0, 0, 0, 0)), end: new Date(now.setHours(23, 59, 59, 999)) };
      } else if (filter === 'this_week') {
        interval = { start: startOfWeek(now), end: endOfWeek(now) };
      } else if (filter === 'this_month') {
        interval = { start: startOfMonth(now), end: endOfMonth(now) };
      } else if (filter === 'this_year') {
        interval = { start: startOfYear(now), end: endOfYear(now) };
      } else if (filter === 'custom' && dateRange?.from) {
        const start = dateRange.from;
        const end = dateRange.to || dateRange.from;
        interval = { start: new Date(start.setHours(0, 0, 0, 0)), end: new Date(end.setHours(23, 59, 59, 999)) };
      }

      if (interval) {
        filtered = filtered.filter(p => {
          if (!p.date) return false;
          try {
            return isWithinInterval(parseISO(p.date), interval!);
          } catch {
            return false;
          }
        });
      }
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((penalty) => {
        if (!penalty.regulation || !penalty.regulation.penalty) return false;
        const { personName, date, notes, regulation } = penalty;
        const { category, violation, penalty: penaltyDetails } = regulation;

        return (
          personName.toLowerCase().includes(lowercasedQuery) ||
          (date && date.toLowerCase().includes(lowercasedQuery)) ||
          (notes && notes.toLowerCase().includes(lowercasedQuery)) ||
          category.toLowerCase().includes(lowercasedQuery) ||
          violation.toLowerCase().includes(lowercasedQuery) ||
          (penaltyDetails.type === "fine" && penaltyDetails.amount?.toString().includes(lowercasedQuery)) ||
          (penaltyDetails.type === "restriction" && penaltyDetails.details?.toLowerCase().includes(lowercasedQuery))
        );
      });
    }

    return filtered;
  }, [penalties, searchQuery, filter, dateRange, selectedPerson]);

  const stats = useMemo(() => {
    const totalCount = filteredPenalties.length;
    const completedCount = filteredPenalties.filter(p => p.isCompleted).length;
    const pendingCount = totalCount - completedCount;
    const totalFineApproved = filteredPenalties.reduce((acc, p) => {
      if (p.regulation?.penalty?.type === 'fine') {
        return acc + (p.regulation.penalty.amount || 0);
      }
      return acc;
    }, 0);

    return { totalCount, completedCount, pendingCount, totalFineApproved };
  }, [filteredPenalties]);

  const noRegulations = regulations.length === 0;

  return (
    <div className="min-h-screen bg-white text-[#1F1F1F]">
      {/* Unified Module Header Bar */}
      <HeaderNav pendingPenaltiesCount={stats.pendingCount} />

      {/* Control Panel Bar — 12-Column Grid Architecture */}
      <div className="bg-[#F8F8F8] border-b border-[#E0E0E0] sticky top-14 z-[90]">
        <div className="ds-container py-3.5">
          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Left Controls: Breadcrumbs & Primary Action */}
            <div className="col-span-12 lg:col-span-5 flex flex-wrap items-center gap-2.5">
              <div className="flex items-center text-xs font-medium text-[#1F1F1F] gap-1 mr-2">
                <span className="text-[#1E74E8] font-semibold">Xử Phạt</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#6B6B6B]" />
                <span className="text-[#1F1F1F] font-bold">Nhật Ký Vi Phạm</span>
              </div>

              {/* SINGLE PRIMARY CTA PER SCREEN: #7FCA27 Green */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleAddViolation}
                disabled={noRegulations}
                className="btn-ds-primary text-xs"
              >
                <Plus className="h-4 w-4" />
                Ghi Nhận Vi Phạm
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsEmpModalOpen(true)}
                className="btn-ds-secondary text-xs"
              >
                <Users className="w-4 h-4 text-[#1E74E8]" />
                <span>Nhân Sự ({employees.length})</span>
              </motion.button>
            </div>

            {/* Central Controls: Filter by Person Select */}
            <div className="col-span-12 md:col-span-7 lg:col-span-4 flex items-center gap-2">
              <div className="w-full">
                <Select
                  value={selectedPerson || "ALL"}
                  onValueChange={(val) => setSelectedPerson(val === "ALL" ? null : val)}
                >
                  <SelectTrigger className="w-full h-11 bg-white border border-[#E0E0E0] focus:ring-2 focus:ring-[#1E74E8] rounded-md px-3.5 text-sm font-semibold text-[#1F1F1F]">
                    <div className="flex items-center gap-2 truncate">
                      <UserCheck className="w-4 h-4 text-[#6B6B6B] shrink-0" />
                      <SelectValue placeholder="Lọc theo nhân sự..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="font-medium text-sm">
                      👥 Tất cả nhân sự ({peopleNames.length})
                    </SelectItem>
                    {peopleNames.map((name) => (
                      <SelectItem key={name} value={name} className="font-semibold text-sm">
                        👤 {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPerson && (
                <button
                  onClick={() => setSelectedPerson(null)}
                  className="btn-ds-secondary text-xs shrink-0"
                  title="Xóa lọc nhân sự"
                >
                  Xóa lọc
                </button>
              )}
            </div>

            {/* Right Controls: Stats & Quick Count */}
            <div className="col-span-12 md:col-span-5 lg:col-span-3 flex items-center justify-end">
              <div className="text-xs text-[#6B6B6B] font-medium">
                Hiển thị: <strong className="text-[#1F1F1F]">{filteredPenalties.length}</strong> bản ghi
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="ds-container py-8 space-y-7">
        {/* KPI STAT CARDS — 12-COLUMN RESPONSIVE GRID */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-4 card-ds p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider">TỔNG LẦN VI PHẠM</p>
              <p className="text-2xl font-bold text-[#1F1F1F]">{stats.totalCount}</p>
            </div>
            <AlertOctagon className="w-6 h-6 text-[#1E74E8]" />
          </div>

          <div className="col-span-12 md:col-span-4 card-ds p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider">TỔNG TIỀN PHẠT DUYỆT</p>
              <p className="text-2xl font-bold text-[#1F1F1F]">{formatCurrency(stats.totalFineApproved)}</p>
            </div>
            <CircleDollarSign className="w-6 h-6 text-[#7FCA27]" />
          </div>

          <div className="col-span-12 md:col-span-4 card-ds p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider">VI PHẠM CHỜ XỬ LÝ</p>
              <p className="text-2xl font-bold text-[#1F1F1F]">{stats.pendingCount}</p>
            </div>
            <Clock className="w-6 h-6 text-[#FF8832]" />
          </div>
        </div>

        {/* ACTIVE FILTER BANNER */}
        {selectedPerson && (
          <div className="bg-[#EAF2FD] border border-[#1E74E8] rounded-lg p-3 flex items-center justify-between text-xs text-[#1E74E8]">
            <div className="flex items-center gap-2 font-medium">
              <Filter className="w-4 h-4 text-[#1E74E8]" />
              <span>Đang lọc vi phạm của nhân sự: <strong>{selectedPerson}</strong> ({filteredPenalties.length} bản ghi)</span>
            </div>
            <button
              onClick={() => setSelectedPerson(null)}
              className="btn-ds-secondary text-xs py-1 px-2.5 font-bold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Xóa lọc nhân sự
            </button>
          </div>
        )}

        {/* PENALTY LIST TABLE (§8.6 & §9.5) */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#E0E0E0] bg-white py-20 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E74E8]"></div>
            <p className="text-[#6B6B6B] text-xs font-medium">Đang tải danh sách xử phạt...</p>
          </div>
        ) : (
          <PenaltyList
            penalties={filteredPenalties}
            onDelete={handleDeletePenalty}
            onToggleComplete={handleToggleComplete}
          />
        )}
      </main>

      {/* CREATE VIOLATION SHEET FORM */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl w-full flex flex-col bg-white border-[#E0E0E0] text-[#1F1F1F] p-0 shadow-md">
          <div className="bg-[#F8F8F8] px-6 py-4 border-b border-[#E0E0E0] flex items-center justify-between">
            <div className="space-y-0.5">
              <SheetTitle className="text-[#1F1F1F] text-lg font-bold">Ghi Nhận Vi Phạm Mới</SheetTitle>
              <SheetDescription className="text-[#6B6B6B] text-xs">
                Chọn nhân sự vi phạm và quy định tương ứng
              </SheetDescription>
            </div>
            <div className="badge-ds-info font-medium text-xs px-2.5 py-0.5">
              Tự động lưu
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col overflow-hidden">
            <ViolationForm
              onSave={handleSaveViolations}
              onClose={() => setIsSheetOpen(false)}
              regulations={regulations}
              people={peopleNames}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* DYNAMIC EMPLOYEE MANAGER MODAL */}
      <EmployeeManagerModal
        isOpen={isEmpModalOpen}
        onClose={() => setIsEmpModalOpen(false)}
        employees={employees}
        onRefresh={fetchData}
      />
    </div>
  );
}