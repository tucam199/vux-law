"use client";

import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Trash2, Copy, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Regulation, ViolationRecord } from "@/lib/types";
import { useEffect } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { useToast } from "@/hooks/use-toast";

const singleViolationSchema = z.object({
  personName: z.string({ required_error: "Vui lòng chọn người vi phạm." }).min(1, "Vui lòng chọn người vi phạm."),
  date: z.date({ required_error: "Vui lòng chọn ngày vi phạm." }),
  regulationId: z.string({ required_error: "Vui lòng chọn một quy định." }).min(1, "Vui lòng chọn một quy định."),
  notes: z.string().optional(),
});

const formSchema = z.object({
  violations: z.array(singleViolationSchema).min(1, "Phải có ít nhất một lỗi vi phạm."),
});

type ViolationFormData = z.infer<typeof formSchema>;

interface ViolationFormProps {
  people: string[];
  regulations: Regulation[];
  onSave: (data: Omit<ViolationRecord, 'id'>[]) => Promise<void>;
  onClose: () => void;
  toast?: (options: { title: string; description: string; variant?: "default" | "destructive" }) => void;
}

export function ViolationForm({ people, regulations, onSave, onClose, toast: customToast }: ViolationFormProps) {
  const { toast: hookToast } = useToast();
  const toast = customToast || hookToast;

  const defaultRegId = regulations.length > 0 ? regulations[0].id : '';

  const form = useForm<ViolationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      violations: [{
        personName: '',
        date: new Date(),
        regulationId: defaultRegId,
        notes: '',
      }],
    },
  });

  useEffect(() => {
    if (regulations.length === 1) {
      form.setValue('violations.0.regulationId', regulations[0].id);
    }
  }, [regulations, form]);

  const { fields, append, remove, insert } = useFieldArray({
    control: form.control,
    name: "violations",
  });

  const violations = useWatch({ control: form.control, name: 'violations' });

  const handleAddViolation = () => {
    append({
        personName: '',
        date: new Date(),
        regulationId: defaultRegId,
        notes: '',
    });
  };

  const handleDuplicate = (index: number) => {
    const violationToDuplicate = violations[index];
    insert(index + 1, { ...violationToDuplicate });
  };

  const handleDelete = (index: number) => {
      if (fields.length > 1) {
        remove(index);
      }
  };

  async function onSubmit(data: ViolationFormData) {
    let submissionData = [];
    for (const [index, violation] of data.violations.entries()) {
        const selectedRegulation = regulations.find(r => r.id === violation.regulationId);
        if (!selectedRegulation) {
            toast({
                title: "Lỗi",
                description: `Quy định được chọn cho Lỗi #${index + 1} không hợp lệ. Vui lòng chọn lại.`,
                variant: "destructive",
            });
            return;
        }
        submissionData.push({
            personName: violation.personName,
            date: violation.date.toISOString(),
            notes: violation.notes || '',
            regulation: selectedRegulation,
        });
    }

    try {
      await onSave(submissionData);
    } catch (error) {
      // Parent component will handle toast
    }
  }

  const noRegulations = regulations.length === 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0 py-2 flex-1 flex flex-col">
        <ScrollArea className="flex-grow pr-4 -mr-4">
          <div className="space-y-5 pb-6">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 rounded-xl border border-[#E0E0E0] bg-white p-4 relative shadow-none">
                 <div className="flex justify-between items-center pb-3 border-b border-[#E0E0E0]">
                  <span className="badge-ds-info font-bold text-xs">
                    Lỗi Vi Phạm #{index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                     <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-[#6B6B6B] hover:text-[#1F1F1F] rounded-sm" onClick={() => handleDuplicate(index)} title="Nhân bản lỗi">
                        <Copy className="h-3.5 w-3.5" />
                     </Button>
                     <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-[#6B6B6B] hover:text-[#D32F2F] hover:bg-[#FDECEC] rounded-sm" onClick={() => handleDelete(index)} disabled={fields.length <= 1} title="Xóa lỗi">
                        <Trash2 className="h-3.5 w-3.5" />
                     </Button>
                  </div>
                 </div>

                <FormField
                  control={form.control}
                  name={`violations.${index}.personName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-[#1F1F1F]">Người Vi Phạm</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-[#E0E0E0] text-[#1F1F1F] text-sm h-11 rounded-md font-medium">
                            <SelectValue placeholder="Chọn một thành viên nhân sự" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-[#E0E0E0] text-sm">
                          {people.length === 0 ? (
                            <SelectItem value="empty" disabled className="text-sm">Chưa có nhân sự trong CSDL</SelectItem>
                          ) : (
                            people.map(person => (
                              <SelectItem key={person} value={person} className="text-sm font-medium">{person}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`violations.${index}.date`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-bold text-[#1F1F1F]">Ngày Vi Phạm</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3.5 text-left font-medium h-11 text-sm border-[#E0E0E0] bg-white text-[#1F1F1F] rounded-md flex justify-between items-center",
                                !field.value && "text-[#D1D1D1]"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Chọn ngày vi phạm</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-60 text-[#6B6B6B]" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-[2500]" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`violations.${index}.regulationId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-[#1F1F1F]">Quy Định Áp Dụng</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={noRegulations}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-[#E0E0E0] text-[#1F1F1F] text-sm h-11 rounded-md font-medium">
                            <SelectValue placeholder={noRegulations ? "Chưa có quy định nào" : "Chọn một quy định"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-[#E0E0E0] text-sm">
                          {regulations.map(reg => (
                            <SelectItem key={reg.id} value={reg.id} className="text-sm font-medium">
                              [{reg.category}] {reg.violation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`violations.${index}.notes`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-[#1F1F1F]">Ghi Chú Thêm (Tùy chọn)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Thêm ghi chú ngữ cảnh vi phạm..."
                          className="resize-none bg-white border-[#E0E0E0] text-[#1F1F1F] text-sm rounded-md placeholder-[#D1D1D1] min-h-[90px] focus:border-[#1E74E8]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            <button type="button" onClick={handleAddViolation} className="btn-ds-outline w-full justify-center text-xs py-2 px-3 flex items-center gap-1.5">
                <Plus className="h-4 w-4" />
                Thêm Lỗi Vi Phạm Cho Lượt Này
            </button>
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 pt-4 border-t border-[#E0E0E0] flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ds-secondary text-xs px-4 py-2">
            Hủy
          </button>
          <button type="submit" disabled={noRegulations || form.formState.isSubmitting} className="btn-ds-primary text-xs px-4 py-2 font-bold">
             {form.formState.isSubmitting ? "Đang lưu..." : `Lưu ${fields.length} Vi Phạm Mới`}
          </button>
        </div>
      </form>
    </Form>
  );
}