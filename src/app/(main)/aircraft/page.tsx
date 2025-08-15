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
// import HeroAsside from '../(home)/_components/overview-cards/heroasside';

interface Aircraft {
  id: number;
  name: string;
  type: string;
  registrationNumber: string;
  manufacturer: string;
  year: number;
  dateAdded: string;
}

export default function AircraftListPage() {
  const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchAircraft() {
      try {
        const res = await fetch('/api/aircraft');

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setAircraftList(data);
        } else {
          // Fallback dummy data
          setAircraftList([
            {
              id: 1,
              name: "Falcon 9",
              type: "Jet",
              registrationNumber: "AP-FX1",
              manufacturer: "SpaceX",
              year: 2020,
              dateAdded: "2025-06-01",
            },
            {
              id: 2,
              name: "Cessna 172",
              type: "Propeller",
              registrationNumber: "AP-CN2",
              manufacturer: "Cessna",
              year: 2018,
              dateAdded: "2025-06-10",
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch aircraft:', error);

        // Fallback dummy data on error
        setAircraftList([
          {
            id: 1,
            name: "Falcon 9",
            type: "Jet",
            registrationNumber: "AP-FX1",
            manufacturer: "SpaceX",
            year: 2020,
            dateAdded: "2025-06-01",
          },
          {
            id: 2,
            name: "Cessna 172",
            type: "Propeller",
            registrationNumber: "AP-CN2",
            manufacturer: "Cessna",
            year: 2018,
            dateAdded: "2025-06-10",
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchAircraft();
  }, []);

  function handleAddNew() {
    router.push('/aircraft/create');
  }

  return (
    <>
      {/* <HeroAsside /> */}
      <div className="bg-white p-6 shadow rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">🛫 Registered Aircraft</h2>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-[#004051] hover:bg-[#006172] text-white font-medium rounded-md transition"
          >
            + Add New Aircraft
          </button>
        </div>

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
                  <TableHead className="text-gray-700">Date Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aircraftList.length > 0 ? (
                  aircraftList.map((aircraft, index) => (
                    <TableRow key={aircraft.id} className="text-gray-800">
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell>{aircraft.name}</TableCell>
                      <TableCell>{aircraft.type}</TableCell>
                      <TableCell>{aircraft.registrationNumber}</TableCell>
                      <TableCell>{aircraft.manufacturer}</TableCell>
                      <TableCell>{aircraft.year}</TableCell>
                      <TableCell>{aircraft.dateAdded}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-4">
                      No aircraft found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
