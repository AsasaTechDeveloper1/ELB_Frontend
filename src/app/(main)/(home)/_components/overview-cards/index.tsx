import { compactFormat } from "@/lib/format-number";
import { getOverviewData } from "../../fetch";
import HeroAsside from "./heroasside";
import { requireAuth } from "@/lib/auth";
import * as icons from "./icons";
import Link from "next/link";

interface Flight {
  id: string;
  fltNo: string;
  takeOffDate: string;
  currentFlight: boolean;
  flightLeg: number; // Added flightLeg to interface
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function OverviewCardsGroup() {
  await requireAuth();
  const { views, profit, products, users } = await getOverviewData();

  // 🔹 Fetch flights
  let previousFlights: Flight[] = [];
  let nextFlights: Flight[] = [];
  let currentFlight: Flight | null = null;
  try {
    const res = await fetch(`${API_BASE}/flights`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

    const flights: Flight[] = await res.json();

    // Filter and sort flights based on flightLeg
    previousFlights = flights
      .filter(flight => flight.flightLeg < 0)
      .sort((a, b) => b.flightLeg - a.flightLeg); // Most recent first (higher negative number)
    nextFlights = flights
      .filter(flight => flight.flightLeg > 0)
      .sort((a, b) => a.flightLeg - b.flightLeg); // Nearest first (lower positive number)
    currentFlight = flights.find(flight => flight.flightLeg === 0) || null;
  } catch (err) {
    console.error("Failed to fetch flights:", err);
  }

  const summaryData = [
    { label: 'Documents', value: 128, imagePath: '/images/cover/details.png', border: 'border-blue-500', link: '/documents/' },
    { label: 'Charts', value: 45, imagePath: '/images/cover/settings-left-side.png', border: 'border-green-500', link: '/ChartsHandler' },
    { label: 'Notices', value: 12, imagePath: '/images/cover/notices.png', border: 'border-yellow-500', link: '/notices' },
    { label: 'Logs', value: 86, imagePath: '/images/cover/errorlogs.png', border: 'border-purple-500', link: '/logs' },
    { label: 'Deferral', value: 6, imagePath: '/images/cover/deferal.png', border: 'border-cyan-500', link: '/deferral' },
  ];

  return (
    <>
      {/* Hero Section + Plane + HeroAsside */}
      <div className="space-y-6 mb-4">
        <div className="w-full">
          <div className="flex flex-col xl:flex-row gap-6 items-start w-full">
            {/* Plane Image */}
            <div className="hidden md:flex w-full xl:w-1/5 justify-center">
              <img
                src="/images/cover/asidePlane.png"
                alt="Plane"
                className="w-full max-w-[180px] h-auto object-contain rounded-2xl"
              />
            </div>

            {/* Hero Asside */}
            <div className="w-full xl:flex-1">
              <HeroAsside />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Circular Cards Row */}
      <div className="mt-8 w-full">
        <div className="flex md:flex-wrap flex-nowrap justify-start md:justify-center gap-6 overflow-x-auto scrollbar-hide px-2">
          {summaryData.map((item, idx) => (
            <Link
              href={item.link}
              key={idx}
              className={`relative 
                w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 
                flex-shrink-0 flex flex-col items-center justify-center 
                border-4 sm:border-6 md:border-8 
                ${item.border} bg-white rounded-full shadow-sm 
                hover:scale-105 transition-all duration-300 ease-in-out 
                group cursor-pointer`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 shadow mb-1 sm:mb-2">
                <img
                  src={item.imagePath}
                  alt={item.label}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-[10px] sm:text-xs md:text-sm text-gray-700 font-medium">
                {item.label}
              </h3>
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-[#004051] mt-0.5 sm:mt-1 group-hover:scale-110 transition-all duration-300">
                {item.value}
              </div>
              <span className="absolute w-full h-full rounded-full border-2 sm:border-3 md:border-4 animate-spin-slow border-dashed border-opacity-20 border-[#004051]"></span>
            </Link>
          ))}
        </div>
      </div>

      {/* Flight History */}
      <div className="w-full mt-10">
        <div className="bg-white py-6 px-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-custom-blue">Flight History</h2>
            <Link
              href="http://localhost:3000/flights"
              className="px-3 py-1 sm:px-4 sm:py-1 bg-[#004051] hover:bg-[#00363f] text-white font-semibold rounded-md transition text-sm sm:text-base flex items-center gap-1"
            >
              <span className="hidden sm:inline">View All</span>
              <span className="sm:hidden">All</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Previous Flights */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="bg-[#004051] px-4 py-2 font-semibold text-white rounded-t-md">
                Previous Flights
              </div>
              <table className="w-full table-auto text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase">
                  <tr>
                    <th className="px-4 py-2 border-b">Flight No</th>
                    <th className="px-4 py-2 border-b">Date</th>
                    <th className="px-4 py-2 border-b">Flight Leg</th>
                  </tr>
                </thead>
                <tbody>
                  {previousFlights.length > 0 ? (
                    previousFlights.map(flight => (
                      <tr key={flight.id}>
                        <td className="px-4 py-2 border-b">{flight.fltNo}</td>
                        <td className="px-4 py-2 border-b">{flight.takeOffDate}</td>
                        <td className="px-4 py-2 border-b">{flight.flightLeg}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 border-b text-center text-gray-500">
                        No previous flights found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Next Flights */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="bg-[#004051] px-4 py-2 font-semibold text-white rounded-t-md">
                Next Flights
              </div>
              <table className="w-full table-auto text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase">
                  <tr>
                    <th className="px-4 py-2 border-b">Flight No</th>
                    <th className="px-4 py-2 border-b">Date</th>
                    <th className="px-4 py-2 border-b">Flight Leg</th>
                  </tr>
                </thead>
                <tbody>
                  {nextFlights.length > 0 ? (
                    nextFlights.map(flight => (
                      <tr key={flight.id}>
                        <td className="px-4 py-2 border-b">{flight.fltNo}</td>
                        <td className="px-4 py-2 border-b">{flight.takeOffDate}</td>
                        <td className="px-4 py-2 border-b">{flight.flightLeg}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 border-b text-center text-gray-500">
                        No upcoming flights found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}