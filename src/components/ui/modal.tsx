"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm dark:bg-black/60" onClick={onClose} />
      <div className={cn(
        "relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full animate-slide-up",
        sizes[size]
      )}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors z-10"
          >
            <X size={18} />
          </button>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
