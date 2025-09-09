'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdAssignment } from 'react-icons/md'; // icon for logs
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Log {
  id: string;
  logPageNo: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function LogListPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();
  
  // 🔹 Fetch logs
  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch(`${API_BASE}/logs`);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
        setLogs([]);
        setMessage({ text: "Failed to load logs ❌", type: "error" });
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, []);

  function formatDate(date: string | { _seconds: number; _nanoseconds: number }): string {
    if (!date) return "-";
    if (typeof date === "string") return new Date(date).toLocaleString();
    return new Date(date._seconds * 1000).toLocaleString();
  }

  // 🔹 Delete handler
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this log?")) return;

    try {
      const res = await fetch(`${API_BASE}/logs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      setLogs(prev => prev.filter(l => l.id !== id));
      setMessage({ text: 'Log deleted successfully!', type: 'success' });

      setTimeout(() => setMessage(null), 1500);
    } catch (err) {
      console.error("Delete failed:", err);
      setMessage({ text: 'Error deleting log', type: 'error' });
      setTimeout(() => setMessage(null), 2000);
    }
  }

  // 🔹 Navigate to edit form
  function handleEdit(id: string) {
    router.push(`/logs/edit/${id}`);
  }

  function handleAddNew() {
    router.push('/logs/create');
  }

  return (
    <div className="bg-white p-6 shadow rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-[#004051] flex items-center gap-2">
          <MdAssignment className="text-base sm:text-xl" />
          <span className="sm:hidden">Logs</span>        
          <span className="hidden sm:inline">Previous Logs</span> 
        </h2>

        <button
          onClick={handleAddNew}
          className="px-3 py-1 sm:px-4 sm:py-2 bg-[#004051] hover:bg-[#00363f] text-white font-semibold rounded-md transition text-sm sm:text-base flex items-center gap-1"
        >
          <MdAssignment className="text-sm sm:text-base" /> 
          <span className="sm:hidden">+ Add</span>            
          <span className="hidden sm:inline">+ Add New Log</span> 
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
        <p className="text-gray-600">Loading logs...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center text-gray-700">#</TableHead>
                <TableHead className="text-gray-700">Log Page No</TableHead>
                <TableHead className="text-gray-700">Status</TableHead>
                <TableHead className="text-gray-700">Created At</TableHead>
                <TableHead className="text-gray-700">Updated At</TableHead>
                <TableHead className="text-gray-700 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <TableRow key={log.id} className="text-gray-800">
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell>{log.logPageNo}</TableCell>
                    <TableCell>{log.status === 1 ? "Active" : "Inactive"}</TableCell>
                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                    <TableCell>{formatDate(log.updatedAt)}</TableCell>

                    <TableCell className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(log.id)}
                        className="px-3 py-1 text-sm bg-[#004051] hover:bg-[#006172] text-white rounded-md"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md"
                      >
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                    No logs found.
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
