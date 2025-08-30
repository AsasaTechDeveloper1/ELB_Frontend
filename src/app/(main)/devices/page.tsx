'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdDevices } from 'react-icons/md';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Device {
  id: string;
  deviceName: string;
  macAddress: string;
  operatingSystem: string;
  manufacturer: string;
  modelNumber: string;
  deviceType: string;
  dateRegistered: string;
  notes?: string;
}

// Centralized API base URL from .env.local
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function DeviceListPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);


  // ✅ Fetch devices
  useEffect(() => {
    async function fetchDevices() {
      try {
        const res = await fetch(`${API_BASE}/devices`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        const sortedData = data.sort(
          (a: Device, b: Device) =>
            new Date(b.dateRegistered).getTime() - new Date(a.dateRegistered).getTime()
        );

        setDevices(sortedData);
      } catch (error) {
        console.error('Failed to fetch devices:', error);
        setDevices([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDevices();
  }, []);

  function handleAddNew() {
    router.push('/devices/create');
  }

  function handleEdit(id: string) {
    router.push(`/devices/edit/${id}`);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this device?')) return;

    try {
      const res = await fetch(`${API_BASE}/devices/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete device');

      setDevices(prev => prev.filter(d => d.id !== id));
      // Remove from list
      setDevices(prev => prev.filter(d => d.id !== id));

      // Show inline success message
      setMessage({ text: 'Device deleted successfully!', type: 'success' });

      // Hide after 1.5 seconds
      setTimeout(() => setMessage(null), 1500);

    } catch (error) {
      console.error(error);
      setMessage({ text: 'Error deleting device ❌', type: 'error' });
      setTimeout(() => setMessage(null), 2000);
    }
  }

  return (
    <div className="bg-white p-6 shadow rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-gray-900">
          <MdDevices className="text-base sm:text-xl" />
          <span className="sm:hidden">Devices</span>          {/* mobile */}
          <span className="hidden sm:inline">Registered Devices</span> {/* desktop */}
        </h2>

        <button
          onClick={handleAddNew}
          className="px-3 py-1 sm:px-4 sm:py-2 bg-[#004051] hover:bg-[#00363f] text-white font-semibold rounded-md transition text-sm sm:text-base flex items-center gap-1"
        >
          <MdDevices className="text-sm sm:text-base" /> {/* your icon */}
          <span className="sm:hidden">+ Add</span>         {/* mobile */}
          <span className="hidden sm:inline">+ Add New Device</span> {/* desktop */}
        </button>
      </div>
      
      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-base font-semibold text-white shadow-lg transition-all duration-300 ease-in-out ${
            message.type === 'success' ? 'bg-[#06b6d4]' : 'bg-red-600'
          }`}
        >
          {message.text}
        </div>
      )} 


      {/* Table */}
      {loading ? (
        <p className="text-gray-600">Loading devices...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center text-gray-700">#</TableHead>
                <TableHead className="text-gray-700">Name</TableHead>
                <TableHead className="text-gray-700">MAC Address</TableHead>
                <TableHead className="text-gray-700">OS</TableHead>
                <TableHead className="text-gray-700">Manufacturer</TableHead>
                <TableHead className="text-gray-700">Model</TableHead>
                <TableHead className="text-gray-700">Type</TableHead>
                <TableHead className="text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.length > 0 ? (
                devices.map((device, index) => (
                  <TableRow key={device.id} className="text-gray-800">
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell>{device.deviceName}</TableCell>
                    <TableCell>{device.macAddress}</TableCell>
                    <TableCell>{device.operatingSystem}</TableCell>
                    <TableCell>{device.manufacturer}</TableCell>
                    <TableCell>{device.modelNumber}</TableCell>
                    <TableCell>{device.deviceType}</TableCell>
                    <TableCell className="flex gap-2">
                      <button
                        onClick={() => handleEdit(device.id)}
                        className="px-2 py-1 bg-[#004051] hover:bg-[#006172] text-white rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(device.id)}
                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                      >
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500 py-4">
                    No devices found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
