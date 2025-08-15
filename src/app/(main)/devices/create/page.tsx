'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeviceRegistrationForm() {
  const router = useRouter();

  const [deviceName, setDeviceName] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [operatingSystem, setOperatingSystem] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log({
      deviceName,
      macAddress,
      operatingSystem,
      manufacturer,
      modelNumber,
      deviceType,
      notes,
    });
  };

  return (
    <div className="max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-[#004051] px-6 py-3 flex justify-between items-center">
        <h2 className="text-white text-lg font-semibold">📱 Register New Device</h2>
        <button
          onClick={() => router.back()}
          type="button"
          className="text-white text-sm hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
        <div>
          <label htmlFor="deviceName" className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Device Name
          </label>
          <input
            id="deviceName"
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="e.g., John's Laptop"
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004051]"
            required
          />
        </div>

        <div>
          <label htmlFor="macAddress" className="text-[15px] font-semibold text-gray-700 mb-1 block">
            MAC Address
          </label>
          <input
            id="macAddress"
            type="text"
            value={macAddress}
            onChange={(e) => setMacAddress(e.target.value)}
            placeholder="e.g., 00:1A:2B:3C:4D:5E"
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004051]"
            required
          />
        </div>

        <div>
          <label htmlFor="operatingSystem" className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Operating System
          </label>
          <input
            id="operatingSystem"
            type="text"
            value={operatingSystem}
            onChange={(e) => setOperatingSystem(e.target.value)}
            placeholder="e.g., Windows 11, macOS Ventura"
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004051]"
            required
          />
        </div>

        <div>
          <label htmlFor="manufacturer" className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Manufacturer
          </label>
          <input
            id="manufacturer"
            type="text"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            placeholder="e.g., Dell, Apple, Samsung"
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004051]"
            required
          />
        </div>

        <div>
          <label htmlFor="modelNumber" className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Model Number
          </label>
          <input
            id="modelNumber"
            type="text"
            value={modelNumber}
            onChange={(e) => setModelNumber(e.target.value)}
            placeholder="e.g., XPS 13, Galaxy S22"
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004051]"
          />
        </div>

        <div>
          <label htmlFor="deviceType" className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Device Type
          </label>
          <select
            id="deviceType"
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004051]"
            required
          >
            <option value="">Select device type</option>
            <option value="laptop">Laptop</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
            <option value="iot">IoT Device</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Notes / Description <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any extra details about the device"
            rows={3}
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm resize-none placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004051]"
          />
        </div>
      </form>

      {/* Footer */}
      <div className="bg-gray-100 px-6 py-3 flex justify-end">
        <button
          type="submit"
          onClick={handleSubmit}
          className="bg-[#004051] hover:bg-[#00363f] text-white text-sm font-medium px-6 py-2 rounded-md transition"
        >
          Register Device
        </button>
      </div>
    </div>
  );
}
