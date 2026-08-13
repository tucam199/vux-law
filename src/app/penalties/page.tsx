"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListFilter, Search, Plus, Users, CircleDollarSign, CheckCircle2, Clock, ChevronRight, ChevronLeft, LayoutGrid, List, X } from "lucide-react";
import { PenaltyList } from "@/components/PenaltyList";
import { HeaderNav } from "@/components/HeaderNav";
import type { ViolationRecord, Regulation } from "@/lib/types";
import { useState, useMemo, useEffect, useCallback } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { DateRange } from "react-day-picker";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from "date-fns";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ViolationForm } from "@/components/ViolationForm";
import { getPenalties, addMultiplePenalties, deletePenalty, updatePenalty } from "@/lib/penaltyService";
import { getRegulations } from "@/lib/regulationService";
import { useToast } from "@/hooks/use-toast";

const people = [
  "Trình Mỹ Phượng Oanh",
  "Trần Anh Tú",
  "Phan Huỳnh Tiến",
  "Tạ Anh Khoa",
];

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState<ViolationRecord[]>([]);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedPenalties, fetchedRegulations] = await Promise.all([
        getPenalties(),
        getRegulations(),
      ]);
      setPenalties(fetchedPenalties);
      setRegulations(fetchedRegulations);
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

  const handleFilterChange = (newFilter: string | null) => {
    setFilter(newFilter);
    if (newFilter !== 'custom') {
      setDateRange(undefined);
    }
  };

  const handlePersonSelect = (person: string | null) => {
    setSelectedPerson(person);
  };

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
    const totalFinesSum = filteredPenalties.reduce((acc, p) => {
      if (p.regulation?.penalty?.type === 'fine') {
        return acc + (p.regulation.penalty.amount || 0);
      }
      return acc;
    }, 0);

    return { totalCount, completedCount, pendingCount, totalFinesSum };
  }, [filteredPenalties]);

  const noRegulations = regulations.length === 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529]">
      {/* Unified Odoo Header Bar */}
      <HeaderNav pendingPenaltiesCount={stats.pendingCount} />

      {/* Control Panel Bar */}
      <div className="bg-white border-b border-[#DEE2E6] shadow-xs sticky top-12 z-20">
        <div className="container mx-auto px-4 lg:px-6 py-2.5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {/* Left Controls: Breadcrumbs & Primary Action Button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-xs font-medium text-[#212529] gap-1">
                <span className="text-[#017E84] font-semibold">Xử phạt</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#6C757D]" />
                <span className="text-[#212529] font-bold">Nhật Ký Vi Phạm</span>
              </div>

              <button
                onClick={handleAddViolation}
                disabled={noRegulations}
                className="btn-odoo-green text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
                Ghi Nhận Vi Phạm
              </button>
            </div>

            {/* Central Search & Filter View */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex items-center w-full md:w-80 bg-white border border-[#017E84] rounded px-2.5 py-1 shadow-xs">
                <Search className="w-3.5 h-3.5 text-[#017E84] mr-1.5 shrink-0" />
                {selectedPerson && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#017E84] bg-[#017E84]/10 border border-[#017E84]/30 px-1.5 py-0.5 rounded mr-1 shrink-0">
                    {selectedPerson}
                    <button onClick={() => setSelectedPerson(null)} className="hover:text-rose-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#212529] focus:outline-none placeholder-[#6C757D]"
                />
              </div>

              {/* Person Select */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="btn-odoo-outline text-xs font-medium">
                    <Users className="w-3.5 h-3.5 text-[#017E84]" />
                    {selectedPerson ? selectedPerson : "Nhân sự"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-[#DEE2E6] text-[#212529] text-xs rounded shadow-md">
                  <DropdownMenuItem onSelect={() => handlePersonSelect(null)}>
                    Tất cả nhân sự
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#DEE2E6]" />
                  {people.map((person) => (
                    <DropdownMenuItem key={person} onSelect={() => handlePersonSelect(person)}>
                      {person}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Switcher */}
              <div className="flex items-center border border-[#017E84] rounded bg-white overflow-hidden shrink-0">
                <Link href="/">
                  <button className="p-1.5 text-[#6C757D] hover:text-[#017E84]" title="Kanban View">
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </Link>
                <button className="p-1.5 bg-[#017E84]/15 text-[#017E84]" title="List View">
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <main className="container mx-auto px-4 lg:px-6 py-5 max-w-7xl space-y-5">
        {/* KPI Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#DEE2E6] rounded-lg p-4 flex items-center justify-between shadow-xs">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider">TỔNG LƯỢT PHẠT</p>
              <p className="text-xl font-bold text-[#212529]">{stats.totalCount}</p>
            </div>
            <Users className="w-5 h-5 text-[#017E84]" />
          </div>

          <div className="bg-white border border-[#DEE2E6] rounded-lg p-4 flex items-center justify-between shadow-xs">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider">ĐÃ HOÀN THÀNH</p>
              <p className="text-xl font-bold text-[#212529]">{stats.completedCount}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-[#28A745]" />
          </div>

          <div className="bg-white border border-[#DEE2E6] rounded-lg p-4 flex items-center justify-between shadow-xs">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider">CHƯA NỘP/THỰC HIỆN</p>
              <p className="text-xl font-bold text-[#212529]">{stats.pendingCount}</p>
            </div>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>

          <div className="bg-white border border-[#DEE2E6] rounded-lg p-4 flex items-center justify-between shadow-xs">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider">TỔNG TIỀN PHẠT</p>
              <p className="text-lg font-bold text-[#212529]">
                {new Intl.NumberFormat('vi-VN').format(stats.totalFinesSum)} đ
              </p>
            </div>
            <CircleDollarSign className="w-5 h-5 text-[#28A745]" />
          </div>
        </div>

        {/* Data Table Display */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded border border-[#E5E7EB] bg-white py-20 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#28A745]"></div>
            <p className="text-[#6C757D] text-xs font-medium">Đang tải danh sách xử phạt...</p>
          </div>
        ) : (
          <PenaltyList
            penalties={filteredPenalties}
            onDelete={handleDeletePenalty}
            onToggleComplete={handleToggleComplete}
          />
        )}
      </main>

      {/* Violation Form Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl w-full flex flex-col bg-white border-[#DEE2E6] text-[#212529] p-0 shadow-xl">
          <div className="bg-[#F8F9FA] px-6 py-3.5 border-b border-[#DEE2E6] flex items-center justify-between">
            <div className="space-y-0.5">
              <SheetTitle className="text-[#212529] text-base font-bold">Ghi Nhận Vi Phạm Mới</SheetTitle>
              <SheetDescription className="text-[#6C757D] text-xs">
                Biểu mẫu ghi nhận vi phạm
              </SheetDescription>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold bg-[#28A745]/10 text-[#28A745] border border-[#28A745]/20 px-2 py-0.5 rounded">
              Bản nháp
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col overflow-hidden">
            <ViolationForm
              onSave={handleSaveViolations}
              onClose={() => setIsSheetOpen(false)}
              regulations={regulations}
              people={people}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}