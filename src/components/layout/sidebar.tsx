"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, Users, GitBranch, Settings,
  LogOut, Zap, ChevronRight, Sun, Moon, Monitor,
  CheckSquare, Link2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/integrations", label: "Integrations", icon: Link2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 mx-2">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={cn(
            "flex-1 flex items-center justify-center py-1 rounded-md transition-all",
            theme === value
              ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
          )}
        >
          <Icon size={13} />
        </button>
      ))}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/60 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-700/60">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">Onboarding OS</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{session?.user.agencyName}</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <Icon size={18} className={active ? "text-brand-600 dark:text-brand-400" : "text-slate-400 dark:text-slate-500"} />
              {label}
              {active && <ChevronRight size={14} className="ml-auto text-brand-400 dark:text-brand-500" />}
            </Link>
          );
        })}
      </nav>

      {/* Theme toggle */}
      <div className="pb-2">
        <ThemeToggle />
      </div>

      {/* User */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar name={session?.user.name ?? session?.user.email ?? "U"} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{session?.user.name ?? "User"}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session?.user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
