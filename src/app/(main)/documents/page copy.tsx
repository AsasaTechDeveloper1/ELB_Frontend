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
import HeroAsside from '../(home)/_components/overview-cards/heroasside';

interface Document {
  id: number;
  title: string;
  uploadedBy: string;
  aircraft: string;
  dateUploaded: string;
}

export default function FormElementsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch('/api/documents');
        const data = await res.json();
        setDocuments(data);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, []);

  function handleAddNew() {
    router.push('/documents/create');
  }

  return (
    <>
      {/* <HeroAsside /> */}
      <div className="bg-red-100 border border-red-600 text-red-800 text-sm font-medium px-4 py-3 rounded mb-6">
        ⚠️ <strong>NOTES:</strong> The docx placed in this folder is customer’s preference and not limited to above mentioned and reduces the workload of flight ops in placing docx on the aircraft whereby they can simply be uploaded to the aircraft irrespective (as decided by the customer).
      </div>

      <div className="bg-white p-6 shadow rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">📄 Uploaded Documents</h2>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
          >
            + Add New Document
          </button>
        </div>

        {loading ? (
          <p>Loading documents...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead>Document Name</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date Uploaded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <TableRow key={doc.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{doc.title}</TableCell>
                    <TableCell>{doc.uploadedBy}</TableCell>
                    <TableCell>{doc.aircraft}</TableCell>
                    <TableCell>{doc.dateUploaded}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No documents found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
}
