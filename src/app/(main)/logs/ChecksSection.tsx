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
}

export default function ChecksSection({
  openAuthModal,
  checkedItems,
  setCheckedItems,
  authDetails,
  setAuthDetails,
}: ChecksSectionProps) {
  const [isAcceptanceAuthorized, setIsAcceptanceAuthorized] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});
  const handleCheckboxChange = (label: string, index: number) => {
    if (checkedItems[label] || isAcceptanceAuthorized) return;

    openAuthModal(label, index);

    setCheckedItems((prev) => ({ ...prev, [label]: true }));
    setAuthDetails((prev) => ({
      ...prev,
      [label]: {
        authId: '—', // placeholder until modal fills in
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

  const handleAcceptanceAuth = () => {

    const requiredChecks = ["TRANSIT", "DAILY", "ETOPS", "Letter", "PDI"];
    // Find missing checks
    const missing = requiredChecks.filter(label => !checkedItems[label]);

    if (missing.length > 0) {
      // Mark missing ones in state
      const errors: { [key: string]: boolean } = {};
      missing.forEach(label => {
        errors[label] = true;
      });
      setValidationErrors(errors);
      return; // Stop here, don't open modal
    }

    // Clear errors if all are done
    setValidationErrors({});
    
    if (isAcceptanceAuthorized) return;

    openAuthModal('ACCEPTANCE', 0);

    setIsAcceptanceAuthorized(true);

    setAuthDetails((prev) => ({
      ...prev,
      ACCEPTANCE: {
        authId: '—', // or empty string if you prefer
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

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl shadow-md border border-gray-200 ${isAcceptanceAuthorized ? 'bg-[#E0F7FA]' : 'bg-white'}`}>
        <h3 className="text-xl font-semibold text-[#004051] border-b pb-2">Check Authorization</h3>

        {/* TRANSIT checkbox */}
        <div className="flex items-center justify-between gap-4 border-b py-2">
          <div className="flex items-center gap-3 flex-1">
            <input
              type="checkbox"
              id="checkbox-TRANSIT"
              className={`accent-[#004051] w-5 h-5 ${checkedItems['TRANSIT'] || isAcceptanceAuthorized ? 'opacity-50 cursor-not-allowed' : ''}`}
              checked={checkedItems['TRANSIT'] || false}
              onChange={() => handleCheckboxChange('TRANSIT', 0)}
              disabled={checkedItems['TRANSIT'] || isAcceptanceAuthorized}
            />
            {/* Wrap label and error in a vertical flex container */}
            <div className="flex flex-col min-w-[150px]">
              <label
                htmlFor="checkbox-TRANSIT"
                className={`text-[#004051] font-medium text-base ${checkedItems['TRANSIT'] || isAcceptanceAuthorized ? 'text-gray-400' : ''}`}
              >
                TRANSIT
              </label>
              {validationErrors["TRANSIT"] && (
                <div className="text-red-500 text-sm mt-1">This check is required</div>
              )}
            </div>

            <div className="font-medium text-gray-700 md:w-[250px] w-full">
              AUTH ID: <span className="font-medium text-gray-800">{authDetails['TRANSIT']?.authId ?? '—'}</span>
            </div>

            <div className="font-medium text-gray-700 md:w-[250px] w-full">
              AUTH NAME: <span className="font-medium text-gray-800">{authDetails['TRANSIT']?.authName ?? '—'}</span>
            </div>

            <div className="font-medium text-gray-700 md:w-[250px] w-full">
              Date: <span className="font-medium text-gray-800">{authDetails['TRANSIT']?.authDate ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* DAILY checkbox */}
        <div className="flex items-center justify-between gap-4 border-b py-2">
          <div className="flex items-center gap-3 flex-1">
            <input
              type="checkbox"
              id="checkbox-DAILY"
              className={`accent-[#004051] w-5 h-5 ${checkedItems['DAILY'] || isAcceptanceAuthorized ? 'opacity-50 cursor-not-allowed' : ''}`}
              checked={checkedItems['DAILY'] || false}
              onChange={() => handleCheckboxChange('DAILY', 0)}
              disabled={checkedItems['DAILY'] || isAcceptanceAuthorized}
            />
            {/* Wrap label and error in a vertical flex container */}
            <div className="flex flex-col min-w-[150px]">
              <label
                htmlFor="checkbox-DAILY"
                className={`text-[#004051] font-medium text-base min-w-[150px] ${checkedItems['DAILY'] || isAcceptanceAuthorized ? 'text-gray-400' : ''}`}
              >
                DAILY
              </label>
              {validationErrors["DAILY"] && (
                <div className="text-red-500 text-sm mt-1">This check is required</div>
              )}
            </div>

            <div className="font-medium text-gray-700 md:w-[250px] w-full">
              AUTH ID: <span className="font-medium text-gray-800">{authDetails['DAILY']?.authId ?? '—'}</span>
            </div>

            <div className="font-medium text-gray-700 md:w-[250px] w-full">
              AUTH NAME: <span className="font-medium text-gray-800">{authDetails['DAILY']?.authName ?? '—'}</span>
            </div>

            <div className="font-medium text-gray-700 md:w-[250px] w-full">
              Date: <span className="font-medium text-gray-800">{authDetails['DAILY']?.authDate ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* ETOPS checkbox */}
        <div className="flex items-center justify-between gap-4 border-b py-2">
          <div className="flex items-center gap-3 flex-1">
            <input
              type="checkbox"
              id="checkbox-ETOPS"
              className={`accent-[#004051] w-5 h-5 ${checkedItems['ETOPS'] || isAcceptanceAuthorized ? 'opacity-50 cursor-not-allowed' : ''}`}
              checked={checkedItems['ETOPS'] || false}
              onChange={() => handleCheckboxChange('ETOPS', 0)}
              disabled={checkedItems['ETOPS'] || isAcceptanceAuthorized}
            />
            {/* Wrap label and error in a vertical flex container */}
            <div className="flex flex-col min-w-[150px]">
              <label
                htmlFor="checkbox-ETOPS"
                className={`text-[#004051] font-medium text-base min-w-[150px] ${checkedItems['ETOPS'] || isAcceptanceAuthorized ? 'text-gray-400' : ''}`}
              >
                ETOPS
              </label>
              {validationErrors["ETOPS"] && (
                <div className="text-red-500 text-sm mt-1">This check is required</div>
              )}
            </div>

            <div className="font-medium text-gray-700 md:w-[250px] w-full">
              AUTH ID: <span className="font-medium text-gray-800">{authDetails['ETOPS']?.authId ?? '—'}</span>
            </div>

            <div className="font-medium text-gray-700 md:w-[250px] w-full">
              AUTH NAME: <span className="font-medium text-gray-800">{authDetails['ETOPS']?.authName ?? '—'}</span>
            </div>

            <div className="font-medium text-gray-700 md:w-[250px] w-full">
              Date: <span className="font-medium text-gray-800">{authDetails['ETOPS']?.authDate ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Letter checkbox with SVC dropdown */}
        <div className="flex items-center justify-between gap-4 border-b py-2">
          <div className="flex items-center gap-3 flex-1">
            <input
              type="checkbox"
              id="checkbox-Letter"
              className={`accent-[#004051] w-5 h-5 ${checkedItems['Letter'] || isAcceptanceAuthorized ? 'opacity-50 cursor-not-allowed' : ''}`}
              checked={checkedItems['Letter'] || false}
              onChange={() => handleCheckboxChange('Letter', 0)}
              disabled={checkedItems['Letter'] || isAcceptanceAuthorized}
            />
            {/* Wrap label and error in a vertical flex container */}
            <div className="flex flex-row items-center min-w-[120px] space-x-2">
              <label
                htmlFor="checkbox-Letter"
                className={`text-[#004051] font-medium text-base min-w-[150px] ${checkedItems['Letter'] || isAcceptanceAuthorized ? 'text-gray-400' : ''}`}
              >
                LETTER
              </label>
              {validationErrors["Letter"] && (
                <div className="text-red-500 text-sm mt-1">This check is required</div>
              )}
              {/* SVC Dropdown */}
              <select
                disabled={!checkedItems['Letter'] || isAcceptanceAuthorized}
                className={`min-w-[150px] border rounded px-2 py-1 text-sm text-gray-900 ${
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

            <div className="font-medium text-gray-700 md:w-[250px] w-full">
              AUTH ID: <span className="font-medium text-gray-800">{authDetails['Letter']?.authId ?? '—'}</span>
            </div>

            <div className="font-medium text-gray-700 md:w-[250px] w-full">
              AUTH NAME: <span className="font-medium text-gray-800">{authDetails['Letter']?.authName ?? '—'}</span>
            </div>

            <div className="font-medium text-gray-700 md:w-[250px] w-full">
              Date: <span className="font-medium text-gray-800">{authDetails['Letter']?.authDate ?? '—'}</span>
            </div>
            
          </div>
        </div>


        {/* PDI checkbox */}
        <div className="flex items-center justify-between gap-4 border-b py-2">
          <div className="flex items-center gap-3 flex-1">
            <input
              type="checkbox"
              id="checkbox-PDI"
              className={`accent-[#004051] w-5 h-5 ${checkedItems['PDI'] || isAcceptanceAuthorized ? 'opacity-50 cursor-not-allowed' : ''}`}
              checked={checkedItems['PDI'] || false}
              onChange={() => handleCheckboxChange('PDI', 0)}
              disabled={checkedItems['PDI'] || isAcceptanceAuthorized}
            />
            {/* Wrap label and error in a vertical flex container */}
            <div className="flex flex-col min-w-[150px]">
              <label
                htmlFor="checkbox-PDI"
                className={`text-[#004051] font-medium text-base min-w-[150px] ${checkedItems['PDI'] || isAcceptanceAuthorized ? 'text-gray-400' : ''}`}
              >
                PDI
              </label>
              {validationErrors["PDI"] && (
                <div className="text-red-500 text-sm mt-1">This check is required</div>
              )}
            </div>

            <div className="font-medium text-gray-700 md:w-[250px] w-full">
              AUTH ID: <span className="font-medium text-gray-800">{authDetails['PDI']?.authId ?? '—'}</span>
            </div>

            <div className="font-medium text-gray-700 md:w-[250px] w-full">
              AUTH NAME: <span className="font-medium text-gray-800">{authDetails['PDI']?.authName ?? '—'}</span>
            </div>

            <div className="font-medium text-gray-700 md:w-[250px] w-full">
              Date: <span className="font-medium text-gray-800">{authDetails['PDI']?.authDate ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* ACCEPTANCE auth */}
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

      {isAcceptanceAuthorized && (
        <div className="bg-[#E0F7FA] p-4 rounded-lg text-sm text-gray-600">
          All checks are finalized and authorized.
        </div>
      )}
    </div>
  );
}
