'use client';

import { useState, useRef, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

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
  { name: 'ENG-#2 NACELLE - LH SIDE', src: '/images/charts/15.png' },
  { name: 'ENG-#2 NACELLE - RH SIDE', src: '/images/charts/16.png' },
  { name: 'ENG-#3 NACELLE - LH SIDE', src: '/images/charts/17.png' },
  { name: 'ENG-#3 NACELLE - RH SIDE', src: '/images/charts/18.png' },
  { name: 'ENG-#4 NACELLE - LH SIDE', src: '/images/charts/19.png' },
  { name: 'ENG-#4 NACELLE - RH SIDE', src: '/images/charts/20.png' }
];

interface Damage {
  firebaseId?: string;
  id: string;
  name?: string;
  status: string;
  date: string;
  location: string;
  description: string;
  fileNames?: string[];
  fileUrls?: string[];
  marker: { x: string; y: string };
  imageSrc: string;
}

export default function DamageReportPage() {
  const [selectedImage, setSelectedImage] = useState(tabImages[0].src);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'view'>('view');
  const imageRef = useRef<HTMLDivElement>(null);
  const [selectedDamageId, setSelectedDamageId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [newMarker, setNewMarker] = useState<{ x: string; y: string } | null>(null);

  const [damageList, setDamageList] = useState<Damage[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Loader state

  // Fetch damages with loader
  useEffect(() => {
    const fetchDamages = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/damages`);
        if (res.ok) {
          const data: Damage[] = await res.json();
          setDamageList(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDamages();
  }, []);

  const selectedTabName = tabImages.find(t => t.src === selectedImage)?.name ?? '';

  // Open modal
  const openModal = (
    mode: 'add' | 'view',
    item?: Damage,
    coords?: { x: string; y: string }
  ) => {
    setModalMode(mode);
    if (mode === 'view' && item) {
      setName(item.name ?? '');
      setStatus(item.status);
      setLocation(item.location);
      setDescription(item.description);
      setFiles([]);
      setNewMarker(item.marker);
      setSelectedDamageId(item.id);
      setSelectedImage(item.imageSrc);
    } else {
      setName('');
      setStatus('');
      setLocation('');
      setDescription('');
      setFiles([]);
      setNewMarker(coords ?? { x: '50%', y: '50%' });
    }
    setShowModal(true);
  };

  // Save damage with loader
  const saveDamage = async () => {
    if (!newMarker) return;

    setIsLoading(true); // Show loader

    const form = new FormData();
    form.append('name', name);
    form.append('status', status || 'Active');
    form.append('location', location);
    form.append('description', description);
    form.append('marker', JSON.stringify(newMarker));
    form.append('imageSrc', selectedImage);

    files.forEach(file => {
      form.append('files', file);
    });

    try {
      const res = await fetch(`${API_BASE}/damages`, {
        method: 'POST',
        body: form,
      });

      if (res.ok) {
        const fresh = await fetch(`${API_BASE}/damages`).then(r => r.json());
        setDamageList(fresh);
        setShowModal(false);
        setNewMarker(null);
        setFiles([]);
        setName('');
        setStatus('');
        setLocation('');
        setDescription('');
      } else {
        const err = await res.text();
        alert('Save failed: ' + err);
      }
    } catch (e) {
      alert('Network error');
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = imageRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const marker = { x: `${y.toFixed(2)}%`, y: `${x.toFixed(2)}%` };
    openModal('add', undefined, marker);
  };

  const handleRowClick = (item: Damage) => {
    setSelectedImage(item.imageSrc);
    setSelectedDamageId(item.id);
    openModal('view', item);
  };

  // Remove file from add list
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

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

      <div className="flex h-screen bg-gray-100 relative">
        {/* LEFT THUMBNAILS */}
        <div className="w-1/6 bg-white p-2 space-y-2 border-r overflow-y-auto" style={{ maxHeight: '100vh' }}>
          {tabImages.map(tab => {
            const active = selectedImage === tab.src;
            return (
              <button
                key={tab.src}
                onClick={() => setSelectedImage(tab.src)}
                className={`w-full rounded flex flex-col items-center overflow-hidden cursor-pointer transition-all duration-300 border border-[#004051] ${
                  active ? 'bg-[#004051] text-white' : 'bg-white text-gray-800'
                } hover:bg-[#004051] hover:text-white`}
              >
                <img src={tab.src} alt={tab.name} className="w-full h-32 object-cover rounded shadow" />
                <span className="text-xs font-semibold p-2 text-center">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* CENTER */}
        <div className="flex-1 pl-2 flex flex-col">
          <h2 className="font-semibold mb-2 text-gray-800 bg-[#004051] rounded p-2 text-white">
            {selectedTabName}
          </h2>

          {/* IMAGE + MARKERS */}
          <div
            ref={imageRef}
            onClick={handleImageClick}
            className="flex-1 border rounded overflow-hidden bg-white relative cursor-crosshair"
          >
            <img src={selectedImage} alt="Aircraft" className="w-full h-full object-contain" />

            {damageList
              .filter(d => d.imageSrc === selectedImage)
              .map(d => (
                <div
                  key={d.id}
                  onClick={e => {
                    e.stopPropagation();
                    handleRowClick(d);
                  }}
                  className={`absolute w-5 h-5 rounded-full cursor-pointer transition-all shadow-lg ${
                    selectedDamageId === d.id ? 'bg-orange-500 ring-4 ring-orange-300' : 'bg-red-600'
                  }`}
                  style={{ top: d.marker.x, left: d.marker.y }}
                  title="Click to view"
                />
              ))}
          </div>

          {/* GLOBAL TABLE */}
          <div className="mt-4 bg-white border rounded p-4 overflow-auto max-h-60 shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-semibold text-gray-800">Damage Records</h3>
              <button
                onClick={() => openModal('add')}
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
                  <th className="px-3 py-2 text-left font-semibold">Images</th>
                  <th className="px-3 py-2 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300 bg-gray-100 text-gray-800">
                {damageList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-500 py-4">
                      No record found
                    </td>
                  </tr>
                ) : (
                  damageList.map(d => (
                    <tr
                      key={d.id}
                      onClick={() => handleRowClick(d)}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedDamageId === d.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-3 py-2">{d.id}</td>
                      <td className="px-3 py-2">{d.name ?? '-'}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          d.status === 'Critical' ? 'bg-red-100 text-red-800' :
                          d.status === 'Major' ? 'bg-orange-100 text-orange-800' :
                          d.status === 'Minor' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">{d.date}</td>
                      <td className="px-3 py-2">{d.location}</td>
                      <td className="px-3 py-2 max-w-xs truncate">{d.description}</td>
                      <td className="px-3 py-2">
                        {d.fileNames && d.fileNames.length > 0 ? (
                          <span className="text-blue-600 underline text-xs">
                            {d.fileNames.length} image{d.fileNames.length > 1 ? 's' : ''}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleRowClick(d);
                          }}
                          className="bg-[#004051] text-white px-3 py-1 text-xs rounded hover:bg-[#006172]"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="bg-[#004051] text-white px-6 py-3 rounded-t-xl">
                <h3 className="text-xl font-bold">
                  {modalMode === 'view' ? 'Damage Detail' : 'Record New Damage'}
                </h3>
              </div>

              <div className="p-6 space-y-5">

                {/* IMAGE SECTION – VIEW MODE */}
                {modalMode === 'view' && selectedDamageId && damageList.find(d => d.id === selectedDamageId)?.fileUrls?.length ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">Damage Images</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {damageList.find(d => d.id === selectedDamageId)!.fileUrls!.map((url, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={url}
                            alt={`Damage ${i + 1}`}
                            className="w-full h-32 object-cover rounded-lg shadow border border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center rounded-lg">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white opacity-0 group-hover:opacity-100 transition"
                            >
                              Full Size
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* IMAGE SECTION – ADD MODE */}
                {modalMode === 'add' && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Upload Images <span className="text-gray-400 font-normal">(optional)</span>
                    </h4>

                    {/* Upload Zone */}
                    <div
                      onDrop={e => {
                        e.preventDefault();
                        const dropped = Array.from(e.dataTransfer.files).filter(f =>
                          /\.(jpe?g|png|gif|webp)$/i.test(f.name)
                        );
                        setFiles(prev => [...prev, ...dropped]);
                      }}
                      onDragOver={e => e.preventDefault()}
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#004051] rounded-lg p-4 text-center text-sm bg-[#f9fbfb] hover:bg-[#f1f5f5] cursor-pointer transition"
                      onClick={() => document.getElementById('multiImgUpload')?.click()}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1 text-[#004051]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16v-4a4 4 0 118 0v4m-4 4v-4" />
                      </svg>
                      <p className="text-[#004051] font-medium">Drop images or click</p>
                      <p className="text-xs text-gray-400">JPG, PNG, GIF, WEBP (max 5MB each)</p>
                    </div>
                    <input
                      id="multiImgUpload"
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      multiple
                      className="hidden"
                      onChange={e => {
                        const selected = Array.from(e.target.files || []).filter(f =>
                          /\.(jpe?g|png|gif|webp)$/i.test(f.name)
                        );
                        setFiles(prev => [...prev, ...selected]);
                      }}
                    />

                    {/* Thumbnails */}
                    {files.length > 0 && (
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {files.map((file, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${i + 1}`}
                              className="w-full h-20 object-cover rounded shadow border"
                            />
                            <button
                              onClick={() => removeFile(i)}
                              className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* FORM FIELDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      disabled={modalMode === 'view'}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051] focus:border-transparent"
                      placeholder="e.g. Door Crack"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      disabled={modalMode === 'view'}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051] focus:border-transparent"
                      placeholder="e.g. 13fs"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      disabled={modalMode === 'view'}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#004051] focus:border-transparent"
                    >
                      <option value="">Select status</option>
                      <option value="Critical">Critical</option>
                      <option value="Major">Major</option>
                      <option value="Minor">Minor</option>
                      <option value="General">General</option>
                      <option value="Void">Void</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    disabled={modalMode === 'view'}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-[#004051] focus:border-transparent"
                    placeholder="Describe the damage..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setNewMarker(null);
                      setSelectedDamageId(null);
                      setFiles([]);
                    }}
                    className="px-5 py-2 text-sm bg-gray-300 hover:bg-gray-400 rounded-md font-medium transition"
                  >
                    Close
                  </button>
                  {modalMode === 'add' && (
                    <button
                      onClick={saveDamage}
                      disabled={isLoading}
                      className="px-6 py-2 text-sm bg-[#004051] text-white hover:bg-[#006172] rounded-md font-medium transition shadow-md disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Damage'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}