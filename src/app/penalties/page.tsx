"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ListFilter, Search, Plus, Users, CircleDollarSign, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { PenaltyList } from "@/components/PenaltyList";
import type { ViolationRecord, Regulation } from "@/lib/types";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { DateRange } from "react-day-picker";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="min-h-screen bg-[#070b12] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Ambient Emerald Glowing Background Effects */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-[#070b12]/70 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            <Logo />
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5 rounded-xl backdrop-blur-md">
                <Home className="h-4 w-4 text-emerald-400" />
                Trang Chủ Quy Định
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 lg:px-8 py-10 max-w-7xl space-y-8 relative z-10">
        {/* Header Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/15 text-emerald-300 border-emerald-500/40 text-xs px-3 py-1 font-bold rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                Nhật Ký Vi Phạm Nhân Sự
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Danh Sách Bị Phạt</h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Duyệt, theo dõi và đánh dấu hoàn thành nghĩa vụ cho tất cả các trường hợp vi phạm quy định.
            </p>
          </div>

          {/* Primary Emerald Gradient CTA */}
          <Button
            onClick={handleAddViolation}
            disabled={noRegulations}
            className="gap-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-400 text-slate-950 font-black shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all rounded-xl border-0 shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            Ghi Nhận Vi Phạm Mới
          </Button>
        </div>

        {/* Liquid Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl rounded-2xl">
            <CardContent className="p-5 flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng Lượt Phạt</p>
                <p className="text-2xl font-black text-white">{stats.totalCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl rounded-2xl">
            <CardContent className="p-5 flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đã Hoàn Thành</p>
                <p className="text-2xl font-black text-emerald-400">{stats.completedCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl rounded-2xl">
            <CardContent className="p-5 flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chưa Nộp/Thực Hiện</p>
                <p className="text-2xl font-black text-amber-400">{stats.pendingCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl rounded-2xl">
            <CardContent className="p-5 flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-lime-500/15 text-lime-400 border border-lime-500/30">
                <CircleDollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng Tiền Phạt</p>
                <p className="text-xl font-black bg-gradient-to-r from-emerald-400 to-lime-300 bg-clip-text text-transparent">
                  {new Intl.NumberFormat('vi-VN').format(stats.totalFinesSum)} đ
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-2xl">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/80" />
            <Input
              type="text"
              placeholder="Tìm theo tên cá nhân, quy định..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-950/60 border-white/10 text-sm text-slate-100 rounded-xl"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Person Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-white/10 text-xs rounded-xl hover:bg-white/5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  {selectedPerson ? selectedPerson : "Tất cả nhân sự"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900/90 backdrop-blur-xl border-white/10 text-slate-200 rounded-xl">
                <DropdownMenuItem onSelect={() => handlePersonSelect(null)}>
                  Tất cả nhân sự
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                {people.map((person) => (
                  <DropdownMenuItem key={person} onSelect={() => handlePersonSelect(person)}>
                    {person}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Time Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-white/10 text-xs rounded-xl hover:bg-white/5">
                  <ListFilter className="w-3.5 h-3.5 text-emerald-400" />
                  Lọc thời gian
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900/90 backdrop-blur-xl border-white/10 text-slate-200 rounded-xl">
                <DropdownMenuItem onSelect={() => handleFilterChange(null)}>Tất cả</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleFilterChange('today')}>Hôm nay</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleFilterChange('this_week')}>Tuần này</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleFilterChange('this_month')}>Tháng này</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleFilterChange('this_year')}>Năm nay</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {(selectedPerson || filter || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPerson(null);
                  setFilter(null);
                  setSearchQuery("");
                }}
                className="h-8 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>

        {/* Penalty List Display */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/20 backdrop-blur-xl py-24 text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
            <p className="text-slate-400 text-sm font-medium">Đang tải danh sách xử phạt...</p>
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
        <SheetContent className="sm:max-w-xl w-full flex flex-col bg-slate-950/95 backdrop-blur-2xl border-white/10 text-slate-100">
          <SheetHeader className="pr-8 pb-3 border-b border-white/10">
            <SheetTitle className="text-slate-100 text-xl font-bold">Ghi Nhận Vi Phạm Mới</SheetTitle>
            <SheetDescription className="text-slate-400 text-xs">
              Chọn cá nhân và áp dụng quy định xử phạt tương ứng.
            </SheetDescription>
          </SheetHeader>
          <ViolationForm
            onSave={handleSaveViolations}
            onClose={() => setIsSheetOpen(false)}
            regulations={regulations}
            people={people}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}