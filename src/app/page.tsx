"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Plus, ListChecks, Server, Search, CircleDollarSign, Ban, ShieldCheck, Filter, X, LayoutGrid, List, ChevronRight, SlidersHorizontal } from "lucide-react";
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
    <div className="min-h-screen bg-[#1e1e24] text-zinc-100 font-sans">
      {/* Odoo 17 Top Navbar */}
      <header className="bg-[#18181c] border-b border-[#32323d] sticky top-0 z-30">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex h-14 items-center justify-between gap-4">
            <Logo />
            <div className="flex items-center gap-2">
              <Link href="/vibehost">
                <Button variant="ghost" size="sm" className="h-8 text-xs text-zinc-300 hover:text-white hover:bg-[#25252d]">
                  <Server className="h-3.5 w-3.5 mr-1 text-[#017e84]" />
                  VibeHost MCP
                </Button>
              </Link>

              <Link href="/penalties">
                <Button variant="ghost" size="sm" className="h-8 text-xs text-zinc-300 hover:text-white hover:bg-[#25252d]">
                  <ListChecks className="h-3.5 w-3.5 mr-1 text-[#28a745]" />
                  Danh Sách Bị Phạt
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Odoo 17 Control Panel Bar */}
      <div className="bg-[#25252d] border-b border-[#32323d] shadow-sm sticky top-14 z-20">
        <div className="container mx-auto px-4 lg:px-6 py-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {/* Odoo Breadcrumbs & Primary Action Button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-sm font-medium text-zinc-300 gap-1.5">
                <span className="text-[#017e84] font-bold">Quy định</span>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-100 font-semibold">Khung Xử Phạt</span>
              </div>

              {/* Odoo Primary Action Button */}
              <button
                onClick={handleAddNew}
                className="btn-odoo-primary"
              >
                <Plus className="h-4 w-4" />
                Thêm Mới
              </button>
            </div>

            {/* Odoo Search & Filter Control View */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Search View */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm quy định..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-7 h-8 bg-[#1e1e24] border-[#32323d] text-xs text-zinc-100 rounded focus-visible:ring-[#714B67]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-[#1e1e24] p-0.5 rounded border border-[#32323d]">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`h-7 px-2.5 text-xs font-medium rounded transition-colors ${
                    activeFilter === "all"
                      ? "bg-[#714B67] text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Tất cả ({regulations.length})
                </button>

                <button
                  onClick={() => setActiveFilter("fine")}
                  className={`h-7 px-2.5 text-xs font-medium rounded transition-colors ${
                    activeFilter === "fine"
                      ? "bg-[#28a745] text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Phạt tiền ({stats.fineCount})
                </button>

                <button
                  onClick={() => setActiveFilter("restriction")}
                  className={`h-7 px-2.5 text-xs font-medium rounded transition-colors ${
                    activeFilter === "restriction"
                      ? "bg-rose-600 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Hạn chế ({stats.restrictionCount})
                </button>
              </div>

              {/* View Switcher Buttons */}
              <div className="flex items-center gap-1 bg-[#1e1e24] p-0.5 rounded border border-[#32323d] shrink-0">
                <button className="p-1.5 text-zinc-200 bg-[#32323d] rounded" title="Kanban View">
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <Link href="/penalties">
                  <button className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded" title="List View">
                    <List className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Odoo Content Body */}
      <main className="container mx-auto px-4 lg:px-6 py-6 max-w-7xl space-y-6">
        {/* Odoo Stat Buttons / KPI Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#25252d] border border-[#32323d] rounded-lg p-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">TỔNG QUY ĐỊNH</span>
              <div className="text-xl font-bold text-white">{stats.total}</div>
            </div>
            <ShieldCheck className="w-6 h-6 text-[#714B67]" />
          </div>

          <div className="bg-[#25252d] border border-[#32323d] rounded-lg p-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">PHẠT TIỀN</span>
              <div className="text-xl font-bold text-[#28a745]">{stats.fineCount}</div>
            </div>
            <CircleDollarSign className="w-6 h-6 text-[#28a745]" />
          </div>

          <div className="bg-[#25252d] border border-[#32323d] rounded-lg p-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">HẠN CHẾ</span>
              <div className="text-xl font-bold text-rose-400">{stats.restrictionCount}</div>
            </div>
            <Ban className="w-6 h-6 text-rose-400" />
          </div>

          <div className="bg-[#25252d] border border-[#32323d] rounded-lg p-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">MỨC PHẠT TỔNG</span>
              <div className="text-base font-bold text-[#017e84] truncate">
                {formatCurrency(stats.totalFineAmount)}
              </div>
            </div>
            <SlidersHorizontal className="w-6 h-6 text-[#017e84]" />
          </div>
        </div>

        {/* Odoo Kanban View Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-[#32323d] bg-[#25252d] py-20 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#714B67]"></div>
            <p className="text-zinc-400 text-xs font-medium">Đang tải Odoo Kanban View...</p>
          </div>
        ) : filteredRegulations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#32323d] bg-[#25252d] py-20 text-center space-y-3">
            <ShieldCheck className="h-10 w-10 text-zinc-500" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-200">
                {searchQuery || activeFilter !== "all"
                  ? "Không tìm thấy quy định phù hợp trong Odoo"
                  : "Chưa Có Quy Định Nào"}
              </h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Bắt đầu bằng cách bấm nút "Thêm Mới" ở thanh điều hướng Odoo.
              </p>
            </div>
            {searchQuery || activeFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="btn-odoo-secondary"
              >
                Xóa bộ lọc
              </button>
            ) : (
              <button onClick={handleAddNew} className="btn-odoo-primary">
                <Plus className="h-4 w-4" />
                Thêm Mới Quy Định
              </button>
            )}
          </div>
        )}
      </main>

      {/* Slide-over Odoo Form Sheet View */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg w-full flex flex-col bg-[#25252d] border-[#32323d] text-zinc-100 p-0">
          {/* Odoo Form Header Status Bar */}
          <div className="bg-[#1e1e24] px-6 py-4 border-b border-[#32323d] flex items-center justify-between">
            <div className="space-y-0.5">
              <SheetTitle className="text-zinc-100 text-lg font-bold">
                {editingRegulation ? "Sửa Quy Định Odoo" : "Tạo Quy Định Mới"}
              </SheetTitle>
              <SheetDescription className="text-zinc-400 text-xs">
                Odoo Form View
              </SheetDescription>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold bg-[#714B67]/20 text-[#714B67] border border-[#714B67]/30 px-2 py-0.5 rounded">
              {editingRegulation ? "Chỉnh sửa" : "Bản nháp"}
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col overflow-hidden">
            <RegulationForm
              onSave={handleSave}
              onClose={() => setIsSheetOpen(false)}
              regulation={editingRegulation}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
