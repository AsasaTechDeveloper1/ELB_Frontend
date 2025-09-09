'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import SignaturePad from 'react-signature-canvas';
import type { SignatureCanvas } from 'react-signature-canvas';

interface NoticeEntry {
  id?: number;
  groupNo: number;
  enteredSign: string;
  enteredAuth: string;
  enteredAuthName: string;
  enteredDate: string;
  expDate: string;
  clearedSign: string;
  clearedAuth: string;
  clearedAuthName: string;
  clearedDate: string;
  description: string;
}

const initialEntry: NoticeEntry = {
  groupNo: 1,
  enteredSign: '',
  enteredAuth: '',
  enteredAuthName: '',
  enteredDate: '',
  expDate: '',
  clearedSign: '',
  clearedAuth: '',
  clearedAuthName: '',
  clearedDate: '',
  description: '',
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function NoticesForm() {
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [entries, setEntries] = useState<NoticeEntry[]>([{ ...initialEntry }]);
  const [removedIds, setRemovedIds] = useState<number[]>([]); // <-- Add this at top with other useState
  const [authModal, setAuthModal] = useState<{ type: 'entered' | 'cleared'; index: number } | null>(null);
  const [authData, setAuthData] = useState<{
    authId: string;
    authName: string;
    password: string;
    sign: string;
    date: string;
    expDate: string;
  }>({
    authId: '',
    authName: '',
    password: '',
    sign: '',
    date: '',
    expDate: '',
  });
  const [descriptionErrors, setDescriptionErrors] = useState<string[]>([]);
  const [authorizedEntries, setAuthorizedEntries] = useState<number[]>([]);
  const [clearedEntries, setClearedEntries] = useState<number[]>([]);

  // Fetch notices on component mount
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch(`${API_BASE}/notices`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch notices');

        // Map API response to NoticeEntry interface
        const fetchedEntries: NoticeEntry[] = data.map((notice: any, index: number) => ({
          groupNo: index + 1,
          id: notice.id, // <-- ADD THIS LINE
          enteredSign: '',
          enteredAuth: notice.entered_by || '',
          enteredAuthName: '',
          enteredDate: '',
          expDate: '',
          clearedSign: '',
          clearedAuth: notice.cleared_by || '',
          clearedAuthName: '',
          clearedDate: '',
          description: notice.description || '',
        }));


        setEntries(fetchedEntries.length > 0 ? fetchedEntries : [{ ...initialEntry }]);
        setAuthorizedEntries(fetchedEntries.map((entry, index) => entry.enteredAuth ? index : -1).filter(i => i !== -1));
        setClearedEntries(fetchedEntries.map((entry, index) => entry.clearedAuth ? index : -1).filter(i => i !== -1));
      } catch (err: any) {
        console.error('Fetch failed:', err);
        alert(`Error fetching notices ❌: ${err.message}`);
      }
    };
    
    fetchNotices();
  }, []);

  const handleInputChange = (index: number, field: keyof NoticeEntry, value: string) => {
    const updatedEntries = [...entries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setEntries(updatedEntries);
  };

  const addNewEntry = () => {
    const newGroupNo = entries.length + 1;
    setEntries([...entries, { ...initialEntry, groupNo: newGroupNo }]);
  };


  const removeEntry = (index: number) => {
    const updatedEntries = [...entries];
    const removed = updatedEntries.splice(index, 1)[0];
    if (removed.id !== undefined) setRemovedIds(prev => removed.id != null ? [...prev, removed.id] : prev);
    setEntries(updatedEntries);
    setDescriptionErrors((prev) => prev.filter((_, i) => i !== index));
    setAuthorizedEntries((prev) => prev.filter((i) => i !== index));
    setClearedEntries((prev) => prev.filter((i) => i !== index));
  };


  const openModal = (index: number, type: 'entered' | 'cleared') => {
    const entry = entries[index];
    if (!entry.description.trim()) {
      const updatedErrors = [...descriptionErrors];
      updatedErrors[index] = 'Description is required';
      setDescriptionErrors(updatedErrors);
      return;
    }
    setAuthModal({ type, index });
    const currentDate = new Date().toISOString().split('T')[0];
    setAuthData((prev) => ({ ...prev, date: currentDate }));
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const updatedEntries = [...entries];
    updatedEntries[index] = { ...updatedEntries[index], description: value };
    setEntries(updatedEntries);

    const updatedErrors = [...descriptionErrors];
    updatedErrors[index] = value.trim() ? '' : 'Description is required';
    setDescriptionErrors(updatedErrors);
  };

  const saveAuthorization = () => {
    if (!authModal) return;
    const { index, type } = authModal;
    const entry = entries[index];

    if (!entry.description.trim()) {
      const updatedErrors = [...descriptionErrors];
      updatedErrors[index] = 'Description is required';
      setDescriptionErrors(updatedErrors);
      return;
    }

    const updatedEntries = [...entries];
    if (type === 'entered') {
      updatedEntries[index] = {
        ...updatedEntries[index],
        enteredSign: authData.sign,
        enteredAuth: authData.authId,
        enteredAuthName: authData.authName,
        enteredDate: authData.date,
        expDate: authData.expDate,
      };
      setAuthorizedEntries((prev) => [...prev, index]);
    } else if (type === 'cleared') {
      updatedEntries[index] = {
        ...updatedEntries[index],
        clearedSign: authData.sign,
        clearedAuth: authData.authId,
        clearedAuthName: authData.authName,
        clearedDate: authData.date,
      };
      setClearedEntries((prev) => [...prev, index]);
    }

    setEntries(updatedEntries);
    setAuthModal(null);
    setAuthData({ authId: '', authName: '', password: '', sign: '', date: '', expDate: '' });
    sigCanvas.current?.clear();
  };

  const handleSave = async () => {
    const hasEmptyDescription = entries.some((entry) => !entry.description.trim());
    if (hasEmptyDescription) {
      const updatedErrors = entries.map((entry, index) =>
        entry.description.trim() ? '' : 'Description is required'
      );
      setDescriptionErrors(updatedErrors);
      alert('Please fill description for all entries ❌');
      return;
    }

    const payload = entries.map((entry) => ({
      id: entry.id || undefined, // <-- ADD THIS LINE
      entered_by: entry.enteredAuth || null,
      cleared_by: entry.clearedAuth || null,
      description: entry.description,
    }));


    try {
      const res = await fetch(`${API_BASE}/notices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: payload, removedIds }), // <-- ADD removedIds
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save notices');

      alert('Notices saved successfully ✅');
      console.log(data);
      // Reload the page
      window.location.reload();
      setEntries([{ ...initialEntry, groupNo: 1 }]);
      setAuthorizedEntries([]);
      setClearedEntries([]);
      setDescriptionErrors([]);
    } catch (err: any) {
      console.error('Save failed:', err);
      alert(`Error saving notices ❌: ${err.message}`);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-xl shadow p-6">
        <header className="border-b-2 border-[#004051] pb-4 mb-6">
          <div className="flex flex-row items-center gap-2 md:hidden">
            <Image
              src="/images/logo/Picture1.png"
              width={150}
              height={75}
              className="h-10 sm:h-12 w-auto rounded"
              alt="Organization logo"
              role="presentation"
              quality={100}
            />
            <h1 className="ml-4 text-sm sm:text-lg font-bold text-[#004051] uppercase text-left">
              Notices to Flight / Maintenance Crew
            </h1>
          </div>
          <div className="hidden md:flex items-center relative justify-between">
            <Image
              src="/images/logo/Picture1.png"
              width={150}
              height={75}
              className="h-12 w-auto rounded"
              alt="Organization logo"
              role="presentation"
              quality={100}
            />
            <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-[#004051] uppercase text-center">
              Notices to Flight / Maintenance Crew
            </h1>
            <button
              onClick={handleSave}
              className="bg-[#004051] text-white px-4 py-1 mr-4 rounded hover:bg-[#002f35] transition"
            >
              Save
            </button>
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-sm rounded-md overflow-hidden border border-gray-200 shadow-sm">
            <thead>
              <tr className="bg-[#004051] text-white">
                <th className="p-3 w-1/4 text-left">Entered</th>
                <th className="p-3 w-2/4 text-left">Description</th>
                <th className="p-3 w-1/4 text-left">Cleared</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr
                  key={`entry-${index}`}
                  className={`border-t ${
                    authorizedEntries.includes(index) && clearedEntries.includes(index)
                      ? 'bg-[#e0f0ff] text-[#1c3b57]'
                      : 'bg-white'
                  }`}
                >
                  <td className="p-3 align-top border-t border-gray-300">
                    <div
                      className={`flex flex-col sm:grid sm:grid-cols-2 gap-y-2 gap-x-4 p-3 rounded-md ${
                        authorizedEntries.includes(index) && clearedEntries.includes(index)
                          ? 'bg-[#e0f0ff] text-[#1c3b57]'
                          : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      <div>
                        <label className="font-medium text-gray-700">Auth ID: </label>
                        <div className="break-words">{entry.enteredAuth || '—'}</div>
                      </div>
                      <div>
                        <label className="font-medium text-gray-700">Auth Name: </label>
                        <div className="break-words">{entry.enteredAuthName || '—'}</div>
                      </div>
                      <div className="col-span-2 flex justify-center mt-2">
                        {!authorizedEntries.includes(index) && (
                          <button
                            onClick={() => openModal(index, 'entered')}
                            className="bg-[#004051] text-white px-6 py-1.5 text-sm rounded-md hover:bg-[#003040] transition"
                          >
                            Auth
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 align-top border-t border-gray-300">
                    <textarea
                      className="w-full min-w-[250px] md:min-w-[400px] h-34 border-2 border-[#004051] rounded-md p-2 text-md focus:outline-none focus:ring-2 focus:ring-[#004051]/30"
                      placeholder="Enter description..."
                      value={entry.description}
                      onChange={(e) => handleDescriptionChange(index, e.target.value)}
                      disabled={authorizedEntries.includes(index) || clearedEntries.includes(index)}
                    />
                    {descriptionErrors[index] && (
                      <p className="text-red-600 text-sm mt-1">{descriptionErrors[index]}</p>
                    )}
                  </td>
                  <td className="p-3 align-top border-t border-gray-300">
                    <div
                      className={`flex flex-col sm:grid sm:grid-cols-2 gap-y-2 gap-x-4 p-3 rounded-md ${
                        authorizedEntries.includes(index) && clearedEntries.includes(index)
                          ? 'bg-[#e0f0ff] text-[#1c3b57]'
                          : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      <div>
                        <label className="font-medium text-gray-700">Auth ID: </label>
                        <div className="break-words">{entry.clearedAuth || '—'}</div>
                      </div>
                      <div>
                        <label className="font-medium text-gray-700">Auth Name: </label>
                        <div className="break-words">{entry.clearedAuthName || '—'}</div>
                      </div>
                      <div className="col-span-2 flex justify-center mt-2">
                        {!clearedEntries.includes(index) && (
                          <button
                            onClick={() => openModal(index, 'cleared')}
                            className="bg-[#004051] text-white px-6 py-1.5 text-sm rounded-md hover:bg-[#003040] transition"
                          >
                            Auth
                          </button>
                        )}
                      </div>
                      <div className="col-span-2 flex justify-center mt-4">
                        <button
                          onClick={() => removeEntry(index)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 text-sm rounded-md font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mb-6 mt-4">
          <button
            onClick={addNewEntry}
            className="bg-[#004051] hover:bg-[#006172] text-white px-6 py-2 rounded-md font-medium"
          >
            + Add New Entry
          </button>
        </div>
        <div className="bg-[#f0fafa] border border-[#004051] rounded-lg p-4 shadow-sm mb-4">
          <h3 className="text-md font-semibold text-[#004051] mb-1">📌 Note :</h3>
          <p className="text-sm text-gray-800 leading-relaxed">
            Enter information for the attention of Flight or Maintenance Crews. Do not use this to defer defects.
            The authorised person writing a notice must sign and date it. When no longer valid, it must be struck out and signed again.
          </p>
          <h3 className="text-md font-semibold text-[#004051] mb-1">📌 Note :</h3>
          <p className="text-sm text-gray-800 leading-relaxed">
            Open Notices to Flight / Maintenance Crews must be deleted by expiry date.
          </p>
        </div>
      </div>

      {authModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start pt-20 sm:pt-16 z-50 overflow-y-auto h-screen">
          <div
            className="bg-white rounded-lg p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-lg border-t-4 border-yellow-500"
            style={{ marginTop: '100px', marginBottom: '10px', marginLeft: '20px', marginRight: '20px' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
              <h2 className="text-lg font-semibold text-yellow-700">
                {authModal.type} Authorization Required
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This action requires proper authorization. Please provide valid credentials.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auth ID (Staff ID)</label>
                <input
                  type="text"
                  name="authId"
                  autoComplete="off"
                  onChange={(e) => setAuthData({ ...authData, authId: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter Staff ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auth Name (Staff Name)</label>
                <input
                  type="text"
                  name="authName"
                  autoComplete="off"
                  onChange={(e) => setAuthData({ ...authData, authName: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter Staff Name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="authPass"
                autoComplete="new-password"
                value={authData.password}
                onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Enter Password"
              />
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  Sign
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 4l-1.41 1.41M4 20h16M4 20L19 5a2.828 2.828 0 114 4L8 20H4z" />
                  </svg>
                </label>
                <button
                  onClick={() => {
                    sigCanvas.current!.clear();
                    setAuthData({ ...authData, sign: '' });
                  }}
                  className="px-3 py-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded shadow transition"
                >
                  Clear
                </button>
              </div>
              <div className="w-full border rounded">
                <SignaturePad
                  ref={sigCanvas}
                  canvasProps={{ className: 'w-full h-24 rounded' }}
                  onEnd={() => {
                    if (sigCanvas.current) {
                      const signature = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
                      setAuthData((prev) => ({ ...prev, sign: signature }));
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setAuthModal(null)}
                className="px-5 py-2 text-sm font-medium bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveAuthorization}
                className="px-5 py-2 text-sm font-medium bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition"
              >
                Auth
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}