"use client";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ArrowLeftIcon, ChevronUp } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";

type SubItem = {
  title: string;
  url: string;
};

type Item = {
  title: string;
  icon: React.ComponentType<any>;
  items: SubItem[];
  url?: string;
};

type Section = {
  label: string;
  items: Item[];
};

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? [] : [title]
    );
  };

  useEffect(() => {
    (NAV_DATA as Section[]).some((section) => {
      return section.items.some((item) => {
        return item.items.some((subItem) => {
          if (subItem.url === pathname) {
            if (!expandedItems.includes(item.title)) {
              toggleExpanded(item.title);
            }
            return true;
          }
          return false;
        });
      });
    });
  }, [pathname]);

  return (
    <>
      {/* Background overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Toggle button for desktop when sidebar is closed */}
      {!isMobile && !isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 rounded bg-[#06b6d4] text-white p-2 shadow-md"
        >
          <ArrowLeftIcon className="rotate-180 transition-transform" />
        </button>
      )}

      {/* Sidebar itself */}
      <aside
        className={cn(
          "max-w-[290px] overflow-hidden border-r border-gray-200 bg-white transition-[width] duration-200 ease-linear dark:border-gray-800 dark:bg-gray-dark",
          isMobile ? "fixed bottom-0 top-0 z-50" : "sticky top-0 h-screen",
          isOpen ? "w-full" : "w-0"
        )}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="flex h-full flex-col py-10 pl-[25px] pr-[7px]">
          {/* Top Row with Logo and Toggle Button */}
          <div className="relative pr-4.5 flex items-center justify-between">
            <Link
              href="/"
              onClick={() => isMobile && toggleSidebar()}
              className="px-0 py-2.5 min-[850px]:py-0"
            >
              <Logo />
            </Link>

            {/* Desktop Toggle Button: far right of row */}
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="rounded bg-[#06b6d4] text-white p-2 shadow-md"
              >
                <ArrowLeftIcon
                  className={cn(
                    "transition-transform",
                    isOpen ? "rotate-180" : ""
                  )}
                />
              </button>
            )}

            {/* Mobile Toggle Button */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="absolute left-3/4 right-4.5 top-1/2 -translate-y-1/2 text-right bg-[#004051] text-white"
              >
                <span className="sr-only">Close Menu</span>
                <ArrowLeftIcon className="ml-auto size-7" />
              </button>
            )}
          </div>

          {/* Sidebar Menu */}
          <div className="custom-scrollbar mt-6 flex-1 overflow-y-auto pr-3 min-[850px]:mt-10">
            {(NAV_DATA as Section[]).map((section) => (
              <div key={section.label} className="mb-6">
                <h2 className="mb-5 text-sm font-medium text-dark-4 dark:text-dark-6">
                  {section.label}
                </h2>

                <nav role="navigation" aria-label={section.label}>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.title}>
                        {item.items.length ? (
                          <div>
                            <MenuItem
                              isActive={item.items.some(
                                ({ url }) => url === pathname
                              )}
                              onClick={() => toggleExpanded(item.title)}
                            >
                              <item.icon className="size-6 shrink-0" />
                              <span>{item.title}</span>
                              <ChevronUp
                                className={cn(
                                  "ml-auto rotate-180 transition-transform duration-200",
                                  expandedItems.includes(item.title) &&
                                    "rotate-0"
                                )}
                              />
                            </MenuItem>

                            {expandedItems.includes(item.title) && (
                              <ul
                                className="ml-9 mr-0 space-y-1.5 pb-[15px] pr-0 pt-2"
                                role="menu"
                              >
                                {item.items.map((subItem) => (
                                  <li key={subItem.title} role="none">
                                    <MenuItem
                                      as="link"
                                      href={subItem.url}
                                      isActive={pathname === subItem.url}
                                    >
                                      <span>{subItem.title}</span>
                                    </MenuItem>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : (
                          (() => {
                            const href =
                              item.url ??
                              "/" +
                                item.title
                                  .toLowerCase()
                                  .split(" ")
                                  .join("-");

                            return (
                              <MenuItem
                                className="flex items-center gap-3 py-3"
                                as="link"
                                href={href}
                                isActive={pathname === href}
                              >
                                <item.icon className="size-6 shrink-0" />
                                <span>{item.title}</span>
                              </MenuItem>
                            );
                          })()
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
