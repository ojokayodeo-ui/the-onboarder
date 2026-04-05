import { cn } from "@/lib/utils";
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helpText, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border rounded-lg transition-colors",
            "placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
            "dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500",
            error
              ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
              : "border-slate-200 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-500",
            className
          )}
          {...props}
        />
        {helpText && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{helpText}</p>}
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helpText, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={4}
          className={cn(
            "w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border rounded-lg transition-colors resize-none",
            "placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
            "dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500",
            error
              ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
              : "border-slate-200 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-500",
            className
          )}
          {...props}
        />
        {helpText && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{helpText}</p>}
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  options: string[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helpText, options, placeholder, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border rounded-lg transition-colors appearance-none",
            "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
            "dark:bg-slate-800 dark:text-slate-100",
            error
              ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
              : "border-slate-200 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-500",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {helpText && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{helpText}</p>}
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
