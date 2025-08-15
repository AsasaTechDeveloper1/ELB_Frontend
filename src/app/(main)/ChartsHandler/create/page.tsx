'use client';

import { useState, useRef } from 'react';

export default function DamageReportPage() {
  const tabImages = [
    { name: 'FUSELAGE - LH PROFILE', src: '/images/charts/1.png' },
    { name: 'FUSELAGE - RH PROFILE', src: '/images/charts/2.png' },
    { name: 'RH WING - UPPER SURFACE', src: '/images/charts/3.png' },
    { name: 'RH WING - LOWER SURFACE', src: '/images/charts/4.png' },
    { name: 'LH WING - UPPER SURFACE', src: '/images/charts/5.png' },
    { name: 'LH WING - LOWER SURFACE', src: '/images/charts/6.png' },
    { name: 'HORIZONTAL STABILISER - UPPER SURFACE', src: '/images/charts/7.png' },
    { name: 'HORIZONTAL STABILISER - LOWER SURFACE', src: '/images/charts/8.png' },
    { name: 'VERTICAL STABILISER - LEFT HAND SIDE', src: '/images/charts/9.png' },
    { name: 'VERTICAL STABILISER - RIGHT HAND SIDE', src: '/images/charts/10.png' },
    { name: 'PYLONS 1 AND 4 LH SHOWN, RH SIMILAR', src: '/images/charts/11.png' },
    { name: 'PYLONS 3 AND 4 LH SHOWN, RH SIMILAR', src: '/images/charts/12.png' },
    { name: 'ENG #1 NACELLE - LH SIDE', src: '/images/charts/13.png' },
    { name: 'ENG #1 NACELLE - RH SIDE', src: '/images/charts/14.png' },
    { name: 'ENG #2 NACELLE - LH SIDE', src: '/images/charts/15.png' },
    { name: 'ENG #2 NACELLE - RH SIDE', src: '/images/charts/16.png' },
    { name: 'ENG #3 NACELLE - LH SIDE', src: '/images/charts/17.png' },
    { name: 'ENG #3 NACELLE - RH SIDE', src: '/images/charts/18.png' },
    { name: 'ENG #4 NACELLE - LH SIDE', src: '/images/charts/19.png' },
    { name: 'ENG #4 NACELLE - RH SIDE', src: '/images/charts/20.png' }
  ];

  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [damageList, setDamageList] = useState<Array<{
    id: string;
    name?: string;
    status: string;
    date: string;
    location: string;
    description: string;
    file?: File | null;
    marker: { x: string; y: string };
    imageSrc: string;
  }>>([
    {
      id: 'DMG0005',
      name: 'Panel Crack',
      status: 'Active',
      date: '01/07/2020',
      location: '13fs',
      description: 'Door damage',
      marker: { x: '30%', y: '15%' },
      imageSrc: '/images/charts/1.png',
      file: null,
    },
    {
      id: 'DMG0004',
      name: 'Door Dent',
      status: 'Active',
      date: '01/07/2020',
      location: 'vvv',
      description: 'Door area Damage',
      marker: { x: '45%', y: '16%' },
      imageSrc: '/images/charts/1.png',
      file: null,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'view'>('add');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [newMarker, setNewMarker] = useState<{ x: string; y: string } | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState(tabImages[0].src);

  const selectedTab = tabImages.find((tab) => tab.src === selectedImage);
  const selectedTabName = selectedTab ? selectedTab.name : 'No Tab Selected';

  const openModal = (
      mode: 'add' | 'view',
      item: any = null,
      coords: { x: string; y: string } | null = null
    ) => {
    setModalMode(mode);
      if (mode === 'view' && item) {
        setName(item.name || '');
        setStatus(item.status);
        setLocation(item.location);
        setDescription(item.description);
        setFile(item.file || null);
        setNewMarker(item.marker || null);
      } else {
        setName('');
        setStatus('');
        setLocation('');
        setDescription('');
        setFile(null);

        // Fix: Add this line to give it a default marker if none is passed
        setNewMarker(coords || { x: '50%', y: '50%' }); // Default marker center of image
      }
    setShowModal(true);
  };

  const saveDamage = () => {
    if (!newMarker) return;

    const newItem = {
      id: `DMG${Math.floor(Math.random() * 10000)}`,
      name,
      status: status || 'Active',
      date: new Date().toLocaleDateString(),
      location,
      description,
      file,
      marker: newMarker,
      imageSrc: selectedImage,
    };

    setDamageList([...damageList, newItem]);
    setShowModal(false);
    setNewMarker(null);
    setName('');
    setStatus('');
    setLocation('');
    setDescription('');
    setFile(null);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    const container = imageRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const marker = { x: `${y.toFixed(2)}%`, y: `${x.toFixed(2)}%` };
    openModal('add', null, marker);
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Left Panel - Thumbnail Tabs */}
      <div className="w-1/6 bg-white p-2 space-y-2 border-r overflow-y-auto" style={{ maxHeight: '100vh' }}>
        {tabImages.map((tab) => {
          const isSelected = selectedImage === tab.src;
          return (
            <button
              key={tab.name}
              onClick={() => setSelectedImage(tab.src)}
              className={`w-full rounded flex flex-col items-center overflow-hidden cursor-pointer transition-all duration-300
                border border-[#004051]
                ${isSelected ? 'bg-[#004051] text-white' : 'bg-white text-gray-800'}
                hover:bg-[#004051] hover:text-white`}
            >
              <img
                src={tab.src}
                alt={tab.name}
                className="w-full h-32 object-cover rounded shadow"
              />
              <span className="text-xs font-semibold p-2 text-center">{tab.name}</span>
            </button>
          );
        })}
      </div>


      {/* Center Section */}
      <div className="w-full pl-2 flex flex-col">
        {/* Header with Add New */}
         <h2 className="font-semibold mb-2 text-gray-800 bg-[#004051] rounded p-2 text-white">{selectedTabName}</h2>

        {/* Image Viewer */}
        <div
          ref={imageRef}
          onClick={handleImageClick}
          className="flex-1 border rounded overflow-hidden bg-white relative cursor-crosshair"
        >
          <img
            src={selectedImage}
            alt="Aircraft"
            className="w-full h-full object-contain"
          />
          {damageList
            .filter((item) => item.imageSrc === selectedImage)
            .map((item, index) => (
              item.marker && (
                <div
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal('view', item);
                  }}
                  className="absolute w-3 h-3 bg-red-600 rounded-full cursor-pointer"
                  style={{ top: item.marker.x, left: item.marker.y }}
                  title="Click to view damage"
                ></div>
              )
            ))}
        </div>

        {/* Table */}
        <div className="mt-4 bg-white border rounded p-4 overflow-auto max-h-60 shadow">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-semibold text-gray-800">Damage Records</h3>
            <button
              onClick={() => openModal('add', null, null)}
              className="bg-[#004051] text-white px-3 py-1 text-sm rounded hover:bg-[#006172]"
            >
              + Add New
            </button>
          </div>

          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-[#004051] text-white">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Item</th>
                <th className="px-3 py-2 text-left font-semibold">Name</th>
                <th className="px-3 py-2 text-left font-semibold">Status</th>
                <th className="px-3 py-2 text-left font-semibold">Raised</th>
                <th className="px-3 py-2 text-left font-semibold">Location</th>
                <th className="px-3 py-2 text-left font-semibold">Description</th>
                <th className="px-3 py-2 text-left font-semibold">File</th>
                <th className="px-3 py-2 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 bg-gray-100 text-gray-800">
              {damageList.filter((item) => item.imageSrc === selectedImage).length > 0 ? (
                damageList
                  .filter((item) => item.imageSrc === selectedImage)
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">{item.id}</td>
                      <td className="px-3 py-2">{item.name || '-'}</td>
                      <td className="px-3 py-2">{item.status}</td>
                      <td className="px-3 py-2">{item.date}</td>
                      <td className="px-3 py-2">{item.location}</td>
                      <td className="px-3 py-2">{item.description}</td>
                      <td className="px-3 py-2">
                        {item.file?.name ? (
                          <span className="text-blue-600 underline">{item.file.name}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => openModal('view', item)}
                          className="bg-[#004051] text-white px-3 py-1 text-xs rounded hover:bg-[#006172]"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 py-4">
                    No record found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-[700px] p-0 overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-[#004051] text-white px-6 py-2">
              <h3 className="text-lg font-semibold">
                {modalMode === 'view' ? 'Damage Detail' : 'Record Damage'}
              </h3>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">

              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={modalMode === 'view'}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    placeholder="e.g. Door Crack"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={modalMode === 'view'}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    placeholder="e.g. 13fs"
                  />
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="block text-sm font-medium">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={modalMode === 'view'}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="">Select status</option>
                    <option value="Critical">Critical</option>
                    <option value="Major">Major</option>
                    <option value="Minor">Minor</option>
                    <option value="General">General</option>
                    <option value="Void">Void</option>
                  </select>
                </div>

                {/* File Upload */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Upload File</label>
                  <div
                    onDrop={(e) => {
                      e.preventDefault();
                      const droppedFile = e.dataTransfer.files[0];
                      if (droppedFile) setFile(droppedFile);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex flex-col items-center justify-center w-full border-2 border-dashed border-[#004051] rounded-md p-4 text-center text-sm text-gray-500 bg-[#f9fbfb] hover:bg-[#f1f5f5] cursor-pointer transition"
                    onClick={() => document.getElementById('fileUpload')?.click()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2 text-[#004051]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16v-4a4 4 0 118 0v4m-4 4v-4" />
                    </svg>
                    <p className="text-[#004051] font-medium">Drag & drop or click to select</p>
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
                      <strong>Selected:</strong> {file.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={modalMode === 'view'}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setNewMarker(null);
                  }}
                  className="px-4 py-1 text-sm bg-gray-300 hover:bg-gray-400 rounded"
                >
                  Close
                </button>
                {modalMode === 'add' && (
                  <button
                    onClick={saveDamage}
                    className="px-4 py-1 text-sm bg-[#004051] text-white hover:bg-[#006172] rounded"
                  >
                    Save
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
