"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { Regulation } from "@/lib/types";
import { useEffect } from "react";
import { ScrollArea } from "./ui/scroll-area";

const regulationSchema = z.object({
  category: z.string().min(3, "Hạng mục phải có ít nhất 3 ký tự."),
  violation: z.string().min(5, "Mô tả vi phạm phải có ít nhất 5 ký tự."),
  penaltyType: z.enum(["fine", "restriction"], { required_error: "Bạn phải chọn một loại hình phạt." }),
  penaltyAmount: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.coerce.number({invalid_type_error: "Số tiền phạt phải là một số."}).positive("Số tiền phạt phải là số dương.").optional()
  ),
  penaltyDetails: z.string().optional(),
}).refine(data => {
    if (data.penaltyType === 'fine') {
      return data.penaltyAmount !== undefined;
    }
    return true;
}, {
    message: "Số tiền phạt là bắt buộc khi chọn loại hình phạt là Phạt tiền.",
    path: ["penaltyAmount"],
})
.refine(data => {
    if (data.penaltyType === 'restriction') {
      return data.penaltyDetails && data.penaltyDetails.length >= 5;
    }
    return true;
}, {
    message: "Chi tiết hạn chế phải có ít nhất 5 ký tự.",
    path: ["penaltyDetails"],
});

type RegulationFormData = z.infer<typeof regulationSchema>;

interface RegulationFormProps {
  onSave: (data: Omit<Regulation, 'id'> & { id?: string }) => Promise<void>;
  onClose: () => void;
  regulation: Regulation | null;
}

export function RegulationForm({ onSave, onClose, regulation }: RegulationFormProps) {
  const form = useForm<RegulationFormData>({
    resolver: zodResolver(regulationSchema),
    defaultValues: {
      category: "",
      violation: "",
      penaltyType: "fine",
      penaltyAmount: undefined,
      penaltyDetails: "",
    },
  });

  const penaltyType = form.watch("penaltyType");
  
  useEffect(() => {
    if (penaltyType === 'fine') {
        form.setValue('penaltyDetails', '');
    } else if (penaltyType === 'restriction') {
        form.setValue('penaltyAmount', undefined);
    }
  }, [penaltyType, form]);


  useEffect(() => {
    if (regulation) {
        form.reset({
            category: regulation.category,
            violation: regulation.violation,
            penaltyType: regulation.penalty.type,
            penaltyAmount: regulation.penalty.amount || undefined,
            penaltyDetails: regulation.penalty.details || "",
        });
    } else {
        form.reset({
            category: "",
            violation: "",
            penaltyType: "fine",
            penaltyAmount: undefined,
            penaltyDetails: "",
        });
    }
  }, [regulation, form]);

  async function onSubmit(data: RegulationFormData) {
    const isFine = data.penaltyType === 'fine';
    
    const penalty: { type: 'fine' | 'restriction'; amount?: number; details?: string } = {
        type: data.penaltyType,
    };

    if (isFine) {
        penalty.amount = data.penaltyAmount;
    } else {
        penalty.details = data.penaltyDetails;
    }
    
    const submissionData = {
        id: regulation?.id,
        category: data.category,
        violation: data.violation,
        penalty,
    };

    try {
        await onSave(submissionData);
    } catch (error) {
        // The parent component will show a toast error.
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0 py-2 flex-1 flex flex-col">
        <ScrollArea className="flex-grow pr-4 -mr-4">
            <div className="space-y-5 pb-4">
                <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-xs font-bold text-[#1F1F1F]">Hạng Mục Vi Phạm</FormLabel>
                    <FormControl>
                        <Input placeholder="ví dụ: Vi phạm giao thông" {...field} className="input-ds bg-white" />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="violation"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-xs font-bold text-[#1F1F1F]">Chi Tiết Vi Phạm</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Mô tả chi tiết vi phạm..." {...field} value={field.value || ''} rows={4} className="bg-white border-[#E0E0E0] focus:border-[#1E74E8] text-[#1F1F1F] rounded-md text-xs p-3" />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="penaltyType"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-bold text-[#1F1F1F]">Loại Hình Phạt</FormLabel>
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                        >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="fine" className="border-[#D1D1D1] text-[#7FCA27]" />
                            </FormControl>
                            <FormLabel className="font-medium text-xs text-[#1F1F1F]">Phạt tiền</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="restriction" className="border-[#D1D1D1] text-[#FF8832]" />
                            </FormControl>
                            <FormLabel className="font-medium text-xs text-[#1F1F1F]">Hạn chế</FormLabel>
                        </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                {penaltyType === "fine" && (
                <FormField
                    control={form.control}
                    name="penaltyAmount"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs font-bold text-[#1F1F1F]">Số Tiền Phạt</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input type="number" placeholder="ví dụ: 50000" {...field} value={field.value ?? ''} className="input-ds bg-white pr-8" />
                                <span className="absolute inset-y-0 right-3 flex items-center text-[#6B6B6B] text-xs font-bold">đ</span>
                            </div>
                        </FormControl>
                        {field.value && Number(field.value) > 0 && (
                          <p className="text-xs text-[#7FCA27] font-bold mt-1">
                            Xem trước: {new Intl.NumberFormat('vi-VN').format(Number(field.value))} đ
                          </p>
                        )}
                        <FormMessage />
                    </FormItem>
                    )}
                />
                )}
                {penaltyType === "restriction" && (
                <FormField
                    control={form.control}
                    name="penaltyDetails"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs font-bold text-[#1F1F1F]">Chi Tiết Hạn Chế</FormLabel>
                        <FormControl>
                        <Textarea placeholder="Mô tả chi tiết hạn chế..." {...field} value={field.value || ''} rows={4} className="bg-white border-[#E0E0E0] focus:border-[#1E74E8] text-[#1F1F1F] rounded-md text-xs p-3" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                )}
            </div>
        </ScrollArea>
        <div className="flex-shrink-0 pt-4 border-t border-[#E0E0E0] flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-ds-secondary text-xs px-4 py-2">
                Hủy
            </button>
            <button type="submit" disabled={form.formState.isSubmitting} className="btn-ds-primary text-xs px-4 py-2 font-bold">
                {form.formState.isSubmitting ? "Đang lưu..." : "Lưu Quy Định"}
            </button>
        </div>
      </form>
    </Form>
  );
}
