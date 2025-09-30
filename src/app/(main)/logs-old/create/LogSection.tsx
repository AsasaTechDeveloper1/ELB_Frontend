'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogEntry, ComponentRow } from '../types';

interface LogSectionProps {
  logEntries: LogEntry[];
  setLogEntries: React.Dispatch<React.SetStateAction<LogEntry[]>>;
  descriptionErrors: string[];
  setDescriptionErrors: React.Dispatch<React.SetStateAction<string[]>>;
  showError: boolean;
  setShowError: React.Dispatch<React.SetStateAction<boolean>>;
  openAuthModal: (type: string, index: number) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const initialLogEntry: LogEntry = {
  id: 0,
  displayNumber: 1,
  updated_id: '',
  class: '',
  raisedBy: '',
  defectDetails: '',
  mmsgFc: '',
  ata: '',
  sdr: false,
  actionDetails: '',
  ddChecked: false,
  ddAction: '',
  ddType: '',
  ddNo: '',
  melCdlRef: '',
  cat: '',
  indInspChecked: false,
  componentRows: [{ partNo: '', serialOn: '', partOff: '', serialOff: '', grn: '' }],
  shortSignAuthId: '',
  shortSignAuthName: '',
  actionAuthId: '',
  actionAuthName: '',
  attemptedAuth: false,
  raisedByValid: false,
  date: '',
  authenticated: false,
  ddDate1: '',
  ddSign1: '',
  ddAuth1: '',
};

// Function to increment type_no (e.g., DEF-00002 -> DEF-00003)
const incrementTypeNo = (lastTypeNo: string): string => {
  if (!lastTypeNo || !lastTypeNo.startsWith('DEF-')) {
    return 'DEF-00001'; // Default if no valid type_no found
  }
  const numericPart = parseInt(lastTypeNo.replace('DEF-', ''), 10);
  if (isNaN(numericPart)) {
    return 'DEF-00001'; // Fallback if parsing fails
  }
  return `DEF-${String(numericPart + 1).padStart(5, '0')}`; // e.g., DEF-00003
};

// Fetch the latest type_no from deferrals
const fetchLatestTypeNo = async (): Promise<string> => {
  try {
    const res = await fetch(`${API_BASE}/deferrals`);
    if (!res.ok) throw new Error('Failed to fetch deferrals');
    const deferrals = await res.json();
    // Find the highest type_no
    const latestDeferral = deferrals
      .filter((d: any) => d.entries[0]?.defect_reference?.type_no)
      .sort((a: any, b: any) =>
        b.entries[0].defect_reference.type_no.localeCompare(a.entries[0].defect_reference.type_no)
      )[0];
    return latestDeferral?.entries[0]?.defect_reference?.type_no || 'DEF-00000';
  } catch (error) {
    console.error('❌ Error fetching deferrals:', error);
    return 'DEF-00000'; // Fallback
  }
};

// Normalize ddType to backend format (e.g., "Major (M)" -> "M")
const normalizeDdType = (ddType: string): string => {
  if (ddType === 'Major (M)') return 'M';
  if (ddType === 'Minor (N)') return 'N';
  return ddType || 'N'; // Default to 'N' if empty
};

// Normalize cat to backend format (e.g., "Cat A" -> "A")
const normalizeMelCat = (cat: string): string => {
  if (cat.startsWith('Cat ')) return cat.replace('Cat ', '');
  return cat || ''; // Return as-is if not prefixed with "Cat "
};

export default function LogSection({
  logEntries,
  setLogEntries,
  descriptionErrors,
  setDescriptionErrors,
  showError,
  setShowError,
  openAuthModal,
}: LogSectionProps) {
  const router = useRouter();
  const [logPageNo, setLogPageNo] = useState<string>(''); // Initial default, will be updated
  const [isFetchingPageNo, setIsFetchingPageNo] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchingDdIndices, setFetchingDdIndices] = useState<number[]>([]);

