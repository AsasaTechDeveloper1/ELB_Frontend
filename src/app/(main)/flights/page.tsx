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

interface Flight {
  id: number;
  regn: string;
  flightNo: string;
  from: string;
  to: string;
  takeOffDate: string;
  flightTime: string;
}

export default function FlightListPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchFlights() {
      try {
        const res = await fetch('/api/flights');
        
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setFlights(data);
        } else {
          // Fallback dummy data
          setFlights([
            {
              id: 1,
              regn: 'AP-BGX',
              flightNo: 'PK301',
              from: 'Karachi',
              to: 'Lahore',
              takeOffDate: '2025-06-01',
              flightTime: '2h 15m',
            },
            {
              id: 2,
              regn: 'AP-XYZ',
              flightNo: 'PK302',
              from: 'Lahore',
              to: 'Islamabad',
              takeOffDate: '2025-06-03',
              flightTime: '1h 05m',
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch flights:', error);

        // Fallback dummy data on error
        setFlights([
          {
            id: 1,
            regn: 'AP-BGX',
            flightNo: 'PK301',
            from: 'Karachi',
            to: 'Lahore',
            takeOffDate: '2025-06-01',
            flightTime: '2h 15m',
          },
          {
            id: 2,
            regn: 'AP-XYZ',
            flightNo: 'PK302',
            from: 'Lahore',
            to: 'Islamabad',
            takeOffDate: '2025-06-03',
            flightTime: '1h 05m',
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchFlights();
  }, []);

  function handleAddNew() {
    router.push('/flights/create');
  }

  return (
    <>
      {/* <HeroAsside /> */}
      <div className="bg-white p-6 shadow rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">✈️ Previous Flights</h2>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-[#004051] hover:bg-[#006172] text-white font-medium rounded-md transition"
          >
            + Add New Flight
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading flights...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center text-gray-700">#</TableHead>
                  <TableHead className="text-gray-700">REGN</TableHead>
                  <TableHead className="text-gray-700">FLT No</TableHead>
                  <TableHead className="text-gray-700">From → To</TableHead>
                  <TableHead className="text-gray-700">Take Off Date</TableHead>
                  <TableHead className="text-gray-700">Flight Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flights.length > 0 ? (
                  flights.map((flight, index) => (
                    <TableRow key={flight.id} className="text-gray-800">
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell>{flight.regn}</TableCell>
                      <TableCell>{flight.flightNo}</TableCell>
                      <TableCell>{flight.from} → {flight.to}</TableCell>
                      <TableCell>{flight.takeOffDate}</TableCell>
                      <TableCell>{flight.flightTime}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                      No flights found.
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
