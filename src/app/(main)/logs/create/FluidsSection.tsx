'use client';

import { useState, useEffect } from 'react';
import { AuthDetails } from '../types';

interface FluidsSectionProps {
  openAuthModal: (
    type: string,
    index: number,
    onSuccess: (authData: { authId: string; authName: string }) => void
  ) => void;
  authDetails: { [key: string]: AuthDetails };
  setAuthDetails: React.Dispatch<React.SetStateAction<{ [key: string]: AuthDetails }>>;
  currentLogId: string;
  flightLeg: number;
  onFluidsSaved?: () => Promise<void>;
}

interface FluidsData {
  fuel: {
    arrivalFuel: string;
    arrivalFuelFreezePoint: string;
    fuelUsedOnGnd: string;
    fuelUsedOnGndDensity: string;
    beforeUplift: string;
    beforeUpliftUsGalLtrs: string;
    requiredUplift: string;
    requiredUpliftAdditional: string;
    actualUplift: string;
    actualUpliftAdditional: string;
    indicatedFob: string;
    indicatedFobAdditional: string;
    fobDifference: string;
    fobDifferenceAdditional: string;
    differenceActualIndicated: string;
    differenceActualIndicatedAdditional: string;
    supplier: string;
    receipts: string;
  };
  oils: {
    eng1: number;
    eng2: number;
    apu: number;
    hydLGreen: number;
    hydCBlue: number;
    hydRYellow: number;
  };
  water: {
    arrival: string;
    departure: string;
  };
  deIcing: {
    type: string;
    mix: string;
    time: string;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const defaultFluidsData: FluidsData = {
  fuel: {
    arrivalFuel: '',
    arrivalFuelFreezePoint: '',
    fuelUsedOnGnd: '',
    fuelUsedOnGndDensity: '',
    beforeUplift: '',
    beforeUpliftUsGalLtrs: '',
    requiredUplift: '',
    requiredUpliftAdditional: '',
    actualUplift: '',
    actualUpliftAdditional: '',
    indicatedFob: '',
    indicatedFobAdditional: '',
    fobDifference: '',
    fobDifferenceAdditional: '',
    differenceActualIndicated: '',
    differenceActualIndicatedAdditional: '',
    supplier: '',
    receipts: '',
  },
  oils: { eng1: 0, eng2: 0, apu: 0, hydLGreen: 0, hydCBlue: 0, hydRYellow: 0 },
  water: { arrival: '', departure: '' },
  deIcing: { type: '', mix: '', time: '' },
};

export default function FluidsSection({
  openAuthModal,
  authDetails,
  setAuthDetails,
  currentLogId,
  flightLeg,
  onFluidsSaved,
}: FluidsSectionProps) {
  const [fluidsData, setFluidsData] = useState<FluidsData>(defaultFluidsData);
  const [isDeIcingAuthorized, setIsDeIcingAuthorized] = useState(false);

  // === FETCH FLUIDS + AUTH ON LOG CHANGE ===
  useEffect(() => {
    const fetchFluidsAndAuth = async () => {
      if (!currentLogId) return;

      try {
        const response = await fetch(`${API_BASE}/fluids/${currentLogId}/fluids`);
        if (!response.ok) throw new Error('Failed to fetch fluids');

        const data = await response.json();

        // Set Fluids Data
        if (data.fluidsData) {
          setFluidsData(data.fluidsData);
        } else {
          setFluidsData(defaultFluidsData);
        }

        // === CRITICAL: Sync DE-ICING Auth from Server ===
        if (data.authDetails?.DEICING) {
          const deIcingAuth = data.authDetails.DEICING;
          setAuthDetails(prev => ({ ...prev, DEICING: deIcingAuth }));
          setIsDeIcingAuthorized(true);
        } else {
          setAuthDetails(prev => {
            const { DEICING, ...rest } = prev;
            return rest;
          });
          setIsDeIcingAuthorized(false);
        }
      } catch (error) {
        console.error('Error fetching fluids:', error);
        setFluidsData(defaultFluidsData);
        setIsDeIcingAuthorized(false);
      }
    };

    fetchFluidsAndAuth();
  }, [currentLogId, setAuthDetails]);

  // === SAVE FLUIDS ===
  const saveFluids = async (updatedAuthDetails?: { [key: string]: AuthDetails }) => {
    if (!currentLogId) {
      alert('No log selected');
      return;
    }

    try {
      const authToSave = updatedAuthDetails || authDetails;

      const response = await fetch(`${API_BASE}/fluids/${currentLogId}/fluids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fluidsData,
          authDetails: authToSave,
          createdBy: 'user-id',
        }),
      });

      if (!response.ok) throw new Error('Save failed');

      if (onFluidsSaved) await onFluidsSaved();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save fluids');
    }
  };

  // === AUTO-SAVE DEBOUNCE ===
  useEffect(() => {
    if (!currentLogId) return;

    const timeout = setTimeout(() => {
      saveFluids();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [fluidsData, currentLogId]);

  // === HANDLERS ===
  const handleFuelChange = (field: keyof FluidsData['fuel'], value: string) => {
    setFluidsData(prev => ({
      ...prev,
      fuel: { ...prev.fuel, [field]: value },
    }));
  };

  const handleEngOilChange = (engine: keyof FluidsData['oils'], value: number) => {
    setFluidsData(prev => ({
      ...prev,
      oils: { ...prev.oils, [engine]: value },
    }));
  };

  const handleWaterChange = (type: keyof FluidsData['water'], value: string) => {
    setFluidsData(prev => ({
      ...prev,
      water: { ...prev.water, [type]: value },
    }));
  };

  const handleDeIcingChange = (field: keyof FluidsData['deIcing'], value: string) => {
    setFluidsData(prev => ({
      ...prev,
      deIcing: { ...prev.deIcing, [field]: value },
    }));
  };

  // === DE-ICING AUTH ===
  const handleDeIcingAuth = () => {
  if (isDeIcingAuthorized) return; // Already authorized

  const onSuccess = async (authData: { authId: string; authName: string }) => {
    const updatedAuthDetails = {
      ...authDetails,
      DEICING: {
        authId: authData.authId,
        authName: authData.authName,
        authDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        svcOption: '',
      },
    };

    setAuthDetails(updatedAuthDetails);
    setIsDeIcingAuthorized(true);
    await saveFluids(updatedAuthDetails);
  };

  openAuthModal('DEICING', 0, onSuccess);
};

  return (
    <div className="space-y-6">
      {/* === FUEL TABLE === */}
      <div className="bg-white text-gray-800 p-6 rounded-xl border border-gray-200 w-full shadow-sm mb-4">
        <div className="overflow-x-auto md:overflow-visible">
          <table className="border border-gray-300 text-sm rounded overflow-hidden min-w-[600px] md:min-w-0">
            <thead>
              <tr className="bg-[#004051] text-white">
                <th className="p-2 text-center">FUEL</th>
                <th className="p-2 text-center">KGS</th>
                <th className="p-2 text-center" colSpan={2}>Additional</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label1: 'A) Arrival Fuel:', field: 'arrivalFuel' as const, label2: 'FUEL FREEZE POINT', additionalField: 'arrivalFuelFreezePoint' as const },
                { label1: 'B) Fuel Used on GND:', field: 'fuelUsedOnGnd' as const, label2: 'SG (DENSITY) KG / LTRs', additionalField: 'fuelUsedOnGndDensity' as const },
                { label1: 'C) Before Uplift:', field: 'beforeUplift' as const, label2: 'US GAL / LTRs', additionalField: 'beforeUpliftUsGalLtrs' as const },
              ].map(({ label1, field, label2, additionalField }) => (
                <tr className="border" key={field}>
                  <td className="p-2 font-medium">{label1}</td>
                  <td className="p-2">
                    <input
                      type="text"
                      className="w-[160px] md:w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                      value={fluidsData.fuel[field]}
                      onChange={(e) => handleFuelChange(field, e.target.value)}
                    />
                  </td>
                  <td className="p-2 font-medium">{label2}</td>
                  <td className="p-2">
                    <input
                      type="text"
                      className="w-[160px] md:w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                      value={fluidsData.fuel[additionalField]}
                      onChange={(e) => handleFuelChange(additionalField, e.target.value)}
                    />
                  </td>
                </tr>
              ))}

              {[
                { label: 'D) Required Uplift:', field: 'requiredUplift' as const, additionalField: 'requiredUpliftAdditional' as const },
                { label: 'E) Actual Uplift:', field: 'actualUplift' as const, additionalField: 'actualUpliftAdditional' as const },
                { label: 'F) Indicated Fob:', field: 'indicatedFob' as const, additionalField: 'indicatedFobAdditional' as const },
                { label: 'G) Fob Difference:', field: 'fobDifference' as const, additionalField: 'fobDifferenceAdditional' as const },
                { label: 'H) Difference Actual-Indicated:', field: 'differenceActualIndicated' as const, additionalField: 'differenceActualIndicatedAdditional' as const },
              ].map(({ label, field, additionalField }) => (
                <tr className="border" key={field}>
                  <td className="p-2 font-medium">{label}</td>
                  <td className="p-2">
                    <input
                      type="text"
                      className="w-[160px] md:w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                      value={fluidsData.fuel[field]}
                      onChange={(e) => handleFuelChange(field, e.target.value)}
                    />
                  </td>
                  <td className="p-2 font-medium"></td>
                  <td className="p-2">
                    <input
                      type="text"
                      placeholder="-"
                      className="w-[160px] md:w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                      value={fluidsData.fuel[additionalField]}
                      onChange={(e) => handleFuelChange(additionalField, e.target.value)}
                    />
                  </td>
                </tr>
              ))}

              <tr className="border">
                <td className="p-2 font-medium text-[#004051]">
                  Supplier
                  <input
                    type="text"
                    className="w-[160px] md:w-full mt-1 px-2 py-1 border border-[#004051] rounded focus:ring focus:ring-[#004051]/30"
                    value={fluidsData.fuel.supplier}
                    onChange={(e) => handleFuelChange('supplier', e.target.value)}
                  />
                </td>
                <td className="p-2 font-medium text-[#004051]">
                  Receipts
                  <input
                    type="text"
                    className="w-[160px] md:w-full mt-1 px-2 py-1 border border-[#004051] rounded focus:ring focus:ring-[#004051]/30"
                    value={fluidsData.fuel.receipts}
                    onChange={(e) => handleFuelChange('receipts', e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* === OILS, WATER, DE-ICING === */}
      <div className="bg-white text-gray-800 p-6 rounded-xl border border-gray-200 w-full shadow-sm">
        <div className="overflow-x-auto md:overflow-visible">
          <table className="border-collapse text-sm rounded border border-gray-300 min-w-[600px] md:min-w-0">
            <tbody>
              {/* ENG/APU OIL */}
              <tr className="bg-[#004051] text-white">
                <td className="p-2 border">ENG / APU OIL</td>
                <td className="p-2 border">ENG 1</td>
                <td className="p-2 border">ENG 2</td>
                <td className="p-2 border">APU</td>
              </tr>
              <tr>
                <td className="p-2 bg-[#004051] text-white border">QTY / QTS</td>
                {(['eng1', 'eng2', 'apu'] as const).map((key) => (
                  <td key={key} className="p-2 border text-center">
                    <input
                      type="number"
                      className="w-[140px] md:w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                      value={fluidsData.oils[key]}
                      onChange={(e) => handleEngOilChange(key, Number(e.target.value))}
                      min={0}
                    />
                  </td>
                ))}
              </tr>

              {/* HYD OIL */}
              <tr className="bg-[#004051] text-white">
                <td className="p-2 border">HYD OIL</td>
                <td className="p-2 border">L / GREEN</td>
                <td className="p-2 border">C / BLUE</td>
                <td className="p-2 border">R / YELLOW</td>
              </tr>
              <tr>
                <td className="p-2 bg-[#004051] text-white border">QTY / QTS</td>
                {(['hydLGreen', 'hydCBlue', 'hydRYellow'] as const).map((key) => (
                  <td key={key} className="p-2 border text-center">
                    <input
                      type="number"
                      className="w-[140px] md:w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                      value={fluidsData.oils[key]}
                      onChange={(e) => handleEngOilChange(key, Number(e.target.value))}
                      min={0}
                    />
                  </td>
                ))}
              </tr>

              {/* WATER */}
              <tr className="bg-[#004051] text-white">
                <td className="p-2 border">WATER QTY</td>
                <td className="p-2 border">ARRIVAL</td>
                <td className="p-2 border">DEPARTURE</td>
                <td className="p-2 border"></td>
              </tr>
              <tr>
                <td className="p-2 bg-[#004051] text-white border">%</td>
                {(['arrival', 'departure'] as const).map((key) => (
                  <td key={key} className="p-2 border">
                    <input
                      type="text"
                      className="w-[140px] md:w-full border border-gray-300 rounded px-2 py-1 focus:ring focus:ring-blue-100"
                      value={fluidsData.water[key]}
                      onChange={(e) => handleWaterChange(key, e.target.value)}
                    />
                  </td>
                ))}
                <td className="p-2 border"></td>
              </tr>

              {/* DE-ICING */}
              <tr>
                <td className="p-2 text-center bg-[#004051] text-white border" colSpan={3}>
                  GROUND DE - ICING
                </td>
                <td className="p-2 text-center bg-[#004051] text-white border">Action</td>
              </tr>
              <tr>
                <td className="p-2 bg-[#004051] text-white border">Type</td>
                <td colSpan={2} className="p-2 border">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-2 py-1 focus:ring focus:ring-blue-100"
                    value={fluidsData.deIcing.type}
                    onChange={(e) => handleDeIcingChange('type', e.target.value)}
                  />
                </td>
                <td rowSpan={2} className="p-2 border text-center align-middle">
                  <div className="relative inline-block group">
                    <button 
                      onClick={handleDeIcingAuth}
                      className={`bg-[#004051] hover:bg-[#00353f] text-white text-sm font-medium py-1.5 px-6 rounded shadow transition ${
                        isDeIcingAuthorized ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={isDeIcingAuthorized}
                    >
                      {isDeIcingAuthorized ? 'Authorized' : 'Auth'}
                    </button>

                    {isDeIcingAuthorized && (
                      <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap z-10">
                        Already authorized
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-2 bg-[#004051] text-white border">MIX & Time</td>
                <td colSpan={2} className="p-2 border">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Mix"
                      className="w-full border border-gray-300 rounded px-2 py-1 focus:ring focus:ring-blue-100"
                      value={fluidsData.deIcing.mix}
                      onChange={(e) => handleDeIcingChange('mix', e.target.value)}
                    />
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded px-2 py-1 focus:ring focus:ring-blue-100"
                      value={fluidsData.deIcing.time}
                      onChange={(e) => handleDeIcingChange('time', e.target.value)}
                    />
                  </div>
                </td>
              </tr>

              {/* AUTH DISPLAY */}
              {isDeIcingAuthorized && authDetails['DEICING'] && (
                <tr>
                  <td colSpan={4} className="p-2 border text-center bg-green-50">
                    <span className="text-green-700 font-medium">
                      DE-ICING AUTHORIZED BY: {authDetails['DEICING'].authId}, {authDetails['DEICING'].authName}, {authDetails['DEICING'].authDate}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}