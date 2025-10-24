'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogEntry, ComponentRow } from '../types';

interface LogSectionProps {
  logEntries: LogEntry[];
  setLogEntries: React.Dispatch<React.SetStateAction<LogEntry[]>>;
  descriptionErrors: string[];
  setDescriptionErrors: React.Dispatch<React.SetStateAction<string[]>>;
  showError: boolean;
  setShowError: React.Dispatch<React.SetStateAction<boolean>>;
  openAuthModal: (type: string, index: number, onSuccess: (authData: { authId: string; authName: string }) => void) => void;
  currentLogId: string;
  isFetchingLogItems: boolean;
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
  cat: 'Cat A',
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
    return 'DEF-00001';
  }
  const numericPart = parseInt(lastTypeNo.replace('DEF-', ''), 10);
  if (isNaN(numericPart)) {
    return 'DEF-00001';
  }
  return `DEF-${String(numericPart + 1).padStart(5, '0')}`;
};

// Fetch the latest type_no from deferrals
const fetchLatestTypeNo = async (): Promise<string> => {
  try {
    const res = await fetch(`${API_BASE}/deferrals`);
    if (!res.ok) throw new Error('Failed to fetch deferrals');
    const deferrals = await res.json();
    const latestDeferral = deferrals
      .filter((d: any) => d?.ddNo)
      .sort((a: any, b: any) =>
        b.ddNo.localeCompare(a.ddNo)
      )[0];
    return latestDeferral?.ddNo || 'DEF-00000';
  } catch (error) {
    console.error('❌ Error fetching deferrals:', error);
    return 'DEF-00000';
  }
};

// Fetch all deferrals for dropdown
const fetchDeferrals = async () => {
  try {
    const res = await fetch(`${API_BASE}/deferrals`);
    if (!res.ok) throw new Error('Failed to fetch deferrals');
    const deferrals = await res.json();
    return deferrals.filter((d: any) => d?.ddNo);
  } catch (error) {
    console.error('❌ Error fetching deferrals:', error);
    return [];
  }
};

// Normalize ddType to backend format (e.g., "Major (M)" -> "M")
const normalizeDdType = (ddType: string): string => {
  if (ddType === 'Major (M)') return 'M';
  if (ddType === 'Minor (N)') return 'N';
  return ddType || 'N';
};

// Normalize cat to backend format (e.g., "Cat A" -> "A")
const normalizeMelCat = (cat: string): string => {
  if (cat.startsWith('Cat ')) return cat.replace('Cat ', '');
  return cat || 'A';
};

// Convert backend ddType to display format (e.g., "M" -> "Major (M)")
const displayDdType = (ddType: string): string => {
  if (ddType === 'M') return 'Major (M)';
  if (ddType === 'N') return 'Minor (N)';
  return ddType || '';
};

// Convert backend cat to display format (e.g., "A" -> "Cat A")
const displayMelCat = (cat: string): string => {
  if (['A', 'B', 'C', 'D', 'U'].includes(cat)) return `Cat ${cat}`;
  return cat || 'Cat A';
};

// Save or update a single log item
const saveLogItem = async (logId: string, entry: LogEntry, index: number) => {
  console.log('saveLogItem entry:', entry)
  if (!logId) {
    alert('No log selected. Please select a log first.');
    return null;
  }

  const payload = {
    logItem: {
      id: entry.updated_id || undefined,
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
      shortSignAuthId: entry.shortSignAuthId,
      shortSignAuthName: entry.shortSignAuthName,
      actionAuthId: entry.actionAuthId,
      actionAuthName: entry.actionAuthName,
    },
    createdBy: 'user-id',
  };
  console.log('🔍 Sending payload to API:', JSON.stringify(payload, null, 2));
  const method = 'POST';
  const url = `${API_BASE}/logs/${logId}/items`;
  
  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Failed to save log item');

    const data = await response.json();
    return data.savedLogItem;
  } catch (error) {
    console.error('❌ Save log item error:', error);
    alert('Error saving log item. Please try again.');
    return null;
  }
};

