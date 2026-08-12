"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Plus, ListChecks, Server, Search, CircleDollarSign, Ban, ShieldCheck, Sparkles, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { RegulationCard } from "@/components/RegulationCard";
import { RegulationForm } from "@/components/RegulationForm";
import { Logo } from "@/components/Logo";
import type { Regulation } from "@/lib/types";
import { getRegulations, addRegulation, updateRegulation, deleteRegulation } from "@/lib/regulationService";
import { useToast } from "@/hooks/use-toast";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

export default function Home() {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRegulation, setEditingRegulation] = useState<Regulation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "fine" | "restriction">("all");
  const { toast } = useToast();

  const fetchRegulations = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedRegulations = await getRegulations();
      setRegulations(fetchedRegulations);
    } catch (error) {
      console.error("Error fetching regulations:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải quy định. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRegulations();
  }, [fetchRegulations]);

  const handleAddNew = () => {
    setEditingRegulation(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (regulation: Regulation) => {
    setEditingRegulation(regulation);
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRegulation(id);
      await fetchRegulations();
      toast({
        title: "Thành công",
        description: "Đã xóa quy định.",
      });
    } catch (error) {
      console.error("Error deleting regulation: ", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa quy định. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (
    regulationData: Omit<Regulation, "id"> & { id?: string }
  ) => {
    try {
      if (regulationData.id) {
        const { id, ...dataToUpdate } = regulationData;
        await updateRegulation(id, dataToUpdate);
        toast({
          title: "Thành công",
          description: "Đã cập nhật quy định.",
        });
      } else {
        const { id, ...dataToAdd } = regulationData;
        await addRegulation(dataToAdd);
        toast({
          title: "Thành công",
          description: "Đã tạo quy định mới.",
        });
      }
      setIsSheetOpen(false);
      await fetchRegulations();
    } catch (error) {
      console.error("Error saving regulation: ", error);
      toast({
        title: "Lỗi",
        description: `Không thể lưu quy định: ${error instanceof Error ? error.message : "Vui lòng thử lại."}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  // KPI Metrics Calculation
  const stats = useMemo(() => {
    const total = regulations.length;
    const fineCount = regulations.filter((r) => r.penalty?.type === "fine").length;
    const restrictionCount = regulations.filter((r) => r.penalty?.type === "restriction").length;
    const totalFineAmount = regulations
      .filter((r) => r.penalty?.type === "fine")
      .reduce((sum, r) => sum + (r.penalty?.amount || 0), 0);

    return { total, fineCount, restrictionCount, totalFineAmount };
  }, [regulations]);

  // Filtered regulations
  const filteredRegulations = useMemo(() => {
    return regulations.filter((reg) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        reg.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.violation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "fine" && reg.penalty?.type === "fine") ||
        (activeFilter === "restriction" && reg.penalty?.type === "restriction");

      return matchesSearch && matchesFilter;
    });
  }, [regulations, searchQuery, activeFilter]);

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Ambient Emerald Glowing Background Effects */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Liquid Glass Header Bar */}
      <header className="sticky top-0 z-30 bg-[#070b12]/70 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            <Logo />
            <div className="flex items-center gap-3">
              <Link href="/vibehost">
                <Button variant="outline" size="sm" className="gap-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300 rounded-xl backdrop-blur-md">
                  <Server className="h-4 w-4" />
                  VibeHost MCP
                </Button>
              </Link>

              <Link href="/penalties">
                <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5 rounded-xl backdrop-blur-md">
                  <ListChecks className="h-4 w-4 text-emerald-400" />
                  Danh Sách Bị Phạt
                </Button>
              </Link>

              {/* Primary Emerald Gradient CTA Button */}
              <Button
                onClick={handleAddNew}
                size="sm"
                className="gap-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-400 text-slate-950 font-black shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all rounded-xl border-0"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                Thêm Quy Định
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-6 lg:px-8 py-10 max-w-7xl space-y-8 relative z-10">
        {/* Hero & Liquid Glass KPI Dashboard Section */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-8 shadow-2xl shadow-black/50">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3">
              <Badge variant="outline" className="bg-emerald-500/15 text-emerald-300 border-emerald-500/40 gap-1.5 px-3 py-1 text-xs font-bold rounded-full shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Hệ thống Quản lý Quy định VUX Law
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Danh Mục Quy Định
              </h1>
              <p className="text-slate-400 max-w-xl text-sm sm:text-base leading-relaxed">
                Duyệt, thiết lập và quản lý các khung xử phạt vi phạm nhằm đảm bảo kỷ luật và tính minh bạch cho tổ chức.
              </p>
            </div>

            {/* Liquid KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 shrink-0">
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/10 backdrop-blur-xl space-y-1 hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Quy Định
                </div>
                <div className="text-2xl font-black text-white">{stats.total}</div>
                <p className="text-[11px] text-slate-500 font-medium">Khung xử phạt</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/10 backdrop-blur-xl space-y-1 hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase">
                  <CircleDollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Phạt Tiền
                </div>
                <div className="text-2xl font-black text-emerald-400">{stats.fineCount}</div>
                <p className="text-[11px] text-slate-500 font-medium">Quy định áp dụng</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/10 backdrop-blur-xl space-y-1 hover:border-rose-500/30 transition-all">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase">
                  <Ban className="w-3.5 h-3.5 text-rose-400" />
                  Hạn Chế
                </div>
                <div className="text-2xl font-black text-rose-400">{stats.restrictionCount}</div>
                <p className="text-[11px] text-slate-500 font-medium">Mức phạt kỷ luật</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/10 backdrop-blur-xl space-y-1 hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                  Mức Phạt max
                </div>
                <div className="text-lg font-black bg-gradient-to-r from-emerald-400 to-lime-300 bg-clip-text text-transparent truncate">
                  {formatCurrency(stats.totalFineAmount)}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Tổng tiềm năng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Liquid Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-2xl">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/80" />
            <Input
              type="text"
              placeholder="Tìm kiếm hạng mục, vi phạm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-8 bg-slate-950/60 border-white/10 text-sm focus-visible:ring-emerald-500 text-slate-100 rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              Lọc theo:
            </span>
            <Button
              size="sm"
              variant={activeFilter === "all" ? "default" : "outline"}
              onClick={() => setActiveFilter("all")}
              className={`h-8 text-xs font-bold rounded-full transition-all ${
                activeFilter === "all"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              Tất cả ({regulations.length})
            </Button>

            <Button
              size="sm"
              variant={activeFilter === "fine" ? "default" : "outline"}
              onClick={() => setActiveFilter("fine")}
              className={`h-8 text-xs font-bold rounded-full gap-1 transition-all ${
                activeFilter === "fine"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <CircleDollarSign className="w-3.5 h-3.5" />
              Phạt tiền ({stats.fineCount})
            </Button>

            <Button
              size="sm"
              variant={activeFilter === "restriction" ? "default" : "outline"}
              onClick={() => setActiveFilter("restriction")}
              className={`h-8 text-xs font-bold rounded-full gap-1 transition-all ${
                activeFilter === "restriction"
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/20"
                  : "border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              Hạn chế ({stats.restrictionCount})
            </Button>
          </div>
        </div>

        {/* Regulations Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/20 backdrop-blur-xl py-28 text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
            <p className="text-slate-400 text-sm font-medium">Đang tải danh sách quy định...</p>
          </div>
        ) : filteredRegulations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRegulations.map((regulation) => (
              <RegulationCard
                key={regulation.id}
                regulation={regulation}
                onEdit={() => handleEdit(regulation)}
                onDelete={() => handleDelete(regulation.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-900/20 backdrop-blur-xl py-24 text-center space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-slate-500 shadow-xl">
              <ShieldCheck className="h-10 w-10 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-200">
                {searchQuery || activeFilter !== "all"
                  ? "Không tìm thấy quy định phù hợp"
                  : "Chưa Có Quy Định Nào"}
              </h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                {searchQuery || activeFilter !== "all"
                  ? "Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt bộ lọc."
                  : "Bắt đầu bằng cách thêm quy định xử phạt đầu tiên vào cơ sở dữ liệu."}
              </p>
            </div>
            {searchQuery || activeFilter !== "all" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="border-white/10 rounded-xl"
              >
                Xóa bộ lọc
              </Button>
            ) : (
              <Button
                onClick={handleAddNew}
                size="sm"
                className="gap-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-400 text-slate-950 font-black shadow-lg shadow-emerald-500/25 rounded-xl border-0"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                Thêm Quy Định Mới
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Slide-over Form Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg w-full flex flex-col bg-slate-950/95 backdrop-blur-2xl border-white/10 text-slate-100">
          <SheetHeader className="pr-8 pb-3 border-b border-white/10">
            <SheetTitle className="text-slate-100 text-xl font-bold">
              {editingRegulation ? "Chỉnh Sửa Quy Định" : "Tạo Quy Định Mới"}
            </SheetTitle>
            <SheetDescription className="text-slate-400 text-xs">
              {editingRegulation
                ? "Sửa đổi chi tiết và hình phạt của quy định hiện có."
                : "Điền biểu mẫu bên dưới để thêm quy định xử phạt vào cơ sở dữ liệu."}
            </SheetDescription>
          </SheetHeader>
          <RegulationForm
            onSave={handleSave}
            onClose={() => setIsSheetOpen(false)}
            regulation={editingRegulation}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
