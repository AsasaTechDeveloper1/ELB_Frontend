'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MdDevices } from 'react-icons/md';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export default function DeviceRegistrationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [deviceName, setDeviceName] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [operatingSystem, setOperatingSystem] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [notes, setNotes] = useState('');
  const [aircraftId, setAircraftId] = useState('');
  const [connectivity, setConnectivity] = useState<'wifi' | 'wifi_internet' | ''>('');

  const [aircraftList, setAircraftList] = useState<{ id: string; aircraftName: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch aircraft for dropdown
  useEffect(() => {
    async function fetchAircraft() {
      try {
        const res = await fetch(`${API_BASE}/aircrafts`);
        if (!res.ok) throw new Error('Failed to fetch aircraft list');
        const data = await res.json();
        setAircraftList(data || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAircraft();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setMessage(null);

    // Validation
    if (!deviceName || !macAddress || !operatingSystem || !manufacturer || !deviceType || !aircraftId || !connectivity) {
      setMessage({ text: 'Please fill all required fields.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        deviceName,
        macAddress,
        operatingSystem,
        manufacturer,
        modelNumber,
        deviceType,
        aircraftId,
        connectivity,
        notes,
      }; 

      const res = await fetch(`${API_BASE}/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage({ text: 'Device registered successfully!', type: 'success' });
        setTimeout(() => router.push('/devices'), 1500);
      } else {
        setMessage({ text: result.error || 'Failed to register device', type: 'error' });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || 'Failed to register device', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (value: string) =>
    `w-full border rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${
      submitted && !value ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-[#004051]'
    }`;

  return (
    <div className="max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-[#004051] px-6 py-3 flex justify-between items-center">
        <h2 className="text-white text-lg font-semibold flex items-center space-x-2">
          <MdDevices className="text-xl" />
          <span>Register New Device</span>
        </h2> 

        <button
          onClick={() => router.back()}
          type="button"
          className="text-white text-sm hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white"
      >
        {/* Inline message */}
        {message && (
          <div
            className={`
              md:col-span-2 mb-4 px-4 py-3 rounded-lg text-base font-semibold text-white shadow-lg 
              transition-all duration-300 ease-in-out
              ${message.type === 'success' ? 'bg-[#06b6d4]' : 'bg-red-700'}
            `}
          >
            {message.text}
          </div>
        )}

        {/* Device Fields */}
        <div>
          <label className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Device Name
          </label>
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="e.g., John's Laptop"
            className={getInputClass(deviceName)}
          />
        </div>

        <div>
          <label className="text-[15px] font-semibold text-gray-700 mb-1 block">
            MAC Address
          </label>
          <input
            type="text"
            value={macAddress}
            onChange={(e) => setMacAddress(e.target.value)}
            placeholder="e.g., 00:1A:2B:3C:4D:5E"
            className={getInputClass(macAddress)}
          />
        </div>

        <div>
          <label className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Operating System
          </label>
          <input
            type="text"
            value={operatingSystem}
            onChange={(e) => setOperatingSystem(e.target.value)}
            placeholder="e.g., Windows 11, macOS Ventura"
            className={getInputClass(operatingSystem)}
          />
        </div>

        <div>
          <label className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Manufacturer
          </label>
          <input
            type="text"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            placeholder="e.g., Dell, Apple, Samsung"
            className={getInputClass(manufacturer)}
          />
        </div>

        <div>
          <label className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Model Number
          </label>
          <input
            type="text"
            value={modelNumber}
            onChange={(e) => setModelNumber(e.target.value)}
            placeholder="e.g., XPS 13, Galaxy S22"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Device Type
          </label>
          <select
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
            className={getInputClass(deviceType)}
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

        {/* Aircraft & Connectivity Row */}
      <div className="md:col-span-2 flex flex-col md:flex-row md:space-x-6 gap-4">
        {/* Aircraft Dropdown */}
          <div className="flex-1">
            <label className="text-[15px] font-semibold text-gray-700 mb-1 block">
              Select Aircraft <span className="text-red-500">*</span>
            </label>
            <select
              value={aircraftId}
              onChange={(e) => setAircraftId(e.target.value)}
              className={getInputClass(aircraftId)}
            >
              <option value="">Select aircraft</option>
              {aircraftList.map((ac) => (
                <option key={ac.id} value={ac.id}>
                  {ac.aircraftName}
                </option>
              ))}
            </select>
          </div>

          {/* Connectivity Radio Buttons */}
          <div className="flex-1">
            <label className="text-[15px] font-semibold text-gray-700 mb-1 block">
              Connectivity <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-6 mt-1">
              <label className="inline-flex items-center space-x-2">
                <input
                  type="radio"
                  value="wifi"
                  checked={connectivity === 'wifi'}
                  onChange={() => setConnectivity('wifi')}
                  className="form-radio text-[#06b6d4] h-4 w-4"
                />
                <span>WiFi Only</span>
              </label>
              <label className="inline-flex items-center space-x-2">
                <input
                  type="radio"
                  value="wifi_internet"
                  checked={connectivity === 'wifi_internet'}
                  onChange={() => setConnectivity('wifi_internet')}
                  className="form-radio text-[#06b6d4] h-4 w-4"
                />
                <span>WiFi + Internet</span>
              </label>
            </div>
          </div>
      </div>


        <div className="md:col-span-2">
          <label className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Notes / Description <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any extra details about the device"
            rows={3}
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
          />
        </div>

        {/* Footer */}
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#004051] hover:bg-[#00363f] text-white text-sm font-medium px-6 py-2 rounded-md transition"
          >
            {loading ? 'Saving...' : 'Register Device'}
          </button>
        </div>
      </form>
    </div>
  );
}
