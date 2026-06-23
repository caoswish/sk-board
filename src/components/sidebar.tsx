"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/notices", label: "공지사항" },
  { href: "/", label: "과정 문의" },
  { href: "/mysuni", label: "★ mySUNI 이용문의" },
  { href: "/faq", label: "FAQ" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 gap-2 sm:w-44 sm:flex-col sm:gap-1">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded px-3 py-2 text-sm font-medium ${
              active
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
