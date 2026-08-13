"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Plus, ListChecks, Server, Search, CircleDollarSign, Ban, ShieldCheck, Filter, X, LayoutGrid, List, ChevronRight, ChevronLeft, SlidersHorizontal } from "lucide-react";
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
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529]">
      {/* Header Bar */}
      <header className="bg-white border-b border-[#DEE2E6] sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex h-12 items-center justify-between gap-4">
            <Logo />
            <div className="flex items-center gap-2">
              <Link href="/vibehost">
                <Button variant="outline" size="sm" className="h-8 text-xs border-[#DEE2E6] text-[#212529] hover:bg-zinc-100 font-medium">
                  <Server className="h-3.5 w-3.5 mr-1 text-[#017E84]" />
                  VibeHost MCP
                </Button>
              </Link>

              <Link href="/penalties">
                <Button variant="outline" size="sm" className="h-8 text-xs border-[#DEE2E6] text-[#212529] hover:bg-zinc-100 font-medium">
                  <ListChecks className="h-3.5 w-3.5 mr-1 text-[#28A745]" />
                  Danh Sách Bị Phạt
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Odoo 17 Light Mode Control Panel Bar */}
      <div className="bg-white border-b border-[#DEE2E6] shadow-sm sticky top-12 z-20">
        <div className="container mx-auto px-4 lg:px-6 py-2.5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {/* Left Controls: Breadcrumbs & Primary Purple Button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-xs font-medium text-[#212529] gap-1">
                <span className="text-[#017E84] font-semibold">Quy định</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#6C757D]" />
                <span className="text-[#212529] font-bold">Khung Xử Phạt</span>
              </div>

              <button
                onClick={handleAddNew}
                className="btn-odoo-purple text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm Quy Định
              </button>
            </div>

            {/* Central Odoo Search Bar */}
            <div className="relative flex items-center w-full md:w-96 bg-white border border-[#017E84] rounded px-2.5 py-1 shadow-sm">
              <Search className="w-3.5 h-3.5 text-[#017E84] mr-1.5 shrink-0" />
              
              {activeFilter !== "all" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#017E84] bg-[#017E84]/10 border border-[#017E84]/30 px-1.5 py-0.5 rounded mr-1 shrink-0">
                  {activeFilter === "fine" ? "Phạt tiền" : "Hạn chế"}
                  <button onClick={() => setActiveFilter("all")} className="hover:text-rose-600">
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
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-[#6C757D] hover:text-[#212529]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right Controls: Pagination & View Switcher Buttons */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-[#212529] font-medium">
                <span>1-{filteredRegulations.length} / {filteredRegulations.length}</span>
                <div className="flex items-center border border-[#DEE2E6] rounded bg-white">
                  <button className="p-1 hover:bg-zinc-100 border-r border-[#DEE2E6]">
                    <ChevronLeft className="w-3 h-3 text-[#6C757D]" />
                  </button>
                  <button className="p-1 hover:bg-zinc-100">
                    <ChevronRight className="w-3 h-3 text-[#6C757D]" />
                  </button>
                </div>
              </div>

              <div className="flex items-center border border-[#017E84] rounded bg-white overflow-hidden">
                <button className="p-1.5 bg-[#017E84]/15 text-[#017E84]" title="Kanban View">
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <Link href="/penalties">
                  <button className="p-1.5 text-[#6C757D] hover:text-[#017E84]" title="List View">
                    <List className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="container mx-auto px-4 lg:px-6 py-5 max-w-7xl space-y-5">
        {/* KPI Stat Cards (Numbers are BLACK #212529 text as circled in Image 2) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#DEE2E6] rounded-lg p-4 flex items-center justify-between shadow-xs">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider">TỔNG QUY ĐỊNH</p>
              <p className="text-xl font-bold text-[#212529]">{stats.total}</p>
            </div>
            <ShieldCheck className="w-5 h-5 text-[#714B67]" />
          </div>

          <div className="bg-white border border-[#DEE2E6] rounded-lg p-4 flex items-center justify-between shadow-xs">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider">PHẠT TIỀN</p>
              {/* Circled Area in Image 2: BLACK #212529 text */}
              <p className="text-xl font-bold text-[#212529]">{stats.fineCount}</p>
            </div>
            <CircleDollarSign className="w-5 h-5 text-[#28A745]" />
          </div>

          <div className="bg-white border border-[#DEE2E6] rounded-lg p-4 flex items-center justify-between shadow-xs">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider">HẠN CHẾ</p>
              {/* Circled Area in Image 2: BLACK #212529 text */}
              <p className="text-xl font-bold text-[#212529]">{stats.restrictionCount}</p>
            </div>
            <Ban className="w-5 h-5 text-rose-600" />
          </div>

          <div className="bg-white border border-[#DEE2E6] rounded-lg p-4 flex items-center justify-between shadow-xs">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider">MỨC PHẠT MAX</p>
              {/* Circled Area in Image 2: BLACK #212529 text */}
              <p className="text-lg font-bold text-[#212529] truncate">
                {formatCurrency(stats.totalFineAmount)}
              </p>
            </div>
            <SlidersHorizontal className="w-5 h-5 text-[#017E84]" />
          </div>
        </div>

        {/* Odoo Kanban View Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded border border-[#E5E7EB] bg-white py-20 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#017E84]"></div>
            <p className="text-[#6C757D] text-xs font-medium">Đang tải danh sách quy định...</p>
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
          <div className="flex flex-col items-center justify-center rounded border border-dashed border-[#DEE2E6] bg-white py-20 text-center space-y-3">
            <ShieldCheck className="h-10 w-10 text-[#6C757D]" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#212529]">
                {searchQuery || activeFilter !== "all"
                  ? "Không tìm thấy quy định phù hợp"
                  : "Chưa Có Quy Định Nào"}
              </h3>
              <p className="text-xs text-[#6C757D] max-w-xs mx-auto">
                Bắt đầu bằng cách bấm nút "Thêm Quy Định" ở thanh điều khiển.
              </p>
            </div>
            {searchQuery || activeFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="btn-odoo-outline"
              >
                Xóa bộ lọc
              </button>
            ) : (
              <button onClick={handleAddNew} className="btn-odoo-purple font-bold">
                <Plus className="h-4 w-4" />
                Thêm Quy Định
              </button>
            )}
          </div>
        )}
      </main>

      {/* Form Sheet View */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg w-full flex flex-col bg-white border-[#DEE2E6] text-[#212529] p-0 shadow-xl">
          <div className="bg-[#F8F9FA] px-6 py-3.5 border-b border-[#DEE2E6] flex items-center justify-between">
            <div className="space-y-0.5">
              <SheetTitle className="text-[#212529] text-base font-bold">
                {editingRegulation ? "Sửa Quy Định" : "Tạo Quy Định Mới"}
              </SheetTitle>
              <SheetDescription className="text-[#6C757D] text-xs">
                Biểu mẫu nhập liệu quy định
              </SheetDescription>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20 px-2 py-0.5 rounded">
              {editingRegulation ? "Đã lưu" : "Bản nháp"}
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
