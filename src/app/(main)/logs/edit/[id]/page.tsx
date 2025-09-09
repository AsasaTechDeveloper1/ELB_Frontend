'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import LogSection from './LogSection';
import AuthModal from './AuthModal'; 
import { LogEntry, AuthData } from '../../types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const initialLogEntry: LogEntry = {
  id: 0,
  updated_id: "",
  class: '',
  raisedBy: '',
  defectDetails: '',
  mmsgFc: '',
  ata: '',             // ✅ add this line
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


export default function FormElementsPage() {
  const params = useParams(); 
  const logId = params?.id as string;

  const [activeTab, setActiveTab] = useState('Log');
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [authModal, setAuthModal] = useState<null | { type: string; index: number }>(null);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [authDetails, setAuthDetails] = useState<Record<string, any>>({});
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

  // 🔹 Fetch log by ID
  useEffect(() => {
    if (!logId) return;

const fetchLog = async () => {
  try {
    const res = await fetch(`${API_BASE}/logs/${logId}`);
    if (!res.ok) throw new Error('Failed to fetch log');
    const data = await res.json();
    console.log(data, "fetch data");

    // ✅ Normalize items array into LogEntry[]
    const normalizedEntries: LogEntry[] = (data.items || []).map((item: any) => ({
      ...initialLogEntry,
      ...item,
      ata: item.ata ?? initialLogEntry.ata,
      mmsgFc: item.mmsgFc ?? initialLogEntry.mmsgFc,
      componentRows: item.components?.length
        ? item.components
        : initialLogEntry.componentRows,
    }));


    console.log(normalizedEntries,"normalizedEntries")
    setLogEntries(normalizedEntries.length ? normalizedEntries : [initialLogEntry]);
  } catch (err) {
    console.error('❌ Error fetching log:', err);
    setLogEntries([{ ...initialLogEntry, id: 0 }]);
  }
};


    fetchLog();
  }, [logId]);

  const openAuthModal = (type: string, index: number) => {
    const today = new Date().toISOString().split('T')[0];
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
        />
      ),
    },
  ];

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="space-y-6">
      <div className="mb-6">
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
    </div>
  );
}
