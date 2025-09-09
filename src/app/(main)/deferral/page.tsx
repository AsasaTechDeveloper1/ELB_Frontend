'use client';

import { useState } from 'react';
import Image from 'next/image';
import SignaturePad from 'react-signature-canvas';
import type { SignatureCanvas } from 'react-signature-canvas';

import { useRef } from 'react';

interface NoticeEntry {
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
  descriptionSign1: string;
  descriptionAuth1: string;
  descriptionDate1: string;
  descriptionSign2: string;
  descriptionAuth2: string;
  descriptionDate2: string;
  descriptionSign3: string;
  descriptionAuth3: string;
  descriptionDate3: string;
  descriptionSign4: string;
  descriptionAuth4: string;
  descriptionDate4: string;
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
  descriptionSign1: '',
  descriptionAuth1: '',
  descriptionDate1: '',
  descriptionSign2: '',
  descriptionAuth2: '',
  descriptionDate2: '',
  descriptionSign3: '',
  descriptionAuth3: '',
  descriptionDate3: '',
  descriptionSign4: '',
  descriptionAuth4: '',
  descriptionDate4: '',
};

export default function NoticesForm() {
  
  const sigCanvas = useRef<SignatureCanvas | null>(null);

  const [entries, setEntries] = useState<NoticeEntry[]>([{ ...initialEntry }]);
  const [authModal, setAuthModal] = useState<{ type: 'entered' | 'cleared'; index: number } | null>(null);
  const [authData, setAuthData] = useState<{ authId: string; authName:string; password: string; sign: string; date: string; expDate: string }>({
    authId: '',
    authName: '',
    password: '',
    sign: '',
    date: '',
    expDate: '',
  });
  const handleInputChange = (index: number, field: keyof NoticeEntry, value: string) => {
    const updatedEntries = [...entries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value,
    };
    setEntries(updatedEntries);
  };

  const addNewEntry = () => {
    const newGroupNo = entries.length + 1;
    setEntries([...entries, { ...initialEntry, groupNo: newGroupNo }]);
  };

  const removeEntry = (index: number) => {
    const updatedEntries = [...entries];
    updatedEntries.splice(index, 1);
    setEntries(updatedEntries);
  };

  const openModal = (index: number, type: 'entered' | 'cleared') => {
    const entry = entries[index];
    const description = (entry as any)[`description${index + 1}`];


    if (!description || description.trim() === '') {
      const updatedErrors = [...descriptionErrors];
      updatedErrors[index] = 'Description is required';
      setDescriptionErrors(updatedErrors);
      return; // ❌ prevent opening modal
    }

    setAuthModal({ type, index });

    const currentDate = new Date().toISOString().split('T')[0];
    setAuthData((prev) => ({ ...prev, date: currentDate }));
  };

  const [descriptionErrors, setDescriptionErrors] = useState<string[]>([]);
  const [authorizedEntries, setAuthorizedEntries] = useState<number[]>([]);
  const [clearedEntries, setClearedEntries] = useState<number[]>([]);

  const handleDescriptionChange = (index: number, value: string) => {
    const updated = [...entries];
    (updated[index] as any)[`description${index + 1}`] = value;
    setEntries(updated);

    const updatedErrors = [...descriptionErrors];
    updatedErrors[index] = value.trim() ? '' : 'Description is required';
    setDescriptionErrors(updatedErrors);
  };

  const saveAuthorization = () => {
    if (!authModal) return;
    const index = authModal.index;
    const entry = entries[index];

    const description = (entry as any)[`description${index + 1}`];


    if (!description || description.trim() === '') {
      const updatedErrors = [...descriptionErrors];
      updatedErrors[index] = 'Description is required';
      setDescriptionErrors(updatedErrors);
      return;
    }

    const updated = [...entries];

    if (authModal.type === 'entered') {
      updated[index].enteredSign = authData.sign;
      updated[index].enteredAuth = authData.authId;
      updated[index].enteredAuthName = authData.authName;
      updated[index].enteredDate = authData.date;
      updated[index].expDate = authData.expDate;
      setAuthorizedEntries((prev) => [...prev, index]);
    } else if (authModal.type === 'cleared') {
      updated[index].clearedSign = authData.sign;
      updated[index].clearedAuth = authData.authId;
      updated[index].clearedAuthName = authData.authName;
      updated[index].clearedDate = authData.date;
      setClearedEntries((prev) => [...prev, index]);
    }

    setEntries(updated);
    setAuthModal(null);
    setAuthData({ authId: '', authName:'', password: '', sign: '', date: '', expDate: '' });
  };

  // Get current date for header
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-xl shadow p-6">
        {/* Enhanced Header */}
        {/* Header */}
        <header className="border-b-2 border-[#004051] pb-4 mb-6">
          {/* Mobile/Tablet Layout */}
          <div className="flex flex-row items-center gap-2 md:hidden">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                src="/images/logo/Picture1.png"
                width={150}
                height={75}
                className="h-10 sm:h-12 w-auto rounded"
                alt="Organization logo"
                role="presentation"
                quality={100}
              />
            </div>

            {/* Heading */}
            <h1 className="ml-4 text-sm sm:text-lg font-bold text-[#004051] uppercase text-left">
              Notices to Flight / Maintenance Crew
            </h1>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center relative">
            <div className="mt-2">
              <Image
                src="/images/logo/Picture1.png"
                width={150}
                height={75}
                className="h-12 w-auto rounded"
                alt="Organization logo"
                role="presentation"
                quality={100}
              />
            </div>
            <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-[#004051] uppercase text-center">
              Acceptable Deferred Defect Record
            </h1> 
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-sm rounded-md overflow-hidden border border-gray-200 shadow-sm">
            <thead>
              <tr className="bg-[#004051] text-white">
                <th className="p-3 w-1/4 text-center uppercase">Defect Reference</th>
                <th className="p-3 w-2/4 text-center uppercase">Enter True Copy Of Original Defect</th>
                <th className="p-3 w-1/4 text-center uppercase">Clearance Reference</th>
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
                    <div className="grid grid-cols-2 gap-3">
                      {/* Row 1: DD + Type/No */}
                      <div className="flex gap-3 col-span-2">
                        {/* DD */}
                        <div className="flex flex-col w-[80px]">
                          <label className="text-sm font-medium text-gray-600 mb-1">DD</label>
                          <select className="border border-gray-300 rounded px-2 py-2 w-full">
                            <option value="M">M</option>
                            <option value="N">N</option>
                          </select>
                        </div>

                        {/* Type/No */}
                        <div className="flex flex-col flex-1">
                          <label className="text-sm font-medium text-gray-600 mb-1">Type/No</label>
                          <input
                            type="text"
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                          />
                        </div>
                      </div>

                      {/* Row 2: Log Page No + Item No */}
                      <div className="flex gap-3 col-span-2">
                        <div className="flex flex-col w-[180px]">
                          <label className="text-sm font-medium text-gray-600 mb-1">Log Page No</label>
                          <input
                            type="text"
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                          />
                        </div>

                        <div className="flex flex-col w-[100px]">
                          <label className="text-sm font-medium text-gray-600 mb-1">Item No</label>
                          <input
                            type="text"
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                          />
                        </div>
                      </div>

                      {/* Row 3: MEL/CD Ref */}
                      <div className="flex flex-col col-span-2">
                        <label className="text-sm font-medium text-gray-600 mb-1">MEL/CD Ref (If Any)</label>
                        <input
                          type="text"
                          className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                      </div>

                      {/* Row 4: MEL Cat + Date */}
                      <div className="flex gap-3 col-span-2">
                        <div className="flex flex-col w-[120px]">
                          <label className="text-sm font-medium text-gray-600 mb-1">MEL Cat</label>
                          <select className="border border-gray-300 rounded px-3 py-2 w-full">
                            <option value="">—</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                            <option value="E">E</option>
                            <option value="U">U</option>
                          </select>
                        </div>

                        <div className="flex flex-col flex-1">
                          <label className="text-sm font-medium text-gray-600 mb-1">Date</label>
                          <input
                            type="date"
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </td>


                  {/* Description Column */}
                  <td className="p-3 align-top border-t border-gray-300">
                    <textarea
                      className="w-full min-w-[250px] md:min-w-[400px] h-34 border-2 border-[#004051] rounded-md p-2 text-md focus:outline-none focus:ring-2 focus:ring-[#004051]/30"
                      placeholder="Enter description..."
                      value={(entry as any)[`description${index + 1}`]}
                      onChange={(e) => handleDescriptionChange(index, e.target.value)}
                      disabled={authorizedEntries.includes(index) || clearedEntries.includes(index)}
                    />
                    {descriptionErrors[index] && (
                      <p className="text-red-600 text-sm mt-1">{descriptionErrors[index]}</p>
                    )}
                  </td>

                  {/* Cleared Column */}
                  <td className="p-3 align-top border-t border-gray-300">
                    <div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex gap-3 col-span-2">
                          <div className="flex flex-col flex-1 w-full">
                            <label className="text-sm font-medium text-gray-600 mb-1">Date</label>
                            <input
                              type="date"
                              className="border border-gray-300 rounded px-3 py-2 w-full"
                            />
                          </div>
                        </div>
                        
                        {/* Row 2: Log Page No + Item No */}
                        <div className="flex gap-3 col-span-2">
                          <div className="flex flex-col w-[180px]">
                            <label className="text-sm font-medium text-gray-600 mb-1">Log Page No</label>
                            <input
                              type="text"
                              className="border border-gray-300 rounded px-3 py-2 w-full"
                            />
                          </div>

                          <div className="flex flex-col w-[100px]">
                            <label className="text-sm font-medium text-gray-600 mb-1">Item No</label>
                            <input
                              type="text"
                              className="border border-gray-300 rounded px-3 py-2 w-full"
                            />
                          </div>
                        </div>

                        {/* Row 4: MEL Cat + Date */}
                        <div className="flex gap-3 col-span-2">
                          <label className="font-medium text-gray-700">Cleared / Consolidated By : </label>
                          <div className="break-words">{entry.clearedAuth || '—'}</div>
                        </div>
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

                      {/* Remove Button */}
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
      </div>

      {authModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start pt-20 sm:pt-16 z-50 overflow-y-auto h-screen">
          <div
            className="bg-white rounded-lg p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-lg border-t-4 border-yellow-500"
            style={{ marginTop: '100px', marginBottom: '10px', marginLeft: '20px', marginRight: '20px' }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
              <h2 className="text-lg font-semibold text-yellow-700">
                {authModal.type} Authorization Required
              </h2>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">
              This action requires proper authorization. Please provide valid credentials.
            </p>

            {/* Auth Inputs */}
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
                  placeholder="Enter Staff ID"
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
            {/* Signature */}
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
                  canvasProps={{ className: "w-full h-24 rounded" }}
                  onEnd={() => {
                    if (sigCanvas.current) {
                      const signature = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
                      setAuthData((prev) => ({ ...prev, sign: signature }));
                    }
                  }}
                />
              </div>
            </div>

            {/* Footer Buttons */}
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