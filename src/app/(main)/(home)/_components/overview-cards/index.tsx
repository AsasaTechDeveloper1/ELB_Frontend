import { compactFormat } from "@/lib/format-number";
import { getOverviewData } from "../../fetch";
import MainHero from "./hero";
import HeroAsside from "./heroasside";
import { requireAuth } from "@/lib/auth";
import * as icons from "./icons";
import Link from "next/link";

export async function OverviewCardsGroup() {
  await requireAuth();
  const { views, profit, products, users } = await getOverviewData();

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
        {/* <MainHero /> */}

        <div className="w-full">
          <div className="flex flex-col xl:flex-row gap-6 items-start w-full">
            {/* Plane Image */}
            <div className="w-full xl:w-1/5 flex justify-center">
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
        <div className="flex flex-wrap justify-center gap-14">
          {summaryData.map((item, idx) => (
            <Link
              href={item.link}
              key={idx}
              className={`relative w-40 h-40 flex flex-col items-center justify-center border-8 ${item.border} bg-white rounded-full shadow-sm hover:scale-105 transition-all duration-300 ease-in-out group cursor-pointer`}
            >
              <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 shadow mb-2">
                <img
                  src={item.imagePath}
                  alt={item.label}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-sm text-gray-700 font-medium">{item.label}</h3>
              <div className="text-3xl font-bold text-[#004051] mt-1 group-hover:scale-110 transition-all duration-300">
                {item.value}
              </div>
              <span className="absolute w-full h-full rounded-full border-4 animate-spin-slow border-dashed border-opacity-20 border-[#004051]"></span>
            </Link>
          ))}
        </div>
      </div>

      {/* Flight History */}
      <div className="w-full mt-10">
        <div className="bg-white py-6 px-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-custom-blue mb-6">Flight History</h2>

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
                    <th className="px-4 py-2 border-b">Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border-b">XYZ123</td>
                    <td className="px-4 py-2 border-b">12 Jun 2025 - 08:00 AM</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">DEF789</td>
                    <td className="px-4 py-2 border-b">10 Jun 2025 - 06:30 PM</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">XYZ123</td>
                    <td className="px-4 py-2 border-b">12 Jun 2025 - 08:00 AM</td>
                  </tr>
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
                    <th className="px-4 py-2 border-b">Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border-b">ABC456</td>
                    <td className="px-4 py-2 border-b">17 Jun 2025 - 03:45 PM</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">LMN999</td>
                    <td className="px-4 py-2 border-b">20 Jun 2025 - 09:15 AM</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b">ABC456</td>
                    <td className="px-4 py-2 border-b">17 Jun 2025 - 03:45 PM</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
