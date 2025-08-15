'use client';

export default function FlightDetailsSection() {
  return (
    <div className="max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      <div className="bg-[#004051] px-6 py-3 flex justify-between items-center">
        <h2 className="text-white text-lg font-semibold">✈️ Flight Information Entry</h2>
      </div>
      <form className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">REGN</label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051]">
            <option>Choose Regn</option>
            <option>Regn # 1</option>
            <option>Regn # 2</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">FLT No</label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051]">
            <option>Choose Flight No</option>
            <option>A-00001</option>
            <option>A-00002</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Type of Flight</label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051]">
            <option>Choose Type</option>
            <option>Commercial</option>
            <option>Non-Commercial</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">From</label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051]">
            <option>Choose Airport</option>
            <option>DXB</option>
            <option>NYC</option>
            <option>KCA</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">To</label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051]">
            <option>Choose Airport</option>
            <option>DXB</option>
            <option>NYC</option>
            <option>KCA</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Number Of Landing</label>
          <input
            type="text"
            placeholder="Enter number"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Off Block</label>
          <input
            type="time"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">On Block</label>
          <input
            type="time"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Previous HRS</label>
          <input
            type="time"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Take Off</label>
          <input
            type="time"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Landing</label>
          <input
            type="time"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Flight Time</label>
          <input
            type="time"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Take Off Date</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Landing Date</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Total ACFT HRS</label>
          <input
            type="time"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Employee No</label>
          <input
            type="text"
            placeholder="Employee No"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Capt Name</label>
          <input
            type="text"
            placeholder="Capt Name"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051]"
          />
        </div>
        <div className="flex items-center gap-2 mt-6">
          <input type="checkbox" className="h-4 w-4 border border-gray-300 rounded focus:ring focus:ring-[#004051]" />
          <span className="text-sm font-medium text-gray-700">ACFT RELEASE</span>
        </div>
      </form>
      <div className="bg-gray-100 px-6 py-3 flex justify-end">
        <button
          type="submit"
          className="bg-[#004051] hover:bg-[#00363f] text-white text-sm font-medium px-6 py-2 rounded-md transition"
        >
          Submit Form
        </button>
      </div>
    </div>
  );
}