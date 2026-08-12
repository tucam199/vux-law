"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ListFilter, Search, FileText, CircleDollarSign, User, Users, Plus } from "lucide-react";
import { Logo } from "@/components/Logo";
import { PenaltyList } from "@/components/PenaltyList";
import type { ViolationRecord, Regulation } from "@/lib/types";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ViolationForm } from "@/components/ViolationForm";
import { getPenalties, addMultiplePenalties, deletePenalty, updatePenalty } from "@/lib/penaltyService";
import { getRegulations } from "@/lib/regulationService";
import { useToast } from "@/hooks/use-toast";

const people = [
    "Trình Mỹ Phượng Oanh",
    "Trần Anh Tú",
    "Nguyễn Hoàng Long",
    "Lưu Kim Thư",
    "Nguyễn Huỳnh Như Ngọc"
];

type FilterType = 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom';

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState<ViolationRecord[]>([]);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
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

  const handleFilterChange = (newFilter: FilterType | null) => {
    setFilter(newFilter);
    if (newFilter !== 'custom') {
      setDateRange(undefined);
    }
  };

  const handlePersonFilter = (person: string | null) => {
      setSelectedPerson(person);
  };
  
  const handleSaveViolation = async (violations: Omit<ViolationRecord, 'id'>[]) => {
    try {
      await addMultiplePenalties(violations);
      setIsSheetOpen(false);
      await fetchData(); // Re-fetch data
      toast({
        title: "Thành công",
        description: `Đã ghi nhận ${violations.length} lỗi vi phạm mới.`,
      });
    } catch (error) {
       console.error("Error saving violations: ", error);
       toast({
        title: "Lỗi",
        description: "Không thể lưu các lỗi vi phạm. Vui lòng thử lại.",
        variant: "destructive",
      });
      throw error; // Re-throw to inform the form
    }
  };

  const handleDeletePenalty = async (id: string) => {
    try {
      await deletePenalty(id);
      await fetchData(); // Re-fetch data
      toast({
        title: "Thành công",
        description: "Đã xóa lỗi vi phạm.",
      });
    } catch (error) {
      console.error("Error deleting penalty: ", error);
       toast({
        title: "Lỗi",
        description: "Không thể xóa lỗi vi phạm. Vui lòng thử lại.",
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
        
        if(interval) {
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

  const totalViolations = filteredPenalties.length;
  const totalFines = filteredPenalties.reduce((acc, penalty) => {
      if (penalty.regulation && penalty.regulation.penalty && penalty.regulation.penalty.type === 'fine') {
          return acc + (penalty.regulation.penalty.amount || 0);
      }
      return acc;
  }, 0);
  
  const noRegulations = regulations.length === 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Logo />
            <Link href="/">
              <Button variant="outline" className="hover:text-primary-foreground hover:bg-gradient-to-b hover:from-[#98D62A] hover:to-[#28A745] hover:border-[#98D62A]">
                <Home className="mr-2 h-4 w-4" />
                Trang Chủ
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Danh Sách Bị Phạt</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Duyệt và quản lý tất cả các trường hợp đã bị xử phạt.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ListFilter className="mr-2 h-4 w-4" />
                  Lọc
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => handleFilterChange('today')}>Hôm nay</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleFilterChange('this_week')}>Tuần này</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleFilterChange('this_month')}>Tháng này</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleFilterChange('this_year')}>Năm nay</DropdownMenuItem>
                <DropdownMenuSeparator />
                <Popover>
                    <PopoverTrigger asChild>
                         <Button
                            variant="ghost"
                            className={cn("w-full justify-start font-normal px-2 py-1.5 text-sm", filter === 'custom' && "text-accent-foreground")}
                            onClick={() => handleFilterChange('custom')}
                        >
                            Tùy chỉnh...
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setIsSheetOpen(true)} disabled={noRegulations} title={noRegulations ? "Vui lòng tạo quy định trước" : "Tạo lỗi vi phạm"}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo Lỗi Vi Phạm
            </Button>
          </div>
        </div>

         <div className="flex flex-wrap items-center gap-2 mb-6">
            <Button
                size="sm"
                variant={selectedPerson === null ? "default" : "outline"}
                onClick={() => handlePersonFilter(null)}
                className="rounded-full"
            >
                <Users className="mr-2 h-4 w-4" />
                Tất cả
            </Button>
            {people.map(person => (
                <Button
                    key={person}
                    size="sm"
                    variant={selectedPerson === person ? "default" : "outline"}
                    onClick={() => handlePersonFilter(person)}
                    className="rounded-full"
                >
                    <User className="mr-2 h-4 w-4" />
                    {person}
                </Button>
            ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-10">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng Số Lỗi Vi Phạm</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalViolations}</div>
                    <p className="text-xs text-muted-foreground">Tổng số lỗi vi phạm được ghi nhận</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng Số Tiền Phạt</CardTitle>
                    <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{new Intl.NumberFormat("vi-VN").format(totalFines)} đ</div>
                    <p className="text-xs text-muted-foreground">Tổng số tiền phạt từ các lỗi vi phạm</p>
                </CardContent>
            </Card>
        </div>

        {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-28 text-center">
              <div className="mb-6 text-muted-foreground/50">
                <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-primary"></div>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Đang tải danh sách...
              </h2>
              <p className="mt-2 text-muted-foreground">
                Vui lòng chờ trong giây lát.
              </p>
            </div>
        ) : <PenaltyList penalties={filteredPenalties} onDelete={handleDeletePenalty} onToggleComplete={handleToggleComplete} />}
      </main>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-2xl w-full flex flex-col">
          <SheetHeader className="pr-8">
            <SheetTitle>Tạo Lỗi Vi Phạm Mới</SheetTitle>
            <SheetDescription>
              Điền vào biểu mẫu để ghi nhận một hoặc nhiều lỗi vi phạm mới.
            </SheetDescription>
          </SheetHeader>
          <ViolationForm
            people={people}
            regulations={regulations}
            onSave={handleSaveViolation}
            onClose={() => setIsSheetOpen(false)}
            toast={toast}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
    