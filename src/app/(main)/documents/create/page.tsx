'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FormElementsPage() {
  const router = useRouter();
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState(''); 

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload a file");
      return;
    }

    const formData = new FormData();
    formData.append("docName", docName);
    formData.append("docType", docType);
    formData.append("description", description);
    formData.append("file", file); 

    try { 
      // const res = await fetch("http://localhost:5000/document_create", {
      //   method: "POST",
      //   body: formData,
      // });

      const res = await fetch("https://elb-backend-r8x5.onrender.com/document_create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("✅ Upload Response:", data);

      if (res.ok) {
        alert("Document uploaded successfully!");
        // Redirect to index page (assuming it's `/documents`)
        router.push("/documents");
      } else {
        alert("Failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("❌ Upload failed:", error);
      alert("Failed to upload document");
    }
  };

  return (
    <div className="max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-[#004051] px-6 py-3 flex justify-between items-center">
        <h2 className="text-white text-base sm:text-lg md:text-lg font-semibold">
          📄 Document Upload Portal
        </h2>
        <button
          onClick={() => router.back()}
          type="button"
          className="text-white text-sm hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
        {/* Document Name */}
        <div className="col-span-1">
          <label htmlFor="docName" className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Document Name
          </label>
          <input
            id="docName"
            type="text"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            placeholder="e.g. Document ID"
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-[8px] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004051]"
            required
          />
        </div>

        {/* Document Type */}
        <div className="col-span-1">
          <label htmlFor="docType" className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Document Type
          </label>
          <select
            id="docType"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-[8px] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004051]"
            required
          >
            <option value="">Select Type</option>
            <option value="report">Report</option>
            <option value="invoice">Invoice</option>
            <option value="certificate">Certificate</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* File Upload with Drag & Drop */}
        <div className="col-span-1 md:col-span-2">
          <label className="text-[15px] font-semibold text-gray-700 mb-2 block">
            Upload File
          </label>

          <div
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile) setFile(droppedFile);
            }}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center w-full border-2 border-dashed border-[#004051] rounded-md p-6 text-center text-sm text-gray-500 bg-[#f9fbfb] hover:bg-[#f1f5f5] cursor-pointer transition"
            onClick={() => document.getElementById('fileUpload')?.click()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mb-2 text-[#004051]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16v-4a4 4 0 118 0v4m-4 4v-4" />
            </svg>
            <p className="text-[#004051] font-medium">Drag & drop file here or click to select</p>
            <p className="text-xs text-gray-400 mt-1">Supported: PDF, DOC, DOCX, JPG, PNG</p>
          </div>

          <input
            id="fileUpload"
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.png"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
              }
            }}
          />

          {file && (
            <p className="text-sm text-gray-600 mt-2">
              📎 <strong>Selected:</strong> {file.name}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="description" className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Description <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add additional information here..."
            rows={3}
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm resize-none placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004051]"
          />
        </div>
      </form>

      {/* Footer */}
      <div className="bg-gray-100 px-6 py-3 flex justify-end">
        <button
          type="submit"
          onClick={handleSubmit}
          className="bg-[#004051] hover:bg-[#00363f] text-white text-sm font-medium px-6 py-2 rounded-md transition"
        >
          Upload Document
        </button>
      </div>
    </div>
  );
}
