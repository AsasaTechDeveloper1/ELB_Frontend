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
import { useEffect, useState } from "react";

interface Flight {
  id: string;
  fltNo: string;
  takeOffDate: string;
  currentFlight: boolean;
  flightLeg: number;
  regn: string; // Aircraft registration (e.g., A6EQN)
  typeOfFlight: string; // Aircraft type (e.g., B773ER)
  from: string; // Departure airport (e.g., DMM)
  to: string; // Arrival airport (e.g., DXB)
  totalHrs: string; // Flight hours (e.g., 28865:56)
  landings: number; // Flight cycles (e.g., 4656)
  offBlock: string; // Departure time (e.g., 01:15)
  onBlock: string; // Arrival time (e.g., 02:17)
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();
  const [currentFlight, setCurrentFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current flight (flightLeg === 0)
  useEffect(() => {
    const fetchCurrentFlight = async () => {
      try {
        const res = await fetch(`${API_BASE}/flights`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const flights: Flight[] = await res.json();
        const flight = flights.find(flight => flight.flightLeg === 0) || null;
        setCurrentFlight(flight);
      } catch (err) {
        console.error("Failed to fetch current flight:", err);
        setCurrentFlight(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentFlight();
  }, []);

  // Default placeholder data for when no current flight is found
  const defaultFlightData = {
    regn: "A6EQN",
    typeOfFlight: "B773ER",
    totalHrs: "28865:56",
    landings: 4656,
    fltNo: "EK0824",
    from: "DMM",
    to: "DXB",
    offBlock: "01:15",
    onBlock: "02:17",
    takeOffDate: "7 Mar 25",
  };

  // Format flight data for display
  const flightData = currentFlight || defaultFlightData;

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
                  {defaultFlightData.regn} / {flightData.typeOfFlight}
                </span>
              </div>

              {/* Flight Hours / Cycles */}
              <div className="flex flex-col items-center justify-center px-4 border-b border-gray-300 md:border-b-0 md:border-r">
                <span className="text-xs text-gray-300 uppercase">
                  Flight Hours / Cycles
                </span>
                <span className="text-sm font-semibold text-white">
                  FH-{flightData.totalHrs} / FC-{flightData.landings}
                </span>
              </div>

              {/* Flight & Route */}
              <div className="flex flex-col items-center justify-center px-4">
                <span className="text-sm font-semibold text-white leading-tight text-center">
                  <span className="text-xs text-gray-300 uppercase">
                    Flight :
                  </span>{" "}
                  {flightData.fltNo}
                  <br />
                  <span className="text-xs font-normal text-gray-200">
                    {flightData.from} (ETD {flightData.offBlock}, {flightData.takeOffDate}) →{" "}
                    {flightData.to} (ETA {flightData.onBlock}, {flightData.takeOffDate})
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
            <span className="text-xs font-semibold">
              {flightData.regn} / {flightData.typeOfFlight}
            </span>
          </div>

          {/* Flight Hours / Cycles */}
          <div className="flex flex-col items-center px-1">
            <span className="uppercase text-gray-300">FH / FC</span>
            <span className="text-xs font-semibold">
              {flightData.totalHrs} / {flightData.landings}
            </span>
          </div>

          {/* Flight & Route */}
          <div className="flex flex-col items-center px-1">
            <span className="uppercase text-gray-300">Flight</span>
            <span className="text-xs font-semibold">{flightData.fltNo}</span>
            <span className="text-[10px] text-gray-200 leading-tight">
              {flightData.from} ({flightData.offBlock}) → {flightData.to} ({flightData.onBlock})
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}