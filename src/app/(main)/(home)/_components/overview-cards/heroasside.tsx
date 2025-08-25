'use client';

import Image from "next/image";
import { useState } from "react";
import { FaPlane, FaHashtag, FaClock, FaCogs } from "react-icons/fa";

export default function HeroAsside() {
  const [data, setData] = useState({
    name: "Danish Heilium",
    profilePhoto: "/images/user/user-03.png",
    coverPhoto: "/images/cover/main-login.jpg",
  });

  const infoItems = [
    { label: "REGN", value: "ABC123", icon: <FaPlane /> },
    { label: "MSN", value: "56789", icon: <FaHashtag /> },
    { label: "AF HRS", value: "1200", icon: <FaClock /> },
    { label: "ENG 1", value: "300 HRS", icon: <FaCogs /> },
    { label: "ENG 2", value: "295 HRS", icon: <FaCogs /> },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Info Summary - Horizontal scroll on small screens */}
      <div className="rounded-xl bg-white shadow-md border border-gray-200 p-4 md:p-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {infoItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-lg transition shrink-0"
            >
              <div className="text-blue-600 text-base">{item.icon}</div>
              <div className="leading-tight">
                <p className="text-[11px] font-medium text-gray-500">{item.label}</p>
                <p className="text-sm font-semibold text-gray-800">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cover Image with Name Overlay */}
      <div className="relative overflow-hidden rounded-xl shadow-sm">
        <div className="absolute bottom-3 left-4 bg-black/60 px-3 py-1.5 rounded">
          <p className="text-sm font-semibold text-white">{data.name}</p>
        </div>
      </div>
    </div>
  );
}
