'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DocumentType {
  id: string;
  docName: string;
  docType: string;
  description: string;
  fileName: string;
  filePath: string;
  fileSize: number;
}

export default function FormElementsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [activeDoc, setActiveDoc] = useState<DocumentType | null>(null);

  // Fetch documents from backend
  useEffect(() => { 
    const fetchDocs = async () => {
      try {
        // const res = await fetch("http://localhost:5000/document_create");
        const res = await fetch("https://elb-backend-r8x5.onrender.com/document_create");
        const data = await res.json();
        setDocuments(data);
        if (data.length > 0) {
          setActiveDoc(data[0]); // first document default
        }
      } catch (error) {
        console.error("❌ Failed to fetch documents:", error);
      }
    };
    fetchDocs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-[#004051]">
          📄 Uploaded Documents
        </h2>
        <button
          onClick={() => router.push('/documents/create')}
          className="px-4 py-2 bg-[#004051] hover:bg-[#00363f] text-white font-semibold rounded-md transition"
        >
          + Add New Document
        </button>
      </div>

      {/* Notes */}
      <div className="bg-[#f0fafa] border border-[#004051] rounded-lg p-3 shadow-sm">
        <h3 className="text-sm font-semibold text-[#004051] mb-1">📌 Notes:</h3>
        <p className="text-xs text-gray-800 leading-snug">
          The documents are uploaded and stored. Select a document from the list to view details.
        </p>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar list */}
        <div className="col-span-12 md:col-span-3">
          <ul className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible whitespace-nowrap scrollbar-hide px-1">
            {documents.map((doc) => (
              <li
                key={doc.id}
                onClick={() => setActiveDoc(doc)}
                className={`
                  cursor-pointer px-4 py-2 rounded-md transition 
                  text-md sm:text-base
                  flex-shrink-0 text-center md:text-left 
                  ${activeDoc?.id === doc.id
                    ? 'bg-[#004051] text-white shadow-md'
                    : 'bg-white hover:bg-[#e6f5f5] text-black'}
                `}
              >
                {doc.docName}
              </li>
            ))}
          </ul>
        </div>
        

        {/* Content Area */}
          {activeDoc ? (
            <div className="col-span-12 md:col-span-9">
              <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  {/* Left: Doc name */}
                  <h2 className="text-lg font-semibold text-[#004051]">
                    {activeDoc.docName}
                  </h2>

                  {/* Right: Delete button */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete "${activeDoc.docName}"?`)) {
                        try {
                          const res = await fetch(`https://elb-backend-r8x5.onrender.com/document_create/${activeDoc.id}`, {
                            method: "DELETE",
                          });
                          const data = await res.json();
                          console.log("✅ Deleted:", data);

                          setDocuments((prev) => prev.filter((d) => d.id !== activeDoc.id));
                          setActiveDoc(null);
                        } catch (err) {
                          console.error("❌ Delete failed:", err);
                        }
                      }
                    }}
                    className="ml-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-md"
                  >
                    Delete
                  </button>
                </div>

                <p><strong>Type:</strong> {activeDoc.docType}</p>
                <p><strong>Description:</strong> {activeDoc.description}</p>
                <p><strong>File:</strong> {activeDoc.fileName}</p>
                <p><strong>Size:</strong> {Math.round(activeDoc.fileSize / 1024)} KB</p>

                {/* File Preview */}
                <div className="mt-4 border rounded p-2 bg-gray-50">
                  {/\.(jpg|jpeg|png|gif|webp)$/i.test(activeDoc.fileName) ? (
                    // Images
                    <img
                      src={`https://elb-backend-r8x5.onrender.com${activeDoc.filePath}`}
                      alt={activeDoc.docName}
                      className="max-w-full h-auto rounded shadow"
                    />
                  ) : activeDoc.fileName.toLowerCase().endsWith(".pdf") ? (
                    // PDF
                    <iframe
                      src={`https://elb-backend-r8x5.onrender.com${activeDoc.filePath}`}
                      className="w-full h-[500px] border rounded"
                    ></iframe>
                  ) : /\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(activeDoc.fileName) ? (
                    // Word, Excel, PowerPoint via Google Docs Viewer
                    <iframe
                      src={`https://docs.google.com/gview?url=https://elb-backend-r8x5.onrender.com${activeDoc.filePath}&embedded=true`}
                      className="w-full h-[500px] border rounded"
                    ></iframe>
                  ) : activeDoc.fileName.toLowerCase().endsWith(".txt") ? (
                    // Text files
                    <iframe
                      src={`https://elb-backend-r8x5.onrender.com${activeDoc.filePath}`}
                      className="w-full h-[500px] border rounded bg-white"
                    ></iframe>
                  ) : (
                    // Fallback (Download link for unsupported formats)
                    <div className="text-center p-4">
                      <p className="mb-2">Preview not available for this file type.</p>
                      <a
                        href={`https://elb-backend-r8x5.onrender.com${activeDoc.filePath}`}
                        download
                        className="text-blue-600 underline"
                      >
                        Download {activeDoc.docName}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="col-span-12 md:col-span-12">
              <p className='text-center'>No documents found.</p>
            </div>
          )}
      </div>
    </div>
  );
}
