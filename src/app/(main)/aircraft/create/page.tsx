'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddAircraftForm() {
  const router = useRouter();

  const [aircraftName, setAircraftName] = useState('');
  const [aircraftType, setAircraftType] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [year, setYear] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    } else {
      setImage(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      aircraftName,
      aircraftType,
      registrationNumber,
      manufacturer,
      year,
      image,
      description,
    });
  };

  return (
    <div className="max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-[#004051] px-6 py-3 flex justify-between items-center">
        <h2 className="text-white text-lg font-semibold">✈️ Add New Aircraft</h2>
        <button
          onClick={() => router.back()}
          type="button"
          className="text-white text-sm hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
        {/* Fields */}
        <div>
          <label htmlFor="aircraftName" className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Aircraft Name
          </label>
          <input
            id="aircraftName"
            type="text"
            value={aircraftName}
            onChange={(e) => setAircraftName(e.target.value)}
            placeholder="Enter aircraft name"
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004051]"
            required
          />
        </div>

        <div>
          <label htmlFor="aircraftType" className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Aircraft Type
          </label>
          <input
            id="aircraftType"
            type="text"
            value={aircraftType}
            onChange={(e) => setAircraftType(e.target.value)}
            placeholder="e.g. Jet, Helicopter, Glider"
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004051]"
            required
          />
        </div>

        <div>
          <label htmlFor="registrationNumber" className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Registration Number
          </label>
          <input
            id="registrationNumber"
            type="text"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            placeholder="Enter registration number"
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004051]"
            required
          />
        </div>

        <div>
          <label htmlFor="manufacturer" className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Manufacturer
          </label>
          <input
            id="manufacturer"
            type="text"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            placeholder="e.g. Boeing, Airbus"
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004051]"
            required
          />
        </div>

        <div>
          <label htmlFor="year" className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Year of Manufacture
          </label>
          <input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g. 2015"
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004051]"
            required
          />
        </div>

        {/* Image Upload with Drag & Drop */}
        <div className="md:col-span-2">
          <label className="text-[15px] font-semibold text-gray-700 mb-2 block">
            Upload Aircraft Image
          </label>

          <div
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile && droppedFile.type.startsWith('image/')) {
                setImage(droppedFile);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center w-full border-2 border-dashed border-[#004051] rounded-md p-6 text-center text-sm text-gray-500 bg-[#f9fbfb] hover:bg-[#f1f5f5] cursor-pointer transition"
            onClick={() => document.getElementById('aircraftImage')?.click()}
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
            <p className="text-[#004051] font-medium">Drag & drop image here or click to select</p>
            <p className="text-xs text-gray-400 mt-1">Supported: JPG, PNG</p>
          </div>

          <input
            id="aircraftImage"
            type="file"
            accept=".jpg,.jpeg,.png"
            className="hidden"
            onChange={handleImageChange}
          />

          {image && (
            <p className="text-sm text-gray-600 mt-2">
              📎 <strong>Selected:</strong> {image.name}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="text-[15px] font-semibold text-gray-700 mb-1 block">
            Notes / Description <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any extra details about the aircraft"
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
          Save Aircraft
        </button>
      </div>
    </div>
  );
}
