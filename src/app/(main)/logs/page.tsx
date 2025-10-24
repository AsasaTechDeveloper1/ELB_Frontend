'use client';

import { useState, useEffect } from 'react';
import LogSection from './create/LogSection';
import FlightDetailsSection from './create/FlightDetailsSection';
import FluidsSection from './create/FluidsSection';
import ChecksSection from './create/ChecksSection';
import AuthModal from './create/AuthModal';
import { LogEntry, AuthData, AuthDetails, AuthModalState } from './types';
import { BiBorderAll } from 'react-icons/bi';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

interface Airport {
  id: string;
  code: string;
  name: string;
}

interface Log {
  id: string;
  logPageNo: string;
  flightId: string;
  flightLeg: number;
  createdAt?: string | { _seconds: number; _nanoseconds: number };
  createdBy: string;
  status: number;
  flightDetails?: {
    fltNo: string;
    from: string;
    to: string;
    takeOff: string;
    landing: string;
    takeOffDate: string;
    landingDate: string;
    acftRelease: boolean;
    currentFlight: boolean;
  };
}

const initialLogEntry: LogEntry = {
  id: 1,
  updated_id: '',
  displayNumber: 1,
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

function parseDate(input?: string | { _seconds: number; _nanoseconds: number }): Date | null {
  if (!input) return null;
  if (typeof input === 'string') return new Date(input);
  if ('_seconds' in input) return new Date(input._seconds * 1000);
  return null;
}

export default function FormElementsPage() {
  const [activeTab, setActiveTab] = useState('Log');
  const [logEntries, setLogEntries] = useState<LogEntry[]>([{ ...initialLogEntry }]);
  const [authModal, setAuthModal] = useState<AuthModalState | null>(null);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    TRANSIT: false,
    DAILY: false,
    ETOPS: false,
    Letter: false,
    PDI: false,
  });
  const [authDetails, setAuthDetails] = useState<{ [key: string]: AuthDetails }>({});
  const [isFetchingPageNo, setIsFetchingPageNo] = useState(true);
  const [isFetchingLogItems, setIsFetchingLogItems] = useState(false);
  const [logPageNo, setLogPageNo] = useState<string>('');
  const [authData, setAuthData] = useState<AuthData>({
    authId: '',
    authName: '',
    date: '',
    expDate: '',
  });
  const getCurrentFlightIndex = () => logs.findIndex(l => l.flightDetails?.currentFlight === true);
  const [descriptionErrors, setDescriptionErrors] = useState<string[]>([]);
  const [showError, setShowError] = useState(false);
  const [showLogListModal, setShowLogListModal] = useState(false);
  const [selectedLogIndex, setSelectedLogIndex] = useState<number>(0);
  const [logs, setLogs] = useState<Log[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);

  // Add the missing variables and function here:
  const currentLogId = logs[selectedLogIndex]?.id || '';
  const flightLeg = logs[selectedLogIndex]?.flightLeg || 0;

  const handleFluidsSaved = async () => {
    console.log('Fluids data saved successfully');
    // Optional: Add any post-save logic here
  };
  
  // Fetch airports
  useEffect(() => {
    async function fetchAirports() {
      try {
        const airportsRes = await fetch(`${API_BASE}/flights/airports/list`);
        if (!airportsRes.ok) throw new Error(`Failed to fetch airports: ${airportsRes.status}`);
        const airportsData = await airportsRes.json();
        setAirports(Array.isArray(airportsData) ? airportsData : []);
      } catch (err) {
        console.error('Failed to fetch airports:', err);
        setAirports([]);
      }
    }
    fetchAirports();
  }, []);

  // Fetch check authorizations for the current log
  const fetchChecks = async (logId: string) => {
    try {
      const response = await fetch(`${API_BASE}/checks/${logId}/checks`);
      if (!response.ok) throw new Error('Failed to fetch check authorizations');
      const data = await response.json();
      if (data.checks && data.checks.length > 0) {
        const checks = data.checks.reduce((acc: { [key: string]: AuthDetails }, check: any) => {
          acc[check.type] = {
            authId: check.authId,
            authName: check.authName,
            authDate: check.authDate,
            svcOption: check.svcOption,
          };
          return acc;
        }, {});
        setAuthDetails(checks);
        // Sync checkedItems with fetched authDetails
        setCheckedItems((prev) => ({
          ...prev,
          ...Object.keys(checks).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
        }));
      } else {
        setAuthDetails({});
        setCheckedItems({ TRANSIT: false, DAILY: false, ETOPS: false, Letter: false, PDI: false });
      }
    } catch (err) {
      console.error('Failed to fetch checks:', err);
      setAuthDetails({});
      setCheckedItems({ TRANSIT: false, DAILY: false, ETOPS: false, Letter: false, PDI: false });
    }
  };

  // Get airport name by code
  const getAirportName = (code: string) => {
    const airport = airports.find((a) => a.code === code);
    return airport ? airport.name : code;
  };

  // Fetch logs and their associated flight details
  const refetchLogsAndFlights = async () => {
    try {
      setIsFetchingPageNo(true);
      const logsResponse = await fetch(`${API_BASE}/logs`);
      if (!logsResponse.ok) throw new Error(`Failed to fetch logs: ${logsResponse.status}`);

      let logsData: Log[] = await logsResponse.json();

      // Sort logs chronologically (ascending by createdAt)
      logsData = logsData.sort((a, b) => {
        const dateA = parseDate(a.createdAt);
        const dateB = parseDate(b.createdAt);
        return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
      });

      // Fetch flight details for each log
      const logsWithFlightDetails = await Promise.all(
        logsData.map(async (log) => {
          if (log.flightId) {
            const flightResponse = await fetch(`${API_BASE}/flights/${log.flightId}`);
            if (flightResponse.ok) {
              const flightData = await flightResponse.json();
              return {
                ...log,
                flightDetails: {
                  fltNo: flightData.fltNo,
                  from: flightData.from,
                  to: flightData.to,
                  takeOff: flightData.takeOff,
                  landing: flightData.landing,
                  takeOffDate: flightData.takeOffDate,
                  landingDate: flightData.landingDate,
                  acftRelease: flightData.acftRelease,
                  currentFlight: flightData.currentFlight,
                },
              };
            }
          }
          return log;
        })
      );

      setLogs(logsWithFlightDetails);

      if (logsWithFlightDetails.length === 0) {
        setLogPageNo('');
        setSelectedLogIndex(0);
        setIsFetchingPageNo(false);
        return;
      }

      let selectedLog = logsWithFlightDetails.find((log) => log.flightDetails?.currentFlight === true);
      let selectedIndex = logsWithFlightDetails.findIndex((log) => log.flightDetails?.currentFlight === true);

      if (!selectedLog) {
        selectedLog = logsWithFlightDetails[logsWithFlightDetails.length - 1];
        selectedIndex = logsWithFlightDetails.length - 1;
      }

      setLogPageNo(selectedLog.logPageNo);
      setSelectedLogIndex(selectedIndex);
      await fetchLogItems(selectedLog.id);
      await fetchChecks(selectedLog.id);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setLogs([]);
      setLogPageNo('');
      setSelectedLogIndex(0);
    } finally {
      setIsFetchingPageNo(false);
    }
  };

  useEffect(() => {
    refetchLogsAndFlights();
  }, []);

  // Function to fetch log items for a specific log
  async function fetchLogItems(logId: string) {
    setIsFetchingLogItems(true);
    try {
      const response = await fetch(`${API_BASE}/logs/${logId}`);
      if (!response.ok) throw new Error(`Failed to fetch log items: ${response.status}`);
      const logData = await response.json();
      const logItems = logData.items || [];

      const mappedLogEntries: LogEntry[] = logItems.length > 0
        ? logItems.map((item: any, index: number) => ({
            ...initialLogEntry,
            id: index + 1,
            updated_id: item.id,
            displayNumber: item.displayNumber || index + 1,
            class: item.class || '',
            raisedBy: item.raisedBy || '',
            defectDetails: item.defectDetails || '',
            mmsgFc: item.mmsgFc || '',
            ata: item.ata || '',
            sdr: item.sdr || false,
            actionDetails: item.actionDetails || '',
            ddChecked: item.ddChecked || false,
            ddAction: item.ddAction || '',
            ddType: item.ddType || '',
            ddNo: item.ddNo || '',
            melCdlRef: item.melCdlRef || '',
            cat: item.cat ? `Cat ${item.cat}` : 'Cat A',
            indInspChecked: item.indInspChecked || false,
            componentRows: item.components?.map((comp: any) => ({
              partNo: comp.partNo || '',
              serialOn: comp.serialOn || '',
              partOff: comp.partOff || '',
              serialOff: comp.serialOff || '',
              grn: comp.grn || '',
            })) || [{ partNo: '', serialOn: '', partOff: '', serialOff: '', grn: '' }],
            shortSignAuthId: item.shortSignAuthId || '',
            shortSignAuthName: item.shortSignAuthName || '',
            actionAuthId: item.actionAuthId || '',
            actionAuthName: item.actionAuthName || '',
            attemptedAuth: false,
            raisedByValid: false,
            date: '',
            authenticated: false,
            ddDate1: '',
            ddSign1: '',
            ddAuth1: '',
          }))
        : [{ ...initialLogEntry, id: 1, displayNumber: 1 }];

      setLogEntries(mappedLogEntries);
      setDescriptionErrors(new Array(mappedLogEntries.length).fill(''));
    } catch (err) {
      console.error('Failed to fetch log items:', err);
      setLogEntries([{ ...initialLogEntry, id: 1, displayNumber: 1 }]);
      setDescriptionErrors(['']);
    } finally {
      setIsFetchingLogItems(false);
    }
  }

  const handleNextLog = () => {
    const currentIdx = getCurrentFlightIndex();
      
    // If no current flight, or already at the end, do nothing
    if (currentIdx === -1 || selectedLogIndex >= logs.length - 1) return;

    const nextIdx = selectedLogIndex + 1;

    // Allow moving forward ONLY if next index <= current flight index
    if (nextIdx <= currentIdx) {
      setSelectedLogIndex(nextIdx);
      setLogPageNo(logs[nextIdx].logPageNo);
      fetchLogItems(logs[nextIdx].id);
      fetchChecks(logs[nextIdx].id);
    }
  };

  const handlePrevLog = () => {
    if (selectedLogIndex > 0) {
      const prevIndex = selectedLogIndex - 1;
      setSelectedLogIndex(prevIndex);
      setLogPageNo(logs[prevIndex].logPageNo);
      fetchLogItems(logs[prevIndex].id);
      fetchChecks(logs[prevIndex].id);
    }
  };

  const addNewLogEntry = () => {
    const newEntry = {
      ...initialLogEntry,
      id: logEntries.length + 1,
      displayNumber: logEntries.length + 1,
      componentRows: [{ partNo: '', serialOn: '', partOff: '', serialOff: '', grn: '' }],
    };
    setLogEntries([...logEntries, newEntry]);
    setDescriptionErrors([...descriptionErrors, '']);
  };

  // Updated openAuthModal function
  const openAuthModal = (
    type: string,
    index: number,
    onSuccess: (authData: { authId: string; authName: string }) => void
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const entry = logEntries[index];
    const description = entry?.actionDetails;

    if ((type === 'Short Sign Auth' || type === 'Action Auth') && (!description || description.trim() === '')) {
      const updatedErrors = [...descriptionErrors];
      updatedErrors[index] = 'Action Detail is required';
      setDescriptionErrors(updatedErrors);
      setShowError(true);
      return;
    }

    setAuthModal({
      type,
      index,
      onSuccess,
    });
    setAuthData((prev) => ({ ...prev, date: today }));
    // Removed premature setCheckedItems here; let onSuccess handle it
  };

  const tabs = [
    {
      id: 'FLT DETAILS/RELEASE',
      label: 'FLT DETAILS/RELEASE',
      content: <FlightDetailsSection />,
    },
    {
      id: 'Log',
      label: 'Log',
      content: (
        <LogSection
          logEntries={logEntries}
          setLogEntries={setLogEntries}
          descriptionErrors={descriptionErrors}
          setDescriptionErrors={setDescriptionErrors}
          showError={showError}
          setShowError={setShowError}
          openAuthModal={openAuthModal}
          currentLogId={logs[selectedLogIndex]?.id || ''}
          isFetchingLogItems={isFetchingLogItems}
        />
      ),
    },
    {
      id: 'Fluids',
      label: 'Fluids',
      content: <FluidsSection
        openAuthModal={openAuthModal}
        authDetails={authDetails}
        setAuthDetails={setAuthDetails}
        currentLogId={currentLogId}
        flightLeg={flightLeg}
        onFluidsSaved={handleFluidsSaved}
      />,
    },
    {
      id: 'Checks',
      label: 'Checks',
      content: (
        <ChecksSection
          openAuthModal={openAuthModal}
          checkedItems={checkedItems}
          setCheckedItems={setCheckedItems}
          authDetails={authDetails}
          setAuthDetails={setAuthDetails}
          currentLogId={logs[selectedLogIndex]?.id || ''}
          flightLeg={logs[selectedLogIndex]?.flightLeg || 0}
          onChecksSaved={refetchLogsAndFlights}
        />
      ),
    },
  ];

  const handleViewList = () => {
    setShowLogListModal(true);
  };

  const handleSelectLog = (index: number) => {
    setSelectedLogIndex(index);
    setLogPageNo(logs[index].logPageNo);
    fetchLogItems(logs[index].id);
    fetchChecks(logs[index].id);
    setShowLogListModal(false);
    setActiveTab('Log');
  };

  const closeLogListModal = () => {
    setShowLogListModal(false);
  };

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="space-y-6">
      {(isFetchingPageNo || isFetchingLogItems) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-4 border-[#004051] border-opacity-50 rounded-full animate-spin border-t-[#06b6d4]"></div>
            <p className="mt-4 text-white text-lg font-semibold">Loading...</p>
          </div>
        </div>
      )}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <ul className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <li
                key={tab.id}
                className={`cursor-pointer px-4 py-2 rounded-md font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[rgb(0,64,81)] text-white shadow-md'
                    : 'bg-white hover:bg-[rgba(0,64,81,0.1)] text-black border border-gray-200'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button
              className="px-4 py-1 bg-[rgb(0,64,81)] text-white rounded-md hover:bg-[rgb(0,80,100)] transition-all"
              onClick={handleViewList}
            >
              View List
            </button>
          </div>
        </div>
        <div className="bg-gray-100 flex justify-center">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg w-full max-w-[1200px] flex flex-col">
            <header className="sticky top-0 z-20 border-b-2 border-[#004051] pb-4 bg-white mb-4">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-extrabold text-[#004051] uppercase tracking-wide">
                    Defect & Action Log
                  </h1>
                  {logs[selectedLogIndex]?.flightDetails ? (
                    <>
                      {
                        logs[selectedLogIndex].flightLeg === 0 && (
                          <span className="ml-2 px-8 py-1 text-md font-semibold text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4] rounded-full">
                            Current Flight
                          </span>
                        )
                      }
                    </>
                  ) : (
                    ''
                  )}
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-700 uppercase text-sm">
                        Log Page Number:
                      </span>
                      {isFetchingPageNo ? (
                        <span className="text-sm font-semibold text-[#004051] bg-gray-100 border border-[#004051]/20 px-4 py-1.5 rounded-full shadow-sm uppercase animate-pulse">
                          Loading...
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-[#004051] bg-gray-100 border border-[#004051]/20 px-4 py-1.5 rounded-full shadow-sm uppercase">
                          {logPageNo}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handlePrevLog}
                      disabled={selectedLogIndex === 0}
                      className="bg-[#06b6d4] flex items-center gap-2 text-white font-semibold px-5 py-1 rounded-lg shadow-md hover:bg-[#003340] transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                      </svg>
                      Previous
                    </button>
                    <button
                        onClick={handleNextLog}
                        disabled={selectedLogIndex === getCurrentFlightIndex() || selectedLogIndex === logs.length - 1}
                        className="bg-[#06b6d4] flex items-center gap-2 text-white font-semibold px-5 py-1 rounded-lg shadow-md hover:bg-[#003340] transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-start gap-6 text-sm font-medium text-gray-700 uppercase tracking-tight">
                  <span>
                    Date:{' '}
                    {logs[selectedLogIndex]?.createdAt
                      ? parseDate(logs[selectedLogIndex].createdAt)?.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }) ?? 'N/A'
                      : 'N/A'}
                  </span>
                  <span>|</span>
                  <span>Flight Leg: {logs[selectedLogIndex]?.flightLeg ?? 'N/A'}</span>
                  <span>|</span>
                  <span>Flight No: {logs[selectedLogIndex]?.flightDetails?.fltNo ?? 'N/A'}</span>
                  <span>|</span>
                  <span>
                    Sector:{' '}
                    {logs[selectedLogIndex]?.flightDetails ? (
                      <>
                        {`${getAirportName(logs[selectedLogIndex].flightDetails.from)} (ETD ${logs[selectedLogIndex].flightDetails.takeOff}, ${logs[selectedLogIndex].flightDetails.takeOffDate}) → ${getAirportName(logs[selectedLogIndex].flightDetails.to)} (ETA ${logs[selectedLogIndex].flightDetails.landing}, ${logs[selectedLogIndex].flightDetails.landingDate})`}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </span>
                </div>
              </div>
            </header>
            <div>{activeContent}</div>
            <AuthModal
              authModal={authModal}
              authData={authData}
              setAuthData={setAuthData}
              setAuthModal={setAuthModal}
              setCheckedItems={setCheckedItems}
            />
            {/* <button
              className="bg-[#004051] flex items-center gap-2 text-white font-semibold px-5 py-1 rounded-lg shadow-md hover:bg-[#003340] transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={addNewLogEntry}
            >
              + Add Entry
            </button>  */}
            <div className="flex justify-end">
              <button
                className="inline-flex items-center gap-2 bg-[#004051] text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:bg-[#003340] transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                onClick={addNewLogEntry}
              >
                + Add Entry
              </button>
            </div>
          </div>
        </div>
      </div>
      {showLogListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg border-t-4 border-yellow-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Log Entries</h2>
              <button className="text-gray-500 hover:text-gray-700" onClick={closeLogListModal}>
                ✕
              </button>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[rgb(0,64,81)] text-white">
                  <th className="p-3 text-left whitespace-nowrap">Date</th>
                  <th className="p-3 text-left whitespace-nowrap">Log Page Number</th>
                  <th className="p-3 text-left whitespace-nowrap">Flight Leg</th>
                  <th className="p-3 text-left whitespace-nowrap">Flight No</th>
                  <th className="p-3 text-left whitespace-nowrap">Sector</th>
                  <th className="p-3 text-left whitespace-nowrap">Aircraft Release</th>
                  <th className="p-3 text-left whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="p-3">
                        {log.createdAt
                          ? parseDate(log.createdAt)?.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }) ?? 'N/A'
                          : 'N/A'}
                      </td>
                      <td className="p-3">{log.logPageNo}</td>
                      <td className="p-3">{log.flightLeg}</td>
                      <td className="p-3">{log.flightDetails ? log.flightDetails.fltNo : 'N/A'}</td>
                      <td className="p-3">
                        {log.flightDetails ? (
                          <>
                            {`${getAirportName(log.flightDetails.from)} (ETD ${log.flightDetails.takeOff}, ${log.flightDetails.takeOffDate}) → ${getAirportName(log.flightDetails.to)} (ETA ${log.flightDetails.landing}, ${log.flightDetails.landingDate})`}
                            {log.flightLeg === 0 && (
                              <span className="ml-2 px-2 py-1 text-xs font-semibold text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4] rounded-full">
                                Current Flight
                              </span>
                            )}
                          </>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="p-3">{log.flightDetails ? (log.flightDetails.acftRelease ? 'Yes' : 'No') : 'N/A'}</td>
                      <td className="p-3">
                        <button
                          className="px-3 py-1 bg-[rgb(0,64,81)] text-white rounded-md hover:bg-[rgb(0,80,100)] transition-all"
                          onClick={() => handleSelectLog(index)}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-3 text-center text-gray-500">
                      No logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}