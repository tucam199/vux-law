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
import { motion, AnimatePresence } from "motion/react";

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
    <div className="min-h-screen bg-[var(--bg-main,#FAFAFA)] text-[var(--text-primary,#2F3438)]">
      {/* Unified Notion Module Header Bar */}
      <HeaderNav pendingPenaltiesCount={stats.pendingPenaltiesCount} />

      {/* Notion Control Panel Bar */}
      <div className="bg-white border-b border-[#E9E9E7] shadow-2xs sticky top-12 z-20">
        <div className="container mx-auto px-4 lg:px-6 py-2.5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {/* Left Controls: Breadcrumbs, Primary Action & Dynamic Employee Manager */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-xs font-medium text-[#2F3438] gap-1 mr-1">
                <span className="text-[#2F3438] font-semibold">Quy định</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#787774]" />
                <span className="text-[#2F3438] font-bold">Khung Xử Phạt</span>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => handleAddNew()}
                className="btn-token-primary text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm Quy Định
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsEmpModalOpen(true)}
                className="btn-token-outline text-xs font-medium"
              >
                <Users className="w-3.5 h-3.5 text-[#2F3438]" />
                <span>Quản Lý Nhân Sự ({employees.length})</span>
              </motion.button>
            </div>

            {/* Central Notion Search Bar */}
            <div className="relative flex items-center w-full md:w-80 bg-white border border-[#D3D3D0] focus-within:border-[#2F3438] rounded px-2.5 py-1 shadow-2xs transition-colors">
              <Search className="w-3.5 h-3.5 text-[#787774] mr-1.5 shrink-0" />
              
              {activeFilter !== "all" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2F3438] bg-[#F0F0EF] border border-[#E0E0DE] px-1.5 py-0.5 rounded mr-1 shrink-0">
                  {activeFilter === "fine" ? "Phạt tiền" : "Hạn chế"}
                  <button onClick={() => setActiveFilter("all")} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-[#2F3438] focus:outline-none placeholder-[#787774]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-[#787774] hover:text-[#2F3438]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right Controls: View Switcher & Pagination */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-[#2F3438] font-medium">
                <span>1-{filteredRegulations.length} / {filteredRegulations.length}</span>
                <div className="flex items-center border border-[#E9E9E7] rounded bg-white">
                  <button className="p-1 hover:bg-[#F7F7F5] border-r border-[#E9E9E7]">
                    <ChevronLeft className="w-3 h-3 text-[#787774]" />
                  </button>
                  <button className="p-1 hover:bg-[#F7F7F5]">
                    <ChevronRight className="w-3 h-3 text-[#787774]" />
                  </button>
                </div>
              </div>

              <div className="flex items-center border border-[#D3D3D0] rounded bg-white overflow-hidden">
                <button
                  onClick={() => setViewMode("swimlanes")}
                  className={`p-1.5 text-xs flex items-center gap-1 transition-colors ${
                    viewMode === "swimlanes" ? "bg-[#F0F0EF] text-[#2F3438] font-bold" : "text-[#787774] hover:text-[#2F3438]"
                  }`}
                  title="Swimlanes Column View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Swimlanes</span>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 text-xs flex items-center gap-1 transition-colors ${
                    viewMode === "grid" ? "bg-[#F0F0EF] text-[#2F3438] font-bold" : "text-[#787774] hover:text-[#2F3438]"
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
        {/* INTERACTIVE MOTION KPI STAT CARDS */}
        <div className="space-y-1">
          <div className="flex justify-between items-center px-1">
            <span className="text-[11px] font-bold text-[#787774] uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#2F3438]" />
              Bộ lọc nhanh 1-Click
            </span>
            {activeFilter !== "all" && (
              <button
                onClick={() => setActiveFilter("all")}
                className="text-[11px] text-[#2F3438] hover:underline font-semibold"
              >
                Hiển thị tất cả ({stats.total})
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveFilter("all")}
              className={`bg-white border rounded-lg p-4 flex items-center justify-between transition-all cursor-pointer hover:border-[#2F3438] ${
                activeFilter === "all"
                  ? "border-2 border-[#2F3438] bg-[#F7F7F5] shadow-xs"
                  : "border-[#E9E9E7] shadow-2xs"
              }`}
            >
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-[#787774] uppercase tracking-wider">TỔNG QUY ĐỊNH</p>
                <p className="text-xl font-bold text-[#2F3438]">{stats.total}</p>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#2F3438]" />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveFilter("fine")}
              className={`bg-white border rounded-lg p-4 flex items-center justify-between transition-all cursor-pointer hover:border-[#2F3438] ${
                activeFilter === "fine"
                  ? "border-2 border-[#2F3438] bg-[#F7F7F5] shadow-xs"
                  : "border-[#E9E9E7] shadow-2xs"
              }`}
            >
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-[#787774] uppercase tracking-wider">PHẠT TIỀN (FILTER)</p>
                <p className="text-xl font-bold text-[#2F3438]">{stats.fineCount}</p>
              </div>
              <CircleDollarSign className="w-5 h-5 text-[#2F3438]" />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveFilter("restriction")}
              className={`bg-white border rounded-lg p-4 flex items-center justify-between transition-all cursor-pointer hover:border-[#2F3438] ${
                activeFilter === "restriction"
                  ? "border-2 border-[#2F3438] bg-[#F7F7F5] shadow-xs"
                  : "border-[#E9E9E7] shadow-2xs"
              }`}
            >
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-[#787774] uppercase tracking-wider">HẠN CHẾ (FILTER)</p>
                <p className="text-xl font-bold text-[#2F3438]">{stats.restrictionCount}</p>
              </div>
              <Ban className="w-5 h-5 text-[#2F3438]" />
            </motion.div>

            <div className="bg-white border border-[#E9E9E7] rounded-lg p-4 flex items-center justify-between shadow-2xs">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-[#787774] uppercase tracking-wider">MỨC PHẠT MAX</p>
                <p className="text-lg font-bold text-[#2F3438] truncate">
                  {formatCurrency(stats.totalFineAmount)}
                </p>
              </div>
              <SlidersHorizontal className="w-5 h-5 text-[#2F3438]" />
            </div>
          </div>
        </div>

        {/* GROUPED NOTION KANBAN SWIMLANES OR GRID VIEW */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded border border-[#E9E9E7] bg-white py-20 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F3438]"></div>
            <p className="text-[#787774] text-xs font-medium">Đang tải Notion Swimlane View...</p>
          </div>
        ) : filteredRegulations.length > 0 ? (
          viewMode === "swimlanes" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categorySwimlanes.map(([categoryName, categoryList]) => (
                <motion.div
                  key={categoryName}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="notion-swimlane"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#E9E9E7]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#2F3438]">{categoryName}</span>
                      <span className="text-[10px] font-bold bg-[#EFEFED] text-[#2F3438] border border-[#E0E0DE] px-1.5 py-0.2 rounded-full">
                        {categoryList.length}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddNew(categoryName)}
                      className="p-1 text-[#2F3438] hover:bg-white rounded transition-colors"
                      title={`Thêm quy định cho ${categoryName}`}
                    >
                      <FolderPlus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 flex-1">
                    <AnimatePresence>
                      {categoryList.map((regulation) => (
                        <RegulationCard
                          key={regulation.id}
                          regulation={regulation}
                          onEdit={() => handleEdit(regulation)}
                          onDelete={() => handleDelete(regulation.id)}
                          onQuickPenalty={handleQuickPenalty}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredRegulations.map((regulation) => (
                  <RegulationCard
                    key={regulation.id}
                    regulation={regulation}
                    onEdit={() => handleEdit(regulation)}
                    onDelete={() => handleDelete(regulation.id)}
                    onQuickPenalty={handleQuickPenalty}
                  />
                ))}
              </AnimatePresence>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center rounded border border-dashed border-[#E9E9E7] bg-white py-20 text-center space-y-3">
            <ShieldCheck className="h-10 w-10 text-[#787774]" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#2F3438]">
                {searchQuery || activeFilter !== "all"
                  ? "Không tìm thấy quy định phù hợp"
                  : "Chưa Có Quy Định Nào"}
              </h3>
              <p className="text-xs text-[#787774] max-w-xs mx-auto">
                Bắt đầu bằng cách bấm nút "Thêm Quy Định" ở thanh điều khiển.
              </p>
            </div>
            {searchQuery || activeFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="btn-token-outline"
              >
                Xóa bộ lọc
              </button>
            ) : (
              <button onClick={() => handleAddNew()} className="btn-token-primary font-bold">
                <Plus className="h-4 w-4" />
                Thêm Quy Định
              </button>
            )}
          </div>
        )}
      </main>

      {/* Form Sheet View for Edit/Add Regulation */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg w-full flex flex-col bg-white border-[#E9E9E7] text-[#2F3438] p-0 shadow-xl">
          <div className="bg-[#F7F7F5] px-6 py-3.5 border-b border-[#E9E9E7] flex items-center justify-between">
            <div className="space-y-0.5">
              <SheetTitle className="text-[#2F3438] text-base font-bold">
                {editingRegulation?.id ? "Sửa Quy Định" : "Tạo Quy Định Mới"}
              </SheetTitle>
              <SheetDescription className="text-[#787774] text-xs">
                Biểu mẫu nhập liệu quy định
              </SheetDescription>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold bg-[#F0F0EF] text-[#2F3438] border border-[#E0E0DE] px-2 py-0.5 rounded">
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
        <SheetContent className="sm:max-w-xl w-full flex flex-col bg-white border-[#E9E9E7] text-[#2F3438] p-0 shadow-xl">
          <div className="bg-[#F7F7F5] px-6 py-3.5 border-b border-[#E9E9E7] flex items-center justify-between">
            <div className="space-y-0.5">
              <SheetTitle className="text-[#2F3438] text-base font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#2F3438]" />
                Phạt Nhanh Nhân Sự
              </SheetTitle>
              <SheetDescription className="text-[#787774] text-xs">
                Quy định chọn sẵn: <strong className="text-[#2F3438]">{quickPenaltyRegulation?.violation}</strong>
              </SheetDescription>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold bg-[#2F3438] text-white px-2 py-0.5 rounded shadow-2xs">
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
