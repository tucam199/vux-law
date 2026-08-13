"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, CircleDollarSign, Ban, ShieldCheck, X, LayoutGrid, List, ChevronRight, ChevronLeft, SlidersHorizontal, Zap, Filter, FolderPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { RegulationCard } from "@/components/RegulationCard";
import { RegulationForm } from "@/components/RegulationForm";
import { ViolationForm } from "@/components/ViolationForm";
import { EmployeeManagerModal } from "@/components/EmployeeManagerModal";
import { HeaderNav } from "@/components/HeaderNav";
import type { Regulation, ViolationRecord, Employee } from "@/lib/types";
import { getRegulations, addRegulation, updateRegulation, deleteRegulation } from "@/lib/regulationService";
import { addMultiplePenalties, getPenalties } from "@/lib/penaltyService";
import { getEmployees } from "@/lib/employeeService";
import { useToast } from "@/hooks/use-toast";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

export default function Home() {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [penalties, setPenalties] = useState<ViolationRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [isQuickPenaltyOpen, setIsQuickPenaltyOpen] = useState(false);
  const [quickPenaltyRegulation, setQuickPenaltyRegulation] = useState<Regulation | null>(null);
  const [editingRegulation, setEditingRegulation] = useState<Regulation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "fine" | "restriction">("all");
  const [viewMode, setViewMode] = useState<"swimlanes" | "grid">("swimlanes");
  const { toast } = useToast();

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedRegs, fetchedPens, fetchedEmps] = await Promise.all([
        getRegulations(),
        getPenalties(),
        getEmployees(),
      ]);
      setRegulations(fetchedRegs);
      setPenalties(fetchedPens);
      setEmployees(fetchedEmps);
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
    fetchInitialData();
  }, [fetchInitialData]);

  const peopleNames = useMemo(() => {
    return employees.map(e => e.name);
  }, [employees]);

  const handleAddNew = (defaultCategory?: string) => {
    setEditingRegulation(defaultCategory ? ({ category: defaultCategory, violation: '', penalty: { type: 'fine', amount: 50000 } } as any) : null);
    setIsSheetOpen(true);
  };

  const handleEdit = (regulation: Regulation) => {
    setEditingRegulation(regulation);
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRegulation(id);
      await fetchInitialData();
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
      await fetchInitialData();
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

  // Quick 1-Click Penalty Action from Card
  const handleQuickPenalty = (regulation: Regulation) => {
    setQuickPenaltyRegulation(regulation);
    setIsQuickPenaltyOpen(true);
  };

  const handleSaveQuickPenalty = async (violations: Omit<ViolationRecord, 'id'>[]) => {
    try {
      await addMultiplePenalties(violations);
      toast({
        title: "Thành công ⚡",
        description: `Đã phạt nhanh ${violations.length} nhân sự thành công.`,
      });
      setIsQuickPenaltyOpen(false);
      await fetchInitialData();
    } catch (error) {
      console.error("Error saving quick penalty:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu phạt nhanh. Vui lòng thử lại.",
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

    const pendingPenaltiesCount = penalties.filter(p => !p.isCompleted).length;

    return { total, fineCount, restrictionCount, totalFineAmount, pendingPenaltiesCount };
  }, [regulations, penalties]);

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

  // Grouped by Category for Swimlane Odoo View
  const categorySwimlanes = useMemo(() => {
    const map = new Map<string, Regulation[]>();
    for (const reg of filteredRegulations) {
      const cat = reg.category || "Quy định chung";
      const list = map.get(cat) || [];
      list.push(reg);
      map.set(cat, list);
    }
    return Array.from(map.entries());
  }, [filteredRegulations]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529]">
      {/* Unified Odoo Module Header Bar */}
      <HeaderNav pendingPenaltiesCount={stats.pendingPenaltiesCount} />

      {/* Odoo 17 Light Mode Control Panel Bar */}
      <div className="bg-white border-b border-[#DEE2E6] shadow-xs sticky top-12 z-20">
        <div className="container mx-auto px-4 lg:px-6 py-2.5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {/* Left Controls: Breadcrumbs, Primary Action & Dynamic Employee Manager */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-xs font-medium text-[#212529] gap-1 mr-1">
                <span className="text-[#017E84] font-semibold">Quy định</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#6C757D]" />
                <span className="text-[#212529] font-bold">Khung Xử Phạt</span>
              </div>

              <button
                onClick={() => handleAddNew()}
                className="btn-odoo-purple text-xs font-bold shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm Quy Định
              </button>

              {/* Dynamic Employee Manager Modal Trigger */}
              <button
                onClick={() => setIsEmpModalOpen(true)}
                className="btn-odoo-outline text-xs font-medium"
              >
                <Users className="w-3.5 h-3.5 text-[#017E84]" />
                <span>Quản Lý Nhân Sự ({employees.length})</span>
              </button>
            </div>

            {/* Central Odoo Search Bar */}
            <div className="relative flex items-center w-full md:w-80 bg-white border border-[#017E84] rounded px-2.5 py-1 shadow-xs">
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

            {/* Right Controls: View Switcher & Pagination */}
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
                <button
                  onClick={() => setViewMode("swimlanes")}
                  className={`p-1.5 text-xs flex items-center gap-1 ${
                    viewMode === "swimlanes" ? "bg-[#017E84]/15 text-[#017E84] font-bold" : "text-[#6C757D] hover:text-[#017E84]"
                  }`}
                  title="Odoo Swimlanes Column View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Swimlanes</span>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 text-xs flex items-center gap-1 ${
                    viewMode === "grid" ? "bg-[#017E84]/15 text-[#017E84] font-bold" : "text-[#6C757D] hover:text-[#017E84]"
                  }`}
                  title="Grid View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Grid</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="container mx-auto px-4 lg:px-6 py-5 max-w-7xl space-y-6">
        {/* INTERACTIVE KPI STAT CARDS */}
        <div className="space-y-1">
          <div className="flex justify-between items-center px-1">
            <span className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#714B67]" />
              Bộ lọc nhanh 1-Click
            </span>
            {activeFilter !== "all" && (
              <button
                onClick={() => setActiveFilter("all")}
                className="text-[11px] text-[#017E84] hover:underline font-semibold"
              >
                Hiển thị tất cả ({stats.total})
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveFilter("all")}
              className={`bg-white border rounded-lg p-4 flex items-center justify-between transition-all cursor-pointer hover:border-[#714B67] ${
                activeFilter === "all"
                  ? "border-2 border-[#714B67] bg-[#714B67]/5 shadow-sm ring-1 ring-[#714B67]/20"
                  : "border-[#DEE2E6] shadow-xs"
              }`}
            >
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider">TỔNG QUY ĐỊNH</p>
                <p className="text-xl font-bold text-[#212529]">{stats.total}</p>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#714B67]" />
            </div>

            <div
              onClick={() => setActiveFilter("fine")}
              className={`bg-white border rounded-lg p-4 flex items-center justify-between transition-all cursor-pointer hover:border-[#28A745] ${
                activeFilter === "fine"
                  ? "border-2 border-[#28A745] bg-[#28A745]/5 shadow-sm ring-1 ring-[#28A745]/20"
                  : "border-[#DEE2E6] shadow-xs"
              }`}
            >
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider">PHẠT TIỀN (FILTER)</p>
                <p className="text-xl font-bold text-[#212529]">{stats.fineCount}</p>
              </div>
              <CircleDollarSign className="w-5 h-5 text-[#28A745]" />
            </div>

            <div
              onClick={() => setActiveFilter("restriction")}
              className={`bg-white border rounded-lg p-4 flex items-center justify-between transition-all cursor-pointer hover:border-rose-500 ${
                activeFilter === "restriction"
                  ? "border-2 border-rose-500 bg-rose-500/5 shadow-sm ring-1 ring-rose-500/20"
                  : "border-[#DEE2E6] shadow-xs"
              }`}
            >
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider">HẠN CHẾ (FILTER)</p>
                <p className="text-xl font-bold text-[#212529]">{stats.restrictionCount}</p>
              </div>
              <Ban className="w-5 h-5 text-rose-600" />
            </div>

            <div className="bg-white border border-[#DEE2E6] rounded-lg p-4 flex items-center justify-between shadow-xs">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider">MỨC PHẠT MAX</p>
                <p className="text-lg font-bold text-[#212529] truncate">
                  {formatCurrency(stats.totalFineAmount)}
                </p>
              </div>
              <SlidersHorizontal className="w-5 h-5 text-[#017E84]" />
            </div>
          </div>
        </div>

        {/* GROUPED ODOO KANBAN SWIMLANES OR GRID VIEW */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded border border-[#E5E7EB] bg-white py-20 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#017E84]"></div>
            <p className="text-[#6C757D] text-xs font-medium">Đang tải Odoo Kanban View...</p>
          </div>
        ) : filteredRegulations.length > 0 ? (
          viewMode === "swimlanes" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categorySwimlanes.map(([categoryName, categoryList]) => (
                <div key={categoryName} className="bg-[#F1F3F5]/60 border border-[#DEE2E6] rounded-lg p-3.5 space-y-3 flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DEE2E6]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#212529]">{categoryName}</span>
                      <span className="text-[10px] font-bold bg-white text-[#714B67] border border-[#DEE2E6] px-1.5 py-0.2 rounded-full">
                        {categoryList.length}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddNew(categoryName)}
                      className="p-1 text-[#017E84] hover:bg-white rounded transition-colors"
                      title={`Thêm quy định cho ${categoryName}`}
                    >
                      <FolderPlus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 flex-1">
                    {categoryList.map((regulation) => (
                      <RegulationCard
                        key={regulation.id}
                        regulation={regulation}
                        onEdit={() => handleEdit(regulation)}
                        onDelete={() => handleDelete(regulation.id)}
                        onQuickPenalty={handleQuickPenalty}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRegulations.map((regulation) => (
                <RegulationCard
                  key={regulation.id}
                  regulation={regulation}
                  onEdit={() => handleEdit(regulation)}
                  onDelete={() => handleDelete(regulation.id)}
                  onQuickPenalty={handleQuickPenalty}
                />
              ))}
            </div>
          )
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
              <button onClick={() => handleAddNew()} className="btn-odoo-purple font-bold">
                <Plus className="h-4 w-4" />
                Thêm Quy Định
              </button>
            )}
          </div>
        )}
      </main>

      {/* Form Sheet View for Edit/Add Regulation */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg w-full flex flex-col bg-white border-[#DEE2E6] text-[#212529] p-0 shadow-xl">
          <div className="bg-[#F8F9FA] px-6 py-3.5 border-b border-[#DEE2E6] flex items-center justify-between">
            <div className="space-y-0.5">
              <SheetTitle className="text-[#212529] text-base font-bold">
                {editingRegulation?.id ? "Sửa Quy Định" : "Tạo Quy Định Mới"}
              </SheetTitle>
              <SheetDescription className="text-[#6C757D] text-xs">
                Biểu mẫu nhập liệu quy định
              </SheetDescription>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20 px-2 py-0.5 rounded">
              {editingRegulation?.id ? "Đã lưu" : "Bản nháp"}
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

      {/* QUICK PENALTY SHEET MODAL */}
      <Sheet open={isQuickPenaltyOpen} onOpenChange={setIsQuickPenaltyOpen}>
        <SheetContent className="sm:max-w-xl w-full flex flex-col bg-white border-[#DEE2E6] text-[#212529] p-0 shadow-xl">
          <div className="bg-[#28A745]/10 px-6 py-3.5 border-b border-[#28A745]/20 flex items-center justify-between">
            <div className="space-y-0.5">
              <SheetTitle className="text-[#212529] text-base font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#28A745]" />
                Phạt Nhanh Nhân Sự
              </SheetTitle>
              <SheetDescription className="text-[#6C757D] text-xs">
                Quy định chọn sẵn: <strong className="text-[#212529]">{quickPenaltyRegulation?.violation}</strong>
              </SheetDescription>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold bg-[#28A745] text-white px-2 py-0.5 rounded shadow-xs">
              ⚡ 1-Click Fast Action
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col overflow-hidden">
            <ViolationForm
              onSave={handleSaveQuickPenalty}
              onClose={() => setIsQuickPenaltyOpen(false)}
              regulations={quickPenaltyRegulation ? [quickPenaltyRegulation] : regulations}
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
        onRefresh={fetchInitialData}
      />
    </div>
  );
}
