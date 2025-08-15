'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const tabs = [
  {
    id: 'AIRCRAFT DAMAGE LOG',
    label: 'Aircraft Damage Report',
    content: (
      <div>
        <img
          src="https://dummyimage.com/800x500/004051/ffffff&text=Damage+Report"
          alt="Damage Report"
          className="w-full h-auto rounded shadow mb-4"
        />
      </div>
    )
  },
  {
    id: 'PRE-FLIGHT INSPECTION',
    label: 'Pre-Flight Inspection Report',
    content: (
      <img
        src="https://dummyimage.com/800x500/004051/ffffff&text=Pre-Flight+Inspection"
        alt="Pre-Flight Inspection"
        className="w-full h-auto rounded shadow"
      />
    )
  },
  {
    id: 'FUEL LOG',
    label: 'Fuel Consumption Log',
    content: (
      <img
        src="https://dummyimage.com/800x500/004051/ffffff&text=Fuel+Log"
        alt="Fuel Log"
        className="w-full h-auto rounded shadow"
      />
    )
  },
  {
    id: 'MAINTENANCE RECORD',
    label: 'Maintenance Log',
    content: (
      <img
        src="https://dummyimage.com/800x500/004051/ffffff&text=Maintenance+Record"
        alt="Maintenance Record"
        className="w-full h-auto rounded shadow"
      />
    )
  },
  {
    id: 'CABIN REPORT',
    label: 'Cabin Condition Report',
    content: (
      <img
        src="https://dummyimage.com/800x500/004051/ffffff&text=Cabin+Report"
        alt="Cabin Report"
        className="w-full h-auto rounded shadow"
      />
    )
  },
  {
    id: 'PILOT REPORT',
    label: 'Pilot Flight Log',
    content: (
      <img
        src="https://dummyimage.com/800x500/004051/ffffff&text=Pilot+Flight+Log"
        alt="Pilot Flight Log"
        className="w-full h-auto rounded shadow"
      />
    )
  },
  {
    id: 'WEATHER REPORT',
    label: 'Weather Briefing Document',
    content: (
      <img
        src="https://dummyimage.com/800x500/004051/ffffff&text=Weather+Briefing"
        alt="Weather Briefing"
        className="w-full h-auto rounded shadow"
      />
    )
  },
  {
    id: 'FLIGHT PLAN',
    label: 'Filed Flight Plan',
    content: (
      <img
        src="https://dummyimage.com/800x500/004051/ffffff&text=Flight+Plan"
        alt="Flight Plan"
        className="w-full h-auto rounded shadow"
      />
    )
  },
  {
    id: 'ENGINEERING REPORT',
    label: 'Engineering Status Report',
    content: (
      <img
        src="https://dummyimage.com/800x500/004051/ffffff&text=Engineering+Report"
        alt="Engineering Report"
        className="w-full h-auto rounded shadow"
      />
    )
  },
  {
    id: 'CARGO MANIFEST',
    label: 'Cargo & Load Sheet',
    content: (
      <img
        src="https://dummyimage.com/800x500/004051/ffffff&text=Cargo+Manifest"
        alt="Cargo Manifest"
        className="w-full h-auto rounded shadow"
      />
    )
  }
];

export default function FormElementsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-[#004051]">📄 Uploaded Documents</h2>
        <button
          onClick={() => router.push('/documents/create')}
          className="px-4 py-2 bg-[#004051] hover:bg-[#00363f] text-white font-semibold rounded-md transition"
        >
          + Add New Document
        </button>
      </div>

      {/* Notes */}
      <div className="bg-[#f0fafa] border border-[#004051] rounded-lg p-4 shadow-sm">
        <h3 className="text-md font-semibold text-[#004051] mb-1">📌 Notes:</h3>
        <p className="text-sm text-gray-800 leading-relaxed">
          The documents placed in this folder reflect customer preferences. These are not limited to the examples listed, and aim to ease the workload of flight operations by allowing direct upload to the aircraft system — removing the need to manually place printed documents onboard.
        </p>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Tabs */}
        <div className="col-span-12 md:col-span-3">
          <ul className="flex md:flex-col gap-2">
            {tabs.map((tab) => (
              <li
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`cursor-pointer px-4 py-2 rounded-md transition text-center md:text-left ${
                  activeTab === tab.id
                    ? 'bg-[#004051] text-white shadow-md'
                    : 'bg-white hover:bg-[#e6f5f5] text-black'
                }`}
              >
                {tab.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Content Area */}
        <div className="col-span-12 md:col-span-9">
          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-semibold text-[#004051] mb-4">
              {activeTab}
            </h2>
            <div>{activeContent}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
