"use client";

import { SearchIcon } from "@/assets/icons";
import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { Notification } from "./notification";
import { HomeButton } from "./home";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();

  return (
    <header className="sticky top-0 z-30 border-b border-stroke bg-white px-4 py-5 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-4">
      <div className="flex items-center justify-between">
        {/* Sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className="rounded-lg border px-1.5 py-1 dark:border-stroke-dark dark:bg-[#020D1A] hover:dark:bg-[#FFFFFF1A] lg:hidden"
        >
          <MenuIcon />
          <span className="sr-only">Toggle Sidebar</span>
        </button>

        

        {/* Logo (only mobile) */}
        {isMobile && (
          <Link href={"/"} className="ml-2 max-[430px]:hidden min-[375px]:ml-4">
            <Image
              src={"/images/logo/favicon.png"}
              width={32}
              height={32}
              alt=""
              role="presentation"
            />
          </Link>
        )}

        <HomeButton />
        
        {/* Right side - notification & profile */}
        <div className="flex flex-1 items-center justify-end gap-2 min-[375px]:gap-4">
          {/* Desktop flight info */}
          
          <div className="hidden md:block w-full bg-[#004051] shadow-md border border-gray-200 rounded-lg">
            <div 
              className="grid max-w-[970px] mx-auto py-3"
              style={{ gridTemplateColumns: "1fr 1fr 2fr" }}
            >
              {/* Aircraft / Type */}
              <div className="flex flex-col items-center justify-center px-4 border-b border-gray-300 md:border-b-0 md:border-r">
                <span className="text-xs text-gray-300 uppercase">
                  Aircraft / Type
                </span>
                <span className="text-sm font-semibold text-white">
                  A6EQN / B773ER
                </span>
              </div>

              {/* Flight Hours / Cycles */}
              <div className="flex flex-col items-center justify-center px-4 border-b border-gray-300 md:border-b-0 md:border-r">
                <span className="text-xs text-gray-300 uppercase">
                  Flight Hours / Cycles
                </span>
                <span className="text-sm font-semibold text-white">
                  FH-28865:56 / FC-4656
                </span>
              </div>

              {/* Flight & Route */}
              <div className="flex flex-col items-center justify-center px-4">
                <span className="text-sm font-semibold text-white leading-tight text-center">
                  <span className="text-xs text-gray-300 uppercase">
                    Flight :
                  </span>{" "}
                  EK0824
                  <br />
                  <span className="text-xs font-normal text-gray-200">
                    DMM (ETD 01:15, 7 Mar 25) → DXB (ETA 02:17, 7 Mar 25)
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Notification + Profile */}
          <Notification />
          <div className="shrink-0">
            <UserInfo />
          </div>
        </div>
      </div>

      {/* Mobile flight info (compact row) */}
      <div className="block md:hidden w-full mt-3">
        <div className="bg-[#004051] shadow-md border border-gray-200 rounded-md p-2 flex items-center justify-between text-center text-white text-[10px]">
          
          {/* Aircraft / Type */}
          <div className="flex flex-col items-center px-1">
            <span className="uppercase text-gray-300">Aircraft / Type</span>
            <span className="text-xs font-semibold">A6EQN / B773ER</span>
          </div>

          {/* Flight Hours / Cycles */}
          <div className="flex flex-col items-center px-1">
            <span className="uppercase text-gray-300">FH / FC</span>
            <span className="text-xs font-semibold">28865:56 / 4656</span>
          </div>

          {/* Flight & Route */}
          <div className="flex flex-col items-center px-1">
            <span className="uppercase text-gray-300">Flight</span>
            <span className="text-xs font-semibold">EK0824</span>
            <span className="text-[10px] text-gray-200 leading-tight">
              DMM (01:15) → DXB (02:17)
            </span>
          </div>
        </div>
      </div>

    </header>
  );
}
