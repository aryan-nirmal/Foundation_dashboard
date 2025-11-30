"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Button } from "../ui/button";

export function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between border-b border-border bg-white px-4 py-4 text-lg text-slate-800 lg:hidden">
      <button
        className="rounded-full border border-border p-2"
        aria-label="Toggle navigation"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Menu className="h-6 w-6" />
      </button>
      <Link href="/" className="font-semibold">
        Foundation Dashboard
      </Link>
      <Button variant="ghost" className="font-semibold text-brand">
        {pathname === "/" ? "Hi there" : "Menu"}
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-72 bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <Sidebar
              collapseOnMobile={false}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
}

