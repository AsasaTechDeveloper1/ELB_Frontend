'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MdFlightTakeoff } from 'react-icons/md';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

interface Airport {
  id: string;
  code: string;
  name: string;
}

interface Flight {
  id: string;
  regn: string;
  fltNo: string;
  from: string;
  to: string;
  takeOffDate: string;
  landingDate: string;
  landings: string;
  offBlock: string;
  onBlock: string;
  prevHrs: string;
  takeOff: string;
  landing: string;
  flightTime: string;
  totalHrs: string;
  currentFlight: boolean;
}

interface Log {
  id: string;
  flightId: string;
  flightLeg: number;
}

export default function FlightListPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();

  // Fetch flights, airports, and logs
  useEffect(() => {
    async function fetchData() {
      try {
        const [flightsRes, airportsRes, logsRes] = await Promise.all([
          fetch(`${API_BASE}/flights`),
          fetch(`${API_BASE}/flights/airports/list`),
          fetch(`${API_BASE}/logs`),
        ]);

        if (!flightsRes.ok) throw new Error(`Failed to fetch flights: ${flightsRes.status}`);
        if (!airportsRes.ok) throw new Error(`Failed to fetch airports: ${airportsRes.status}`);
        if (!logsRes.ok) throw new Error(`Failed to fetch logs: ${logsRes.status}`);

        const flightsData = await flightsRes.json();
        const airportsData = await airportsRes.json();
        const logsData = await logsRes.json();

        setFlights(Array.isArray(flightsData) ? flightsData : []);
        setAirports(Array.isArray(airportsData) ? airportsData : []);
        setLogs(Array.isArray(logsData) ? logsData : []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setFlights([]);
        setAirports([]);
        setLogs([]);
        setMessage({ text: "Failed to load flights, airports, or logs ❌", type: "error" });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Get airport name by code
  const getAirportName = (code: string) => {
    const airport = airports.find((a) => a.code === code);
    return airport ? airport.name : code; // Fallback to code if name not found
  };

  // Delete handler with inline message
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this flight?")) return;

    try {
      const res = await fetch(`${API_BASE}/flights/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      setFlights((prev) => prev.filter((f) => f.id !== id));
      setLogs((prev) => prev.filter((l) => l.flightId !== id));
      setMessage({ text: 'Flight deleted successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 1500);
    } catch (err) {
      console.error("Delete failed:", err);
      setMessage({ text: 'Error deleting Flight', type: 'error' });
      setTimeout(() => setMessage(null), 2000);
    }
  }

  // Navigate to edit form
  function handleEdit(id: string) {
    router.push(`/flights/edit/${id}`);
  }

  // Make current flight handler
  async function handleMakeCurrent(id: string) {
    try {
      const res = await fetch(`${API_BASE}/flights/${id}/make-current`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error("Failed to set current flight");

      // Fetch updated logs to reflect new flightLeg values
      const logsRes = await fetch(`${API_BASE}/logs`);
      if (!logsRes.ok) throw new Error(`Failed to fetch logs: ${logsRes.status}`);
      const logsData = await logsRes.json();

      // Update flights and logs state
      setFlights((prev) =>
        prev.map((flight) =>
          flight.id === id
            ? { ...flight, currentFlight: true }
            : { ...flight, currentFlight: false }
        )
      );
      setLogs(Array.isArray(logsData) ? logsData : []);
      setMessage({ text: 'Flight set as current!', type: 'success' });
      setTimeout(() => setMessage(null), 1500);
    } catch (err) {
      console.error("Failed to set current flight:", err);
      setMessage({ text: 'Error setting current flight', type: 'error' });
      setTimeout(() => setMessage(null), 2000);
    }
  }

  // Get flightLeg for a flight
  const getFlightLeg = (flightId: string) => {
    const log = logs.find((l) => l.flightId === flightId);
    return log ? log.flightLeg : 'N/A';
  };

  function handleAddNew() {
    router.push('/flights/create');
  }

  return (
    <div className="bg-white p-6 shadow rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-[#004051] flex items-center gap-2">
          <MdFlightTakeoff className="text-base sm:text-xl" />
          <span className="sm:hidden">Flights</span>
          <span className="hidden sm:inline">Flights</span>
        </h2>

        <button
          onClick={handleAddNew}
          className="px-3 py-1 sm:px-4 sm:py-2 bg-[#004051] hover:bg-[#00363f] text-white font-semibold rounded-md transition text-sm sm:text-base flex items-center gap-1"
        >
          <MdFlightTakeoff className="text-sm sm:text-base" />
          <span className="sm:hidden">+ Add</span>
          <span className="hidden sm:inline">+ Add New Flight</span>
        </button>
      </div>

      {message && (
        <div
          className={`md:col-span-2 mb-4 px-4 py-3 rounded-lg text-base font-semibold text-white shadow-lg transition-all duration-300 ${
            message.type === 'success' ? 'bg-[#06b6d4]' : 'bg-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

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
                <TableHead className="text-gray-700">Flight Time</TableHead>
                <TableHead className="text-gray-700">Total Hrs</TableHead>
                <TableHead className="text-gray-700">Flight Leg</TableHead>
                <TableHead className="text-gray-700 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flights.length > 0 ? (
                flights.map((flight, index) => (
                  <TableRow key={flight.id} className="text-gray-800">
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell>{flight.regn}</TableCell>
                    <TableCell>{flight.fltNo}</TableCell>
                    <TableCell>
                      {getAirportName(flight.from)} → {getAirportName(flight.to)}
                    </TableCell>
                    <TableCell>{flight.flightTime}</TableCell>
                    <TableCell>{flight.totalHrs}</TableCell>
                    <TableCell>{getFlightLeg(flight.id)}</TableCell>
                    <TableCell className="flex gap-2 justify-center items-center">
                      {flight.currentFlight ? (
                        <span className="px-3 py-1 text-sm text-[#06b6d4] font-semibold bg-[#06b6d4]/10 border border-[#06b6d4] rounded-full">
                          Current Flight
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMakeCurrent(flight.id)}
                          className="px-3 py-1 text-sm bg-[#06b6d4] hover:bg-[#0891b2] text-white rounded-md"
                        >
                          Make Current
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(flight.id)}
                        className="px-3 py-1 text-sm bg-[#004051] hover:bg-[#006172] text-white rounded-md"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(flight.id)}
                        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md"
                      >
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={15} className="text-center text-gray-500 py-4">
                    No flights found.
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