'use client';

import { useState, useEffect } from 'react';
import { AuthDetails } from '../types';

interface ChecksSectionProps {
  openAuthModal: (
    type: string,
    index: number,
    onSuccess: (authData: { authId: string; authName: string }) => void
  ) => void;
  checkedItems: { [key: string]: boolean };
  setCheckedItems: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  authDetails: { [key: string]: AuthDetails };
  setAuthDetails: React.Dispatch<React.SetStateAction<{ [key: string]: AuthDetails }>>;
  currentLogId: string;
  flightLeg: number;
  onChecksSaved?: () => Promise<void>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export default function ChecksSection({
  openAuthModal,
  checkedItems,
  setCheckedItems,
  authDetails,
  setAuthDetails,
  currentLogId,
  flightLeg,
  onChecksSaved,
}: ChecksSectionProps) {
  const [isAcceptanceAuthorized, setIsAcceptanceAuthorized] = useState(!!authDetails['ACCEPTANCE']);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({
    TRANSIT: false,
    DAILY: false,
    ETOPS: false,
    Letter: false,
    PDI: false,
  });

  // Fetch checks to initialize state
  useEffect(() => {
    const fetchChecks = async () => {
      try {
        const response = await fetch(`${API_BASE}/checks/${currentLogId}/checks`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched checks data:', data);
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
            setCheckedItems((prev) => ({
              ...prev,
              ...Object.keys(checks).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
            }));
            setIsAcceptanceAuthorized(!!checks['ACCEPTANCE']);
          } else {
            setAuthDetails({});
            setCheckedItems({ TRANSIT: false, DAILY: false, ETOPS: false, Letter: false, PDI: false });
            setIsAcceptanceAuthorized(false);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching checks:', error);
      }
    };
    if (currentLogId) {
      fetchChecks();
    }
  }, [currentLogId, setAuthDetails, setCheckedItems]);

  // Function to save check authorizations to the backend
  const saveChecks = async (updatedAuthDetails?: { [key: string]: AuthDetails }) => {
    if (!currentLogId) {
      console.error('No log ID provided');
      alert('No log selected. Please select a log first.');
      return;
    }

    try {
      const checksToSave = updatedAuthDetails || authDetails;
      console.log('Checks to save:', checksToSave);

      const response = await fetch(`${API_BASE}/checks/${currentLogId}/checks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checks: checksToSave,
          createdBy: 'user-id', // Replace with actual user ID
        }),
      });

      if (!response.ok) throw new Error('Failed to save check authorizations');

      const data = await response.json();
      console.log('✅ Check authorizations saved:', data);

      if (onChecksSaved) {
        await onChecksSaved();
      }
    } catch (error) {
      console.error('❌ Error saving check authorizations:', error);
      alert('Failed to save check authorizations. Please try again.');
    }
  };

  const handleCheckboxChange = (label: string, index: number) => {
    if (checkedItems[label] || isAcceptanceAuthorized) return;

    const onSuccess = (authData: { authId: string; authName: string }) => {
      console.log(`Authorizing ${label}, authData:`, authData);
      setCheckedItems((prev) => {
        const newCheckedItems = { ...prev, [label]: true };
        console.log(`Updated checkedItems:`, newCheckedItems);
        return newCheckedItems;
      });
      setAuthDetails((prev) => ({
        ...prev,
        [label]: {
          authId: authData.authId,
          authName: authData.authName,
          authDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          svcOption: authDetails[label]?.svcOption || '',
        },
      }));
      // Do NOT save to backend here; save only on ACCEPTANCE
    };

    openAuthModal(label, index, onSuccess);
  };

  const handleAcceptanceAuth = async () => {
    if (flightLeg !== 0) {
      alert('Acceptance authorization is only allowed for the current flight (flightLeg: 0).');
      return;
    }

    const requiredChecks = ['TRANSIT', 'DAILY', 'ETOPS', 'Letter', 'PDI'];
    const missing = requiredChecks.filter((label) => !checkedItems[label]);

    if (missing.length > 0) {
      const errors: { [key: string]: boolean } = {};
      missing.forEach((label) => {
        errors[label] = true;
      });
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    if (isAcceptanceAuthorized) return;

    const onSuccess = async (authData: { authId: string; authName: string }) => {
      const updatedAuthDetails = {
        ...authDetails,
        ACCEPTANCE: {
          authId: authData.authId,
          authName: authData.authName,
          authDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          svcOption: '',
        },
      };

      console.log('Updated authDetails with ACCEPTANCE:', updatedAuthDetails);
      setIsAcceptanceAuthorized(true);
      setAuthDetails(updatedAuthDetails);
      await saveChecks(updatedAuthDetails);
    };

    openAuthModal('ACCEPTANCE', 0, onSuccess);
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto md:overflow-x-visible">
        <div
          className={`p-6 rounded-xl shadow-md border border-gray-200 ${
            isAcceptanceAuthorized ? 'bg-[#E0F7FA]' : 'bg-white'
          }`}
        >
          <h3 className="text-xl font-semibold text-[#004051] border-b pb-2">Check Authorization</h3>

          {/* TRANSIT */}
          <div className="border-b py-2">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-8">
              <div className="flex flex-row items-center gap-6">
                <input
                  type="checkbox"
                  id="checkbox-TRANSIT"
                  className={`accent-[#004051] w-5 h-5 ${
                    checkedItems['TRANSIT'] || isAcceptanceAuthorized ? 'opacity-50 cursor-not-allowed' : ''
                  } ${checkedItems['TRANSIT'] ? 'bg-green-100' : ''}`}
                  checked={checkedItems['TRANSIT'] || false}
                  onChange={() => handleCheckboxChange('TRANSIT', 0)}
                  disabled={checkedItems['TRANSIT'] || isAcceptanceAuthorized}
                />
                <div className="flex flex-col min-w-0">
                  <label
                    htmlFor="checkbox-TRANSIT"
                    className={`text-[#004051] font-medium text-sm sm:text-base ${
                      checkedItems['TRANSIT'] || isAcceptanceAuthorized ? 'text-gray-400' : ''
                    }`}
                  >
                    TRANSIT {checkedItems['TRANSIT'] && <span className="text-green-600">(Completed)</span>}
                  </label>
                  {validationErrors['TRANSIT'] && (
                    <div className="text-red-500 text-xs sm:text-sm mt-1">This check is required</div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Date:</span>
                <span className="text-gray-800 text-sm sm:text-base">
                  {authDetails['TRANSIT']?.authDate ?? '—'}
                </span>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[120px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">AUTH ID:</span>
                <span className="text-gray-800 text-sm sm:text-base">
                  {authDetails['TRANSIT']?.authId ?? '—'}
                </span>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base pl-0 sm:pl-4">AUTH NAME:</span>
                <span className="text-gray-800 text-sm sm:text-base">
                  {authDetails['TRANSIT']?.authName ?? '—'}
                </span>
              </div>
            </div>
          </div>

          {/* DAILY */}
          <div className="border-b py-2">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-8">
              <div className="flex flex-row items-center gap-6">
                <input
                  type="checkbox"
                  id="checkbox-DAILY"
                  className={`accent-[#004051] w-5 h-5 ${
                    checkedItems['DAILY'] || isAcceptanceAuthorized ? 'opacity-50 cursor-not-allowed' : ''
                  } ${checkedItems['DAILY'] ? 'bg-green-100' : ''}`}
                  checked={checkedItems['DAILY'] || false}
                  onChange={() => handleCheckboxChange('DAILY', 0)}
                  disabled={checkedItems['DAILY'] || isAcceptanceAuthorized}
                />
                <div className="flex flex-col min-w-0">
                  <label
                    htmlFor="checkbox-DAILY"
                    className={`text-[#004051] font-medium text-sm sm:text-base ${
                      checkedItems['DAILY'] || isAcceptanceAuthorized ? 'text-gray-400' : ''
                    }`}
                  >
                    DAILY {checkedItems['DAILY'] && <span className="text-green-600">(Completed)</span>}
                  </label>
                  {validationErrors['DAILY'] && (
                    <div className="text-red-500 text-xs sm:text-sm mt-1">This check is required</div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Date:</span>
                <span className="text-gray-800 text-sm sm:text-base">
                  {authDetails['DAILY']?.authDate ?? '—'}
                </span>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[120px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">AUTH ID:</span>
                <span className="text-gray-800 text-sm sm:text-base">
                  {authDetails['DAILY']?.authId ?? '—'}
                </span>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base pl-0 sm:pl-4">AUTH NAME:</span>
                <span className="text-gray-800 text-sm sm:text-base">
                  {authDetails['DAILY']?.authName ?? '—'}
                </span>
              </div>
            </div>
          </div>

          {/* ETOPS */}
          <div className="border-b py-2">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-8">
              <div className="flex flex-row items-center gap-6">
                <input
                  type="checkbox"
                  id="checkbox-ETOPS"
                  className={`accent-[#004051] w-5 h-5 ${
                    checkedItems['ETOPS'] || isAcceptanceAuthorized ? 'opacity-50 cursor-not-allowed' : ''
                  } ${checkedItems['ETOPS'] ? 'bg-green-100' : ''}`}
                  checked={checkedItems['ETOPS'] || false}
                  onChange={() => handleCheckboxChange('ETOPS', 0)}
                  disabled={checkedItems['ETOPS'] || isAcceptanceAuthorized}
                />
                <div className="flex flex-col min-w-0">
                  <label
                    htmlFor="checkbox-ETOPS"
                    className={`text-[#004051] font-medium text-sm sm:text-base ${
                      checkedItems['ETOPS'] || isAcceptanceAuthorized ? 'text-gray-400' : ''
                    }`}
                  >
                    ETOPS {checkedItems['ETOPS'] && <span className="text-green-600">(Completed)</span>}
                  </label>
                  {validationErrors['ETOPS'] && (
                    <div className="text-red-500 text-xs sm:text-sm mt-1">This check is required</div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Date:</span>
                <span className="text-gray-800 text-sm sm:text-base">
                  {authDetails['ETOPS']?.authDate ?? '—'}
                </span>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[120px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">AUTH ID:</span>
                <span className="text-gray-800 text-sm sm:text-base">
                  {authDetails['ETOPS']?.authId ?? '—'}
                </span>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base pl-0 sm:pl-4">AUTH NAME:</span>
                <span className="text-gray-800 text-sm sm:text-base">
                  {authDetails['ETOPS']?.authName ?? '—'}
                </span>
              </div>
            </div>
          </div>

          {/* LETTER */}
          <div className="border-b py-2">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-8">
              <div className="flex flex-row items-center gap-6">
                <input
                  type="checkbox"
                  id="checkbox-Letter"
                  className={`accent-[#004051] w-5 h-5 ${
                    checkedItems['Letter'] || isAcceptanceAuthorized ? 'opacity-50 cursor-not-allowed' : ''
                  } ${checkedItems['Letter'] ? 'bg-green-100' : ''}`}
                  checked={checkedItems['Letter'] || false}
                  onChange={() => handleCheckboxChange('Letter', 0)}
                  disabled={checkedItems['Letter'] || isAcceptanceAuthorized}
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label
                      htmlFor="checkbox-Letter"
                      className={`text-[#004051] font-medium text-sm sm:text-base ${
                        checkedItems['Letter'] || isAcceptanceAuthorized ? 'text-gray-400' : ''
                      }`}
                    >
                      LETTER {checkedItems['Letter'] && <span className="text-green-600">(Completed)</span>}
                    </label>
                    <select
                      disabled={!checkedItems['Letter'] || isAcceptanceAuthorized}
                      className={`min-w-[150px] border rounded px-2 py-1 text-xs sm:text-sm text-gray-900 ${
                        !checkedItems['Letter'] || isAcceptanceAuthorized
                          ? 'bg-gray-200 cursor-not-allowed'
                          : 'bg-white cursor-pointer'
                      }`}
                      value={authDetails['Letter']?.svcOption ?? ''}
                      onChange={(e) => {
                        const svcOption = e.target.value;
                        setAuthDetails((prev) => ({
                          ...prev,
                          Letter: {
                            ...prev['Letter'],
                            svcOption,
                          },
                        }));
                      }}
                    >
                      <option value="" disabled>
                        Select SVC
                      </option>
                      <option value="A">A. 1A/2A/3A</option>
                      <option value="C">C. 1C/2C/3C</option>
                      <option value="D">D. 1D/2D/3D</option>
                    </select>
                  </div>
                  {validationErrors['Letter'] && (
                    <div className="text-red-500 text-xs sm:text-sm mt-1">This check is required</div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Date:</span>
                <span className="text-gray-800 text-sm sm:text-base">
                  {authDetails['Letter']?.authDate ?? '—'}
                </span>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[120px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">AUTH ID:</span>
                <span className="text-gray-800 text-sm sm:text-base">
                  {authDetails['Letter']?.authId ?? '—'}
                </span>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base pl-0 sm:pl-4">AUTH NAME:</span>
                <span className="text-gray-800 text-sm sm:text-base">
                  {authDetails['Letter']?.authName ?? '—'}
                </span>
              </div>
            </div>
          </div>

          {/* PDI */}
          <div className="border-b py-2">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-8">
              <div className="flex flex-row items-center gap-6">
                <input
                  type="checkbox"
                  id="checkbox-PDI"
                  className={`accent-[#004051] w-5 h-5 ${
                    checkedItems['PDI'] || isAcceptanceAuthorized ? 'opacity-50 cursor-not-allowed' : ''
                  } ${checkedItems['PDI'] ? 'bg-green-100' : ''}`}
                  checked={checkedItems['PDI'] || false}
                  onChange={() => handleCheckboxChange('PDI', 0)}
                  disabled={checkedItems['PDI'] || isAcceptanceAuthorized}
                />
                <div className="flex flex-col min-w-0">
                  <label
                    htmlFor="checkbox-PDI"
                    className={`text-[#004051] font-medium text-sm sm:text-base ${
                      checkedItems['PDI'] || isAcceptanceAuthorized ? 'text-gray-400' : ''
                    }`}
                  >
                    PDI {checkedItems['PDI'] && <span className="text-green-600">(Completed)</span>}
                  </label>
                  {validationErrors['PDI'] && (
                    <div className="text-red-500 text-xs sm:text-sm mt-1">This check is required</div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Date:</span>
                <span className="text-gray-800 text-sm sm:text-base">
                  {authDetails['PDI']?.authDate ?? '—'}
                </span>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[120px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">AUTH ID:</span>
                <span className="text-gray-800 text-sm sm:text-base">
                  {authDetails['PDI']?.authId ?? '—'}
                </span>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base pl-0 sm:pl-4">AUTH NAME:</span>
                <span className="text-gray-800 text-sm sm:text-base">
                  {authDetails['PDI']?.authName ?? '—'}
                </span>
              </div>
            </div>
          </div>

          {/* ACCEPTANCE */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-[#004051] font-medium text-base">
              ACCEPTANCE {authDetails['ACCEPTANCE'] && <span className="text-green-600">(Completed)</span>}
            </div>
            <div className="flex items-center gap-4">
              {!authDetails['ACCEPTANCE'] && flightLeg === 0 && (
                <button
                  onClick={handleAcceptanceAuth}
                  className={`bg-[#004051] text-white text-sm font-medium py-2 px-5 rounded shadow ${
                    isAcceptanceAuthorized ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#00353f]'
                  }`}
                  disabled={isAcceptanceAuthorized}
                >
                  AUTH
                </button>
              )}
              {authDetails['ACCEPTANCE'] && (
                <div className="font-medium text-gray-700 md:w-[650px] w-full">
                  ACCEPTANCE BY:{' '}
                  <span className="font-medium text-gray-800">
                    {authDetails['ACCEPTANCE'].authId}, {authDetails['ACCEPTANCE'].authName},{' '}
                    {authDetails['ACCEPTANCE'].authDate}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isAcceptanceAuthorized && (
        <div className="bg-[#E0F7FA] p-4 rounded-lg text-sm text-gray-600">
          All checks are finalized and authorized.
        </div>
      )}
    </div>
  );
}
