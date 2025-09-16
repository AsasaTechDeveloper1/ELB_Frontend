'use client';

import { useParams } from 'next/navigation';
import { LogEntry, ComponentRow } from '../../types';

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

export default function LogSection({
  logEntries,
  setLogEntries,
  descriptionErrors,
  setDescriptionErrors,
  showError,
  setShowError,
  openAuthModal,
}: LogSectionProps) {
  const params = useParams();
  const logId = params?.id as string;

  // Fetch the latest type_no from deferrals
  const fetchLatestTypeNo = async (): Promise<string> => {
    try {
      const res = await fetch(`${API_BASE}/deferrals`);
      if (!res.ok) throw new Error('Failed to fetch deferrals');
      const deferrals = await res.json();
      // Find the highest type_no
      const latestDeferral = deferrals
        .filter((d: any) => d.defect_reference?.type_no)
        .sort((a: any, b: any) =>
          b.defect_reference.type_no.localeCompare(a.defect_reference.type_no)
        )[0];
      return latestDeferral?.defect_reference?.type_no || 'DEF-00000';
    } catch (error) {
      console.error('❌ Error fetching deferrals:', error);
      return 'DEF-00000'; // Fallback
    }
  };

  // Handle input changes, including DD checkbox logic
  const handleLogInputChange = async (index: number, field: keyof LogEntry, value: string | boolean) => {
    const updatedEntries = [...logEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };

    // If DD checkbox is checked, fetch and increment type_no
    if (field === 'ddChecked' && value === true) {
      const lastTypeNo = await fetchLatestTypeNo();
      const newTypeNo = incrementTypeNo(lastTypeNo);
      updatedEntries[index].ddNo = newTypeNo;
    } else if (field === 'ddChecked' && value === false) {
      // Clear ddNo when unchecking DD
      updatedEntries[index].ddNo = '';
    }

    setLogEntries(updatedEntries);
  };

  // Update existing log
  const handleUpdate = async () => {
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

    try {
      console.log('📤 Updating logs:', logEntries);

      // Prepare payload for the backend
      const payload = {
        logEntries: logEntries.map((entry) => ({
          ...entry,
          components: entry.componentRows, // Map componentRows to components for backend
        })),
        status: 1,
        updatedBy: 'user-id', // Replace with actual user ID from auth context
      };

      const res = await fetch(`${API_BASE}/logs/${logId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Failed to update log ${logId}`);
      const data = await res.json();
      console.log(`✅ Updated log ${logId}:`, data);

      // Update local state with new logItem IDs from the response
      if (data.newLogItems) {
        const updatedEntries = logEntries.map((entry, index) => ({
          ...entry,
          id: data.newLogItems[index]?.id || entry.id,
        }));
        setLogEntries(updatedEntries);
      }

      // Create deferral entries for logs with ddChecked
      for (const entry of logEntries) {
        if (entry.ddChecked && entry.ddNo) {
          const deferralPayload = {
            entries: [{
              defect_reference: {
                date: new Date().toISOString().split('T')[0], // Current date
                dd: entry.ddType || 'N',
                log_item_no: entry.id || '',
                log_page: 'LOG-00001',
                mel_cat: entry.cat || '',
                mel_cd_ref: entry.melCdlRef || '',
                type_no: entry.ddNo,
              },
              description: entry.defectDetails || 'No description provided',
              clear_reference: {},
              enteredSign: '',
              enteredAuth: '',
              enteredAuthName: '',
              enteredDate: '',
              expDate: '',
              clearedSign: '',
              clearedAuth: '',
              clearedAuthName: '',
              clearedDate: '',
              deferral: true,
            }],
          };

          const deferralRes = await fetch(`${API_BASE}/deferrals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deferralPayload),
          });

          if (!deferralRes.ok) {
            console.error('❌ Failed to create deferral for ddNo:', entry.ddNo);
          } else {
            console.log(`✅ Created deferral for ddNo: ${entry.ddNo}`);
          }
        }
      }

      alert('Logs updated successfully!');
      setShowError(false);
    } catch (error) {
      console.error('❌ Update error:', error);
      alert('Error updating logs. Please try again.');
    }
  };

  // Add / remove log
  const addNewLogEntry = () => {
    setLogEntries([...logEntries, { ...initialLogEntry, id: 0 }]);
  };

  const removeLogEntry = (index: number) => {
    const updatedEntries = [...logEntries];
    updatedEntries.splice(index, 1);
    setLogEntries(updatedEntries);
  };

  // Component rows
  const addComponentRow = (logIndex: number) => {
    const updatedEntries = [...logEntries];
    updatedEntries[logIndex].componentRows.push({
      partNo: '',
      serialOn: '',
      partOff: '',
      serialOff: '',
      grn: '',
    });
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
                <span className="text-sm font-semibold text-[#004051] bg-gray-100 border border-[#004051]/30 px-3 py-1 rounded-md shadow-sm uppercase">
                  LOG-00001
                </span>
              </div>

              <button
                className="text-white font-semibold px-4 py-1 rounded-md shadow-sm hover:bg-[#003340] transition-colors"
                style={{ backgroundColor: '#004051' }}
                onClick={handleUpdate}
              >
                Update
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable log entries */}
        <div className="overflow-y-auto max-h-[600px] p-4 space-y-6">
          {logEntries.map((entry, index) => {
            const isFullyAuthorized = entry.shortSignAuthId && entry.actionAuthId;
            return (
              <div
                key={`log-entry-${index}`}
                className={`border border-gray-300 rounded-lg mb-6 p-4 sm:p-6 shadow-sm space-y-6 ${
                  isFullyAuthorized ? 'bg-[#E0F7FA]' : 'bg-gray-50'
                }`}
              >
                <div className="flex flex-col gap-4 border-b border-gray-200 pb-4">
                  <div className="flex flex-wrap md:flex-nowrap items-start gap-4">
                    <div className="flex flex-col flex-1 gap-4">
                      <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
                        <div className="flex flex-row items-center gap-2 w-full sm:w-[350px] max-w-[350px]">
                          <h1 className="text-xl font-bold text-[#004051] w-[15px]">
                            {index + 1}.
                          </h1>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-[320px]">
                            <label className="text-sm font-medium text-gray-700 w-[60px] min-w-[60px]">
                              CLASS:
                            </label>
                            <div className="flex flex-col w-full sm:w-[350px] max-w-[350px]">
                              <select
                                className="border p-2 rounded"
                                value={entry.class}
                                onChange={(e) => {
                                  handleLogInputChange(index, 'class', e.target.value);
                                }}
                              >
                                {['L', 'P', 'LI'].map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                              {entry.class && !/^(L|P|LI)$/i.test(entry.class) && (
                                <p className="text-red-500 text-xs mt-1">
                                  Must be L, P, or LI
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-0 w-full md:w-[350px]">
                          <label
                            className={`text-sm font-medium ${
                              !entry.raisedBy && showError ? 'text-red-500' : 'text-gray-600'
                            } w-[120px] min-w-[80px]`}
                          >
                            RAISED BY:
                          </label>
                          <div className="flex flex-col w-[300px]">
                            <input
                              type="text"
                              className={`w-full border border-gray-300 rounded px-4 py-2 text-base focus:ring-2 focus:ring-[#004051] ${
                                !entry.raisedBy && showError ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Auth ID / (Staff ID)"
                              value={entry.raisedBy}
                              onChange={(e) =>
                                handleLogInputChange(index, 'raisedBy', e.target.value)
                              }
                              disabled={(Boolean(entry.authenticated) || isFullyAuthorized) as boolean}
                            />
                            {!entry.raisedBy && showError && (
                              <span className="text-red-500 text-xs mt-1">
                                Raised by is required
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full mt-2">
                    <label className="text-sm font-medium text-gray-600">
                      DEFECT DETAILS:
                    </label>
                    <textarea
                      placeholder="Details..."
                      rows={3}
                      className={`w-full border ${
                        entry.defectDetails && !/.+/.test(entry.defectDetails)
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } rounded px-4 py-2 text-base focus:ring-2 focus:ring-[#004051] resize-none overflow-hidden mt-2`}
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
                      <label className="text-sm font-medium text-gray-700 w-[40px] min-w-[40px]">
                        ATA:
                      </label>
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
                      <label className="text-sm font-medium text-gray-700 w-[80px] min-w-[80px]">
                        MMSG / FC:
                      </label>
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
                          disabled={!!isFullyAuthorized}
                        />
                        <label className="text-sm font-medium text-gray-600">DD</label>
                      </div>
                      <div className="flex items-center gap-2 py-2 min-w-[80px]">
                        <input
                          type="checkbox"
                          checked={entry.indInspChecked}
                          onChange={(e) =>
                            handleLogInputChange(index, 'indInspChecked', e.target.checked)
                          }
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
                    <label className="text-sm font-medium text-gray-600">
                      ACTION DETAILS:
                    </label>
                    <textarea
                      placeholder="Details..."
                      rows={3}
                      className={`w-full border ${
                        entry.actionDetails && !/.+/.test(entry.actionDetails)
                          ? 'border-red-500'
                          : 'border-gray-300'
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
                          SHORT SIGN AUTH ID:{' '}
                          <span className="font-medium text-gray-800">
                            {entry.shortSignAuthId}
                          </span>
                        </div>
                        <div className="font-medium text-gray-700 w-full md:w-[250px]">
                          SHORT SIGN AUTH NAME:{' '}
                          <span className="font-medium text-gray-800">
                            {entry.shortSignAuthName}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-2 min-w-[160px] pt-[30px]">
                    <div className="flex flex-row flex-wrap items-center gap-2 w-full overflow-x-auto px-2">
                      {!entry.shortSignAuthId ? (
                        <button
                          type="button"
                          className={`bg-[#004051] text-white px-4 py-2 rounded-md text-sm ${
                            isFullyAuthorized ? 'opacity-50 cursor-not-allowed' : ''
                          } min-w-[120px]`}
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
                      ) : (
                        ''
                      )}
                      {!entry.actionAuthId ? (
                        <button
                          type="button"
                          className={`bg-[#004051] text-white px-4 py-2 rounded-md text-sm ${
                            !entry.shortSignAuthId || isFullyAuthorized
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          } min-w-[120px]`}
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
                            AUTH ID:{' '}
                            <span className="font-medium text-gray-800">
                              {entry.actionAuthId}
                            </span>
                          </div>
                          <div className="font-medium text-gray-700 min-w-[100px]">
                            AUTH NAME:{' '}
                            <span className="font-medium text-gray-800">
                              {entry.actionAuthName}
                            </span>
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
                              handleLogInputChange(index, field.name as keyof LogEntry, e.target.value)
                            }
                            disabled={!!isFullyAuthorized}
                          >
                            <option value="">Choose {field.placeholder}</option>
                            {field.options?.map((opt) => (
                              <option key={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
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
                            disabled={!!isFullyAuthorized || field.name === 'ddNo'} // Disable ddNo input
                          />
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
                        It is Certified that an independent inspection has been carried out for
                        installation IAW XYZ and is satisfactory.
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <h2 className="text-sm font-semibold text-gray-700 min-w-[40px]">1.B</h2>
                      <p className="text-sm text-gray-800 flex-1">
                        It is Certified that an independent inspection has been carried out for
                        functional check IAW XYZ and is satisfactory.
                      </p>
                    </div>
                  </div>
                )}
                <div className="w-full flex flex-col md:flex-row items-start gap-4">
                  <div className="flex flex-col min-w-[110px] pt-2 md:pt-7">
                    <h2 className="text-md font-bold text-gray-700 mb-2">COMPONENTS: </h2>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <table className="table-auto border border-gray-300 text-sm min-w-[900px]">
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
                                onChange={(e) =>
                                  handleComponentRowChange(index, rowIndex, 'partNo', e.target.value)
                                }
                              />
                            </td>
                            <td className="p-2 border border-gray-300">
                              <input
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                                type="text"
                                placeholder="Type here..."
                                value={row.serialOn}
                                onChange={(e) =>
                                  handleComponentRowChange(index, rowIndex, 'serialOn', e.target.value)
                                }
                              />
                            </td>
                            <td className="p-2 border border-gray-300">
                              <input
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                                type="text"
                                placeholder="Type here..."
                                value={row.partOff}
                                onChange={(e) =>
                                  handleComponentRowChange(index, rowIndex, 'partOff', e.target.value)
                                }
                              />
                            </td>
                            <td className="p-2 border border-gray-300">
                              <input
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                                type="text"
                                placeholder="Type here..."
                                value={row.serialOff}
                                onChange={(e) =>
                                  handleComponentRowChange(index, rowIndex, 'serialOff', e.target.value)
                                }
                              />
                            </td>
                            <td className="p-2 border border-gray-300">
                              <input
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                                type="text"
                                placeholder="Type here..."
                                value={row.grn}
                                onChange={(e) =>
                                  handleComponentRowChange(index, rowIndex, 'grn', e.target.value)
                                }
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
                      className={`bg-red-600 text-white px-3 py-1 text-sm rounded-md font-medium mt-2 ${
                        isFullyAuthorized ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                      }`}
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
              className="bg-[#004051] text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-[#006172]"
            >
              + Add New Log
            </button>
          </div>
          <div className="bg-[#f0fafa] border border-[#004051] rounded-lg p-3 shadow-sm mb-4">
            <h3 className="text-sm font-semibold text-[#004051] mb-1">📌 Note:</h3>
            <p className="text-md text-gray-800 leading-relaxed">
              Enter defect and action details accurately. Ensure all fields are completed as per
              aviation maintenance protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}