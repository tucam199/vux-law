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

const singleViolationSchema = z.object({
  personName: z.string({ required_error: "Vui lòng chọn người vi phạm." }),
  date: z.date({ required_error: "Vui lòng chọn ngày vi phạm." }),
  regulationId: z.string({ required_error: "Vui lòng chọn một quy định." }),
  notes: z.string().optional(),
});

const formSchema = z.object({
  violations: z.array(singleViolationSchema).min(1, "Phải có ít nhất một lỗi vi phạm."),
});


type ViolationFormData = z.infer<typeof formSchema>;
type SingleViolationFormData = z.infer<typeof singleViolationSchema>;

interface ViolationFormProps {
  people: string[];
  regulations: Regulation[];
  onSave: (data: Omit<ViolationRecord, 'id'>[]) => Promise<void>;
  onClose: () => void;
  toast: (options: { title: string; description: string; variant?: "default" | "destructive" }) => void;
}

export function ViolationForm({ people, regulations, onSave, onClose, toast }: ViolationFormProps) {
  const form = useForm<ViolationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      violations: [{
        personName: '',
        date: new Date(),
        regulationId: '',
        notes: '',
      }],
    },
  });

  const { fields, append, remove, insert } = useFieldArray({
    control: form.control,
    name: "violations",
  });

  const violations = useWatch({ control: form.control, name: 'violations' });

  const handleAddViolation = () => {
    append({
        personName: '',
        date: new Date(),
        regulationId: '',
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
            return; // Stop submission
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
      // Parent component will show a toast
    }
  }

  const noRegulations = regulations.length === 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0 py-2 flex-1 flex flex-col">
        <div className="flex-grow pr-6 -mr-6">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-6 pb-6">

              {fields.map((field, index) => (
                <div key={field.id} className="space-y-6 rounded-lg border p-4 relative">
                   <div className="flex justify-between items-center">
                    <Badge variant="outline" className="bg-background px-2">Lỗi #{index + 1}</Badge>
                    <div className="flex items-center gap-1">
                       <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDuplicate(index)}>
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Nhân bản lỗi</span>
                       </Button>
                       <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-white hover:text-white/80" onClick={() => handleDelete(index)} disabled={fields.length <= 1}>
                          <Trash2 className="h-4 w-4" />
                           <span className="sr-only">Xóa lỗi</span>
                       </Button>
                    </div>
                   </div>

                  <FormField
                    control={form.control}
                    name={`violations.${index}.personName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Người Vi Phạm</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn một thành viên" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {people.map(person => (
                              <SelectItem key={person} value={person}>{person}</SelectItem>
                            ))}
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
                        <FormLabel>Ngày Vi Phạm</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>Chọn một ngày</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
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
                        <FormLabel>Quy Định Áp Dụng</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={noRegulations}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={noRegulations ? "Không có quy định nào" : "Chọn một quy định"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regulations.map(reg => (
                              <SelectItem key={reg.id} value={reg.id}>
                                {reg.category}: {reg.violation}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {noRegulations && <FormDescription>Vui lòng tạo quy định trước khi ghi lỗi.</FormDescription>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`violations.${index}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi Chú Thêm (Tùy chọn)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Thêm ghi chú nếu cần..." {...field} rows={2} value={field.value || ''}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
                <Button type="button" variant="outline" onClick={handleAddViolation} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm Lỗi
                </Button>
            </div>
          </ScrollArea>
        </div>
        <div className="flex-shrink-0 pt-6 border-t flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={noRegulations || form.formState.isSubmitting}>
             {form.formState.isSubmitting ? "Đang lưu..." : `Lưu ${fields.length} Lỗi Vi Phạm`}
          </Button>
        </div>
      </form>
    </Form>
  );
}
    