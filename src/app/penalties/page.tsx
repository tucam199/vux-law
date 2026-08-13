"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ListFilter, Search, Plus, Users, CircleDollarSign, CheckCircle2, Clock, ChevronRight, LayoutGrid, List } from "lucide-react";
import { Logo } from "@/components/Logo";
import { PenaltyList } from "@/components/PenaltyList";
import type { ViolationRecord, Regulation } from "@/lib/types";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { DateRange } from "react-day-picker";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ViolationForm } from "@/components/ViolationForm";
import { getPenalties, addMultiplePenalties, deletePenalty, updatePenalty } from "@/lib/penaltyService";
import { getRegulations } from "@/lib/regulationService";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen bg-[#1e1e24] text-zinc-100 font-sans">
      {/* Odoo Top Navbar */}
      <header className="bg-[#18181c] border-b border-[#32323d] sticky top-0 z-30">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex h-14 items-center justify-between gap-4">
            <Logo />
            <Link href="/">
              <Button variant="ghost" size="sm" className="h-8 text-xs text-zinc-300 hover:text-white hover:bg-[#25252d]">
                <Home className="h-3.5 w-3.5 mr-1 text-[#017e84]" />
                Trang Chủ Quy Định
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Odoo Control Panel Bar */}
      <div className="bg-[#25252d] border-b border-[#32323d] shadow-sm sticky top-14 z-20">
        <div className="container mx-auto px-4 lg:px-6 py-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {/* Odoo Breadcrumbs & Primary Action Button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-sm font-medium text-zinc-300 gap-1.5">
                <span className="text-[#017e84] font-bold">Xử phạt</span>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-100 font-semibold">Nhật Ký Vi Phạm</span>
              </div>

              <button
                onClick={handleAddViolation}
                disabled={noRegulations}
                className="btn-odoo-green"
              >
                <Plus className="h-4 w-4" />
                Ghi Nhận Vi Phạm
              </button>
            </div>

            {/* Odoo Search & Filter Control View */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Tìm theo tên cá nhân..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-[#1e1e24] border-[#32323d] text-xs text-zinc-100 h-8 rounded focus-visible:ring-[#714B67]"
                />
              </div>

              {/* Person Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="btn-odoo-secondary">
                    <Users className="w-3.5 h-3.5 text-[#017e84]" />
                    {selectedPerson ? selectedPerson : "Nhân sự"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#25252d] border-[#32323d] text-zinc-200 text-xs rounded-md">
                  <DropdownMenuItem onSelect={() => handlePersonSelect(null)}>
                    Tất cả nhân sự
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#32323d]" />
                  {people.map((person) => (
                    <DropdownMenuItem key={person} onSelect={() => handlePersonSelect(person)}>
                      {person}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Time Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="btn-odoo-secondary">
                    <ListFilter className="w-3.5 h-3.5 text-[#28a745]" />
                    Thời gian
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#25252d] border-[#32323d] text-zinc-200 text-xs rounded-md">
                  <DropdownMenuItem onSelect={() => handleFilterChange(null)}>Tất cả</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleFilterChange('today')}>Hôm nay</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleFilterChange('this_week')}>Tuần này</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleFilterChange('this_month')}>Tháng này</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleFilterChange('this_year')}>Năm nay</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Switcher Buttons */}
              <div className="flex items-center gap-1 bg-[#1e1e24] p-0.5 rounded border border-[#32323d] shrink-0">
                <Link href="/">
                  <button className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded" title="Kanban View">
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </Link>
                <button className="p-1.5 text-zinc-200 bg-[#32323d] rounded" title="List View">
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Odoo Content Body */}
      <main className="container mx-auto px-4 lg:px-6 py-6 max-w-7xl space-y-6">
        {/* Odoo Stat Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#25252d] border border-[#32323d] rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase">TỔNG LƯỢT PHẠT</p>
              <p className="text-xl font-bold text-white">{stats.totalCount}</p>
            </div>
            <Users className="w-5 h-5 text-[#017e84]" />
          </div>

          <div className="bg-[#25252d] border border-[#32323d] rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase">ĐÃ HOÀN THÀNH</p>
              <p className="text-xl font-bold text-[#28a745]">{stats.completedCount}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-[#28a745]" />
          </div>

          <div className="bg-[#25252d] border border-[#32323d] rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase">CHƯA HOÀN THÀNH</p>
              <p className="text-xl font-bold text-amber-400">{stats.pendingCount}</p>
            </div>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>

          <div className="bg-[#25252d] border border-[#32323d] rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase">TỔNG TIỀN PHẠT</p>
              <p className="text-base font-bold text-[#28a745]">
                {new Intl.NumberFormat('vi-VN').format(stats.totalFinesSum)} đ
              </p>
            </div>
            <CircleDollarSign className="w-5 h-5 text-[#28a745]" />
          </div>
        </div>

        {/* Odoo List View Display */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-[#32323d] bg-[#25252d] py-20 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#28a745]"></div>
            <p className="text-zinc-400 text-xs font-medium">Đang tải Odoo List View...</p>
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
        <SheetContent className="sm:max-w-xl w-full flex flex-col bg-[#25252d] border-[#32323d] text-zinc-100 p-0">
          <div className="bg-[#1e1e24] px-6 py-4 border-b border-[#32323d] flex items-center justify-between">
            <div className="space-y-0.5">
              <SheetTitle className="text-zinc-100 text-lg font-bold">Ghi Nhận Vi Phạm Mới</SheetTitle>
              <SheetDescription className="text-zinc-400 text-xs">
                Odoo Form View
              </SheetDescription>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold bg-[#28a745]/20 text-[#28a745] border border-[#28a745]/30 px-2 py-0.5 rounded">
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