'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Device {
  id: number;
  deviceName: string;
  macAddress: string;
  operatingSystem: string;
  manufacturer: string;
  modelNumber: string;
  deviceType: string;
  dateRegistered: string;
}

export default function DeviceListPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchDevices() {
      try {
        const res = await fetch('/api/devices');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();

        if (data && Array.isArray(data) && data.length > 0) {
          setDevices(data);
        } else {
          // Fallback to dummy data if API returns empty or invalid response
          setDevices([
            {
              id: 1,
              deviceName: "John's Laptop",
              macAddress: "00:1A:2B:3C:4D:5E",
              operatingSystem: "Windows 11",
              manufacturer: "Dell",
              modelNumber: "XPS 13",
              deviceType: "Laptop",
              dateRegistered: "2025-06-01",
            },
            {
              id: 2,
              deviceName: "Office Tablet",
              macAddress: "AA:BB:CC:DD:EE:FF",
              operatingSystem: "Android 13",
              manufacturer: "Samsung",
              modelNumber: "Galaxy Tab S8",
              deviceType: "Tablet",
              dateRegistered: "2025-06-15",
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch devices:', error);
        // Fallback to dummy data on fetch error
        setDevices([
          {
            id: 1,
            deviceName: "John's Laptop",
            macAddress: "00:1A:2B:3C:4D:5E",
            operatingSystem: "Windows 11",
            manufacturer: "Dell",
            modelNumber: "XPS 13",
            deviceType: "Laptop",
            dateRegistered: "2025-06-01",
          },
          {
            id: 2,
            deviceName: "Office Tablet",
            macAddress: "AA:BB:CC:DD:EE:FF",
            operatingSystem: "Android 13",
            manufacturer: "Samsung",
            modelNumber: "Galaxy Tab S8",
            deviceType: "Tablet",
            dateRegistered: "2025-06-15",
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchDevices();
  }, []);

  function handleAddNew() {
    router.push('/devices/create');
  }

  return (
    <div className="bg-white p-6 shadow rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">📱 Registered Devices</h2>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-[#004051] hover:bg-[#006172] text-white font-medium rounded-md transition"
        >
          + Add New
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading devices...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center text-gray-700">#</TableHead>
                <TableHead className="text-gray-700">Device Name</TableHead>
                <TableHead className="text-gray-700">MAC Address</TableHead>
                <TableHead className="text-gray-700">OS</TableHead>
                <TableHead className="text-gray-700">Manufacturer</TableHead>
                <TableHead className="text-gray-700">Model</TableHead>
                <TableHead className="text-gray-700">Type</TableHead>
                <TableHead className="text-gray-700">Date Registered</TableHead>
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
                    <TableCell>{device.dateRegistered}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-4">
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
