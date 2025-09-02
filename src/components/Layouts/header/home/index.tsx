"use client";

import { FaHome } from "react-icons/fa"; // using react-icons (already installed)
import { cn } from "@/lib/utils";
import Link from "next/link";

export function HomeButton() {
  return (
    <Link
      href="/"
      className={cn(
        "grid size-12 place-items-center rounded-full border bg-gray-2 text-dark outline-none",
        "hover:text-primary focus-visible:border-primary focus-visible:text-primary",
        "dark:border-dark-4 pl-3 pr-3 dark:bg-dark-3 ml-2 mr-2 dark:text-white dark:focus-visible:border-primary"
      )}
      aria-label="Go to Home"
    >
      <FaHome className="size-6" />
    </Link>
  );
}
