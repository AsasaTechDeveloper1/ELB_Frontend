'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MdAirplanemodeActive } from 'react-icons/md'; // import aircraft icon

// Centralized API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export default function EditAircraftForm() {
  const router = useRouter();
  const { id } = useParams(); // Aircraft ID from URL

  const [aircraftName, setAircraftName] = useState('');
  const [aircraftType, setAircraftType] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [year, setYear] = useState('');
  const [openingFlightHours, setOpeningFlightHours] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch aircraft details
  useEffect(() => {
    async function fetchAircraft() {
      try {
        if (!id) return;

        const res = await fetch(`${API_BASE}/aircrafts/${id}`);
        if (!res.ok) throw new Error('Failed to fetch aircraft');

        const data = await res.json();
        setAircraftName(data.aircraftName || '');
        setAircraftType(data.aircraftType || '');
        setRegistrationNumber(data.registrationNumber || '');
        setManufacturer(data.manufacturer || '');
        setYear(data.year || '');
        setOpeningFlightHours(data.openingFlightHours ? data.openingFlightHours.toString() : '');
        setDescription(data.description || '');
        setExistingImageUrl(data.imageUrl || '');
      } catch (err) {
        console.error(err);
        setMessage({ text: 'Failed to load aircraft data', type: 'error' });
        setTimeout(() => router.back(), 1500);
      } finally {
        setLoading(false);
      }
    }

    fetchAircraft();
  }, [id, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setMessage(null);

    if (!aircraftName || !aircraftType || !registrationNumber || !manufacturer || !year || !openingFlightHours) {
      setMessage({ text: 'Please fill all required fields.', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('aircraftName', aircraftName);
    formData.append('aircraftType', aircraftType);
    formData.append('registrationNumber', registrationNumber);
    formData.append('manufacturer', manufacturer);
    formData.append('year', year);
    formData.append('openingFlightHours', openingFlightHours);
    formData.append('description', description);
    if (image) formData.append('image', image);

    try {
      const res = await fetch(`${API_BASE}/aircrafts/${id}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ text: 'Aircraft updated successfully!', type: 'success' });
        setTimeout(() => router.push('/aircraft'), 1500);
      } else {
        setMessage({ text: data.error || 'Failed to update aircraft', type: 'error' });
      }
    } catch (err) {
      console.error('❌ Update failed:', err);
      setMessage({ text: 'Failed to update aircraft', type: 'error' });
    }
  };

  const getInputClass = (value: string) =>
    `w-full border rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${
      submitted && !value ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-[#004051]'
    }`;

  if (loading) return <p className="p-4 text-gray-600">Loading aircraft details...</p>;

  return (
    <div className="max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-[#004051] px-6 py-3 flex justify-between items-center">
        <h2 className="text-white text-lg font-semibold flex items-center space-x-2">
          <MdAirplanemodeActive className="text-xl" />
          <span>Edit Aircraft</span>
        </h2>
        <button onClick={() => router.back()} type="button" className="text-white text-sm hover:underline">
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {message && (
          <div
            className={`md:col-span-2 mb-4 px-4 py-3 rounded-lg text-base font-semibold text-white shadow-lg transition-all duration-300 ease-in-out ${
              message.type === 'success' ? 'bg-[#06b6d4]' : 'bg-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Fields */}
        <div>
          <label className="text-[15px] font-semibold text-gray-700 mb-1 block">Aircraft Name</label>
          <input
            type="text"
            value={aircraftName}
            onChange={(e) => setAircraftName(e.target.value)}
            className={getInputClass(aircraftName)}
            required
          />
        </div>
        <div>
          <label className="text-[15px] font-semibold text-gray-700 mb-1 block">Aircraft Type</label>
          <input
            type="text"
            value={aircraftType}
            onChange={(e) => setAircraftType(e.target.value)}
            className={getInputClass(aircraftType)}
            required
          />
        </div>
        <div>
          <label className="text-[15px] font-semibold text-gray-700 mb-1 block">Registration Number</label>
          <input
            type="text"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            className={getInputClass(registrationNumber)}
            required
          />
        </div>
        <div>
          <label className="text-[15px] font-semibold text-gray-700 mb-1 block">Manufacturer</label>
          <input
            type="text"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            className={getInputClass(manufacturer)}
            required
          />
        </div>
        <div>
          <label className="text-[15px] font-semibold text-gray-700 mb-1 block">Year of Manufacture</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={getInputClass(year)}
            required
          />
        </div>
        <div>
          <label className="text-[15px] font-semibold text-gray-700 mb-1 block">Opening Flight Hours</label>
          <input
            type="number"
            value={openingFlightHours}
            onChange={(e) => setOpeningFlightHours(e.target.value)}
            className={getInputClass(openingFlightHours)}
            required
          />
        </div>

        {/* Drag & Drop Image Upload */}
        <div className="md:col-span-2">
          <label className="text-[15px] font-semibold text-gray-700 mb-2 block">Upload Aircraft Image</label>
          <div
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile && droppedFile.type.startsWith('image/')) setImage(droppedFile);
            }}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center w-full border-2 border-dashed border-[#004051] rounded-md p-6 text-center text-sm text-gray-500 bg-[#f9fbfb] hover:bg-[#f1f5f5] cursor-pointer transition"
            onClick={() => document.getElementById('aircraftImage')?.click()}
          >
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
          {image && <p className="text-sm text-gray-600 mt-2">📎 <strong>Selected:</strong> {image.name}</p>}
          {!image && existingImageUrl && (
            <img src={`${API_BASE}${existingImageUrl}`} alt="Aircraft" className="h-16 mt-2 rounded-md" />
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="text-[15px] font-semibold text-gray-700 mb-1 block">Notes / Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004051]"
          />
        </div>
      </form>

      <div className="bg-gray-100 px-6 py-3 flex justify-end">
        <button
          type="submit"
          onClick={handleSubmit}
          className="bg-[#004051] hover:bg-[#00363f] text-white px-6 py-2 rounded-md"
        >
          Update Aircraft
        </button>
      </div>
    </div>
  );
}