export default function LogSection({
  logEntries,
  setLogEntries,
  descriptionErrors,
  setDescriptionErrors,
  showError,
  setShowError,
  openAuthModal,
  currentLogId,
  isFetchingLogItems,
}: LogSectionProps) {
  const router = useRouter();
  const [fetchingDdIndices, setFetchingDdIndices] = useState<number[]>([]);
  const [deferrals, setDeferrals] = useState<any[]>([]);
  const [deferralErrors, setDeferralErrors] = useState<string[]>([]);
  const [isAuthorizing, setIsAuthorizing] = useState<{ index: number; type: string } | null>(null);
  const prevLogEntries = useRef<LogEntry[]>(logEntries);

  // Fetch deferrals on component mount
  useEffect(() => {
    async function loadDeferrals() {
      const fetchedDeferrals = await fetchDeferrals();
      setDeferrals(fetchedDeferrals);
      setDeferralErrors(new Array(logEntries.length).fill(''));
    }
    loadDeferrals();
  }, []);

  // Handle input changes
  const handleLogInputChange = async (index: number, field: keyof LogEntry, value: any) => {
    const updatedEntries = [...logEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };

    const updatedErrors = [...deferralErrors];
    updatedErrors[index] = '';
    setDeferralErrors(updatedErrors);

    if (field === 'ddAction') {
      updatedEntries[index].ddNo = '';
      updatedEntries[index].ddType = '';
      updatedEntries[index].melCdlRef = '';
      updatedEntries[index].cat = 'Cat A';

      if (value === 'Raised (R)') {
        setFetchingDdIndices((prev) => [...prev, index]);
        try {
          const latestTypeNo = await fetchLatestTypeNo();
          console.log(latestTypeNo,"latestTypeNo")
          const nextTypeNo = incrementTypeNo(latestTypeNo);
          updatedEntries[index].ddNo = nextTypeNo;
        } catch (error) {
          console.error('❌ Error fetching latest type_no:', error);
          updatedErrors[index] = 'Failed to generate deferral number';
          setDeferralErrors(updatedErrors);
        } finally {
          setFetchingDdIndices((prev) => prev.filter((i) => i !== index));
        }
      }
    }

    if (field === 'ddNo' && ['Worked (W)', 'Cleared (C)'].includes(updatedEntries[index].ddAction)) {
      setFetchingDdIndices((prev) => [...prev, index]);
      try {
        const selectedDeferral = deferrals.find(
          (d) => d.entries[0]?.defect_reference?.type_no === value
        );
        if (selectedDeferral) {
          const deferralData = selectedDeferral.entries[0]?.defect_reference || {};
          updatedEntries[index].ddType = displayDdType(deferralData.dd || '');
          updatedEntries[index].melCdlRef = deferralData.mel_cd_ref || '';
          updatedEntries[index].cat = displayMelCat(deferralData.mel_cat || '');
        } else {
          // updatedErrors[index] = 'Selected deferral not found';
          // setDeferralErrors(updatedErrors);
          updatedEntries[index].ddType = '';
          updatedEntries[index].melCdlRef = '';
          updatedEntries[index].cat = 'Cat A';
        }
      } catch (error) {
        console.error('❌ Error fetching deferral data:', error);
        updatedErrors[index] = 'Error fetching deferral data';
        setDeferralErrors(updatedErrors);
      } finally {
        setFetchingDdIndices((prev) => prev.filter((i) => i !== index));
      }
    }

    setLogEntries(updatedEntries);
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
    setDeferralErrors([...deferralErrors, '']);
  };

  const removeLogEntry = async (index: number) => {
    const entry = logEntries[index];
    if (entry.updated_id) {
      try {
        const response = await fetch(`${API_BASE}/logs/${currentLogId}/items/${entry.updated_id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to delete log item');
      } catch (error) {
        console.error('❌ Delete log item error:', error);
        alert('Error deleting log item. Please try again.');
        return;
      }
    }

    const updatedEntries = [...logEntries];
    updatedEntries.splice(index, 1);
    setLogEntries(updatedEntries.map((e, i) => ({ ...e, displayNumber: i + 1 })));
    const updatedErrors = [...descriptionErrors];
    updatedErrors.splice(index, 1);
    setDescriptionErrors(updatedErrors);
    const updatedDeferralErrors = [...deferralErrors];
    updatedDeferralErrors.splice(index, 1);
    setDeferralErrors(updatedDeferralErrors);
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

  const handleAuthClick = async (type: string, index: number) => {
    const entry = logEntries[index];

    // Validate actionDetails
    if (!entry.actionDetails || entry.actionDetails.trim() === '') {
      const updatedErrors = [...descriptionErrors];
      updatedErrors[index] = 'Action Details are required';
      setDescriptionErrors(updatedErrors);
      setShowError(true);
      return;
    }

    if (type === 'Action Auth' && !entry.shortSignAuthId) {
      alert('First short sign must be signed then authorized.');
      return;
    }

    // Set loading state
    setIsAuthorizing({ index, type });

    // Open auth modal with a callback to save the log item after authorization
    openAuthModal(type, index, async (authData) => {
      console.log(authData, "fetch authData");
      console.log(type, "fetch type");
      const updatedEntries = [...logEntries];
      const entry = updatedEntries[index];

      try {
        // Update authorization data
        if (type === 'Short Sign Auth') {
          updatedEntries[index] = {
            ...entry,
            shortSignAuthId: authData.authId,
            shortSignAuthName: authData.authName,
          };
          // Save the log item after Short Sign Auth
          console.log('Saving log item after Short Sign Auth');
          const savedItem = await saveLogItem(currentLogId, updatedEntries[index], index);
          if (savedItem) {
            updatedEntries[index] = {
              ...updatedEntries[index],
              updated_id: savedItem.id || updatedEntries[index].updated_id,
              displayNumber: savedItem.displayNumber || updatedEntries[index].displayNumber,
              ddNo: savedItem.ddNo || updatedEntries[index].ddNo,
            };
            alert(`Log item saved successfully with ID: ${savedItem.id}`);
          } else {
            alert('Failed to save log item after Short Sign Auth.');
          }
        } else if (type === 'Action Auth') {
          updatedEntries[index] = {
            ...entry,
            actionAuthId: authData.authId,
            actionAuthName: authData.authName,
          };
          // Update the log item after Action Auth
          console.log('Updating log item after Action Auth');
          const savedItem = await saveLogItem(currentLogId, updatedEntries[index], index);
          if (savedItem) {
            updatedEntries[index] = {
              ...updatedEntries[index],
              updated_id: savedItem.id || updatedEntries[index].updated_id,
              displayNumber: savedItem.displayNumber || updatedEntries[index].displayNumber,
              ddNo: savedItem.ddNo || updatedEntries[index].ddNo,
            };
            alert(`Log item updated successfully with ID: ${savedItem.id}`);
          } else {
            alert('Failed to update log item after Action Auth.');
          }
        }
        console.log(updatedEntries, "updatedEntries");
        setLogEntries(updatedEntries);
      } catch (error) {
        console.error('❌ Error during authorization save:', error);
        alert('An error occurred while saving the log item.');
      } finally {
        // Clear loading state
        setIsAuthorizing(null);
      }
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center">
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow w-full max-w-[1200px] flex flex-col">
        <div className="p-4 space-y-6">
          {isFetchingLogItems ? (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <svg
                className="animate-spin h-10 w-10 text-[#004051] mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-gray-600 text-lg">Loading log items...</p>
            </div>
          ) : (
            <>
              {logEntries.map((entry, index) => {
                const isFullyAuthorized = !!entry.shortSignAuthId && !!entry.actionAuthId;
                const isFetchingDd = fetchingDdIndices.includes(index);
                const isDdActionRaised = entry.ddAction === 'Raised (R)';
                const isDdActionWorkedOrCleared = ['Worked (W)', 'Cleared (C)'].includes(entry.ddAction);

                return (
                  <div
                    key={`log-entry-${entry.updated_id || index}`}
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
                                    className={`border ${
                                      isFullyAuthorized ? 'bg-[#E0F7FA]' : 'bg-gray-50'
                                    } ${
                                      entry.class && !/^(L|P|LI)$/i.test(entry.class)
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                    } rounded px-3 py-2 text-base focus:ring-2 focus:ring-[#004051]`}
                                    value={entry.class}
                                    onChange={(e) => handleLogInputChange(index, 'class', e.target.value)}
                                    disabled={isFullyAuthorized} // Disable when fully authorized
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
                                  className={`w-full border ${!entry.raisedBy && showError ? 'border-red-500' : 'border-gray-300'} rounded px-4 py-2 text-base focus:ring-2 focus:ring-[#004051]`}
                                  placeholder="Auth ID / (Staff ID)"
                                  value={entry.raisedBy}
                                  onChange={(e) => handleLogInputChange(index, 'raisedBy', e.target.value)}
                                  disabled={isFullyAuthorized} // Disable when fully authorized
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
                          disabled={isFullyAuthorized} // Disable when fully authorized
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
                              disabled={isFullyAuthorized} // Disable when fully authorized
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
                              disabled={isFullyAuthorized} // Disable when fully authorized
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
                              disabled={isFullyAuthorized} // Disable when fully authorized
                            />
                            <label className="text-sm font-medium text-gray-600">SDR</label>
                          </div>
                          <div className="flex items-center gap-2 py-2 min-w-[80px]">
                            <input
                              type="checkbox"
                              checked={entry.ddChecked}
                              onChange={(e) => handleLogInputChange(index, 'ddChecked', e.target.checked)}
                              className="h-5 w-5 border border-gray-300 rounded focus:ring-2 focus:ring-[#004051]"
                              disabled={isFullyAuthorized} // Disable when fully authorized
                            />
                            <label className="text-sm font-medium text-gray-600">DD</label>
                          </div>
                          <div className="flex items-center gap-2 py-2 min-w-[80px]">
                            <input
                              type="checkbox"
                              checked={entry.indInspChecked}
                              onChange={(e) => handleLogInputChange(index, 'indInspChecked', e.target.checked)}
                              className="h-5 w-5 border border-gray-300 rounded focus:ring-2 focus:ring-[#004051]"
                              disabled={isFullyAuthorized} // Disable when fully authorized
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
                          disabled={isFullyAuthorized} // Disable when fully authorized
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
                          {!entry.shortSignAuthId && (
                            <button
                              type="button"
                              className={`bg-[#004051] text-white px-4 py-2 rounded-md text-sm ${isFullyAuthorized || (isAuthorizing?.index === index && isAuthorizing?.type === 'Short Sign Auth') ? 'opacity-50 cursor-not-allowed' : ''} min-w-[120px] flex items-center justify-center`}
                              onClick={() => handleAuthClick('Short Sign Auth', index)}
                              disabled={isFullyAuthorized || (isAuthorizing?.index === index && isAuthorizing?.type === 'Short Sign Auth')} // Disable button when fully authorized
                            >
                              {isAuthorizing?.index === index && isAuthorizing?.type === 'Short Sign Auth' ? (
                                <>
                                  <svg
                                    className="animate-spin h-5 w-5 mr-2 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Authorizing...
                                </>
                              ) : (
                                'Short Sign'
                              )}
                            </button>
                          )}
                          {!entry.actionAuthId && (
                            <button
                              type="button"
                              className={`bg-[#004051] text-white px-4 py-2 rounded-md text-sm min-w-[120px] flex items-center justify-center`}
                              onClick={() => handleAuthClick('Action Auth', index)}
                              disabled={isFullyAuthorized || (isAuthorizing?.index === index && isAuthorizing?.type === 'Action Auth')} // Disable button when fully authorized
                            >
                              {isAuthorizing?.index === index && isAuthorizing?.type === 'Action Auth' ? (
                                <>
                                  <svg
                                    className="animate-spin h-5 w-5 mr-2 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Authorizing...
                                </>
                              ) : (
                                'Auth'
                              )}
                            </button>
                          )}
                          {entry.actionAuthId && (
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
                            invalid: entry.ddAction && !['Raised (R)', 'Worked (W)', 'Cleared (C)'].includes(entry.ddAction),
                            error: 'Select a valid DD Action',
                            placeholder: 'Action',
                          },
                          {
                            label: 'DD Type',
                            type: 'select',
                            name: 'ddType',
                            options: ['Major (M)', 'Minor (N)'],
                            value: displayDdType(entry.ddType),
                            placeholder: 'Type',
                          },
                          {
                            label: 'No',
                            type: isDdActionRaised ? 'text' : isDdActionWorkedOrCleared ? 'select' : 'text',
                            name: 'ddNo',
                            value: entry.ddNo,
                            options: isDdActionWorkedOrCleared ? deferrals.map((d) => d?.ddNo || '') : [],
                            pattern: /^[A-Za-z0-9\-]+$/,
                            error: 'Invalid format',
                            placeholder: isDdActionWorkedOrCleared ? 'Select deferral...' : 'Type here...',
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
                            value: displayMelCat(entry.cat),
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
                                value={field.value ?? ''}
                                onChange={(e) =>
                                  handleLogInputChange(
                                    index,
                                    field.name as keyof LogEntry,
                                    e.target.value
                                  )
                                }
                                disabled={isFullyAuthorized} // Disable when fully authorized
                              >
                                <option value="">{field.placeholder || `Choose ${field.label}`}</option>
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
                                  placeholder={field.placeholder || 'Type here...'}
                                  className={`w-full border ${
                                    field.value && field.pattern && !field.pattern.test(field.value)
                                      ? 'border-red-500'
                                      : 'border-gray-300'
                                  } rounded px-2 py-2 text-sm focus:ring-2 focus:ring-[#004051]`}
                                  value={field.value ?? ''}
                                  onChange={(e) =>
                                    handleLogInputChange(
                                      index,
                                      field.name as keyof LogEntry,
                                      e.target.value
                                    )
                                  }
                                  disabled={isFullyAuthorized} // Disable when fully authorized
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
                            {field.invalid && <p className="text-red-500 text-xs mt-1 absolute">{field.error}</p>}
                            {deferralErrors[index] && field.name === 'ddNo' && (
                              <p className="text-red-500 text-xs mt-1 absolute">{deferralErrors[index]}</p>
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
                                    disabled={isFullyAuthorized} // Disable when fully authorized
                                  />
                                </td>
                                <td className="p-2 border border-gray-300">
                                  <input
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                                    type="text"
                                    placeholder="Type here..."
                                    value={row.serialOn}
                                    onChange={(e) => handleComponentRowChange(index, rowIndex, 'serialOn', e.target.value)}
                                    disabled={isFullyAuthorized} // Disable when fully authorized
                                  />
                                </td>
                                <td className="p-2 border border-gray-300">
                                  <input
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                                    type="text"
                                    placeholder="Type here..."
                                    value={row.partOff}
                                    onChange={(e) => handleComponentRowChange(index, rowIndex, 'partOff', e.target.value)}
                                    disabled={isFullyAuthorized} // Disable when fully authorized
                                  />
                                </td>
                                <td className="p-2 border border-gray-300">
                                  <input
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                                    type="text"
                                    placeholder="Type here..."
                                    value={row.serialOff}
                                    onChange={(e) => handleComponentRowChange(index, rowIndex, 'serialOff', e.target.value)}
                                    disabled={isFullyAuthorized} // Disable when fully authorized
                                  />
                                </td>
                                <td className="p-2 border border-gray-300">
                                  <input
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                                    type="text"
                                    placeholder="Type here..."
                                    value={row.grn}
                                    onChange={(e) => handleComponentRowChange(index, rowIndex, 'grn', e.target.value)}
                                    disabled={isFullyAuthorized} // Disable when fully authorized
                                  />
                                </td>
                                <td className="p-2 border border-gray-300 text-center">
                                  <button
                                    type="button"
                                    onClick={() => removeComponentRow(index, rowIndex)}
                                    className="bg-red-600 text-white px-3 py-1 text-xs rounded-md hover:bg-red-700"
                                    disabled={isFullyAuthorized} // Disable when fully authorized
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
                          className="bg-[#004051] w-30 text-white text-sm font-medium py-2 px-3 mr-2 rounded shadow transition hover:bg-[#00363f]"
                          disabled={isFullyAuthorized} // Disable when fully authorized
                        >
                          + Add New
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="bg-[#f0fafa] border border-[#004051] rounded-lg p-3 shadow-sm mb-4">
                <h3 className="text-sm font-semibold text-[#004051] mb-1">📌 Note:</h3>
                <p className="text-md text-gray-800 leading-relaxed">
                  Enter defect and action details accurately. Ensure all fields are completed as per aviation maintenance protocols.
                </p>
              </div>
              {/* <div className="flex justify-end">
                <button
                  onClick={addNewLogEntry}
                  type="button"
                  className="bg-[#004051] text-white text-sm font-medium py-2 px-4 rounded shadow transition hover:bg-[#00363f]"
                >
                  + Add New Log Entry
                </button>
              </div> */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}