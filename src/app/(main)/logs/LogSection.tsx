'use client';

import { LogEntry, ComponentRow } from './types';

interface LogSectionProps {
  logEntries: LogEntry[];
  setLogEntries: React.Dispatch<React.SetStateAction<LogEntry[]>>;
  descriptionErrors: string[];
  setDescriptionErrors: React.Dispatch<React.SetStateAction<string[]>>;
  showError: boolean;
  setShowError: React.Dispatch<React.SetStateAction<boolean>>;
  openAuthModal: (type: string, index: number) => void;
}

const initialLogEntry: LogEntry = {
  id: 1,
  class: '',
  raisedBy: '',
  defectDetails: '',
  mmsgFc: '',
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

export default function LogSection({
  logEntries,
  setLogEntries,
  descriptionErrors,
  setDescriptionErrors,
  showError,
  setShowError,
  openAuthModal,
}: LogSectionProps) {
  const handleLogInputChange = (index: number, field: keyof LogEntry, value: string | boolean) => {
    const updatedEntries = [...logEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value,
    };
    setLogEntries(updatedEntries);
  };

  const addNewLogEntry = () => {
    const newId = logEntries.length + 1;
    setLogEntries([...logEntries, { ...initialLogEntry, id: newId, componentRows: [{ partNo: '', serialOn: '', partOff: '', serialOff: '', grn: '' }] }]);
  };

  const removeLogEntry = (index: number) => {
    const updatedEntries = [...logEntries];
    updatedEntries.splice(index, 1);
    setLogEntries(updatedEntries);
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
    <div className="bg-gray-100">
      <div className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-lg shadow p-4">
        <header className="border-b-2 border-[#004051] pb-2 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#004051] uppercase">Defect & Action Log</h1>
          </div>
        </header>

        {logEntries.map((entry, index) => {
          const isFullyAuthorized = entry.shortSignAuthId && entry.actionAuthId;
          return (
            <div
              key={`log-entry-${index}`}
              className={`border border-gray-300 rounded-lg mb-4 p-6 shadow-sm space-y-4 ${isFullyAuthorized ? 'bg-[#E0F7FA]' : 'bg-gray-50'}`}
            >
              <div className="flex flex-col gap-2 border-b border-gray-200 pb-2">
                <div className="flex flex-wrap md:flex-nowrap items-start gap-4">
                  <div className="flex flex-col flex-1 gap-2">
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
                      <label className="text-md font-medium text-gray-700 w-[75px]">ITEM # {entry.id}.</label>
                      <div className="flex items-center gap-2 w-full md:w-[240px]">
                        <label className="text-sm font-medium text-gray-700 w-[60px]">CLASS:</label>
                        <div className="flex flex-col w-[150px]">
                          <select
                            className={`border ${entry.class && !/^(L|P|LI)$/i.test(entry.class) ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-1 text-md focus:ring-2 focus:ring-[#004051]`}
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
                      <div className="flex items-center gap-2 w-full md:w-[280px]">
                        <label className={`text-sm w-[120px] font-medium ${!entry.raisedBy && showError ? 'text-red-500' : 'text-gray-600'}`}>
                          RAISED BY:
                        </label>
                        <div className="flex flex-col w-full">
                          <input
                            type="text"
                            className={`w-full border border-gray-300 rounded px-4 py-1 text-md focus:ring-2 focus:ring-[#004051] ${!entry.raisedBy && showError ? 'border-red-500' : 'border-gray-300'}`}
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
                      {!entry.authenticated && (
                        <div className="flex items-center w-full md:w-[70px] mt-2 md:mt-0">
                          {/* <button
                            type="button"
                            className={`bg-[#004051] text-white px-4 py-1 rounded-md text-sm h-[30px] ${isFullyAuthorized || entry.authenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => {
                              const raisedBy = entry.raisedBy || '';
                              const trimmed = raisedBy.trim();
                              if (!trimmed) {
                                setShowError(true);
                                return;
                              }
                              const valid = /^[A-Za-z0-9\-\/]+$/.test(trimmed);
                              if (!valid) {
                                setShowError(true);
                                return;
                              }
                              setShowError(false);
                              openAuthModal('Raised By Auth', index);
                            }}
                            disabled={(Boolean(entry.authenticated) || isFullyAuthorized) as boolean}
                          >
                            Auth
                          </button> */}
                          <button
                              type="button"
                              className="bg-[#004051] text-white px-4 py-1 rounded-md text-sm h-[30px]"
                              onClick={() => {
                                const raisedBy = entry.raisedBy || '';
                                const trimmed = raisedBy.trim();

                                // Show error if empty
                                if (!trimmed) {
                                  setShowError(true);
                                  return;
                                }

                                // Optional: validate format
                                const valid = /^[A-Za-z0-9\-\/]+$/.test(trimmed);
                                if (!valid) {
                                  setShowError(true);
                                  return;
                                }

                                // Success case: hide error, set auth
                                setShowError(false);
                                const authdate = new Date();
                                const today = `${String(authdate.getMonth() + 1).padStart(2, '0')}-${String(authdate.getDate()).padStart(2, '0')}-${authdate.getFullYear()}`;
                                handleAuth(index, today); // ← this sets entry.authenticated = true
                              }}
                            >
                              Auth
                            </button>
                        </div>
                      )}
                      <div className="font-medium text-gray-700 md:w-[200px] w-full">
                        RAISED BY: <span className="font-medium text-gray-800">{entry.authenticated && entry.raisedBy ? entry.raisedBy : '—'}</span>
                      </div>
                      <div className="font-medium text-gray-700">
                        RAISED ON: <span className="font-medium text-gray-800">{entry.authenticated && entry.date ? new Date(entry.date).toLocaleDateString() : '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full mt-2">
                  <label className="text-sm font-medium text-gray-600">DEFECT DETAILS :</label>
                  <textarea
                    placeholder="Details..."
                    rows={2}
                    className={`w-full border ${entry.defectDetails && !/.+/.test(entry.defectDetails) ? 'border-red-500' : 'border-gray-300'} rounded px-4 py-1 text-md focus:ring-2 focus:ring-[#004051] resize-none overflow-hidden mt-2`}
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
              <div className="flex flex-wrap md:flex-nowrap items-start gap-4 border-b border-gray-200 pb-4">
                <div className="flex flex-wrap md:flex-nowrap gap-4 flex-1 items-end">
                  <div className="flex items-center gap-2 w-full md:w-[280px]">
                    <label className="text-sm font-medium text-gray-700 w-[40px]">ATA:</label>
                    <div className="flex flex-col w-full">
                      <input
                        type="text"
                        placeholder="Enter ATA code..."
                        className="w-full border border-gray-300 rounded px-4 py-1 text-md focus:ring-2 focus:ring-[#004051]"
                        value={entry.mmsgFc}
                        onChange={(e) => handleLogInputChange(index, 'mmsgFc', e.target.value)}
                        disabled={!!isFullyAuthorized}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-[320px]">
                    <label className="text-sm font-medium text-gray-700 w-[130px]">MMSG / FC:</label>
                    <div className="flex flex-col w-full">
                      <input
                        type="text"
                        placeholder="Enter MMSG / FC..."
                        className="w-full border border-gray-300 rounded px-4 py-1 text-md focus:ring-2 focus:ring-[#004051]"
                        value={entry.mmsgFc}
                        onChange={(e) => handleLogInputChange(index, 'mmsgFc', e.target.value)}
                        disabled={!!isFullyAuthorized}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 py-2 min-w-[100px]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 border border-gray-300 focus:ring-2 focus:ring-[#004051]"
                      checked={entry.sdr}
                      onChange={(e) => handleLogInputChange(index, 'sdr', e.target.checked)}
                      disabled={!!isFullyAuthorized}
                    />
                    <label className="text-sm font-medium text-gray-600">SDR</label>
                  </div>
                  <div className="flex items-center gap-2 py-2 min-w-[100px]">
                    <input
                      type="checkbox"
                      checked={entry.ddChecked}
                      onChange={(e) => handleLogInputChange(index, 'ddChecked', e.target.checked)}
                      className="h-4 w-4 border border-gray-300 rounded focus:ring-2 focus:ring-[#004051]"
                      disabled={!!isFullyAuthorized}
                    />
                    <label className="text-sm font-medium text-gray-600">DD</label>
                  </div>
                  <div className="flex items-center gap-2 py-2 min-w-[100px]">
                    <input
                      type="checkbox"
                      checked={entry.indInspChecked}
                      onChange={(e) => handleLogInputChange(index, 'indInspChecked', e.target.checked)}
                      className="h-4 w-4 border border-gray-300 rounded focus:ring-2 focus:ring-[#004051]"
                      disabled={!!isFullyAuthorized}
                    />
                    <label className="text-sm font-medium text-gray-600">IND INSP</label>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap md:flex-nowrap gap-4 w-full items-start">
                <div className="flex-1 min-w-[280px]">
                  <label className="text-sm font-medium text-gray-600">ACTION DETAILS: </label>
                  <textarea
                    placeholder="Details..."
                    rows={2}
                    className={`w-full border ${
                      entry.actionDetails && !/.+/.test(entry.actionDetails) ? 'border-red-500' : 'border-gray-300'
                    } rounded px-4 py-1 text-md focus:ring-2 focus:ring-[#004051] resize-none overflow-hidden mt-2`}
                    value={entry.actionDetails}
                    onChange={(e) => {
                      handleLogInputChange(index, 'actionDetails', e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                      // Clear description error when action details are updated
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
                    <div className="mt-2 flex items-center flex-wrap gap-x-4 text-sm">
                      <div className="font-medium text-gray-700 md:w-[250px] w-full">
                        SHORT SIGN AUTH ID: <span className="font-medium text-gray-800">{entry.shortSignAuthId}</span>
                      </div>
                      <div className="font-medium text-gray-700 md:w-[250px] w-full">
                        SHORT SIGN AUTH NAME: <span className="font-medium text-gray-800">{entry.shortSignAuthName}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start gap-2 min-w-[160px] pt-[30px]">
                  <div className="flex gap-2">
                    {!entry.shortSignAuthId ? (
                      <button
                        type="button"
                        className={`bg-[#004051] text-white px-4 py-1 rounded-md text-sm ${isFullyAuthorized ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    ) : ""}
                    {!entry.actionAuthId ? (
                      <button
                        type="button"
                        className={`bg-[#004051] text-white px-4 py-1 rounded-md text-sm ${!entry.shortSignAuthId || isFullyAuthorized ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                      <div>
                        <div className="font-medium text-gray-700 md:w-[200px] w-full">
                          AUTH ID: <span className="font-medium text-gray-800">{entry.actionAuthId}</span>
                        </div>
                        <div className="font-medium text-gray-700 md:w-[200px] w-full">
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
                      placeholder: 'Action'
                    },
                    {
                      label: 'DD Type',
                      type: 'select',
                      name: 'ddType',
                      options: ['Major (M)', 'Minor (N)'],
                      value: entry.ddType,
                      invalid: entry.ddType && !['Major', 'Minor'].includes(entry.ddType),
                      error: 'Select a valid DD Type',
                      placeholder: 'Type'
                    },
                    {
                      label: 'No',
                      type: 'text',
                      name: 'ddNo',
                      value: entry.ddNo,
                      pattern: /^[A-Za-z0-9\-]+$/,
                      error: 'Invalid format',
                      placeholder: 'Type here...'
                    },
                    {
                      label: 'Mel / Cdl Ref',
                      type: 'text',
                      name: 'melCdlRef',
                      value: entry.melCdlRef,
                      pattern: /^[A-Za-z0-9\-\/]+$/,
                      error: 'Invalid format',
                      placeholder: 'Type here...'
                    },
                    {
                      label: 'Cat',
                      type: 'select',
                      name: 'cat',
                      options: ['Cat A', 'Cat B', 'Cat C', 'Cat D', 'Cat U'],
                      value: entry.cat,
                      invalid: entry.cat && !['Cat A', 'Cat B', 'Cat C', 'Cat D', 'Cat U'].includes(entry.cat),
                      error: 'Select a valid Category',
                      placeholder: 'Cat'
                    },
                  ].map((field, i) => (
                    <div
                      key={i}
                      className="flex flex-row items-center gap-2"
                      style={{ width: field.type === 'select' ? '195px' : '195px' }} // manual width here
                    >
                      <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                        {field.label}
                      </label>

                      {field.type === 'select' ? (
                        <select
                          className={`w-full border ${
                            field.invalid ? 'border-red-500' : 'border-gray-300'
                          } rounded px-2 py-1 text-sm focus:ring-2 focus:ring-[#004051]`}
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
                          } rounded px-2 py-1 text-sm focus:ring-2 focus:ring-[#004051]`}
                          value={field.value}
                          onChange={(e) =>
                            handleLogInputChange(
                              index,
                              field.name as keyof LogEntry,
                              e.target.value
                            )
                          }
                          disabled={!!isFullyAuthorized}
                        />
                      )}

                      {/* {field.error && field.invalid && (
                        <p className="text-red-500 text-xs mt-1">{field.error}</p>
                      )}
                      {field.error &&
                        field.pattern &&
                        field.value &&
                        !field.pattern.test(field.value) && (
                          <p className="text-red-500 text-xs mt-1">{field.error}</p>
                        )} */}
                    </div>
                  ))}
                </div>
              )}
              {entry.indInspChecked && (
                <div className="flex flex-col space-y-2 flex-1 border-b border-gray-300 mb-4 pb-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-sm font-semibold text-gray-700 min-w-[20px]">1.A</h2>
                    <p className="text-sm text-gray-800 flex-1">
                      It is Certified that an independent inspection has been carried out for installation IAW XYZ and is satisfactory.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <h2 className="text-sm font-semibold text-gray-700 min-w-[20px]">1.B</h2>
                    <p className="text-sm text-gray-800 flex-1">
                      It is Certified that an independent inspection has been carried out for functional check IAW XYZ and is satisfactory.
                    </p>
                  </div>
                </div>
              )}
              <div className="w-full flex flex-col md:flex-row items-start gap-4">
                <div className="flex flex-col min-w-[110px] pt-2 md:pt-7">
                  <h2 className="text-md font-bold text-gray-700 mb-2">COMPONENTS: </h2>
                </div>

                {/* 🚀 FIX: force horizontal scroll only for table */}
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
            className={`bg-[#004051] text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-[#006172]}`}
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
  );
}