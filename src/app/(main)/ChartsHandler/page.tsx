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

interface Document {
  id: number;
  title: string;
  status: string;
  description: string;
  dateUploaded: string;
}

export default function FormElementsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Sample data for display
    const sampleData: Document[] = [
      {
        id: 1,
        title: 'Engine Maintenance Chart',
        status: 'Active',
        description: 'Detailed inspection of engine components.',
        dateUploaded: '2024-06-15',
      },
      {
        id: 2,
        title: 'Wing Damage Analysis',
        status: 'Pending',
        description: 'Visual report on minor wing scratches.',
        dateUploaded: '2024-06-18',
      },
    ];
    setDocuments(sampleData);
    setLoading(false);
  }, []);

  function handleAddNew() {
    router.push('/ChartsHandler/create');
  }

  return (
    <div className="bg-white p-6 shadow rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Chart List</h2>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-[#004051] hover:bg-[#006172] text-white font-medium rounded-md transition"
        >
          + Add New
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading charts...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center text-gray-700">#</TableHead>
                <TableHead className="text-gray-700">Title</TableHead>
                <TableHead className="text-gray-700">Status</TableHead>
                <TableHead className="text-gray-700">Description</TableHead>
                <TableHead className="text-gray-700">Date Uploaded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <TableRow key={doc.id} className="text-gray-800">
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell>{doc.title}</TableCell>
                    <TableCell>{doc.status}</TableCell>
                    <TableCell>{doc.description}</TableCell>
                    <TableCell>{doc.dateUploaded}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                    No records found.
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
