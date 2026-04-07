"use client";

import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "emails", label: "Email Sequence" },
  { id: "messages", label: "Messages" },
  { id: "notes", label: "Notes" },
];

interface ClientTabsWrapperProps {
  activeTab: string;
  clientId: string;
  children: React.ReactNode;
}

export function ClientTabsWrapper({ activeTab, clientId, children }: ClientTabsWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleTab(tabId: string) {
    router.push(`${pathname}?tab=${tabId}`);
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-5 border-b border-slate-200 dark:border-slate-700">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTab(tab.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2",
              activeTab === tab.id
                ? "text-brand-600 dark:text-brand-400 border-brand-500"
                : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {children}
    </div>
  );
}
