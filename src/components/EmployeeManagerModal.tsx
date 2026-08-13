"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Trash2, Users, Building, Briefcase } from "lucide-react";
import type { Employee } from "@/lib/types";
import { addEmployee, deleteEmployee } from "@/lib/employeeService";
import { useToast } from "@/hooks/use-toast";

interface EmployeeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onRefresh: () => Promise<void>;
}

export function EmployeeManagerModal({
  isOpen,
  onClose,
  employees,
  onRefresh,
}: EmployeeManagerModalProps) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Cảnh báo",
        description: "Vui lòng nhập họ và tên nhân viên.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addEmployee({
        name: name.trim(),
        position: position.trim() || undefined,
        department: department.trim() || undefined,
      });

      toast({
        title: "Thành công",
        description: `Đã thêm nhân viên "${name.trim()}" vào hệ thống CSDL.`,
      });

      setName("");
      setPosition("");
      setDepartment("");
      await onRefresh();
    } catch (error) {
      console.error("Error adding employee:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm nhân viên. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (emp: Employee) => {
    try {
      await deleteEmployee(emp.id);
      toast({
        title: "Thành công",
        description: `Đã xóa nhân viên "${emp.name}".`,
      });
      await onRefresh();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa nhân viên. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl w-full flex flex-col bg-white border-[#DEE2E6] text-[#212529] p-0 shadow-xl">
        <div className="bg-[#F8F9FA] px-6 py-3.5 border-b border-[#DEE2E6] flex items-center justify-between">
          <div className="space-y-0.5">
            <SheetTitle className="text-[#212529] text-base font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-[#017E84]" />
              Quản Lý Danh Sách Nhân Sự Động (CSDL)
            </SheetTitle>
            <SheetDescription className="text-[#6C757D] text-xs">
              Thêm, chỉnh sửa hoặc xóa nhân sự sử dụng trong toàn bộ phân hệ ERP
            </SheetDescription>
          </div>
          <span className="text-xs font-bold bg-[#017E84]/10 text-[#017E84] px-2 py-0.5 rounded border border-[#017E84]/20">
            {employees.length} nhân sự
          </span>
        </div>

        <div className="p-6 flex-1 flex flex-col space-y-6 overflow-y-auto">
          {/* Form Thêm Nhân Viên Mới */}
          <form onSubmit={handleAddEmployee} className="bg-[#F8F9FA] p-4 rounded-lg border border-[#DEE2E6] space-y-3">
            <h4 className="text-xs font-bold text-[#212529] uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-[#714B67]" />
              Thêm Nhân Viên Mới Về CSDL
            </h4>

            <div className="space-y-2">
              <div>
                <label className="text-xs font-semibold text-[#212529] block mb-1">
                  Họ và tên nhân viên <span className="text-rose-600">*</span>
                </label>
                <Input
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white border-[#DEE2E6] text-[#212529] text-xs h-9 focus-visible:ring-[#017E84]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#212529] block mb-1">
                    Chức vụ / Vị trí
                  </label>
                  <Input
                    placeholder="Ví dụ: Chuyên viên Marketing"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="bg-white border-[#DEE2E6] text-[#212529] text-xs h-9 focus-visible:ring-[#017E84]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#212529] block mb-1">
                    Phòng ban
                  </label>
                  <Input
                    placeholder="Ví dụ: Phòng Kinh Doanh"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="bg-white border-[#DEE2E6] text-[#212529] text-xs h-9 focus-visible:ring-[#017E84]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-odoo-purple text-xs font-bold"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {isSubmitting ? "Đang lưu..." : "Thêm Nhân Viên"}
              </button>
            </div>
          </form>

          {/* Danh Sách Nhân Viên Hiện Tại */}
          <div className="space-y-2 flex-1">
            <h4 className="text-xs font-bold text-[#6C757D] uppercase tracking-wider">
              DANH SÁCH NHÂN VIỆN HIỆN CÓ ({employees.length})
            </h4>

            {employees.length === 0 ? (
              <p className="text-xs text-[#6C757D] italic text-center py-6">Chưa có nhân viên nào trong CSDL.</p>
            ) : (
              <div className="space-y-2">
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="bg-white border border-[#DEE2E6] p-3 rounded-lg flex items-center justify-between shadow-xs hover:border-[#017E84] transition-all"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-xs text-[#212529]">{emp.name}</p>
                      <div className="flex items-center gap-3 text-[11px] text-[#6C757D]">
                        {emp.position && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-[#017E84]" />
                            {emp.position}
                          </span>
                        )}
                        {emp.department && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-[#714B67]" />
                            {emp.department}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEmployee(emp)}
                      className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Xóa
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
