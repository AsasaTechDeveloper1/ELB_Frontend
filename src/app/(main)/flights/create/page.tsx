'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MdFlightTakeoff } from 'react-icons/md';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

interface Airport {
  id: string;
  code: string;
  name: string;
}

interface Regn {
  id: string;
  regnNo: string;
}

interface FlightNo {
  id: string;
  flightNo: string;
}

// Helper to generate next sequential number (e.g., REGN-00001, FL-00001, APT-00001)
const generateNextSequentialNo = (existingNos: string[], prefix: 'REGN' | 'FL' | 'APT') => {
  if (!existingNos || existingNos.length === 0) {
    return `${prefix}-00001`;
  }
  const numbers = existingNos
    .map((no) => {
      const match = no.match(new RegExp(`^${prefix}-(\\d+)$`));
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((num) => !isNaN(num));

  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNumber = maxNumber + 1;
  return `${prefix}-${nextNumber.toString().padStart(5, '0')}`;
};

export default function FormElementsPage() {
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [regns, setRegns] = useState<Regn[]>([]);
  const [flightNos, setFlightNos] = useState<FlightNo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAirport, setNewAirport] = useState({ code: '', name: '' });
  const [modalError, setModalError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    regn: '',
    fltNo: '',
    typeOfFlight: '',
    from: '',
    to: '',
    landings: '',
    offBlock: '',
    onBlock: '',
    prevHrs: '',
    takeOff: '',
    landing: '',
    flightTime: '',
    takeOffDate: '',
    landingDate: '',
    totalHrs: '',
    employeeNo: '',
    captName: '',
    acftRelease: false,
  });

  // Fetch dynamic data and set default regn and fltNo
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [airportsRes, regnsRes, flightNosRes] = await Promise.all([
          fetch(`${API_BASE}/flights/airports/list`),
          fetch(`${API_BASE}/flights/regns/list`),
          fetch(`${API_BASE}/flights/flightNos/list`),
        ]);

        let fetchedRegns: Regn[] = [];
        let fetchedFlightNos: FlightNo[] = [];
        let fetchedAirports: Airport[] = [];

        if (airportsRes.ok) fetchedAirports = await airportsRes.json();
        if (regnsRes.ok) fetchedRegns = await regnsRes.json();
        if (flightNosRes.ok) fetchedFlightNos = await flightNosRes.json();

        setAirports(fetchedAirports);
        setRegns(fetchedRegns);
        setFlightNos(fetchedFlightNos);

        // Set default auto-generated values
        const nextRegnNo = generateNextSequentialNo(fetchedRegns.map((r) => r.regnNo), 'REGN');
        const nextFlightNo = generateNextSequentialNo(fetchedFlightNos.map((f) => f.flightNo), 'FL');
        setFormData((prev) => ({
          ...prev,
          regn: nextRegnNo,
          fltNo: nextFlightNo,
        }));
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
      }
    };
    fetchData();
  }, []);

  // Update newAirport code when modal opens
  useEffect(() => {
    if (isModalOpen) {
      const nextAirportCode = generateNextSequentialNo(airports.map((a) => a.code), 'APT');
      setNewAirport((prev) => ({ ...prev, code: nextAirportCode }));
    }
  }, [isModalOpen, airports]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAirportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewAirport((prev) => ({ ...prev, [id]: value }));
  };

  const getInputClass = (field: string) =>
    `w-full bg-white text-gray-900 border rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${
      submitted && !formData[field as keyof typeof formData]
        ? 'border-red-400 focus:ring-red-400'
        : 'border-gray-300 focus:ring-[#004051]'
    }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setMessage(null);

    const requiredFields = [
      'regn',
      'fltNo',
      'typeOfFlight',
      'from',
      'to',
      'landings',
      'offBlock',
      'onBlock',
      'prevHrs',
      'takeOff',
      'landing',
      'flightTime',
      'takeOffDate',
      'landingDate',
      'totalHrs',
      'employeeNo',
      'captName',
    ];

    const emptyFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]);

    if (emptyFields.length > 0) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }

    // Validate that from and to are different
    if (formData.from && formData.to && formData.from === formData.to) {
      setMessage({ text: 'Departure and destination airports must be different', type: 'error' });
      return;
    }

    try {
      // Add new regnNo and flightNo to their respective collections
      await Promise.all([
        fetch(`${API_BASE}/flights/regns`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ regnNo: formData.regn }),
        }),
        fetch(`${API_BASE}/flights/flightNos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flightNo: formData.fltNo }),
        }),
      ]);

      const res = await fetch(`${API_BASE}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: 'Flight saved successfully!', type: 'success' });
        setFormData({
          regn: generateNextSequentialNo([...regns.map((r) => r.regnNo), formData.regn], 'REGN'),
          fltNo: generateNextSequentialNo([...flightNos.map((f) => f.flightNo), formData.fltNo], 'FL'),
          typeOfFlight: '',
          from: '',
          to: '',
          landings: '',
          offBlock: '',
          onBlock: '',
          prevHrs: '',
          takeOff: '',
          landing: '',
          flightTime: '',
          takeOffDate: '',
          landingDate: '',
          totalHrs: '',
          employeeNo: '',
          captName: '',
          acftRelease: false,
        });
        setSubmitted(false);
        setTimeout(() => router.push('/flights'), 1500);
      } else {
        setMessage({ text: data.error || 'Failed to save flight', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to save flight', type: 'error' });
    }
  };

  const handleAddAirport = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!newAirport.code || !newAirport.name) {
      setModalError('Both code and name are required');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/flights/airports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAirport),
      });

      if (res.ok) {
        const data = await res.json();
        setAirports((prev) => [...prev, { id: data.id, ...newAirport }]);
        setNewAirport({ code: '', name: '' });
        setIsModalOpen(false);
      } else {
        const data = await res.json();
        setModalError(data.error || 'Failed to add airport');
      }
    } catch (err) {
      console.error(err);
      setModalError('Failed to add airport');
    }
  };

  const labelClass = 'text-[15px] font-semibold text-gray-700 mb-1 block';

  return (
    <div className="max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-[#004051] px-6 py-3 flex justify-between items-center">
        <h2 className="text-white text-lg font-semibold flex items-center gap-2">
          <MdFlightTakeoff className="h-5 w-5 text-white" /> Create New Flight
        </h2>
        <button
          onClick={() => router.back()}
          type="button"
          className="text-white text-sm flex items-center gap-1 hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 grid grid-cols-1 gap-6 bg-white">
        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-base font-semibold text-white shadow-lg flex items-center gap-2 transition-all duration-300 ease-in-out ${
              message.type === 'success' ? 'bg-[#06b6d4]' : 'bg-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Row Group 1 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="regn" className={labelClass}>
              REGN
            </label>
            <input
              id="regn"
              type="text"
              value={formData.regn}
              readOnly
              className={`${getInputClass('regn')} bg-gray-100 cursor-not-allowed`}
            />
          </div>
          <div>
            <label htmlFor="fltNo" className={labelClass}>
              FLT No
            </label>
            <input
              id="fltNo"
              type="text"
              value={formData.fltNo}
              readOnly
              className={`${getInputClass('fltNo')} bg-gray-100 cursor-not-allowed`}
            />
          </div>
          <div>
            <label htmlFor="typeOfFlight" className={labelClass}>
              Type of Flight
            </label>
            <select id="typeOfFlight" value={formData.typeOfFlight} onChange={handleChange} className={getInputClass('typeOfFlight')}>
              <option value="">Choose Type</option>
              <option value="Commercial">Commercial</option>
              <option value="Non-Commercial">Non-Commercial</option>
            </select>
          </div>
        </div>

        {/* Row Group 2 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="from" className={labelClass}>
              From
            </label>
            <div className="flex items-center gap-2">
              <select id="from" value={formData.from} onChange={handleChange} className={getInputClass('from')}>
                <option value="">Choose Airport</option>
                {airports
                  .filter((airport) => airport.code !== formData.to)
                  .map((airport) => (
                    <option key={airport.id} value={airport.code}>
                      {airport.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="bg-[#004051] hover:bg-[#00363f] text-white text-sm font-medium px-6 py-2 rounded-md transition flex items-center gap-1"
              >
                Add
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="to" className={labelClass}>
              To
            </label>
            <div className="flex items-center gap-2">
              <select id="to" value={formData.to} onChange={handleChange} className={getInputClass('to')}>
                <option value="">Choose Airport</option>
                {airports
                  .filter((airport) => airport.code !== formData.from)
                  .map((airport) => (
                    <option key={airport.id} value={airport.code}>
                      {airport.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="bg-[#004051] hover:bg-[#00363f] text-white text-sm font-medium px-6 py-2 rounded-md transition flex items-center gap-1"
              >
                Add
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="landings" className={labelClass}>
              Number Of Landing
            </label>
            <input
              id="landings"
              type="text"
              value={formData.landings}
              onChange={handleChange}
              placeholder="(L/P/LI)"
              className={getInputClass('landings')}
            />
          </div>
        </div>

        {/* Row Group 3 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="offBlock" className={labelClass}>
              Off Block
            </label>
            <input id="offBlock" type="time" value={formData.offBlock} onChange={handleChange} className={getInputClass('offBlock')} />
          </div>
          <div>
            <label htmlFor="onBlock" className={labelClass}>
              On Block
            </label>
            <input id="onBlock" type="time" value={formData.onBlock} onChange={handleChange} className={getInputClass('onBlock')} />
          </div>
          <div>
            <label htmlFor="prevHrs" className={labelClass}>
              Previous HRS
            </label>
            <input id="prevHrs" type="time" value={formData.prevHrs} onChange={handleChange} className={getInputClass('prevHrs')} />
          </div>
        </div>

        {/* Row Group 4 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="takeOff" className={labelClass}>
              Take Off
            </label>
            <input id="takeOff" type="time" value={formData.takeOff} onChange={handleChange} className={getInputClass('takeOff')} />
          </div>
          <div>
            <label htmlFor="landing" className={labelClass}>
              Landing
            </label>
            <input id="landing" type="time" value={formData.landing} onChange={handleChange} className={getInputClass('landing')} />
          </div>
          <div>
            <label htmlFor="flightTime" className={labelClass}>
              Flight Time
            </label>
            <input id="flightTime" type="time" value={formData.flightTime} onChange={handleChange} className={getInputClass('flightTime')} />
          </div>
        </div>

        {/* Row Group 5 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="takeOffDate" className={labelClass}>
              Take Off Date
            </label>
            <input
              id="takeOffDate"
              type="date"
              value={formData.takeOffDate}
              onChange={handleChange}
              className={getInputClass('takeOffDate')}
            />
          </div>
          <div>
            <label htmlFor="landingDate" className={labelClass}>
              Landing Date
            </label>
            <input
              id="landingDate"
              type="date"
              value={formData.landingDate}
              onChange={handleChange}
              className={getInputClass('landingDate')}
            />
          </div>
          <div>
            <label htmlFor="totalHrs" className={labelClass}>
              Total ACFT HRS
            </label>
            <input id="totalHrs" type="time" value={formData.totalHrs} onChange={handleChange} className={getInputClass('totalHrs')} />
          </div>
        </div>

        {/* Row Group 6 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="employeeNo" className={labelClass}>
              Employee No
            </label>
            <input
              id="employeeNo"
              type="text"
              value={formData.employeeNo}
              onChange={handleChange}
              placeholder="Employee No"
              className={getInputClass('employeeNo')}
            />
          </div>
          <div>
            <label htmlFor="captName" className={labelClass}>
              Capt Name
            </label>
            <input
              id="captName"
              type="text"
              value={formData.captName}
              onChange={handleChange}
              placeholder="Capt Name"
              className={getInputClass('captName')}
            />
          </div>
          <div className="flex items-center gap-2 mt-8">
            <input
              type="checkbox"
              id="acftRelease"
              checked={formData.acftRelease}
              onChange={handleChange}
              className="h-4 w-4 border border-gray-300 rounded focus:ring-2 focus:ring-[#004051]"
            />
            <label htmlFor="acftRelease" className="text-sm font-medium text-gray-700">
              ACFT RELEASE
            </label>
          </div>
        </div>

        {/* Footer Submit */}
        <div className="flex justify-end border-t pt-4">
          <button
            type="submit"
            className="bg-[#004051] hover:bg-[#00363f] text-white text-sm font-medium px-6 py-2 rounded-md transition flex items-center gap-1"
          >
            Submit Flight
          </button>
        </div>
      </form>

      {/* Add Airport Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Airport</h3>
            <form onSubmit={handleAddAirport}>
              {modalError && (
                <div className="mb-4 px-4 py-3 rounded-lg text-base font-semibold text-white bg-red-700">
                  {modalError}
                </div>
              )}
              <div className="mb-4">
                <label htmlFor="code" className={labelClass}>
                  Airport Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={newAirport.code}
                  readOnly
                  className="w-full bg-gray-100 text-gray-900 border rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none border-gray-300 cursor-not-allowed"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="name" className={labelClass}>
                  Airport Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={newAirport.name}
                  onChange={handleAirportChange}
                  placeholder="e.g., Dubai International"
                  className="w-full bg-white text-gray-900 border rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 border-gray-300 focus:ring-[#004051]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewAirport({ code: '', name: '' });
                    setModalError(null);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#004051] hover:bg-[#00363f] text-white text-sm font-medium px-4 py-2 rounded-md"
                >
                  Add Airport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
