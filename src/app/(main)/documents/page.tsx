'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DocumentType {
  id: string;
  docName: string;
  docType: string;
  description: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
}

// Centralized API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function FormElementsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [activeDoc, setActiveDoc] = useState<DocumentType | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Loader state

  useEffect(() => { 
    const fetchDocs = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/document_create`);
        const data = await res.json();
        console.log("Fetched docs:", data);
        setDocuments(data);
        if (data.length > 0) setActiveDoc(data[0]);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const handleDelete = async (doc: DocumentType) => {
    if (!confirm(`Are you sure you want to delete "${doc.docName}"?`)) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/document_create/${doc.id}`, { method: "DELETE" });
      const data = await res.json();
      console.log("Deleted:", data);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      setActiveDoc(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete document.");
    } finally {
      setIsLoading(false);
    }
  };

  const getFileUrl = (filePath: string) => `${API_BASE}${filePath}`;

  return (
    <>
      {/* Full-Screen Loader */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-4 border-[#004051] border-opacity-50 rounded-full animate-spin border-t-[#06b6d4]"></div>
            <p className="mt-4 text-white text-lg font-semibold">Loading...</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg sm:text-xl font-semibold text-[#004051]">
            <span className="sm:hidden">Uploaded Docs</span>
            <span className="hidden sm:inline">Uploaded Documents</span>
          </h2>

          <button 
            onClick={() => router.push('/documents/create')}
            className="px-3 py-1 sm:px-4 sm:py-2 bg-[#004051] hover:bg-[#00363f] text-white font-semibold rounded-md transition text-sm sm:text-base"
          >
            <span className="sm:hidden">+ Add New</span>
            <span className="hidden sm:inline">+ Add New Document</span>
          </button>
        </div>

        {/* Notes */}
        <div className="bg-[#f0fafa] border border-[#004051] rounded-lg p-3 shadow-sm">
          <h3 className="text-sm font-semibold text-[#004051] mb-1">Notes:</h3>
          <p className="text-xs text-gray-800 leading-snug">
            The documents are uploaded and stored. Select a document from the list to view details.
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar list */}
          <div className="col-span-12 md:col-span-3">
            <ul className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible whitespace-nowrap scrollbar-hide px-1">
              {documents.length === 0 && !isLoading ? (
                <li className="text-gray-500 italic px-4 py-2">No documents</li>
              ) : (
                documents.map((doc) => (
                  <li
                    key={doc.id}
                    onClick={() => setActiveDoc(doc)}
                    className={`cursor-pointer px-4 py-2 rounded-md transition text-md sm:text-base flex-shrink-0 text-center md:text-left ${
                      activeDoc?.id === doc.id
                        ? 'bg-[#004051] text-white shadow-md'
                        : 'bg-white hover:bg-[#e6f5f5] text-black'
                    }`}
                  >
                    {doc.docName}
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Content Area */}
          {activeDoc ? ( 
            <div className="col-span-12 md:col-span-9"> 
              <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#004051]">{activeDoc.docName}</h2>
                  <button
                    onClick={() => handleDelete(activeDoc)}
                    disabled={isLoading}
                    className="ml-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-md disabled:opacity-50"
                  >
                    {isLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>

                <p><strong>Type:</strong> {activeDoc.docType}</p>
                <p><strong>Description:</strong> {activeDoc.description}</p>
                <p><strong>File:</strong> {activeDoc.fileName}</p>
                <p><strong>Size:</strong> {Math.round(activeDoc.fileSize / 1024)} KB</p>

                {/* File Preview */}
                <div className="mt-4 border rounded p-2 bg-gray-50">
                  {/\.(jpg|jpeg|png|gif|webp)$/i.test(activeDoc.fileName) ? (
                    <img src={activeDoc.fileUrl} alt={activeDoc.docName} className="max-w-full h-auto rounded shadow" />
                  ) : activeDoc.fileName.toLowerCase().endsWith(".pdf") ? (
                    <iframe src={activeDoc.fileUrl} className="w-full h-[500px] border rounded"></iframe>
                  ) : /\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(activeDoc.fileName) ? (
                    <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(activeDoc.fileUrl)}&embedded=true`} className="w-full h-[500px] border rounded"></iframe>
                  ) : activeDoc.fileName.toLowerCase().endsWith(".txt") ? (
                    <iframe src={activeDoc.fileUrl} className="w-full h-[500px] border rounded bg-white"></iframe>
                  ) : (
                    <div className="text-center p-4">
                      <p className="mb-2">Preview not available for this file type.</p>
                      <a href={activeDoc.fileUrl} download className="text-blue-600 underline">
                        Download {activeDoc.docName}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : ( 
            <div className="col-span-12 md:col-span-12">
              <p className='text-center text-gray-500'>
                {documents.length === 0 ? 'No documents found.' : 'Select a document to view details.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}