'use client';

import { useState } from 'react';
import LogSection from './LogSection';
import FlightDetailsSection from './FlightDetailsSection';
import FluidsSection from './FluidsSection';
import ChecksSection from './ChecksSection';
import AuthModal from './AuthModal';
import { LogEntry, AuthData } from '../types';

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

export default function FormElementsPage() {
  const [activeTab, setActiveTab] = useState('Log');
  const [logEntries, setLogEntries] = useState<LogEntry[]>([{ ...initialLogEntry }]);
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
   
    // ✅ NEW: also set authDetails for checks
    setAuthDetails(prev => ({
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

    // ✅ NEW: disable the checkbox after save
    setCheckedItems(prev => ({
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
    {
      id: 'FLT DETAILS/RELEASE',
      label: 'FLT DETAILS/RELEASE',
      content: <FlightDetailsSection />,
    },
    {
      id: 'Fluids',
      label: 'Fluids',
      content: <FluidsSection />,
    },
    {
      id: 'Checks',
      label: 'Checks',
      content: <ChecksSection 
        openAuthModal={openAuthModal}
        checkedItems={checkedItems} 
        setCheckedItems={setCheckedItems} 
        authDetails={authDetails} 
        setAuthDetails={setAuthDetails} 
      />,
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