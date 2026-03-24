"use client";

import React from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden group">
        {/* Decorative Glow */}
        <div className={cn(
          "absolute -top-24 -right-24 w-48 h-48 blur-[80px] rounded-full opacity-20",
          variant === "danger" ? "bg-red-500" : variant === "success" ? "bg-emerald-500" : "bg-purple-500"
        )} />

        <div className="flex flex-col items-center text-center">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/5",
            variant === "danger" ? "bg-red-500/10 text-red-500" : variant === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-purple-500/10 text-purple-400"
          )}>
            {variant === "danger" ? <AlertCircle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
          </div>

          <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
            {title}
          </h3>
          <p className="text-white/50 text-sm font-medium leading-relaxed mb-6">
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
              className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white/50 font-bold text-sm hover:bg-white/10 hover:text-white transition-all order-2 sm:order-1"
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
