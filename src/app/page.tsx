"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Grip, ListChecks, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


export default function Home() {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRegulation, setEditingRegulation] = useState<Regulation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Logo />
            <div className="flex items-center gap-4">
              <Link href="/vibehost">
                <Button variant="outline" className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                  <Server className="h-4 w-4" />
                  VibeHost MCP
                </Button>
              </Link>
              <Link href="/penalties">
                <Button variant="outline" className="hover:text-primary-foreground hover:bg-gradient-to-b hover:from-[#98D62A] hover:to-[#28A745] hover:border-[#98D62A]">
                  <ListChecks className="mr-2 h-4 w-4" />
                  Danh Sách Bị Phạt
                </Button>
              </Link>
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm Quy Định
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Quy Định</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Duyệt và quản lý tất cả các quy định xử phạt.
          </p>
        </div>

        {isLoading ? (
           <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-28 text-center">
             <div className="mb-6 text-muted-foreground/50">
               <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-primary"></div>
             </div>
             <h2 className="text-2xl font-semibold tracking-tight">
               Đang tải quy định...
             </h2>
             <p className="mt-2 text-muted-foreground">
               Vui lòng chờ trong giây lát.
             </p>
           </div>
        ) : regulations.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {regulations.map((regulation) => (
              <RegulationCard
                key={regulation.id}
                regulation={regulation}
                onEdit={() => handleEdit(regulation)}
                onDelete={() => handleDelete(regulation.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-28 text-center">
            <div className="mb-6 text-muted-foreground/50">
              <Grip className="h-20 w-20" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Không Tìm Thấy Quy Định Nào
            </h2>
            <p className="mt-2 text-muted-foreground">
              Bắt đầu bằng cách thêm một quy định xử phạt mới.
            </p>
            <Button onClick={handleAddNew} className="mt-8" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Thêm Quy Định
            </Button>
          </div>
        )}
      </main>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg w-full flex flex-col">
          <SheetHeader className="pr-8">
            <SheetTitle>
              {editingRegulation ? "Chỉnh Sửa Quy Định" : "Tạo Quy Định Mới"}
            </SheetTitle>
            <SheetDescription>
              {editingRegulation
                ? "Sửa đổi chi tiết của quy định hiện có."
                : "Điền vào biểu mẫu để thiết lập một quy định xử phạt mới."}
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
