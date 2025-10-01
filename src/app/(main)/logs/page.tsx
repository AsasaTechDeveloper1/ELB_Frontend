'use client';

import { useState, useEffect } from 'react';
import LogSection from './create/LogSection';
import FlightDetailsSection from './create/FlightDetailsSection';
import FluidsSection from './create/FluidsSection';
import ChecksSection from './create/ChecksSection';
import AuthModal from './create/AuthModal';
import { LogEntry, AuthData } from './types';
import { BiBorderAll } from 'react-icons/bi';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const initialLogEntry: LogEntry = {
  id: 1,
  updated_id: "",
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
  };
}

function parseDate(input?: string | { _seconds: number; _nanoseconds: number }): Date | null {
  if (!input) return null;
  if (typeof input === "string") return new Date(input);
  if ("_seconds" in input) return new Date(input._seconds * 1000);
  return null;
}

export default function FormElementsPage() {
  const [activeTab, setActiveTab] = useState('Log');
  const [logEntries, setLogEntries] = useState<LogEntry[]>([{ ...initialLogEntry }]);
  const [authModal, setAuthModal] = useState<null | { type: string; index: number }>(null);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [authDetails, setAuthDetails] = useState<Record<string, any>>({});
  const [isFetchingPageNo, setIsFetchingPageNo] = useState(true);
  const [isFetchingLogItems, setIsFetchingLogItems] = useState(false); // New state for log items loading
  const [logPageNo, setLogPageNo] = useState<string>(''); // Initial default, will be updated
  const [authData, setAuthData] = useState<AuthData>({
    authId: '',
    authName: '',
    password: '',
    sign: '',
    date: '',
    expDate: '',
  });
  const [descriptionErrors, setDescriptionErrors] = useState<string[]>([]);
  const [showError, setShowError] = useState(false);
  const [showLogListModal, setShowLogListModal] = useState(false);
  const [selectedLogIndex, setSelectedLogIndex] = useState<number>(0);
  const [logs, setLogs] = useState<Log[]>([]); // State to store fetched logs

  // Fetch logs and their associated flight details
  useEffect(() => {
    async function fetchLogsAndFlights() {
      try {
        setIsFetchingPageNo(true);
        const logsResponse = await fetch(`${API_BASE}/logs`);
        if (!logsResponse.ok) throw new Error(`Failed to fetch logs: ${logsResponse.status}`);

        const logsData: Log[] = await logsResponse.json();
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
                  },
                };
              }
            }
            return log;
          })
        );

        setLogs(logsWithFlightDetails);
        // Set the latest log page number and load its log items
        if (logsWithFlightDetails.length > 0) {
          const latestLog = logsWithFlightDetails.reduce((latest, log) => {
            const logDate = parseDate(log.createdAt);
            const latestDate = parseDate(latest.createdAt);
            if (!logDate) return latest;
            if (!latestDate) return log;
            return logDate > latestDate ? log : latest;
          });
          setLogPageNo(latestLog.logPageNo);
          setSelectedLogIndex(0);
          // Fetch log items for the latest log
          await fetchLogItems(latestLog.id);
        }
      } catch (err) {
        console.error("Failed to fetch logs:", err);
        setLogs([]);
      } finally {
        setIsFetchingPageNo(false);
      }
    }

    fetchLogsAndFlights();
  }, []);

  // Function to fetch log items for a specific log
  async function fetchLogItems(logId: string) {
    setIsFetchingLogItems(true); // Set loading state
    try {
      const response = await fetch(`${API_BASE}/logs/${logId}`);
      if (!response.ok) throw new Error(`Failed to fetch log items: ${response.status}`);
      const logData = await response.json();
      const logItems = logData.items || [];

      // Map log items to LogEntry type
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
            cat: item.cat || '',
            indInspChecked: item.indInspChecked || false,
            componentRows: item.components?.map((comp: any) => ({
              partNo: comp.partNo || '',
              serialOn: comp.serialOn || '',
              partOff: comp.partOff || '',
              serialOff: comp.serialOff || '',
              grn: comp.grn || '',
            })) || [{ partNo: '', serialOn: '', partOff: '', serialOff: '', grn: '' }],
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
          }))
        : [{ ...initialLogEntry, id: 1, displayNumber: 1 }];

      setLogEntries(mappedLogEntries);
      setDescriptionErrors(new Array(mappedLogEntries.length).fill(''));
    } catch (err) {
      console.error("Failed to fetch log items:", err);
      setLogEntries([{ ...initialLogEntry, id: 1, displayNumber: 1 }]);
      setDescriptionErrors(['']);
    } finally {
      setIsFetchingLogItems(false); // Clear loading state
    }
  }

  const handleNextLog = () => {
    if (selectedLogIndex < logs.length - 1) {
      const nextIndex = selectedLogIndex + 1;
      setSelectedLogIndex(nextIndex);
      setLogPageNo(logs[nextIndex].logPageNo);
      fetchLogItems(logs[nextIndex].id);
    }
  };

  const handlePrevLog = () => {
    if (selectedLogIndex > 0) {
      const prevIndex = selectedLogIndex - 1;
      setSelectedLogIndex(prevIndex);
      setLogPageNo(logs[prevIndex].logPageNo);
      fetchLogItems(logs[prevIndex].id);
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

  const openAuthModal = (type: string, index: number) => {
    const today = new Date().toISOString().split("T")[0];
    const entry = logEntries[index];
    const description = entry.actionDetails;

    if ((type === 'Short Sign Auth' || type === 'Action Auth') && (!description || description.trim() === '')) {
      const updatedErrors = [...descriptionErrors];
      updatedErrors[index] = 'Action Detail is required';
      setDescriptionErrors(updatedErrors);
      return;
    }

    setAuthModal({ type, index });
    setAuthData((prev) => ({ ...prev, date: today }));
    setCheckedItems((prev) => ({ ...prev, [type]: true }));
  };

  const saveAuthorization = () => {
    if (!authModal) return;

    const index = authModal.index;
    const entry = logEntries[index];

    if ((authModal.type === 'Short Sign Auth' || authModal.type === 'Action Auth') && (!entry.actionDetails || entry.actionDetails.trim() === '')) {
      const updatedErrors = [...descriptionErrors];
      updatedErrors[index] = 'Action Detail is required';
      setDescriptionErrors(updatedErrors);
      return;
    }

    const updated = [...logEntries];
    if (authModal.type === 'Short Sign Auth') {
      updated[authModal.index].shortSignAuthId = authData.authId;
      updated[authModal.index].shortSignAuthName = authData.authName;
    } else if (authModal.type === 'Action Auth') {
      updated[authModal.index].actionAuthId = authData.authId;
      updated[authModal.index].actionAuthName = authData.authName;
    }

    setLogEntries(updated);

    setAuthDetails((prev) => ({
      ...prev,
      [authModal.type]: {
        authId: authData.authId,
        authName: authData.authName,
        authDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      },
    }));

    setCheckedItems((prev) => ({
      ...prev,
      [authModal.type]: true,
    }));

    setAuthModal(null);
    setAuthData({ authId: '', authName: '', password: '', sign: '', date: '', expDate: '' });
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
          currentLogId={logs[selectedLogIndex]?.id || ''} // Pass current selected log ID
          isFetchingLogItems={isFetchingLogItems} // Pass loading state
        />
      ),
    },
    {
      id: 'Fluids',
      label: 'Fluids',
      content: <FluidsSection />,
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
        />
      ),
    },
  ];

  const handleViewList = () => {
    setShowLogListModal(true);
  };

  const handleSelectLog = (index: number) => {
    console.log("selected hit");
    setSelectedLogIndex(index);
    setLogPageNo(logs[index].logPageNo);
    fetchLogItems(logs[index].id);
    setShowLogListModal(false);
    setActiveTab('Log');
  };

  const closeLogListModal = () => {
    setShowLogListModal(false);
  };

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;
  return (
    <div className="space-y-6">
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
            <header className="sticky top-0 z-20 border-b-2 border-[#004051] pb-4 bg-white">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-extrabold text-[#004051] uppercase tracking-wide">
                    Defect & Action Log
                  </h1>
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
                      disabled={selectedLogIndex === logs.length - 1}
                      className="bg-[#06b6d4] flex items-center gap-2 text-white font-semibold px-5 py-1 rounded-lg shadow-md hover:bg-[#003340] transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                    <button
                      className="bg-[#004051] flex items-center gap-2 text-white font-semibold px-5 py-1 rounded-lg shadow-md hover:bg-[#003340] transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={addNewLogEntry}
                    >
                      + Add Entry
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
                    {logs[selectedLogIndex]?.flightDetails
                      ? `${logs[selectedLogIndex].flightDetails.from} (ETD ${logs[selectedLogIndex].flightDetails.takeOff}, ${logs[selectedLogIndex].flightDetails.takeOffDate}) → ${logs[selectedLogIndex].flightDetails.to} (ETA ${logs[selectedLogIndex].flightDetails.landing}, ${logs[selectedLogIndex].flightDetails.landingDate})`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </header>
          </div>
        </div>
      </div>
      <div>{activeContent}</div>
      <AuthModal
        authModal={authModal}
        authData={authData}
        setAuthData={setAuthData}
        setAuthModal={setAuthModal}
        saveAuthorization={saveAuthorization}
        setCheckedItems={setCheckedItems}
      />
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
                        {log.flightDetails
                          ? `${log.flightDetails.from} (ETD ${log.flightDetails.takeOff}, ${log.flightDetails.takeOffDate}) → ${log.flightDetails.to} (ETA ${log.flightDetails.landing}, ${log.flightDetails.landingDate})`
                          : 'N/A'}
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