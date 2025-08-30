'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdAirplanemodeActive } from 'react-icons/md'; // import aircraft icon
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Aircraft {
  id: string; // Firestore document id
  aircraftName: string;
  aircraftType: string;
  registrationNumber: string;
  manufacturer: string;
  year: string;
  createdAt: string;
  description?: string;
  imageUrl?: string;
}

// Centralized API base URL from .env.local
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AircraftListPage() {
  const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch aircrafts
  useEffect(() => {
    async function fetchAircraft() {
      try {
        const res = await fetch(`${API_BASE}/aircrafts`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        const sortedData = data.sort(
          (a: Aircraft, b: Aircraft) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setAircraftList(sortedData);
      } catch (error) {
        console.error('Failed to fetch aircraft:', error);
        setAircraftList([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAircraft();
  }, []);

  function handleAddNew() {
    router.push('/aircraft/create');
  }

  function handleEdit(id: string) {
    router.push(`/aircraft/edit/${id}`);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this aircraft?')) return;

    try {
      const res = await fetch(`${API_BASE}/aircrafts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete aircraft');

      // Remove from list
      setAircraftList(prev => prev.filter(a => a.id !== id));

      // Show temporary success message
      setMessage({ text: 'Aircraft deleted successfully', type: 'success' });

      setTimeout(() => {
        setMessage(null);
      }, 1500); // 1.5 seconds
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Error deleting aircraft ❌', type: 'error' });
      setTimeout(() => {
        setMessage(null);
      }, 2000);
    }
  }


  return (
    <div className="bg-white p-6 shadow rounded-xl">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg sm:text-xl font-semibold text-[#004051] flex items-center space-x-2">
          <MdAirplanemodeActive className="text-base sm:text-xl" />
          <span className="sm:hidden">Aircraft</span>          {/* mobile */}
          <span className="hidden sm:inline">Registered Aircraft</span> {/* desktop */}
        </h2>

        <button
          onClick={handleAddNew}
          className="px-3 py-1 sm:px-4 sm:py-2 bg-[#004051] hover:bg-[#00363f] text-white font-semibold rounded-md transition text-sm sm:text-base"
        >
          <span className="sm:hidden">+ Add New</span>         {/* mobile */}
          <span className="hidden sm:inline">+ Add New Aircraft</span> {/* desktop */}
        </button>
      </div>

      {message && (
        <div
          className={`
            mb-4 px-4 py-3 rounded-lg text-base font-semibold text-white shadow-lg 
            transition-all duration-300 ease-in-out
            ${message.type === 'success' 
              ? 'bg-[#06b6d4]'  // your preferred success color
              : 'bg-red-600'}
          `}
        >
          {message.text}
        </div>
      )}
      {loading ? (
        <p className="text-gray-600">Loading aircraft...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center text-gray-700">#</TableHead>
                <TableHead className="text-gray-700">Name</TableHead>
                <TableHead className="text-gray-700">Type</TableHead>
                <TableHead className="text-gray-700">Registration #</TableHead>
                <TableHead className="text-gray-700">Manufacturer</TableHead>
                <TableHead className="text-gray-700">Year</TableHead>
                <TableHead className="text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aircraftList.length > 0 ? (
                aircraftList.map((aircraft, index) => (
                  <TableRow key={aircraft.id} className="text-gray-800">
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell>{aircraft.aircraftName}</TableCell>
                    <TableCell>{aircraft.aircraftType}</TableCell>
                    <TableCell>{aircraft.registrationNumber}</TableCell>
                    <TableCell>{aircraft.manufacturer}</TableCell>
                    <TableCell>{aircraft.year}</TableCell>
                    <TableCell className="flex gap-2">
                      <button
                        onClick={() => handleEdit(aircraft.id)}
                        className="px-4 py-1 bg-[#004051] hover:bg-[#006172] text-white rounded text-md"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(aircraft.id)}
                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-md"
                      >
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                    No aircraft found.
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
