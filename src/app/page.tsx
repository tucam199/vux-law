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
    <div className="min-h-screen bg-white text-[#1F1F1F]">
      {/* Unified Module Header Bar */}
      <HeaderNav pendingPenaltiesCount={stats.pendingPenaltiesCount} />

      {/* Control Panel Bar (§8.5 & §9) */}
      <div className="bg-[#F8F8F8] border-b border-[#E0E0E0] sticky top-14 z-[90]">
        <div className="container mx-auto px-4 lg:px-6 py-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {/* Left Controls: Breadcrumbs, Primary CTA & Dynamic Employee Manager */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-xs font-medium text-[#1F1F1F] gap-1 mr-2">
                <span className="text-[#1E74E8] font-semibold">Quy định</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#6B6B6B]" />
                <span className="text-[#1F1F1F] font-bold">Khung Xử Phạt</span>
              </div>

              {/* SINGLE PRIMARY CTA PER SCREEN: #7FCA27 Green */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => handleAddNew()}
                className="btn-ds-primary text-xs py-2 px-3.5"
              >
                <Plus className="h-4 w-4" />
                Thêm Quy Định
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsEmpModalOpen(true)}
                className="btn-ds-secondary text-xs py-2 px-3.5"
              >
                <Users className="w-4 h-4 text-[#1E74E8]" />
                <span>Quản Lý Nhân Sự ({employees.length})</span>
              </motion.button>
            </div>

            {/* Central Search Bar */}
            <div className="relative flex items-center w-full md:w-80 bg-white border border-[#E0E0E0] focus-within:border-[#1E74E8] rounded-md px-3 py-1.5 transition-colors">
              <Search className="w-4 h-4 text-[#6B6B6B] mr-2 shrink-0" />
              
              {activeFilter !== "all" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1E74E8] bg-[#EAF2FD] border border-[#1E74E8]/30 px-1.5 py-0.5 rounded-full mr-1.5 shrink-0">
                  {activeFilter === "fine" ? "Phạt tiền" : "Hạn chế"}
                  <button onClick={() => setActiveFilter("all")} className="hover:text-[#185EC0]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <input
                type="text"
                placeholder="Tìm kiếm quy định..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-[#1F1F1F] focus:outline-none placeholder-[#D1D1D1]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-[#6B6B6B] hover:text-[#1F1F1F]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Right Controls: View Switcher & Pagination */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-[#1F1F1F] font-medium">
                <span>1-{filteredRegulations.length} / {filteredRegulations.length}</span>
                <div className="flex items-center border border-[#E0E0E0] rounded-sm bg-white">
                  <button className="p-1 hover:bg-[#F8F8F8] border-r border-[#E0E0E0]">
                    <ChevronLeft className="w-3.5 h-3.5 text-[#6B6B6B]" />
                  </button>
                  <button className="p-1 hover:bg-[#F8F8F8]">
                    <ChevronRight className="w-3.5 h-3.5 text-[#6B6B6B]" />
                  </button>
                </div>
              </div>

              <div className="flex items-center border border-[#E0E0E0] rounded-sm bg-white overflow-hidden">
                <button
                  onClick={() => setViewMode("swimlanes")}
                  className={`p-1.5 text-xs flex items-center gap-1 transition-colors ${
                    viewMode === "swimlanes" ? "bg-[#EAF2FD] text-[#1E74E8] font-bold" : "text-[#6B6B6B] hover:text-[#1F1F1F]"
                  }`}
                  title="Swimlanes Column View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Swimlanes</span>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 text-xs flex items-center gap-1 transition-colors ${
                    viewMode === "grid" ? "bg-[#EAF2FD] text-[#1E74E8] font-bold" : "text-[#6B6B6B] hover:text-[#1F1F1F]"
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
      <main className="container mx-auto px-4 lg:px-6 py-6 max-w-7xl space-y-6">
        {/* INTERACTIVE KPI STAT CARDS (§8.5 & §9.4) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#1E74E8]" />
              Bộ lọc nhanh 1-Click
            </span>
            {activeFilter !== "all" && (
              <button
                onClick={() => setActiveFilter("all")}
                className="text-xs text-[#1E74E8] hover:underline font-semibold"
              >
                Hiển thị tất cả ({stats.total})
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveFilter("all")}
              className={`p-4 cursor-pointer transition-all ${
                activeFilter === "all" ? "card-ds card-ds-selected" : "card-ds"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider">TỔNG QUY ĐỊNH</p>
                  <p className="text-2xl font-bold text-[#1F1F1F]">{stats.total}</p>
                </div>
                <ShieldCheck className="w-6 h-6 text-[#1E74E8]" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveFilter("fine")}
              className={`p-4 cursor-pointer transition-all ${
                activeFilter === "fine" ? "card-ds card-ds-selected" : "card-ds"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider">PHẠT TIỀN (FILTER)</p>
                  <p className="text-2xl font-bold text-[#1F1F1F]">{stats.fineCount}</p>
                </div>
                <CircleDollarSign className="w-6 h-6 text-[#7FCA27]" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveFilter("restriction")}
              className={`p-4 cursor-pointer transition-all ${
                activeFilter === "restriction" ? "card-ds card-ds-selected" : "card-ds"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider">HẠN CHẾ (FILTER)</p>
                  <p className="text-2xl font-bold text-[#1F1F1F]">{stats.restrictionCount}</p>
                </div>
                <Ban className="w-6 h-6 text-[#FF8832]" />
              </div>
            </motion.div>

            <div className="card-ds p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider">MỨC PHẠT MAX</p>
                <p className="text-xl font-bold text-[#1F1F1F] truncate">
                  {formatCurrency(stats.totalFineAmount)}
                </p>
              </div>
              <SlidersHorizontal className="w-6 h-6 text-[#1E74E8]" />
            </div>
          </div>
        </div>

        {/* GROUPED SWIMLANES OR GRID VIEW */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#E0E0E0] bg-white py-20 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E74E8]"></div>
            <p className="text-[#6B6B6B] text-xs font-medium">Đang tải danh sách quy định...</p>
          </div>
        ) : filteredRegulations.length > 0 ? (
          viewMode === "swimlanes" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categorySwimlanes.map(([categoryName, categoryList]) => (
                <motion.div
                  key={categoryName}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-[#F8F8F8] border border-[#E0E0E0] rounded-xl p-4 space-y-4 flex flex-col"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#1F1F1F]">{categoryName}</span>
                      <span className="badge-ds-info text-xs font-bold px-2 py-0.5">
                        {categoryList.length}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddNew(categoryName)}
                      className="p-1.5 text-[#1E74E8] hover:bg-white rounded transition-colors"
                      title={`Thêm quy định cho ${categoryName}`}
                    >
                      <FolderPlus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4 flex-1">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E0E0E0] bg-white py-20 text-center space-y-4">
            <ShieldCheck className="h-12 w-12 text-[#D1D1D1]" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1F1F1F]">
                {searchQuery || activeFilter !== "all"
                  ? "Không tìm thấy quy định phù hợp"
                  : "Chưa Có Quy Định Nào"}
              </h3>
              <p className="text-xs text-[#6B6B6B] max-w-xs mx-auto">
                Bắt đầu bằng cách bấm nút "Thêm Quy Định" ở thanh điều khiển.
              </p>
            </div>
            {searchQuery || activeFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="btn-ds-secondary text-xs px-4 py-2"
              >
                Xóa bộ lọc
              </button>
            ) : (
              <button onClick={() => handleAddNew()} className="btn-ds-primary text-xs font-bold px-4 py-2">
                <Plus className="h-4 w-4" />
                Thêm Quy Định
              </button>
            )}
          </div>
        )}
      </main>

      {/* Form Sheet View for Edit/Add Regulation */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg w-full flex flex-col bg-white border-[#E0E0E0] text-[#1F1F1F] p-0 shadow-md">
          <div className="bg-[#F8F8F8] px-6 py-4 border-b border-[#E0E0E0] flex items-center justify-between">
            <div className="space-y-0.5">
              <SheetTitle className="text-[#1F1F1F] text-lg font-bold">
                {editingRegulation?.id ? "Sửa Quy Định" : "Tạo Quy Định Mới"}
              </SheetTitle>
              <SheetDescription className="text-[#6B6B6B] text-xs">
                Biểu mẫu nhập liệu quy định
              </SheetDescription>
            </div>
            <div className="badge-ds-info font-medium text-xs px-2.5 py-0.5">
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
        <SheetContent className="sm:max-w-xl w-full flex flex-col bg-white border-[#E0E0E0] text-[#1F1F1F] p-0 shadow-md">
          <div className="bg-[#F8F8F8] px-6 py-4 border-b border-[#E0E0E0] flex items-center justify-between">
            <div className="space-y-0.5">
              <SheetTitle className="text-[#1F1F1F] text-lg font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#7FCA27]" />
                Phạt Nhanh Nhân Sự
              </SheetTitle>
              <SheetDescription className="text-[#6B6B6B] text-xs">
                Quy định chọn sẵn: <strong className="text-[#1F1F1F]">{quickPenaltyRegulation?.violation}</strong>
              </SheetDescription>
            </div>
            <div className="badge-ds-success text-xs font-bold px-2.5 py-0.5">
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
