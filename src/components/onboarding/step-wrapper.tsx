import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Save } from "lucide-react";

interface StepWrapperProps {
  title: string;
  description: string;
  emoji: string;
  children: ReactNode;
  onNext: () => void;
  onSave: () => void;
  saving: boolean;
  isLast?: boolean;
  nextLabel?: string;
}

export function StepWrapper({ title, description, emoji, children, onNext, onSave, saving, isLast, nextLabel }: StepWrapperProps) {
  return (
    <div>
      {/* Step header */}
      <div className="mb-8">
        <div className="text-4xl mb-4">{emoji}</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>

      {/* Fields */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6 shadow-sm dark:shadow-none">
        <div className="space-y-6">{children}</div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
        >
          <Save size={14} />
          Save & continue later
        </button>

        <Button onClick={onNext} loading={saving} size="lg">
          {isLast ? "Submit Onboarding" : (nextLabel ?? "Continue")}
          {!isLast && <ChevronRight size={16} />}
        </Button>
      </div>
    </div>
  );
}
