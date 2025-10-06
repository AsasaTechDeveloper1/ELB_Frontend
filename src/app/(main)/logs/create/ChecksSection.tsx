'use client';

import { useState } from 'react';

interface AuthDetails {
  svcOption: string;
  authId: string;
  authName: string;
  authDate: string;
}

interface ChecksSectionProps {
  openAuthModal: (type: string, index: number) => void;
  checkedItems: { [key: string]: boolean };
  setCheckedItems: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  authDetails: { [key: string]: AuthDetails };
  setAuthDetails: React.Dispatch<React.SetStateAction<{ [key: string]: AuthDetails }>>;
  currentLogId: string;
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
  onChecksSaved,
}: ChecksSectionProps) {
  const [isAcceptanceAuthorized, setIsAcceptanceAuthorized] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});

  // Function to save check authorizations to the backend
  const saveChecks = async () => {
    if (!currentLogId) {
      console.error('No log ID provided');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/checks/${currentLogId}/checks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checks: authDetails,
          createdBy: 'user-id', // Replace with actual user ID
        }),
      });

      if (!response.ok) throw new Error('Failed to save check authorizations');

      const data = await response.json();
      console.log('✅ Check authorizations saved:', data);

      // Trigger a callback to refetch logs if provided
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

    openAuthModal(label, index);

    setCheckedItems((prev) => ({ ...prev, [label]: true }));
    setAuthDetails((prev) => ({
      ...prev,
      [label]: {
        authId: '—',
        authName: '—',
        authDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        svcOption: '',
      },
    }));
  };

  const handleAcceptanceAuth = async () => {
    const requiredChecks = ["TRANSIT", "DAILY", "ETOPS", "Letter", "PDI"];
    const missing = requiredChecks.filter(label => !checkedItems[label]);

    if (missing.length > 0) {
      const errors: { [key: string]: boolean } = {};
      missing.forEach(label => {
        errors[label] = true;
      });
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    if (isAcceptanceAuthorized) return;

    openAuthModal('ACCEPTANCE', 0);

    setIsAcceptanceAuthorized(true);

    setAuthDetails((prev) => ({
      ...prev,
      ACCEPTANCE: {
        authId: '—',
        authName: '—',
        authDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        svcOption: '',
      },
    }));

    await saveChecks();
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto md:overflow-x-visible">
        <div className={`p-6 rounded-xl shadow-md border border-gray-200 ${isAcceptanceAuthorized ? 'bg-[#E0F7FA]' : 'bg-white'}`}>
          <h3 className="text-xl font-semibold text-[#004051] border-b pb-2">Check Authorization</h3>

          <div className="border-b py-2">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-8">
              <div className="flex flex-row items-center gap-6">
                <input
                  type="checkbox"
                  id="checkbox-TRANSIT"
                  className={`accent-[#004051] w-5 h-5 ${checkedItems['TRANSIT'] || isAcceptanceAuthorized ? 'opacity-50 cursor-not-allowed' : ''}`}
                  checked={checkedItems['TRANSIT'] || false}
                  onChange={() => handleCheckboxChange('TRANSIT', 0)}
                  disabled={checkedItems['TRANSIT'] || isAcceptanceAuthorized}
                />
                <div className="flex flex-col min-w-0">
                  <label
                    htmlFor="checkbox-TRANSIT"
                    className={`text-[#004051] font-medium text-sm sm:text-base ${checkedItems['TRANSIT'] || isAcceptanceAuthorized ? 'text-gray-400' : ''}`}
                  >
                    TRANSIT
                  </label>
                  {validationErrors["TRANSIT"] && (
                    <div className="text-red-500 text-xs sm:text-sm mt-1">This check is required</div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Date:</span>
                <span className="text-gray-800 text-sm sm:text-base">{authDetails['TRANSIT']?.authDate ?? '—'}</span>
              </div>

              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[120px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">AUTH ID:</span>
                <span className="text-gray-800 text-sm sm:text-base">{authDetails['TRANSIT']?.authId ?? '—'}</span>
              </div>

              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base pl-0 sm:pl-4">AUTH NAME:</span>
                <span className="text-gray-800 text-sm sm:text-base">{authDetails['TRANSIT']?.authName ?? '—'}</span>
              </div>
            </div>
          </div>

          <div className="border-b py-2">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-8">
              <div className="flex flex-row items-center gap-6">
                <input
                  type="checkbox"
                  id="checkbox-DAILY"
                  className={`accent-[#004051] w-5 h-5 ${checkedItems['DAILY'] || isAcceptanceAuthorized ? 'opacity-50 cursor-not-allowed' : ''}`}
                  checked={checkedItems['DAILY'] || false}
                  onChange={() => handleCheckboxChange('DAILY', 0)}
                  disabled={checkedItems['DAILY'] || isAcceptanceAuthorized}
                />
                <div className="flex flex-col min-w-0">
                  <label
                    htmlFor="checkbox-DAILY"
                    className={`text-[#004051] font-medium text-sm sm:text-base ${checkedItems['DAILY'] || isAcceptanceAuthorized ? 'text-gray-400' : ''}`}
                  >
                    DAILY
                  </label>
                  {validationErrors["DAILY"] && (
                    <div className="text-red-500 text-xs sm:text-sm mt-1">This check is required</div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Date:</span>
                <span className="text-gray-800 text-sm sm:text-base">{authDetails['DAILY']?.authDate ?? '—'}</span>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[120px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">AUTH ID:</span>
                <span className="text-gray-800 text-sm sm:text-base">{authDetails['DAILY']?.authId ?? '—'}</span>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base pl-0 sm:pl-4">AUTH NAME:</span>
                <span className="text-gray-800 text-sm sm:text-base">{authDetails['DAILY']?.authName ?? '—'}</span>
              </div>
            </div>
          </div>

          <div className="border-b py-2">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-8">
              <div className="flex flex-row items-center gap-6">
                <input
                  type="checkbox"
                  id="checkbox-ETOPS"
                  className={`accent-[#004051] w-5 h-5 ${checkedItems['ETOPS'] || isAcceptanceAuthorized ? 'opacity-50 cursor-not-allowed' : ''}`}
                  checked={checkedItems['ETOPS'] || false}
                  onChange={() => handleCheckboxChange('ETOPS', 0)}
                  disabled={checkedItems['ETOPS'] || isAcceptanceAuthorized}
                />
                <div className="flex flex-col min-w-0">
                  <label
                    htmlFor="checkbox-ETOPS"
                    className={`text-[#004051] font-medium text-sm sm:text-base ${checkedItems['ETOPS'] || isAcceptanceAuthorized ? 'text-gray-400' : ''}`}
                  >
                    ETOPS
                  </label>
                  {validationErrors["ETOPS"] && (
                    <div className="text-red-500 text-xs sm:text-sm mt-1">This check is required</div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Date:</span>
                <span className="text-gray-800 text-sm sm:text-base">{authDetails['ETOPS']?.authDate ?? '—'}</span>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[120px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">AUTH ID:</span>
                <span className="text-gray-800 text-sm sm:text-base">{authDetails['ETOPS']?.authId ?? '—'}</span>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base pl-0 sm:pl-4">AUTH NAME:</span>
                <span className="text-gray-800 text-sm sm:text-base">{authDetails['ETOPS']?.authName ?? '—'}</span>
              </div>
            </div>
          </div>

          <div className="border-b py-2">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-8">
              <div className="flex flex-row items-center gap-6">
                <input
                  type="checkbox"
                  id="checkbox-Letter"
                  className={`accent-[#004051] w-5 h-5 ${checkedItems['Letter'] || isAcceptanceAuthorized ? 'opacity-50 cursor-not-allowed' : ''}`}
                  checked={checkedItems['Letter'] || false}
                  onChange={() => handleCheckboxChange('Letter', 0)}
                  disabled={checkedItems['Letter'] || isAcceptanceAuthorized}
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label
                      htmlFor="checkbox-Letter"
                      className={`text-[#004051] font-medium text-sm sm:text-base ${checkedItems['Letter'] || isAcceptanceAuthorized ? 'text-gray-400' : ''}`}
                    >
                      LETTER
                    </label>
                    <select
                      disabled={!checkedItems['Letter'] || isAcceptanceAuthorized}
                      className={`min-w-[150px] border rounded px-2 py-1 text-xs sm:text-sm text-gray-900 ${
                        !checkedItems['Letter'] ? 'bg-gray-200 cursor-not-allowed' : 'bg-white cursor-pointer'
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
                  {validationErrors["Letter"] && (
                    <div className="text-red-500 text-xs sm:text-sm mt-1">This check is required</div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Date:</span>
                <span className="text-gray-800 text-sm sm:text-base">{authDetails['Letter']?.authDate ?? '—'}</span>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[120px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">AUTH ID:</span>
                <span className="text-gray-800 text-sm sm:text-base">{authDetails['Letter']?.authId ?? '—'}</span>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base pl-0 sm:pl-4">AUTH NAME:</span>
                <span className="text-gray-800 text-sm sm:text-base">{authDetails['Letter']?.authName ?? '—'}</span>
              </div>
            </div>
          </div>

          <div className="border-b py-2">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-8">
              <div className="flex flex-row items-center gap-6">
                <input
                  type="checkbox"
                  id="checkbox-PDI"
                  className={`accent-[#004051] w-5 h-5 ${checkedItems['PDI'] || isAcceptanceAuthorized ? 'opacity-50 cursor-not-allowed' : ''}`}
                  checked={checkedItems['PDI'] || false}
                  onChange={() => handleCheckboxChange('PDI', 0)}
                  disabled={checkedItems['PDI'] || isAcceptanceAuthorized}
                />
                <div className="flex flex-col min-w-0">
                  <label
                    htmlFor="checkbox-PDI"
                    className={`text-[#004051] font-medium text-sm sm:text-base ${checkedItems['PDI'] || isAcceptanceAuthorized ? 'text-gray-400' : ''}`}
                  >
                    PDI
                  </label>
                  {validationErrors["PDI"] && (
                    <div className="text-red-500 text-xs sm:text-sm mt-1">This check is required</div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Date:</span>
                <span className="text-gray-800 text-sm sm:text-base">{authDetails['PDI']?.authDate ?? '—'}</span>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[120px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base">AUTH ID:</span>
                <span className="text-gray-800 text-sm sm:text-base">{authDetails['PDI']?.authId ?? '—'}</span>
              </div>
              <div className="flex justify-between items-center w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[150px] sm:gap-1 sm:justify-start">
                <span className="text-gray-700 font-medium text-sm sm:text-base pl-0 sm:pl-4">AUTH NAME:</span>
                <span className="text-gray-800 text-sm sm:text-base">{authDetails['PDI']?.authName ?? '—'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-[#004051] font-medium text-base">ACCEPTANCE</div>
            <div className="flex items-center gap-4">
              {!authDetails['ACCEPTANCE'] && (
                <button
                  onClick={handleAcceptanceAuth}
                  className="bg-[#004051] hover:bg-[#00353f] text-white text-sm font-medium py-2 px-5 rounded shadow"
                >
                  AUTH
                </button>
              )}

              {authDetails['ACCEPTANCE'] && (
                <div className="font-medium text-gray-700 md:w-[650px] w-full">
                  ACCEPTANCE BY:{' '}
                  <span className="font-medium text-gray-800">
                    {authDetails['ACCEPTANCE'].authId}, {authDetails['ACCEPTANCE'].authName}, {authDetails['ACCEPTANCE'].authDate}
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
