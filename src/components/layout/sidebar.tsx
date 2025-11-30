"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  Shield,
  UserPlus,
  HandHeart,
  HeartPulse,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/residents", label: "Manage Residents", icon: Users },
  { href: "/staff", label: "Manage Staff", icon: Shield },
  { href: "/caretakers", label: "Manage Caretakers", icon: UserPlus },
  { href: "/visitors", label: "Visitor Log", icon: ClipboardList },
  { href: "/donations", label: "View Donations", icon: HandHeart },
  { href: "/medical", label: "Medical Records", icon: HeartPulse },
];

type SidebarProps = {
  className?: string;
  collapseOnMobile?: boolean;
  onNavigate?: () => void;
};

export function Sidebar({
  className,
  collapseOnMobile = true,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className={cn(
        "relative z-20 w-72 flex flex-col border-r border-border bg-white px-6 py-8 text-lg text-slate-700",
        collapseOnMobile && "hidden lg:flex",
        className,
      )}
    >
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand">
          foundation
        </p>
        <h1 className="text-2xl font-bold text-slate-900">
          Management Hub
        </h1>
      </div>

      <nav className="space-y-2 relative z-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => {
                router.push(item.href);
                if (onNavigate) {
                  onNavigate();
                }
              }}
              className={cn(
                "relative z-30 w-full flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition-all cursor-pointer text-left border-0 outline-none",
                "focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2",
                "hover:scale-[1.02] active:scale-[0.98]",
                isActive
                  ? "bg-brand text-white shadow-soft"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100",
              )}
              style={{ 
                pointerEvents: 'auto',
                position: 'relative',
                zIndex: 30,
              }}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

