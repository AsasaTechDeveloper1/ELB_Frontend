'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import SignaturePad from 'react-signature-canvas';
import type { SignatureCanvas } from 'react-signature-canvas';

// Define interfaces
interface DeferralEntry {
  id?: string;
  groupNo: number;
  defect_reference: {
    dd: string | null;
    type_no: string | null;
    log_page: string | null;
    log_item_no: string | null;
    mel_cd_ref: string | null;
    mel_cat: string | null;
    date: string | null;
  };
  description: string;
  clear_reference: {
    staff_id: string | null;
    date: string | null;
    log_page: string | null;
    log_item_no: string | null;
  };
  enteredSign: string;
  enteredAuth: string;
  enteredAuthName: string;
  enteredDate: string;
  expDate: string;
  clearedSign: string;
  clearedAuth: string;
  clearedAuthName: string;
  clearedDate: string;
}

interface LogItem {
  id: string;
  displayNumber: number;
}

interface Log {
  id: string;
  logPageNo: string;
  items: LogItem[];
}

const initialEntry: DeferralEntry = {
  groupNo: 1,
  defect_reference: {
    dd: null,
    type_no: null, // Will be auto-generated
    log_page: null,
    log_item_no: null,
    mel_cd_ref: null,
    mel_cat: null,
    date: null,
  },
  description: '',
  clear_reference: {
    staff_id: null,
    date: null,
    log_page: null,
    log_item_no: null,
  },
  enteredSign: '',
  enteredAuth: '',
  enteredAuthName: '',
  enteredDate: '',
  expDate: '',
  clearedSign: '',
  clearedAuth: '',
  clearedAuthName: '',
  clearedDate: '',
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function DeferralsForm() {
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [entries, setEntries] = useState<DeferralEntry[]>([{ ...initialEntry }]);
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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [nextTypeNo, setNextTypeNo] = useState<string>('DEF-00001'); // State for next Type/No

  // Generate the next Type/No based on existing type_no values
  const generateNextTypeNo = (existingTypeNos: string[]): string => {
    if (!existingTypeNos || existingTypeNos.length === 0) {
      return 'DEF-00001';
    }
    const numbers = existingTypeNos
      .map((typeNo) => {
        const match = typeNo?.match(/^DEF-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((num) => !isNaN(num));
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNumber = maxNumber + 1;
    return `DEF-${nextNumber.toString().padStart(5, '0')}`;
  };

  // Fetch deferrals from the backend
  const fetchDeferrals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/deferrals`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        const fetchedEntries = data.map((item: any, index: number) => ({
          ...initialEntry,
          id: item.id,
          groupNo: index + 1,
          defect_reference: {
            dd: item.defect_reference?.dd || null,
            type_no: item.defect_reference?.type_no || null,
            log_page: item.defect_reference?.log_page || null,
            log_item_no: item.defect_reference?.log_item_no || null,
            mel_cd_ref: item.defect_reference?.mel_cd_ref || null,
            mel_cat: item.defect_reference?.mel_cat || null,
            date: item.defect_reference?.date || null,
          },
          description: item.description || '',
          clear_reference: {
            staff_id: item.clear_reference?.staff_id || null,
            date: item.clear_reference?.date || null,
            log_page: item.clear_reference?.log_page || null,
            log_item_no: item.clear_reference?.log_item_no || null,
          },
          enteredSign: item.enteredSign || '',
          enteredAuth: item.enteredAuth || '',
          enteredAuthName: item.enteredAuthName || '',
          enteredDate: item.enteredDate || '',
          expDate: item.expDate || '',
          clearedSign: item.clearedSign || '',
          clearedAuth: item.clearedAuth || '',
          clearedAuthName: item.clearedAuthName || '',
          clearedDate: item.clearedDate || '',
        }));
        setEntries(fetchedEntries);
        setDescriptionErrors(fetchedEntries.map(() => ''));
        setAuthorizedEntries(fetchedEntries.map((_: DeferralEntry, idx: number) => idx).filter((idx: number) => fetchedEntries[idx].enteredAuth));
        setClearedEntries(fetchedEntries.map((_: DeferralEntry, idx: number) => idx).filter((idx: number) => fetchedEntries[idx].clearedAuth));
        // Extract type_no values and set next Type/No
        const typeNos = data
          .map((item: any) => item.defect_reference?.type_no)
          .filter((typeNo: string | null): typeNo is string => typeNo !== null);
        setNextTypeNo(generateNextTypeNo(typeNos));
      } else {
        setError(data.error || 'Failed to fetch deferrals');
      }
    } catch (err: any) {
      setError('Error fetching deferrals: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs from the backend
  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/logs`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        const transformedLogs = data.map((log: Log) => ({
          ...log,
          items: log.items.map((item, idx) => ({
            ...item,
            displayNumber: idx + 1,
          })),
        }));
        setLogs(transformedLogs);
      } else {
        setError(data.error || 'Failed to fetch logs');
      }
    } catch (err: any) {
      setError('Error fetching logs: ' + err.message);
    }
  };

  // Fetch deferrals and logs when the component mounts
  useEffect(() => {
    fetchDeferrals();
    fetchLogs();
  }, []);

  const handleInputChange = (
    index: number,
    field: keyof DeferralEntry | keyof DeferralEntry['defect_reference'] | keyof DeferralEntry['clear_reference'],
    value: string,
    section?: 'defect_reference' | 'clear_reference'
  ) => {
    setEntries((prevEntries) =>
      prevEntries.map((entry, i) =>
        i === index
          ? section
            ? { ...entry, [section]: { ...entry[section], [field]: value } }
            : { ...entry, [field]: value }
          : entry
      )
    );
    // Clear item_no if log_page changes
    if (section === 'defect_reference' && field === 'log_page') {
      setEntries((prevEntries) =>
        prevEntries.map((entry, i) =>
          i === index
            ? { ...entry, defect_reference: { ...entry.defect_reference, log_item_no: null } }
            : entry
        )
      );
    }
    if (section === 'clear_reference' && field === 'log_page') {
      setEntries((prevEntries) =>
        prevEntries.map((entry, i) =>
          i === index
            ? { ...entry, clear_reference: { ...entry.clear_reference, log_item_no: null } }
            : entry
        )
      );
    }
  };

  const addNewEntry = () => {
    const newGroupNo = entries.length + 1;
    setEntries([
      ...entries,
      {
        ...initialEntry,
        groupNo: newGroupNo,
        defect_reference: {
          ...initialEntry.defect_reference,
          type_no: nextTypeNo, // Set auto-generated Type/No
        },
      },
    ]);
    setDescriptionErrors([...descriptionErrors, '']);
    // Filter out null values and ensure only strings are passed
    const typeNos = entries
      .map((e) => e.defect_reference.type_no)
      .filter((typeNo): typeNo is string => typeNo !== null);
    setNextTypeNo(generateNextTypeNo([...typeNos, nextTypeNo]));
  };

  const removeEntry = async (index: number) => {
    const entry = entries[index];
    if (entry.id) {
      try {
        const res = await fetch(`${API_BASE}/deferrals/${entry.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to delete deferral');
          return;
        }
      } catch (err: any) {
        setError('Error deleting deferral: ' + err.message);
        return;
      }
    }

    const updatedEntries = [...entries];
    updatedEntries.splice(index, 1);
    setEntries(updatedEntries);
    const updatedErrors = [...descriptionErrors];
    updatedErrors.splice(index, 1);
    setDescriptionErrors(updatedErrors);
    setAuthorizedEntries((prev) => prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)));
    setClearedEntries((prev) => prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)));

    await fetchDeferrals(); // Refetch to update nextTypeNo
  };

  const openModal = (index: number, type: 'entered' | 'cleared') => {
    const entry = entries[index];
    if (!entry.description || entry.description.trim() === '') {
      const updatedErrors = [...descriptionErrors];
      updatedErrors[index] = 'Description is required';
      setDescriptionErrors(updatedErrors);
      return;
    }

    setAuthModal({ type, index });
    const currentDate = new Date().toISOString().split('T')[0];
    setAuthData((prev) => ({ ...prev, date: currentDate }));
  };

  const saveAuthorization = () => {
    if (!authModal) return;
    const index = authModal.index;
    const entry = entries[index];

    if (!entry.description || entry.description.trim() === '') {
      const updatedErrors = [...descriptionErrors];
      updatedErrors[index] = 'Description is required';
      setDescriptionErrors(updatedErrors);
      return;
    }

    setEntries((prevEntries) =>
      prevEntries.map((entry, i) =>
        i === index
          ? {
              ...entry,
              ...(authModal.type === 'entered'
                ? {
                    enteredSign: authData.sign,
                    enteredAuth: authData.authId,
                    enteredAuthName: authData.authName,
                    enteredDate: authData.date,
                    expDate: authData.expDate,
                    defect_reference: { ...entry.defect_reference, date: authData.date },
                  }
                : {
                    clearedSign: authData.sign,
                    clearedAuth: authData.authId,
                    clearedAuthName: authData.authName,
                    clearedDate: authData.date,
                    clear_reference: { ...entry.clear_reference, date: authData.date, staff_id: authData.authId },
                  }),
            }
          : entry
      )
    );

    if (authModal.type === 'entered') {
      setAuthorizedEntries((prev) => [...prev.filter((i) => i !== index), index]);
    } else {
      setClearedEntries((prev) => [...prev.filter((i) => i !== index), index]);
    }

    setAuthModal(null);
    setAuthData({ authId: '', authName: '', password: '', sign: '', date: '', expDate: '' });
  };

  const handleSave = async () => {
    try {
      const payload = entries.map((entry) => ({
        id: entry.id,
        defect_reference: { ...entry.defect_reference },
        description: entry.description,
        clear_reference: { ...entry.clear_reference },
        enteredSign: entry.enteredSign || '',
        enteredAuth: entry.enteredAuth || '',
        enteredAuthName: entry.enteredAuthName || '',
        enteredDate: entry.enteredDate || '',
        expDate: entry.expDate || '',
        clearedSign: entry.clearedSign || '',
        clearedAuth: entry.clearedAuth || '',
        clearedAuthName: entry.clearedAuthName || '',
        clearedDate: entry.clearedDate || '',
      }));

      if (payload.some((entry) => !entry.description || entry.description.trim() === '')) {
        alert('Description is required for all entries');
        return;
      }

      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/deferrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: payload }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Deferrals saved successfully ✅');
        await fetchDeferrals(); // Refetch to update entries and nextTypeNo
      } else {
        setError('Error saving deferrals: ' + data.error);
      }
    } catch (err: any) {
      setError('Error saving deferrals: ' + err.message);
    } finally {
      setLoading(false);
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
            <h1 className="ml-4 text-sm sm:text-lg font-bold text-[#004051] uppercase text-left">
              Deferrals to Flight / Maintenance Crew
            </h1>
          </div>
          <div className="hidden md:flex items-center relative justify-between">
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
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-[#004051] text-white px-4 py-1 mr-4 rounded hover:bg-[#002f35] transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={fetchDeferrals}
                disabled={loading}
                className="bg-[#06b6d4] text-white px-4 py-1 mr-4 rounded hover:bg-[#005b6b] transition disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {loading && (
          <div className="mb-4 text-center text-gray-600">Loading deferrals...</div>
        )}

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
                  key={entry.id || `entry-${index}`}
                  className={`border-t ${
                    authorizedEntries.includes(index) && clearedEntries.includes(index)
                      ? 'bg-[#e0f0ff] text-[#1c3b57]'
                      : 'bg-white'
                  }`}
                >
                  <td className="p-3 align-top border-t border-gray-300">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex gap-3 col-span-2">
                        <div className="flex flex-col w-[80px]">
                          <label className="text-sm font-medium text-gray-600 mb-1">DD</label>
                          <select
                            value={entry.defect_reference.dd || ''}
                            onChange={(e) => handleInputChange(index, 'dd', e.target.value, 'defect_reference')}
                            className="border border-gray-300 rounded px-2 py-2 w-full"
                          >
                            <option value="">—</option>
                            <option value="M">M</option>
                            <option value="N">N</option>
                          </select>
                        </div>
                        <div className="flex flex-col flex-1">
                          <label className="text-sm font-medium text-gray-600 mb-1">Type/No</label>
                          <input
                            type="text"
                            value={entry.defect_reference.type_no || ''}
                            readOnly
                            className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 col-span-2">
                        <div className="flex flex-col w-[180px]">
                          <label className="text-sm font-medium text-gray-600 mb-1">Log Page No</label>
                          <select
                            value={entry.defect_reference.log_page || ''}
                            onChange={(e) => handleInputChange(index, 'log_page', e.target.value, 'defect_reference')}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                          >
                            <option value="">Select Log Page</option>
                            {logs.map((log) => (
                              <option key={log.id} value={log.logPageNo}>
                                {log.logPageNo}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col w-[100px]">
                          <label className="text-sm font-medium text-gray-600 mb-1">Item No</label>
                          <select
                            value={entry.defect_reference.log_item_no || ''}
                            onChange={(e) => handleInputChange(index, 'log_item_no', e.target.value, 'defect_reference')}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                          >
                            <option value="">Select Item</option>
                            {entry.defect_reference.log_page &&
                              logs
                                .find((log) => log.logPageNo === entry.defect_reference.log_page)
                                ?.items.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.displayNumber}
                                  </option>
                                ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-col col-span-2">
                        <label className="text-sm font-medium text-gray-600 mb-1">MEL/CD Ref (If Any)</label>
                        <input
                          type="text"
                          value={entry.defect_reference.mel_cd_ref || ''}
                          onChange={(e) => handleInputChange(index, 'mel_cd_ref', e.target.value, 'defect_reference')}
                          className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                      </div>
                      <div className="flex gap-3 col-span-2">
                        <div className="flex flex-col w-[120px]">
                          <label className="text-sm font-medium text-gray-600 mb-1">MEL Cat</label>
                          <select
                            value={entry.defect_reference.mel_cat || ''}
                            onChange={(e) => handleInputChange(index, 'mel_cat', e.target.value, 'defect_reference')}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                          >
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
                            value={entry.defect_reference.date || ''}
                            onChange={(e) => handleInputChange(index, 'date', e.target.value, 'defect_reference')}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 align-top border-t border-gray-300">
                    <textarea
                      className="w-full min-w-[250px] md:min-w-[400px] h-54 border-2 border-[#004051] rounded-md p-2 text-md focus:outline-none focus:ring-2 focus:ring-[#004051]/30"
                      placeholder="Enter description..."
                      value={entry.description}
                      onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                      disabled={authorizedEntries.includes(index) || clearedEntries.includes(index)}
                    />
                    {descriptionErrors[index] && (
                      <p className="text-red-600 text-sm mt-1">{descriptionErrors[index]}</p>
                    )}
                  </td>
                  <td className="p-3 align-top border-t border-gray-300">
                    <div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex gap-3 col-span-2">
                          <div className="flex flex-col flex-1 w-full">
                            <label className="text-sm font-medium text-gray-600 mb-1">Date</label>
                            <input
                              type="date"
                              value={entry.clear_reference.date || ''}
                              onChange={(e) => handleInputChange(index, 'date', e.target.value, 'clear_reference')}
                              className="border border-gray-300 rounded px-3 py-2 w-full"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 col-span-2">
                          <div className="flex flex-col w-[180px]">
                            <label className="text-sm font-medium text-gray-600 mb-1">Log Page No</label>
                            <select
                              value={entry.clear_reference.log_page || ''}
                              onChange={(e) => handleInputChange(index, 'log_page', e.target.value, 'clear_reference')}
                              className="border border-gray-300 rounded px-3 py-2 w-full"
                            >
                              <option value="">Select Log Page</option>
                              {logs.map((log) => (
                                <option key={log.id} value={log.logPageNo}>
                                  {log.logPageNo}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex flex-col w-[100px]">
                            <label className="text-sm font-medium text-gray-600 mb-1">Item No</label>
                            <select
                              value={entry.clear_reference.log_item_no || ''}
                              onChange={(e) => handleInputChange(index, 'log_item_no', e.target.value, 'clear_reference')}
                              className="border border-gray-300 rounded px-3 py-2 w-full"
                            >
                              <option value="">Select Item</option>
                              {entry.clear_reference.log_page &&
                                logs
                                  .find((log) => log.logPageNo === entry.clear_reference.log_page)
                                  ?.items.map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.displayNumber}
                                    </option>
                                  ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-3 col-span-2">
                          <label className="font-medium text-gray-700">Cleared / Consolidated By :</label>
                          <div className="break-words">{entry.clearedAuth || '—'}</div>
                        </div>
                      </div>
                      <div className="col-span-6 flex justify-center space-x-4 mt-2">
                        {!clearedEntries.includes(index) && (
                          <button
                            onClick={() => openModal(index, 'cleared')}
                            className="bg-[#004051] text-white px-6 py-1.5 text-sm rounded-md hover:bg-[#003040] transition"
                          >
                            Auth
                          </button>
                        )}
                        <button
                          className="bg-[#06b6d4] hover:bg-[#06b6d4] text-white px-4 py-1 text-sm rounded-md font-medium"
                        >
                          Copy
                        </button>
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