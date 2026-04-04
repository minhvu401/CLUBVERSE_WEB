"use client";

import React from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/store/adminStore";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "success" | "info";
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "danger",
  isLoading = false,
  children,
}: ConfirmDialogProps) {
  const { theme } = useAdminStore();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={cn("absolute inset-0 backdrop-blur-sm", theme === "dark" ? "bg-black/60" : "bg-zinc-900/40")} 
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className={cn("relative w-full max-w-md border rounded-[2.5rem] p-8 shadow-2xl overflow-hidden group", theme === "dark" ? "bg-[#0a0a0a] border-white/10" : "bg-white border-zinc-200")}>
        {/* Decorative Glow */}
        <div className={cn(
          "absolute -top-24 -right-24 w-48 h-48 blur-[80px] rounded-full opacity-20",
          variant === "danger" ? "bg-red-500" : variant === "success" ? "bg-emerald-500" : "bg-purple-500"
        )} />

        <div className="flex flex-col items-center text-center">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border",
            theme === "dark" 
              ? (variant === "danger" ? "bg-red-500/10 text-red-500 border-white/5" : variant === "success" ? "bg-emerald-500/10 text-emerald-500 border-white/5" : "bg-purple-500/10 text-purple-400 border-white/5")
              : (variant === "danger" ? "bg-red-50 text-red-600 border-red-100" : variant === "success" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-purple-50 text-purple-600 border-purple-100")
          )}>
            {variant === "danger" ? <AlertCircle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
          </div>

          <h3 className={cn("text-2xl font-black uppercase tracking-tight mb-3", theme === "dark" ? "text-white" : "text-zinc-900")}>
            {title}
          </h3>
          <p className={cn("text-sm font-medium leading-relaxed mb-6", theme === "dark" ? "text-white/50" : "text-zinc-500")}>
            {description}
          </p>

          {children && (
            <div className="w-full mb-6">
              {children}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={onClose}
              disabled={isLoading}
              className={cn("flex-1 px-6 py-4 rounded-2xl border font-bold text-sm transition-all order-2 sm:order-1", theme === "dark" ? "bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white" : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 shadow-sm")}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                "flex-1 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all order-1 sm:order-2",
                variant === "danger" 
                  ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 text-white" 
                  : "bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20 text-white"
              )}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
              ) : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