  // Fetch existing logs to determine the next log page number
  const fetchLogs = async () => {
    setIsFetchingPageNo(true);
    try {
      const res = await fetch(`${API_BASE}/logs`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        // Extract logPageNo from each log
        const logPageNumbers = data.map((log: { logPageNo: string }) => log.logPageNo);
        // Generate the next log page number
        const nextLogPageNo = generateNextLogPageNo(logPageNumbers);
        setLogPageNo(nextLogPageNo);
      } else {
        console.error('Failed to fetch logs:', data.error);
      }
    } catch (err: any) {
      console.error('Error fetching logs:', err.message);
    } finally {
      setIsFetchingPageNo(false);
    }
  };

  // Generate the next log page number based on existing ones
  const generateNextLogPageNo = (existingPageNos: string[]): string => {
    if (!existingPageNos || existingPageNos.length === 0) {
      return 'LOG-00001'; // Default if no logs exist
    }

    // Extract numeric parts and find the maximum
    const numbers = existingPageNos
      .map((pageNo) => {
        const match = pageNo.match(/^LOG-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((num) => !isNaN(num));

    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNumber = maxNumber + 1;
    // Format as LOG-XXXXX (e.g., LOG-00002)
    return `LOG-${nextNumber.toString().padStart(5, '0')}`;
  };

  // Fetch logs when the component mounts
  useEffect(() => {
    fetchLogs();
  }, []);

  // Handle input changes, including DD checkbox logic
  const handleLogInputChange = async (index: number, field: keyof LogEntry, value: string | boolean) => {
    const updatedEntries = [...logEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };

    // If DD checkbox is checked, fetch and increment type_no
    if (field === 'ddChecked' && value === true) {
      setFetchingDdIndices((prev) => [...prev, index]);
      try {
        const lastTypeNo = await fetchLatestTypeNo();
        const newTypeNo = incrementTypeNo(lastTypeNo);
        updatedEntries[index].ddNo = newTypeNo;
      } finally {
        setFetchingDdIndices((prev) => prev.filter((i) => i !== index));
      }
    } else if (field === 'ddChecked' && value === false) {
      // Clear ddNo when unchecking DD
      updatedEntries[index].ddNo = '';
    }

    setLogEntries(updatedEntries);
  };

  const handleSave = async () => {
    // Validate required fields
    const errors: string[] = [];
    logEntries.forEach((entry, index) => {
      if (!entry.raisedBy || !entry.actionDetails) {
        errors[index] = 'Raised By and Action Details are required';
      } else {
        errors[index] = '';
      }
    });
    setDescriptionErrors(errors);

    if (errors.some((err) => err !== '')) {
      setShowError(true);
      return;
    }

    setIsSaving(true);

    // Prepare payload with normalized fields
    const payload = {
      logPageNo,
      logEntries: logEntries.map((entry) => ({
        id: entry.id || undefined, // Use undefined for new entries to let backend generate ID
        class: entry.class,
        raisedBy: entry.raisedBy,
        defectDetails: entry.defectDetails,
        actionDetails: entry.actionDetails,
        ddChecked: entry.ddChecked,
        ddAction: entry.ddAction,
        ddType: normalizeDdType(entry.ddType),
        ddNo: entry.ddNo,
        melCdlRef: entry.melCdlRef,
        cat: normalizeMelCat(entry.cat),
        indInspChecked: entry.indInspChecked,
        sdr: entry.sdr,
        mmsgFc: entry.mmsgFc,
        ata: entry.ata,
        components: entry.componentRows,
      })),
      status: 1,
      createdBy: 'user-id', // Replace with actual user ID from auth context
    };

    // Send data to backend
    try {
      console.log('📤 Saving logs:', payload);
      const response = await fetch(`${API_BASE}/logs/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save logs');

      const data = await response.json();
      console.log('✅ Saved successfully:', data);

      // Update local state with new logItem IDs from the response
      if (data.savedLogs) {
        const updatedEntries = logEntries.map((entry, index) => ({
          ...entry,
          id: data.savedLogs[index]?.logItemId || entry.id,
          displayNumber: entry.displayNumber || index + 1,
        }));
        setLogEntries(updatedEntries);
      }

      setShowError(false);
      alert('Logs saved successfully!');
      router.push('/logs');

      // Refresh log page number after saving
      await fetchLogs();
    } catch (error) {
      console.error('❌ Save error:', error);
      alert('Error saving logs. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const addNewLogEntry = () => {
    const newEntry = {
      ...initialLogEntry,
      id: 0,
      displayNumber: logEntries.length + 1,
      componentRows: [{ partNo: '', serialOn: '', partOff: '', serialOff: '', grn: '' }],
    };
    setLogEntries([...logEntries, newEntry]);
    setDescriptionErrors([...descriptionErrors, '']);
  };

  const removeLogEntry = (index: number) => {
    const updatedEntries = [...logEntries];
    updatedEntries.splice(index, 1);
    setLogEntries(updatedEntries);
    const updatedErrors = [...descriptionErrors];
    updatedErrors.splice(index, 1);
    setDescriptionErrors(updatedErrors);
  };

  const addComponentRow = (logIndex: number) => {
    const updatedEntries = [...logEntries];
    updatedEntries[logIndex].componentRows.push({ partNo: '', serialOn: '', partOff: '', serialOff: '', grn: '' });
    setLogEntries(updatedEntries);
  };

  const removeComponentRow = (logIndex: number, rowIndex: number) => {
    const updatedEntries = [...logEntries];
    updatedEntries[logIndex].componentRows.splice(rowIndex, 1);
    setLogEntries(updatedEntries);
  };

  const handleComponentRowChange = (
    logIndex: number,
    rowIndex: number,
    field: keyof ComponentRow,
    value: string
  ) => {
    const updatedEntries = [...logEntries];
    updatedEntries[logIndex].componentRows[rowIndex][field] = value;
    setLogEntries(updatedEntries);
  };

  const handleAuth = (index: number, date: string) => {
    setLogEntries((prev) => {
      const updated = [...prev];
      updated[index].authenticated = true;
      updated[index].date = date;
      return updated;
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center">
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow w-full max-w-[1200px] flex flex-col">
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 border-b-2 border-[#004051] pb-2 pr-4 bg-white">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#004051] uppercase">
              Defect & Action Log
            </h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800 uppercase">
                  LOG PAGE NUMBER:
                </span>
                {isFetchingPageNo ? (
                  <span className="text-sm font-semibold text-[#004051] bg-gray-100 border border-[#004051]/30 px-3 py-1 rounded-md shadow-sm uppercase animate-pulse">
                    Loading...
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-[#004051] bg-gray-100 border border-[#004051]/30 px-3 py-1 rounded-md shadow-sm uppercase">
                    {logPageNo}
                  </span>
                )}
              </div>

              <button
                className="bg-[#06b6d4] flex items-center gap-2 text-white font-semibold px-4 py-1 rounded-md shadow-sm hover:bg-[#003340] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Previous
              </button>
              <button
                className="bg-[#06b6d4] flex items-center gap-2 text-white font-semibold px-4 py-1 rounded-md shadow-sm hover:bg-[#003340] transition-colors"
              >
                Next
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
              <button
                className="text-white font-semibold px-4 py-1 rounded-md shadow-sm hover:bg-[#003340] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ backgroundColor: '#004051' }}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable log entries */}
        <div className="overflow-y-auto max-h-[600px] p-4 space-y-6">
          {logEntries.map((entry, index) => {
            const isFullyAuthorized = entry.shortSignAuthId && entry.actionAuthId;
            const isFetchingDd = fetchingDdIndices.includes(index);
            return (
              <div
                key={`log-entry-${index}`}
                className={`border border-gray-300 rounded-lg mb-6 p-4 sm:p-6 shadow-sm space-y-6 ${isFullyAuthorized ? 'bg-[#E0F7FA]' : 'bg-gray-50'}`}
              >
                <div className="flex flex-col gap-4 border-b border-gray-200 pb-4">
                  <div className="flex flex-wrap md:flex-nowrap items-start gap-4">
                    <div className="flex flex-col flex-1 gap-4">
                      <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
                        <div className="flex flex-row items-center gap-2 w-full sm:w-[350px] max-w-[350px]">
                          <h1 className="text-xl font-bold text-[#004051] w-[15px]">
                            {entry.displayNumber || index + 1}.
                          </h1>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-[320px]">
                            <label className="text-sm font-medium text-gray-700 w-[60px] min-w-[60px]">CLASS:</label>
                            <div className="flex flex-col w-full sm:w-[350px] max-w-[350px]">
                              <select
                                className={`border ${entry.class && !/^(L|P|LI)$/i.test(entry.class) ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-base focus:ring-2 focus:ring-[#004051]`}
                                value={entry.class}
                                onChange={(e) => handleLogInputChange(index, 'class', e.target.value)}
                                disabled={(Boolean(entry.authenticated) || isFullyAuthorized) as boolean}
                              >
                                <option value="">Select Class</option>
                                <option value="L">Line-based (L)</option>
                                <option value="P">PIREP (P)</option>
                                <option value="LI">Info Only (I)</option>
                              </select>
                              {entry.class && !/^(L|P|LI)$/i.test(entry.class) && (
                                <p className="text-red-500 text-xs mt-1">Must be L, P, or LI</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-0 w-full md:w-[350px]">
                          <label className={`text-sm font-medium ${!entry.raisedBy && showError ? 'text-red-500' : 'text-gray-600'} w-[120px] min-w-[80px]`}>
                            RAISED BY:
                          </label>
                          <div className="flex flex-col w-[300px]">
                            <input
                              type="text"
                              className={`w-full border border-gray-300 rounded px-4 py-2 text-base focus:ring-2 focus:ring-[#004051] ${!entry.raisedBy && showError ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder="Auth ID / (Staff ID)"
                              value={entry.raisedBy}
                              onChange={(e) => handleLogInputChange(index, 'raisedBy', e.target.value)}
                              disabled={(Boolean(entry.authenticated) || isFullyAuthorized) as boolean}
                            />
                            {!entry.raisedBy && showError && (
                              <span className="text-red-500 text-xs mt-1">Raised by is required</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full mt-2">
                    <label className="text-sm font-medium text-gray-600">DEFECT DETAILS:</label>
                    <textarea
                      placeholder="Details..."
                      rows={3}
                      className={`w-full border ${entry.defectDetails && !/.+/.test(entry.defectDetails) ? 'border-red-500' : 'border-gray-300'} rounded px-4 py-2 text-base focus:ring-2 focus:ring-[#004051] resize-none overflow-hidden mt-2`}
                      value={entry.defectDetails}
                      onChange={(e) => {
                        handleLogInputChange(index, 'defectDetails', e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      disabled={!!isFullyAuthorized}
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row flex-wrap md:flex-nowrap items-start gap-4 border-b border-gray-200 pb-4">
                  <div className="flex flex-wrap md:flex-nowrap gap-4 flex-1 items-end">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-[280px]">
                      <label className="text-sm font-medium text-gray-700 w-[40px] min-w-[40px]">ATA:</label>
                      <div className="flex flex-col w-full md:w-[200px]">
                        <input
                          type="text"
                          placeholder="Enter ATA code..."
                          className="w-full border border-gray-300 rounded px-4 py-2 text-base focus:ring-2 focus:ring-[#004051]"
                          value={entry.ata}
                          onChange={(e) => handleLogInputChange(index, 'ata', e.target.value)}
                          disabled={!!isFullyAuthorized}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-[320px]">
                      <label className="text-sm font-medium text-gray-700 w-[80px] min-w-[80px]">MMSG / FC:</label>
                      <div className="flex flex-col w-full md:w-[200px]">
                        <input
                          type="text"
                          placeholder="Enter MMSG / FC..."
                          className="w-full border border-gray-300 rounded px-4 py-2 text-base focus:ring-2 focus:ring-[#004051]"
                          value={entry.mmsgFc}
                          onChange={(e) => handleLogInputChange(index, 'mmsgFc', e.target.value)}
                          disabled={!!isFullyAuthorized}
                        />
                      </div>
                    </div>
                    <div className="flex flex-row flex-nowrap items-center gap-3 w-full overflow-x-auto px-2">
                      <div className="flex items-center gap-2 py-2 min-w-[80px]">
                        <input
                          type="checkbox"
                          className="h-5 w-5 border border-gray-300 rounded focus:ring-2 focus:ring-[#004051]"
                          checked={entry.sdr}
                          onChange={(e) => handleLogInputChange(index, 'sdr', e.target.checked)}
                          disabled={!!isFullyAuthorized}
                        />
                        <label className="text-sm font-medium text-gray-600">SDR</label>
                      </div>
                      <div className="flex items-center gap-2 py-2 min-w-[80px]">
                        <input
                          type="checkbox"
                          checked={entry.ddChecked}
                          onChange={(e) => handleLogInputChange(index, 'ddChecked', e.target.checked)}
                          className="h-5 w-5 border border-gray-300 rounded focus:ring-2 focus:ring-[#004051]"
                          disabled={!!isFullyAuthorized || isFetchingDd}
                        />
                        <label className="text-sm font-medium text-gray-600">DD</label>
                      </div>
                      <div className="flex items-center gap-2 py-2 min-w-[80px]">
                        <input
                          type="checkbox"
                          checked={entry.indInspChecked}
                          onChange={(e) => handleLogInputChange(index, 'indInspChecked', e.target.checked)}
                          className="h-5 w-5 border border-gray-300 rounded focus:ring-2 focus:ring-[#004051]"
                          disabled={!!isFullyAuthorized}
                        />
                        <label className="text-sm font-medium text-gray-600">IND INSP</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full items-start">
                  <div className="flex-1 min-w-[280px]">
                    <label className="text-sm font-medium text-gray-600">ACTION DETAILS:</label>
                    <textarea
                      placeholder="Details..."
                      rows={3}
                      className={`w-full border ${
                        entry.actionDetails && !/.+/.test(entry.actionDetails) ? 'border-red-500' : 'border-gray-300'
                      } rounded px-4 py-2 text-base focus:ring-2 focus:ring-[#004051] resize-none overflow-hidden mt-2`}
                      value={entry.actionDetails}
                      onChange={(e) => {
                        handleLogInputChange(index, 'actionDetails', e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                        if (descriptionErrors[index]) {
                          const updatedErrors = [...descriptionErrors];
                          updatedErrors[index] = '';
                          setDescriptionErrors(updatedErrors);
                        }
                      }}
                      disabled={!!isFullyAuthorized}
                    />
                    {descriptionErrors[index] && (
                      <p className="text-red-600 text-sm mt-1">{descriptionErrors[index]}</p>
                    )}
                    {entry.shortSignAuthId && (
                      <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center flex-wrap gap-x-4 gap-y-2 text-sm">
                        <div className="font-medium text-gray-700 w-full md:w-[250px]">
                          SHORT SIGN AUTH ID: <span className="font-medium text-gray-800">{entry.shortSignAuthId}</span>
                        </div>
                        <div className="font-medium text-gray-700 w-full md:w-[250px]">
                          SHORT SIGN AUTH NAME: <span className="font-medium text-gray-800">{entry.shortSignAuthName}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-2 min-w-[160px] pt-[30px]">
                    <div className="flex flex-row flex-wrap items-center gap-2 w-full overflow-x-auto px-2">
                      {!entry.shortSignAuthId ? (
                        <button
                          type="button"
                          className={`bg-[#004051] text-white px-4 py-2 rounded-md text-sm ${isFullyAuthorized ? 'opacity-50 cursor-not-allowed' : ''} min-w-[120px]`}
                          onClick={() => {
                            if (!entry.actionDetails || entry.actionDetails.trim() === '') {
                              const updatedErrors = [...descriptionErrors];
                              updatedErrors[index] = 'Action Details are required';
                              setDescriptionErrors(updatedErrors);
                              return;
                            }
                            openAuthModal('Short Sign Auth', index);
                          }}
                          disabled={!!isFullyAuthorized}
                        >
                          Short Sign
                        </button>
                      ) : ''}
                      {!entry.actionAuthId ? (
                        <button
                          type="button"
                          className={`bg-[#004051] text-white px-4 py-2 rounded-md text-sm ${!entry.shortSignAuthId || isFullyAuthorized ? 'opacity-50 cursor-not-allowed' : ''} min-w-[120px]`}
                          onClick={() => {
                            if (!entry.actionDetails || entry.actionDetails.trim() === '') {
                              const updatedErrors = [...descriptionErrors];
                              updatedErrors[index] = 'Action Details are required';
                              setDescriptionErrors(updatedErrors);
                              return;
                            }
                            openAuthModal('Action Auth', index);
                          }}
                          disabled={(!entry.shortSignAuthId || isFullyAuthorized) as boolean}
                        >
                          Auth
                        </button>
                      ) : (
                        <div className="flex flex-row flex-wrap items-center gap-2 w-full min-w-[120px]">
                          <div className="font-medium text-gray-700 min-w-[100px]">
                            AUTH ID: <span className="font-medium text-gray-800">{entry.actionAuthId}</span>
                          </div>
                          <div className="font-medium text-gray-700 min-w-[100px]">
                            AUTH NAME: <span className="font-medium text-gray-800">{entry.actionAuthName}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="border-b border-gray-300 mb-4"></div>
                {entry.ddChecked && (
                  <div className="flex flex-wrap gap-4 flex-1 justify-start items-end border-b border-gray-300 mb-4 pb-4">
                    {[
                      {
                        label: 'DD Action',
                        type: 'select',
                        name: 'ddAction',
                        options: ['Raised (R)', 'Worked (W)', 'Cleared (C)'],
                        value: entry.ddAction,
                        invalid: entry.ddAction && !['Raised', 'Worked', 'Cleared'].includes(entry.ddAction),
                        error: 'Select a valid DD Action',
                        placeholder: 'Action',
                      },
                      {
                        label: 'DD Type',
                        type: 'select',
                        name: 'ddType',
                        options: ['Major (M)', 'Minor (N)'],
                        value: entry.ddType,
                        invalid: entry.ddType && !['Major', 'Minor'].includes(entry.ddType),
                        error: 'Select a valid DD Type',
                        placeholder: 'Type',
                      },
                      {
                        label: 'No',
                        type: 'text',
                        name: 'ddNo',
                        value: entry.ddNo,
                        pattern: /^[A-Za-z0-9\-]+$/,
                        error: 'Invalid format',
                        placeholder: 'Type here...',
                      },
                      {
                        label: 'Mel / Cdl Ref',
                        type: 'text',
                        name: 'melCdlRef',
                        value: entry.melCdlRef,
                        pattern: /^[A-Za-z0-9\-\/]+$/,
                        error: 'Invalid format',
                        placeholder: 'Type here...',
                      },
                      {
                        label: 'Cat',
                        type: 'select',
                        name: 'cat',
                        options: ['Cat A', 'Cat B', 'Cat C', 'Cat D', 'Cat U'],
                        value: entry.cat,
                        invalid: entry.cat && !['Cat A', 'Cat B', 'Cat C', 'Cat D', 'Cat U'].includes(entry.cat),
                        error: 'Select a valid Category',
                        placeholder: 'Cat',
                      },
                    ].map((field, i) => (
                      <div
                        key={i}
                        className="flex flex-row items-center gap-2"
                        style={{ width: field.type === 'select' ? '195px' : '195px' }}
                      >
                        <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                          {field.label}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            className={`w-full border ${
                              field.invalid ? 'border-red-500' : 'border-gray-300'
                            } rounded px-2 py-2 text-sm focus:ring-2 focus:ring-[#004051]`}
                            value={field.value}
                            onChange={(e) =>
                              handleLogInputChange(
                                index,
                                field.name as keyof LogEntry,
                                e.target.value
                              )
                            }
                            disabled={!!isFullyAuthorized}
                          >
                            <option value="">Choose {field.label}</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="relative w-full">
                            <input
                              type="text"
                              placeholder="Type here ..."
                              className={`w-full border ${
                                field.value && field.pattern && !field.pattern.test(field.value)
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              } rounded px-2 py-2 text-sm focus:ring-2 focus:ring-[#004051]`}
                              value={field.value}
                              onChange={(e) =>
                                handleLogInputChange(
                                  index,
                                  field.name as keyof LogEntry,
                                  e.target.value
                                )
                              }
                              disabled={!!isFullyAuthorized || field.name === 'ddNo' || (field.name === 'ddNo' && isFetchingDd)} // Disable ddNo input
                            />
                            {field.name === 'ddNo' && isFetchingDd && (
                              <div className="absolute right-2 top-2 animate-spin h-4 w-4 text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {entry.indInspChecked && (
                  <div className="flex flex-col space-y-4 flex-1 border-b border-gray-300 mb-4 pb-4">
                    <div className="flex items-center gap-4">
                      <h2 className="text-sm font-semibold text-gray-700 min-w-[40px]">1.A</h2>
                      <p className="text-sm text-gray-800 flex-1">
                        It is Certified that an independent inspection has been carried out for installation IAW XYZ and is satisfactory.
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <h2 className="text-sm font-semibold text-gray-700 min-w-[40px]">1.B</h2>
                      <p className="text-sm text-gray-800 flex-1">
                        It is Certified that an independent inspection has been carried out for functional check IAW XYZ and is satisfactory.
                      </p>
                    </div>
                  </div>
                )}
                <h2 style={{ margin: 10, padding: 0 }} className="text-md font-bold text-gray-700 py-0">
                  COMPONENTS:
                </h2>
                <div className="w-full flex flex-col md:flex-row items-start gap-4 mt-0" style={{ margin: 0, padding: 0 }}>
                  <div className="w-full overflow-x-auto">
                    <table className="table-auto border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-[#004051] text-white">
                          <th className="p-2 border border-gray-300">PART NO</th>
                          <th className="p-2 border border-gray-300">SERIAL ON</th>
                          <th className="p-2 border border-gray-300">PART OFF</th>
                          <th className="p-2 border border-gray-300">SERIAL OFF</th>
                          <th className="p-2 border border-gray-300">GRN</th>
                          <th className="p-2 border border-gray-300">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entry.componentRows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="bg-white hover:bg-gray-50">
                            <td className="p-2 border border-gray-300">
                              <input
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                                type="text"
                                placeholder="Type here..."
                                value={row.partNo}
                                onChange={(e) => handleComponentRowChange(index, rowIndex, 'partNo', e.target.value)}
                              />
                            </td>
                            <td className="p-2 border border-gray-300">
                              <input
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                                type="text"
                                placeholder="Type here..."
                                value={row.serialOn}
                                onChange={(e) => handleComponentRowChange(index, rowIndex, 'serialOn', e.target.value)}
                              />
                            </td>
                            <td className="p-2 border border-gray-300">
                              <input
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                                type="text"
                                placeholder="Type here..."
                                value={row.partOff}
                                onChange={(e) => handleComponentRowChange(index, rowIndex, 'partOff', e.target.value)}
                              />
                            </td>
                            <td className="p-2 border border-gray-300">
                              <input
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                                type="text"
                                placeholder="Type here..."
                                value={row.serialOff}
                                onChange={(e) => handleComponentRowChange(index, rowIndex, 'serialOff', e.target.value)}
                              />
                            </td>
                            <td className="p-2 border border-gray-300">
                              <input
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                                type="text"
                                placeholder="Type here..."
                                value={row.grn}
                                onChange={(e) => handleComponentRowChange(index, rowIndex, 'grn', e.target.value)}
                              />
                            </td>
                            <td className="p-2 border border-gray-300 text-center">
                              <button
                                type="button"
                                onClick={() => removeComponentRow(index, rowIndex)}
                                className="bg-red-600 text-white px-3 py-1 text-xs rounded-md hover:bg-red-700"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="pt-2 md:pt-2 md:min-w-[100px]">
                    <button
                      onClick={() => addComponentRow(index)}
                      type="button"
                      className="bg-[#004051] text-white text-sm font-medium py-1 px-3 mr-2 rounded shadow transition w-auto md:w-auto hover:bg-[#00363f]"
                    >
                      + Add New
                    </button>
                    <button
                      onClick={() => removeLogEntry(index)}
                      className={`bg-red-600 text-white px-3 py-1 text-sm rounded-md font-medium mt-2 ${isFullyAuthorized ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
                      disabled={!!isFullyAuthorized}
                    >
                      Remove Log
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex justify-center mb-4">
            <button
              onClick={addNewLogEntry}
              className={`bg-[#004051] text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-[#006172]`}
            >
              + Add New Log
            </button>
          </div>
          <div className="bg-[#f0fafa] border border-[#004051] rounded-lg p-3 shadow-sm mb-4">
            <h3 className="text-sm font-semibold text-[#004051] mb-1">📌 Note:</h3>
            <p className="text-md text-gray-800 leading-relaxed">
              Enter defect and action details accurately. Ensure all fields are completed as per aviation maintenance protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}